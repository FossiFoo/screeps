/* @flow */

import type { Task, TaskId, TaskState, TaskPrio,
              TaskStep, TaskStepType, TaskStepResult,
              TaskStepNavigate, Position,
              CreepMemory, CreepState } from "../types/FooTypes.js";

import { CREEP_MEMORY_VERSION } from "./consts";

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import { TaskStates, CreepStates } from "./consts";
import { debug, warn } from "./monitoring";

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

export function noop(creep: Creep): TaskStepResult {
    creep.say("lalala");
    return {};
}

export function navigate(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepNavigate = stepParam;

    const destination = step.destination;
    const position : Position = destination.position;
    debug("[creep] [" + creep.name + "] will navigate to " + position.x + "/" + position.y);

    //FIXME move to correct room

    const result : CreepMoveToReturn = creep.moveTo(position.x, position.y);

    if (result !== OK) {
        warn("[creep] [" + creep.name + "] can't navigate " + result);
        return {error: "" + result};
    }
    return {success: true};
}

const stepFunctions = {
    "NAVIGATE": navigate,
    "NOOP": noop
}

export function processTaskStep(creep: Creep, step: TaskStep): TaskStepResult {
    const stepFunc = stepFunctions[step.type];
    return stepFunc(creep, step);
}
