/* @flow */

import type { Task, TaskId, TaskState, TaskPrio,
              TaskStep, TaskStepType, TaskStepResult,
              TaskStepNavigate, Position,
              TaskStepHarvest, SourceId,
              TaskStepTransfer,
              TaskStepUpgrade,
              TaskStepBuild,
              TaskStepRepair,
              TaskStepPickup,
              TaskStepWithdraw,
              CreepBodyDefinitionByType,
              CreepMemory, CreepState } from "../types/FooTypes.js";

import { CREEP_MEMORY_VERSION } from "./consts";

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import { TaskStates, CreepStates } from "./consts";
import { debug, info, warn, error } from "./monitoring";

import * as Rooms from "./rooms";

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
    const mem : CreepMemory = memory(creep);
    info(`[creep] [${creep.name}] assigned: ${taskId}`);
    mem.task.assignedId = taskId;
}

export function lift(creep: Creep, taskId: TaskId): void {
    const mem : CreepMemory = memory(creep);
    const assignedId : ?TaskId = mem.task.assignedId;
    if (assignedId && assignedId !== taskId) {
        warn(`[creep] [${creep.name}] assigned id ${assignedId} doesn't match: ${taskId}`);
    }
    mem.task.assignedId = null;
}

export function getAssignedTask(creep: Creep): ?TaskId {
    var mem : CreepMemory = memory(creep);
    return mem.task.assignedId;
}

export function getState(creep: Creep): CreepState {
    return getAssignedTask(creep) ? CreepStates.BUSY : CreepStates.IDLE;
}

export function getBodyParts(creep: Creep): CreepBodyDefinitionByType {
    const body : BodyPartDefinition[] = creep.body;
    const partByType = _.groupBy(creep.body, (b: BodyPartDefinition) => b.type);
    return partByType;
}

export function noop(creep: Creep): TaskStepResult {
    creep.say("lalala");
    return {success: true};
}

export function navigate(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepNavigate = stepParam;

    const destination = step.destination;
    const position : Position = destination.position;
    debug("[creep] [" + creep.name + "] will navigate to " + position.x + "/" + position.y);

    const currentPosition : Position = creep.pos;
    Rooms.incrementTerrainUsage(creep.room, currentPosition.x, currentPosition.y);

    //FIXME move to correct room

    const ignoreCreeps : boolean = step.ignoreCreeps || false;
    const result : CreepMoveToReturn = creep.moveTo(position.x, position.y, {ignoreCreeps});

    if (result !== OK && result !== ERR_TIRED) {
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
    if (source.energy === 0 && step.mine) {
        //FIXME repair container
        const structures : Structure[] = creep.pos.lookFor(LOOK_STRUCTURES, (s: Structure) => s.structureType === STRUCTURE_CONTAINER);
        const container : ?Structure = _.head(structures);
        if (container && container.hits < container.hitsMax) {
            console.log("repairing container");
            creep.repair(container);
        }
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

export function upgrade(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepUpgrade = stepParam;

    const targetId : ObjectId = step.targetId;
    const target : ?StructureController = Game.getObjectById(targetId);
    if (!target) {
        error("[creep] [" + creep.name + "] can't find target " + targetId);
        return {error: "unknown object: " + targetId};
    }
    const result : CreepUpgradeReturn = creep.upgradeController(target);
    if (result !== OK) {
        warn("[creep] [" + creep.name + "] can't upgrade " + result);
        return {error: "" + result};
    }
    return {success: true};
}

export function build(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepBuild = stepParam;

    const targetId : ObjectId = step.targetId;
    const target : ?ConstructionSite = Game.getObjectById(targetId);
    if (!target) {
        error("[creep] [" + creep.name + "] can't find target " + targetId);
        return {error: "unknown object: " + targetId};
    }
    const result : CreepBuildReturn = creep.build(target);
    if (result !== OK) {
        warn("[creep] [" + creep.name + "] can't build " + result);
        return {error: "" + result};
    }
    return {success: true};
}

export function repair(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepRepair = stepParam;

    const targetId : ObjectId = step.targetId;
    const target : ?Structure = Game.getObjectById(targetId);
    if (!target) {
        error("[creep] [" + creep.name + "] can't find target " + targetId);
        return {error: "unknown object: " + targetId};
    }
    const result : CreepRepairReturn = creep.repair(target);
    if (result !== OK) {
        warn("[creep] [" + creep.name + "] can't repair " + result);
        return {error: "" + result};
    }
    return {success: true};
}

export function pickup(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepPickup = stepParam;

    const resourceId : ResourceId = step.resourceId;
    const resource : ?Resource = Game.getObjectById(resourceId);
    if (!resource) {
        error("[creep] [" + creep.name + "] can't find resource " + resourceId);
        return {error: "unknown object: " + resourceId};
    }
    const result : CreepPickupReturn = creep.pickup(resource);
    if (result !== OK) {
        warn("[creep] [" + creep.name + "] can't pickup " + result);
        return {error: "" + result};
    }
    return {success: true};
}

export function withdraw(creep: Creep, stepParam: any): TaskStepResult {
    const step : TaskStepWithdraw = stepParam;

    const targetId : StructureId = step.targetId;
    const target : ?Structure = Game.getObjectById(targetId);
    if (!target) {
        error("[creep] [" + creep.name + "] can't find target " + targetId);
        return {error: "unknown object: " + targetId};
    }
    const result : CreepWithdrawReturn = creep.withdraw(target, RESOURCE_ENERGY);
    if (result !== OK) {
        warn("[creep] [" + creep.name + "] can't withdraw " + result);
        return {error: "" + result};
    }
    return {success: true};
}

const stepFunctions = {
    "NAVIGATE": navigate,
    "HARVEST": harvest,
    "TRANSFER": transfer,
    "UPGRADE": upgrade,
    "BUILD": build,
    "REPAIR": repair,
    "PICKUP": pickup,
    "WITHDRAW": withdraw,
    "NOOP": noop
}

export function processTaskStep(creep: Creep, step: TaskStep): TaskStepResult {
    const stepFunc = stepFunctions[step.type];
    return stepFunc(creep, step);
}
