/* @flow */

import type { Tick, TaskPrio, Task,
              SourceTarget, EnergyTarget, ProvisionTask, SourceId,
              TaskStep, TaskStepNavigate, Position } from "../types/FooTypes.js";
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

export function provisioningStep(task: ProvisionTask, creep: Creep): TaskStep {
    //FIXME check current position
    //FIXME check creep carry state
    const source : SourceTarget = task.source;
    const sourceRoom : RoomName = source.room;
    let position : Position;
    if (source.type === SourceTargets.ANY) {
        if (creep.room.name === sourceRoom) {
            position = findClosestNavigationTargetByType(FIND_SOURCES_ACTIVE, creep.pos);
        } else {
            //not in correct room yet
            position = {x:0, y:0};
        }
    } else {
        const sourceId : SourceId = source.id;
        position = findNavigationTargetById(sourceId);
    }
    const navigation : TaskStepNavigate = {
        type: "NAVIGATE",
        destination: {
            room: source.room,
            position
        }
    }
    return navigation;
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
