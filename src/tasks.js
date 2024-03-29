/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { Tick, TaskPrio, Task, TaskStepType, TaskState,
              SourceTarget, EnergyTarget, ProvisionTask, SourceId,
              TaskEnergyTransmission,
              UpgradeTask, EnergyTargetController,
              TaskBuild, EnergyTargetConstruction,
              TaskMine,
              TaskRepair, EnergyTargetRepairable,
              TaskStep, TaskStepNavigate, TaskStepHarvest, TaskStepTransfer, TaskStepUpgrade,
              TaskMemory,
              Position } from "../types/FooTypes.js";

import  { TaskTypes, TaskStepTypes, SourceTargets, TaskStates } from "./consts";

import { debug, info, warn, error } from "./monitoring";

let Game : GameI;

export function init(game: GameI, memory: MemoryI) {
    Game = game;
};

export function constructProvisioning(now: Tick, prio: TaskPrio, source: SourceTarget, target: EnergyTarget): ProvisionTask {
    return {
        type: TaskTypes.PROVISION,
        assignedRoom: target.room,
        source,
        target,
        created: now,
        updated: now,
        prio,
        spawn: "variable"
    };
}

export function constructUpgrade(now: Tick, prio: TaskPrio, source: SourceTarget, target: EnergyTargetController): UpgradeTask {
    return {
        type: TaskTypes.UPGRADE,
        assignedRoom: target.room,
        source,
        target,
        created: now,
        updated: now,
        prio,
        spawn: "variable"
    }
}

export function constructBuild(now: Tick, prio: TaskPrio, source: SourceTarget, target: EnergyTargetConstruction): TaskBuild {
    return {
        type: TaskTypes.BUILD,
        assignedRoom: target.room,
        source,
        target,
        created: now,
        updated: now,
        prio,
        spawn: "variable"
    }
}

export function constructMine(now: Tick, prio: TaskPrio, spawnTime: Tick, source: SourceTarget, targetRoom: RoomName): TaskMine {
    return {
        type: TaskTypes.MINE,
        assignedRoom: targetRoom,
        source,
        created: now,
        updated: now,
        prio,
        spawn: "timed",
        spawnTime
    }
}

export function constructRepair(now: Tick, prio: TaskPrio, source: SourceTarget, target: EnergyTargetRepairable): TaskRepair {
    return {
        type: TaskTypes.REPAIR,
        assignedRoom: target.room,
        source,
        target,
        created: now,
        updated: now,
        prio,
        spawn: "variable"
    }
}

export function findNavigationTargetById(id: ObjectId): ?RoomPosition {
    const obj : ?RoomObject = Game.getObjectById(id);
    if (!obj) {
        warn("[tasks] can not see object " + id);
        return null;
    }

    const sourcePosition : RoomPosition = obj.pos;
    return sourcePosition;
}

export function findClosestNavigationTargetByType(targetType: ScreepsConstantFind, pos: RoomPosition): ?RoomPosition {
    const obj : ?RoomObject = pos.findClosestByPath(targetType);
    if (!obj) {
        error("[tasks] can not find a source in " + pos.roomName);
        return new RoomPosition(25, 25, pos.roomName);
    }

    const sourcePosition : RoomPosition = obj.pos;
    debug("[tasks] found a source at " + sourcePosition.toString());
    return sourcePosition;
}

export function constructStep(type: TaskStepType, stepData: Object, defaults: Object): TaskStep {
    return _.assign({ type }, stepData, defaults);
}

export function constructMoveStep(position: Position, roomName: RoomName, currentPosition: Position, ignoreCreeps: boolean, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.NAVIGATE, defaults, {
        destination: {
            room: roomName,
            position
        },
        currentPosition,
        ignoreCreeps
    });
}

export function constructHarvestSourceStep(sourceId: SourceId, mine: boolean, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.HARVEST, defaults, {
        sourceId,
        mine
    });
}

export function constructStepTransfer(targetId: ObjectId, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.TRANSFER, defaults, {
        targetId,
    });
}

export function constructStepUpgrade(targetId: ObjectId, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.UPGRADE, defaults, {
        targetId
    });
}

export function constructStepBuild(targetId: ObjectId, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.BUILD, defaults, {
        targetId
    });
}

export function constructStepRepair(targetId: ObjectId, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.REPAIR, defaults, {
        targetId
    });
}

export function constructPickupStep(resourceId: ResourceId, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.PICKUP, defaults, {
        resourceId
    });
}

export function constructWithdrawStep(targetId: StructureId, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.WITHDRAW, defaults, {
        targetId
    });
}

export function lastMoveFailed(memory: TaskMemory, currentPosition: Position): boolean {
    const lastStep : TaskStep = memory.lastStep;
    if (lastStep.type !== TaskStepTypes.NAVIGATE) {
        return false;
    }
    if (memory.lastResult.success) {
        return true;
    }
    const moveStep : TaskStepNavigate = memory.lastStep;
    const lastPosition: Position = moveStep.currentPosition;
    return lastPosition.x !== currentPosition.x || lastPosition.y !== currentPosition.y;
}

export function calculateMoveStep(position: Position, roomName: RoomName, currentPosition: Position, memory: TaskMemory, defaults: Object): TaskStep {

    const moveFailed : boolean = lastMoveFailed(memory, currentPosition);
    if (moveFailed) {
        warn(`[tasks] ${currentPosition.x}/${currentPosition.y} moving failed, sidestepping`);
    }
    return constructMoveStep(position, roomName, currentPosition, !moveFailed, defaults);
}

export function findNearestSourceTarget(currentPosition: RoomPosition, source: SourceTarget): ?RoomPosition {
    if (source.type === SourceTargets.FIXED) {
        const sourceId : SourceId = source.id;
        return findNavigationTargetById(sourceId);
    }

    if (currentPosition.roomName === source.room) {
        return findClosestNavigationTargetByType(FIND_SOURCES_ACTIVE, currentPosition);
    } else {
        //not in correct room yet
        return new RoomPosition(25, 25, source.room);
    }
}

export function getSourceIdForTarget(source: SourceTarget, currentPosition: RoomPosition): ?SourceId {
    if (source.type === SourceTargets.FIXED) {
        return source.id;
    }
    const sources: Source[] = currentPosition.findInRange(FIND_SOURCES, 2);
    const sourceObject : ?Source = _.head(sources);
    return sourceObject && sourceObject.id;
}

type AquireEnergyFunc = (sourceId: SourceId, sourcePosition: RoomPosition, currentPosition: RoomPosition, init: boolean, memory: TaskMemory) => TaskStep;

export function miningFunction(sourceId: SourceId, sourcePosition: RoomPosition, currentPosition: RoomPosition, init: boolean, memory: TaskMemory): TaskStep {

    //check container
    const containers : Container[] = sourcePosition.findInRange(FIND_STRUCTURES, 1, (s: Structure) => s.structureType === STRUCTURE_CONTAINER);
    const container : ?Container = _.head(containers);
    if(container) {
        debug("[tasks] [mining] found container " + container.id);
        const onTop : boolean = currentPosition.x === container.pos.x && currentPosition.y === container.pos.y ;
        if (!onTop) {
            debug("[tasks] [mining] moving to container" + container.id);
            return calculateMoveStep(container.pos, container.pos.roomName, currentPosition, memory, {init, final: false});
        }
    }

    const adjacent : boolean = currentPosition.inRangeTo(sourcePosition, 1);
    if (!adjacent) {
        return calculateMoveStep(sourcePosition, sourcePosition.roomName, currentPosition, memory, {init, final: false});
    }
    return constructHarvestSourceStep(sourceId, true, {init, final: false});
}


export function mineStep(task: TaskMine, creep: Creep, init: boolean, memory: TaskMemory) {
    const source : SourceTarget = task.source;
    const currentPosition : RoomPosition = creep.pos;
    return withPositionAtSource(source, currentPosition, init, memory, miningFunction);
}

export function aquireEnergyFromSource(sourceId: SourceId, sourcePosition: RoomPosition, currentPosition: RoomPosition, init: boolean, memory: TaskMemory): TaskStep {

    const resources : Resource[] = currentPosition.findInRange(FIND_DROPPED_RESOURCES, 3);
    const energy : Resource = _.find(resources, (r: Resource): boolean => r.resourceType === RESOURCE_ENERGY);
    if (energy) {
        const adjacent : boolean = currentPosition.inRangeTo(energy.pos, 1);
        if (!adjacent) {
            return calculateMoveStep(energy.pos, energy.pos.roomName, currentPosition, memory, {init, final: false});
        }
        return constructPickupStep(energy.id, {init, final: false});
    }

    //check container
    const containers : Container[] = sourcePosition.findInRange(FIND_STRUCTURES, 1, (s: Structure) => s.structureType === STRUCTURE_CONTAINER);
    const container : ?Container = _.head(containers);
    if(container && container.store && container.store[RESOURCE_ENERGY] > 0) {
        const adjacent : boolean = currentPosition.inRangeTo(container.pos, 1);
        if (!adjacent) {
            debug(`[tasks] [aquire] move to ${container.id}`);
            return calculateMoveStep(container.pos, container.pos.roomName, currentPosition, memory, {init, final: false});
        }
        debug(`[tasks] [aquire] withdraw from ${container.id}`);
        return constructWithdrawStep(container.id, {init, final: false});
    }

    const adjacent : boolean = currentPosition.inRangeTo(sourcePosition, 1);
    if (!adjacent) {
        return calculateMoveStep(sourcePosition, sourcePosition.roomName, currentPosition, memory, {init, final: false});
    }
    return constructHarvestSourceStep(sourceId, false, {init, final: false});
}


export function withPositionAtSource(source: SourceTarget, currentPosition: RoomPosition, init: boolean, memory: TaskMemory, f: AquireEnergyFunc): TaskStep {
    const sourcePosition : ?RoomPosition = findNearestSourceTarget(currentPosition, source);
    if (!sourcePosition) {
        warn(`[tasks] [aquire] source ${source.room} ${source.type} not found`);
        return constructStep("NOOP", {}, {final: true, init});
    }

    const resources : Resource[] = currentPosition.findInRange(FIND_DROPPED_RESOURCES, 3);
    const adjacent : boolean = currentPosition.inRangeTo(sourcePosition, 2);
    if (!adjacent) {
        return calculateMoveStep(sourcePosition, source.room, currentPosition, memory, {init, final: false});
    }

    const sourceId : ?SourceId = getSourceIdForTarget(source, currentPosition);
    if (!sourceId) {
        warn(`[tasks] ${source.room} ${source.type} id not found`);
        return constructStep("NOOP", {}, {final: true, init});
    }

    return f(sourceId, sourcePosition, currentPosition, init, memory);
}


export function aquireEnergy(source: SourceTarget, currentPosition: RoomPosition, init: boolean, memory: TaskMemory): TaskStep {
    return withPositionAtSource(source, currentPosition, init, memory, aquireEnergyFromSource);
}

export function energyTransmission(
    task: TaskEnergyTransmission,
    creep: Creep,
    init: boolean,
    memory: any,
    distance: number,
    transmissionStep: (taskTarget: EnergyTarget, final: boolean) => TaskStep): TaskStep {

    const carryAmount : number = creep.carry.energy || 0; //FIXME mixed loads
    const carryCapacity : number = creep.carryCapacity;
    const currentPosition : RoomPosition = creep.pos;

    const taskTarget : EnergyTarget = task.target;

    if (init) {
        memory.state = "AQUIRE";
    }

    //FIXME check if close to source
    if (carryAmount > taskTarget.energyNeed || carryAmount > carryCapacity * 0.99) {
        memory.state = "TRANSMIT";
    }

    if (memory.state === "TRANSMIT") {
        if (carryAmount === 0) {
            return constructStep("NOOP", {}, {final: true, init});
        }
        const targetPosition : ?RoomPosition = findNavigationTargetById(taskTarget.targetId);
        if (!targetPosition) {
            warn(`[tasks] [transmit] ${taskTarget.room} ${taskTarget.targetId} not found`);
            return constructStep("NOOP", {}, {final: true, init});
        }

        const adjacent : boolean = currentPosition.inRangeTo(targetPosition, distance);
        if (adjacent) {
            return transmissionStep(taskTarget, false);
        }

        return calculateMoveStep(targetPosition, taskTarget.room, currentPosition, memory, {init, final: false});
    }

    const source : SourceTarget = task.source;
    return aquireEnergy(source, currentPosition, init, memory);
}



export function provisioningStep(task: ProvisionTask, creep: Creep, init: boolean, memory: TaskMemory): TaskStep {
    return energyTransmission(task, creep, init, memory, 1, (taskTarget: EnergyTarget, final: boolean) => {
        const obj : ?Structure = Game.getObjectById(taskTarget.targetId);
        const energy : any = (obj && obj.energy) || null;
        const energyCapacity : any = (obj && obj.energyCapacity) || null;
        if (!obj || (energy === energyCapacity)) {
            return constructStep("NOOP", {}, {final: true, init});
        }
        return constructStepTransfer(taskTarget.targetId, {final, init});
    });
}

export function upgradeStep(task: UpgradeTask, creep: Creep, init: boolean, memory: TaskMemory): TaskStep {
    return energyTransmission(task, creep, init, memory, 3, (taskTarget: EnergyTarget, final: boolean) => {
        return constructStepUpgrade(taskTarget.targetId, {final, init});
    });
}

export function buildStep(task: TaskBuild, creep: Creep, init: boolean, memory: TaskMemory): TaskStep {
    return energyTransmission(task, creep, init, memory, 3, (taskTarget: EnergyTarget, final: boolean) => {
        return constructStepBuild(taskTarget.targetId, {final, init});
    });
}

export function repairStep(task: TaskRepair, creep: Creep, init: boolean, memory: TaskMemory): TaskStep {
    return energyTransmission(task, creep, init, memory, 3, (taskTarget: EnergyTarget, final: boolean) => {
        const obj : ?Structure = Game.getObjectById(taskTarget.targetId);
        if (!obj || obj.hits === obj.hitsMax) {
            return constructStep("NOOP", {}, {final: true, init});
        }
        return constructStepRepair(taskTarget.targetId, {final, init});
    });
}

export function getNextStep(task: Task, creep: Creep, state: TaskState, memory: TaskMemory): TaskStep {
    const init : boolean = (state === TaskStates.ASSIGNED);
    if (task.type === TaskTypes.PROVISION) {
        return provisioningStep(task, creep, init, memory);
    }
    if (task.type === TaskTypes.UPGRADE) {
        return upgradeStep(task, creep, init, memory);
    }
    if (task.type === TaskTypes.BUILD) {
        return buildStep(task, creep, init, memory);
    }
    if (task.type === TaskTypes.REPAIR) {
        return repairStep(task, creep, init, memory);
    }
    if (task.type === TaskTypes.MINE) {
        return mineStep(task, creep, init, memory);
    }
    warn(`[tasks] [${creep.name}] unknown task type ${task.type}`);
    return constructStep("NOOP", {}, {final: true, init});
}
