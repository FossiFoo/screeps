/* @flow */

import type { Task, TaskId, TaskState, TaskPrio,
              TaskStep, TaskStepType, TaskStepResult,
              TaskStepNavigate, Position,
              TaskStepHarvest, SourceId,
              TaskStepTransfer,
              CreepMemory, CreepState } from "../types/FooTypes.js";

import { CREEP_MEMORY_VERSION } from "./consts";

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import { TaskStates, CreepStates } from "./consts";
import { debug, warn, error } from "./monitoring";

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

export function harvest(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepHarvest = stepParam;

    const sourceId : SourceId = step.sourceId;
    const source : ?Source = Game.getObjectById(sourceId);
    if (!source) {
        error("[creep] [" + creep.name + "] can't find source " + sourceId);
        return {error: "unknown object: " + sourceId};
    }
    const result : CreepHarvestReturn = creep.harvest(source);
    if (result !== OK) {
        warn("[creep] [" + creep.name + "] can't harvest " + result);
        return {error: "" + result};
    }
    return {success: true};
}

export function transfer(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepTransfer = stepParam;

    const targetId : ObjectId = step.targetId;
    const target : ?Structure = Game.getObjectById(targetId);
    if (!target) {
        error("[creep] [" + creep.name + "] can't find target " + targetId);
        return {error: "unknown object: " + targetId};
    }
    const result : CreepTransferReturn = creep.transfer(target, RESOURCE_ENERGY);
    if (result !== OK) {
        warn("[creep] [" + creep.name + "] can't transfer " + result);
        return {error: "" + result};
    }
    return {success: true};
}

const stepFunctions = {
    "NAVIGATE": navigate,
    "HARVEST": harvest,
    "TRANSFER": transfer,
    "NOOP": noop
}

export function processTaskStep(creep: Creep, step: TaskStep): TaskStepResult {
    const stepFunc = stepFunctions[step.type];
    return stepFunc(creep, step);
}
