/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { Tick, TaskPrio, Task, TaskStepType, TaskState,
              SourceTarget, EnergyTarget, ProvisionTask, SourceId,
              UpgradeTask, EnergyTargetController,
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
        prio
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
        prio
    }
}

export function findNavigationTargetById(id: ObjectId): Position {
    const obj : ?RoomObject = Game.getObjectById(id);
    if (!obj) {
        warn("[tasks] can not see object " + id);
        return {x:0, y:0};
    }

    const sourcePosition : RoomPosition = obj.pos;
    return sourcePosition;
}

export function findClosestNavigationTargetByType(targetType: ScreepsConstantFind, pos: RoomPosition) {
    const obj : ?RoomObject = pos.findClosestByRange(targetType);
    if (!obj) {
        error("[tasks] can not find a source in " + pos.roomName);
        return {x:0, y:0};
    } else {
        const sourcePosition : RoomPosition = obj.pos;
        debug("[tasks] found a source at " + sourcePosition.toString());
        return sourcePosition;
    }
}

export function constructStep(type: TaskStepType, stepData: Object, defaults: Object): TaskStep {
    return _.assign({ type }, stepData, defaults);
}

export function constructMoveStep(position: Position, roomName: RoomName, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.NAVIGATE, defaults, {
        destination: {
            room: roomName,
            position
        }
    });
}

export function constructHarvestSourceStep(sourceId: SourceId, defaults: Object): TaskStep {
    return constructStep(TaskStepTypes.HARVEST, defaults, {
        sourceId
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

export function findNearestSourceTarget(currentPosition: RoomPosition, source: SourceTarget): Position {
    if (source.type === SourceTargets.FIXED) {
        const sourceId : SourceId = source.id;
        return findNavigationTargetById(sourceId);
    }

    if (currentPosition.roomName === source.room) {
        //not in correct room yet
        return findClosestNavigationTargetByType(FIND_SOURCES_ACTIVE, currentPosition);
    } else {
        return {x:0, y:0};
    }
}

export function getSourceIdForTarget(source: SourceTarget, currentPosition: RoomPosition): SourceId {
    if (source.type === SourceTargets.FIXED) {
        return source.id;
    }
    const sourceObject: Source = currentPosition.findClosestByRange(FIND_SOURCES_ACTIVE);
    return sourceObject.id;
}

export function aquireEnergy(source: SourceTarget, currentPosition: RoomPosition, init: boolean): TaskStep {
    const sourcePosition : Position = findNearestSourceTarget(currentPosition, source);

    const adjacent : boolean = currentPosition.isNearTo(sourcePosition.x, sourcePosition.y);
    if (!adjacent) {
        return constructMoveStep(sourcePosition, source.room, {init, final: false});
    }
    const sourceId : SourceId = getSourceIdForTarget(source, currentPosition);
    return constructHarvestSourceStep(sourceId, {init, final: false});
}

export function energyTransmission(
    task: Task,
    creep: Creep,
    init: boolean,
    memory: any,
    transmissionStep: (taskTarget: EnergyTarget, final: boolean) => TaskStep): TaskStep {

    const carryAmount : number = creep.carry.energy || 0; //FIXME mixed loads
    const carryCapacity : number = creep.carryCapacity;
    const currentPosition : RoomPosition = creep.pos;

    const taskTarget : EnergyTarget = task.target;

    if (init) {
        memory.state = "AQUIRE";
    }

    //FIXME check if close to source
    if (carryAmount > carryCapacity * 0.99) {
        memory.state = "TRANSMIT";
    }

    if (memory.state === "TRANSMIT") {
        if (carryAmount === 0) {
            return constructStep("NOOP", {}, {final: true, init});
        }
        const targetPosition : Position = findNavigationTargetById(taskTarget.targetId);

        const adjacent : boolean = currentPosition.isNearTo(targetPosition.x, targetPosition.y);
        if (adjacent) {
            return transmissionStep(taskTarget, false);
        }

        return constructMoveStep(targetPosition, taskTarget.room, {init, final: false});
    }

    const source : SourceTarget = task.source;
    return aquireEnergy(source, currentPosition, init);
}


export function provisioningStep(task: ProvisionTask, creep: Creep, init: boolean, memory: TaskMemory): TaskStep {
    return energyTransmission(task, creep, init, memory, (taskTarget: EnergyTarget, final: boolean) => {
        return constructStepTransfer(taskTarget.targetId, {final, init});
    });
}

export function upgradeStep(task: UpgradeTask, creep: Creep, init: boolean, memory: TaskMemory): TaskStep {
    return energyTransmission(task, creep, init, memory, (taskTarget: EnergyTarget, final: boolean) => {
        return constructStepUpgrade(taskTarget.targetId, {final, init});
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
    warn("[tasks] [" + creep.name+ "] unknown task type " + task.type);
    return constructStep("NOOP", {}, {final: true, init});
}
