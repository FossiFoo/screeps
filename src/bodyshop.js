/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// types
import type { CreepBody, CreepBodyDefinitionByType,
              FooMemory,
              Task, TaskId, TaskState, TaskPrio, TaskType } from "../types/FooTypes.js";

import { error, warn, info, debug } from "./monitoring";

import { TaskTypes, TaskPriorities, SourceTargets, CreepStates, EnergyTargetTypes, TaskStates } from "./consts";

// Game
import * as _unused from "./kernel";
type KernelType = typeof _unused;
import * as Creeps from "./creeps";


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

export function isCreepBroken(creep: Creep): boolean {
    const body : CreepBodyDefinitionByType = Creeps.getBodyParts(creep);
    const broken : boolean = _.every(body[WORK], (b: BodyPartDefinition) => b.hits === 0);
    return broken;
}

export function calculateMaximumCarry(taskType: TaskType, maxExpenditure: EnergyUnit): ?number {
    const maxBody : ?CreepBody = designCreepForEnergy(taskType, maxExpenditure);
    if (!maxBody) {
        return null;
    }
    const carryParts : number = _.reduce(maxBody, (total: number, part: BODYPART_TYPE): number => {
        return part === CARRY ? total + 1 : total;
    }, 0);
    return carryParts * CARRY_CAPACITY;
}

export function designAffordableWorker(maxEnergy: EnergyUnit): ?CreepBody {
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

export function designCreepForEnergy(taskType: TaskType, maxEnergy: EnergyUnit): ?CreepBody {
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
    const maxEnergy : EnergyUnit = room.energyAvailable;
    const taskType: TaskType = task.type;
    return designCreepForEnergy(taskType, maxEnergy);
}

export function designOptimalCreep(task: Task, room: Room): ?CreepBody {
    const maxEnergy : EnergyUnit = room.energyCapacityAvailable;
    const taskType: TaskType = task.type;
    return designCreepForEnergy(taskType, maxEnergy);
}

export function spawnCreepForTask(Kernel: KernelType, spawn: Spawn, Game: GameI): ?CreepName {
    const room: Room = spawn.room;
    if (spawn.spawning || _.size(Game.creeps) > 10) {
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
