/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// types
import type { CreepBody, CreepBodyDefinitionByType,
              FooMemory,
              Task, TaskId, TaskState, TaskPrio, TaskType, TaskHolder } from "../types/FooTypes.js";

import { error, warn, info, debug } from "./monitoring";

import { TaskTypes, TaskPriorities, SourceTargets, CreepStates, EnergyTargetTypes, TaskStates } from "./consts";

// Game
import * as _unused from "./kernel";
type KernelType = typeof _unused;
import * as Creeps from "./creeps";


export function createCreep(spawn: Spawn, creepBody: CreepBody): ?CreepName {
    debug("[bodyshop] ["+ spawn.name + "] will try to spawn: " + JSON.stringify(creepBody));
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

export function designAffordableMiner(maxEnergy: EnergyUnit): ?CreepBody {
    const maxWork : number = maxEnergy - BODYPART_COST[MOVE];
    const maxPartsWork : number = Math.floor(maxWork / (BODYPART_COST[WORK]));
    const partsWork : number = Math.min(maxPartsWork, 5);
    if (partsWork < 2) {
        return null;
    }

    let body: CreepBody = [MOVE];
    for(let i:number = 0; i < partsWork; i++) {
        body.push(WORK);
    }

    const cost : number = BODYPART_COST[MOVE] + BODYPART_COST[WORK] * partsWork;
    const rest : number = maxEnergy - cost;

    if (partsWork === 5 && rest >= BODYPART_COST[CARRY]) {
        body.push(CARRY);
    }

    return body;
}

export function designCreepForEnergy(taskType: TaskType, maxEnergy: EnergyUnit): ?CreepBody {
    switch (taskType) {
        case TaskTypes.UPGRADE:
        case TaskTypes.BUILD:
        case TaskTypes.REPAIR:
        case TaskTypes.PROVISION: {
            return designAffordableWorker(maxEnergy);
        }
        case TaskTypes.MINE: {
            return designAffordableMiner(maxEnergy);
        }
    }
    error("[bodyshop] [population] task type not known " + taskType);
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
    const creepCount : number = _.size(Game.creeps);
    if (spawn.spawning || creepCount > 15) { //FIXME make relative to work
        return;
    }

    const taskId : ?TaskId = Kernel.getLocalWaiting(room.name, null, Game.time);
    if (!taskId) {
        warn(`[bodyshop] [${room.name}] [spawn] did not find a waiting task`)
        return;
    }

    const task : ?Task = Kernel.getTaskById(taskId);
    if (!task) {
        error(`[bodyshop] [${room.name}] [spawn] ${taskId} is missing`)
        return;
    }

    const openTaskCount : number = Kernel.getLocalCount(room.name, (holder: TaskHolder) => {
        const state : TaskState = holder.meta.state;
        return (state === TaskStates.WAITING || state === TaskStates.RUNNING);
    });

    if (task.prio < TaskPriorities.UPGRADE) {
        warn(`[bodyshop] [${room.name}] no normal priority task found`);
    }

    let creepBody : ?CreepBody;
    if (task.prio >= TaskPriorities.URGENT) {
        creepBody = designAffordableCreep(task, room);
    } else {
        creepBody = designOptimalCreep(task, room);
    }
    if (!creepBody) {
        info(`[bodyshop] [${room.name}] no suitable body could be constructed for ${taskId} ${task.type} ${task.prio}`);
        return;
    }

    debug(`[bodyshop] [${room.name}] will spawn for task ${taskId} ${task.type} ${task.prio}`);

    return createCreep(spawn, creepBody);
}
