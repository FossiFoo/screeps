/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// types
import type { CreepBody, FooMemory, Task, TaskId,
              TaskState, TaskPrio, TaskType } from "../types/FooTypes.js";

import { error, warn, info, debug } from "./monitoring";

import { TaskTypes, TaskPriorities, SourceTargets, CreepStates, EnergyTargetTypes, TaskStates } from "./consts";

// Game
import * as _unused from "./kernel";
type KernelType = typeof _unused;


export function createCreep(spawn: Spawn, creepBody: CreepBody): ?CreepName {
    const returnValue: number | string = spawn.createCreep(creepBody);

    if (typeof returnValue !== "string") {
        switch (returnValue) {
            case ERR_BUSY: return;
            case ERR_NOT_ENOUGH_ENERGY: return;
        }
        error("[bodyshop] ["+ spawn.name + "] create creep failed: " + returnValue);
        return;
    }

    debug("[bodyshop] ["+ spawn.name + "] creep spawned: " + returnValue);
    return returnValue;
}

export function designAffordableWorker(maxEnergy: number): ?CreepBody {
    const maxCarry : number = maxEnergy - BODYPART_COST["work"];
    const partsCarry : number = Math.floor(maxCarry / (BODYPART_COST["carry"] + BODYPART_COST["move"]));
    if (partsCarry < 1) {
        return null;
    }

    let body: CreepBody = [WORK];
    for(let i:number = 0; i < partsCarry; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }
    return body;
}

export function designCreepForEnergy(task: Task, maxEnergy: number): ?CreepBody {
    const taskType: TaskType = task.type;
    switch (taskType) {
        case TaskTypes.UPGRADE:
        case TaskTypes.BUILD:
        case TaskTypes.PROVISION: {
            return designAffordableWorker(maxEnergy);
        }
    }
    error("[kernel] [population] task type not known " + taskType);
    return null;
}

export function designAffordableCreep(task: Task, room: Room): ?CreepBody {
    const maxEnergy : number = room.energyAvailable;
    return designCreepForEnergy(task, maxEnergy);
}

export function designOptimalCreep(task: Task, room: Room): ?CreepBody {
    const maxEnergy : number = room.energyCapacityAvailable;
    return designCreepForEnergy(task, maxEnergy);
}

export function spawnCreepForTask(Kernel: KernelType, spawn: Spawn, Game: GameI): ?CreepName {
    const room: Room = spawn.room;
    if (spawn.spawning || _.size(Game.creeps) > 20) {
        return;
    }

    const taskId : ?TaskId = Kernel.getLocalWaiting(room.name /* , creep*/);
    if (!taskId) {
        return;
    }

    const task : ?Task = Kernel.getTaskById(taskId);
    if (!task) {
        return;
    }

    let creepBody : ?CreepBody;
    if (task.prio > TaskPriorities.UPKEEP) {
        creepBody = designAffordableCreep(task, room);
    } else {
        creepBody = designOptimalCreep(task, room);
    }
    if (!creepBody) {
        debug(`[bodyshop] [${room.name}] no suitable body could be constructed for ${taskId}`);
        return;
    }

    return createCreep(spawn, creepBody);
}
