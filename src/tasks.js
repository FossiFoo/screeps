/* @flow */

import type { Tick, TaskPrio, Task,
              SourceTarget, EnergyTarget, ProvisionTask, SourceId,
              TaskStep, TaskStepNavigate, TaskStepHarvest, TaskStepTransfer,
              Position } from "../types/FooTypes.js";
import  { TaskTypes, TaskStepTypes, SourceTargets } from "./consts";

import { debug, info, warn, error } from "./monitoring";

let Game : GameI;

export function init(game: GameI, memory: MemoryI) {
    Game = game;
};

export function constructProvisioning(now: Tick, prio: TaskPrio, source: SourceTarget, target: EnergyTarget): ProvisionTask {
    return {
        type: TaskTypes.PROVISION,
        assignedRoom: source.room,
        source,
        target,
        created: now,
        updated: now,
        prio
    };
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


export function constructMoveStep(position: Position, roomName: RoomName): TaskStep {
    const navigation : TaskStepNavigate = {
        type: "NAVIGATE",
        destination: {
            room: roomName,
            position
        }
    }
    return navigation;
}

export function constructHarvestSourceStep(sourceId: SourceId): TaskStep {
    const harvest : TaskStepHarvest = {
        type: "HARVEST",
        sourceId
    }
    return harvest;
}

export function constructStepTransfer(targetId: ObjectId): TaskStep {
    const transfer : TaskStepTransfer = {
        type: "TRANSFER",
        targetId
    }
    return transfer;
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

export function provisioningStep(task: ProvisionTask, creep: Creep): TaskStep {

    const carryAmount : number = creep.carry.energy || 0; //FIXME mixed loads
    const carryCapacity : number = creep.carryCapacity;
    const currentPosition : RoomPosition = creep.pos;

    //FIXME check if close to source
    if (carryAmount > carryCapacity * 0.9) {
        const taskTarget : EnergyTarget = task.target;
        const targetPosition : Position = findNavigationTargetById(taskTarget.targetId);

        const adjacent : boolean = currentPosition.isNearTo(targetPosition.x, targetPosition.y);
        if (adjacent) {
            return constructStepTransfer(taskTarget.targetId);
        }

        return constructMoveStep(targetPosition, taskTarget.room);
    }

    const source : SourceTarget = task.source;
    const sourcePosition : Position = findNearestSourceTarget(currentPosition, source);

    const adjacent : boolean = currentPosition.isNearTo(sourcePosition.x, sourcePosition.y);
    if (adjacent) {
        const sourceId : SourceId = getSourceIdForTarget(source, currentPosition);
        return constructHarvestSourceStep(sourceId);
    }
    return constructMoveStep(sourcePosition, source.room);
}

export function getNextStep(task: Task, creep: Creep): TaskStep {
    if (task.type === TaskTypes.PROVISION) {
        return provisioningStep(task, creep);
    }
    warn("[tasks] [" + creep.name+ "] unknown task type " + task.type);
    return {
        type: "NOOP"
    }
}
