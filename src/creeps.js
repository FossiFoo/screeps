/* @flow */

import type { Task, TaskId, TaskState, TaskPrio,
              CreepMemory, CreepState } from "../types/FooTypes.js";
import { CREEP_MEMORY_VERSION } from "./consts";

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import { TaskStates, CreepStates } from "./consts";
import { warn } from "./monitoring";

export function memory(creep: Creep): CreepMemory {
    if (creep.memory.version === CREEP_MEMORY_VERSION) {
        return (creep.memory: CreepMemory);
    }
    const initCreep: CreepMemory = {
        version: CREEP_MEMORY_VERSION,
        task: {
            assignedId: null
        }
    }
    _.defaultsDeep(creep.memory, initCreep);
    creep.memory.version = CREEP_MEMORY_VERSION;
    return (creep.memory: CreepMemory);
}

export function assign(creep: Creep, taskId: TaskId, task: Task): void {
    var mem : CreepMemory = memory(creep);
    mem.task.assignedId = taskId;
}

export function getAssignedTask(creep: Creep): ?TaskId {
    var mem : CreepMemory = memory(creep);
    return mem.task.assignedId;
}

export function getState(creep: Creep): CreepState {
    return getAssignedTask(creep) ? CreepStates.BUSY : CreepStates.IDLE;
}
