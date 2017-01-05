/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// types
import type { CreepBody, FooMemory, Task, TaskId,
              TaskHolder, TaskState,
              SourceTarget, EnergyTargetSpawn, EnergyTargetController,
              CreepMemory } from "../types/FooTypes.js";

// API
/* import Game from "./ApiGame";*/
import * as ApiMemory from "./ApiMemory";

// Support
import * as Stats from "./stats";
import * as Monitoring from "./monitoring";
import { error, warn, info, debug } from "./monitoring";

// Utils
import * as Tasks from "./tasks";
import { TaskTypes, TaskPriorities, SourceTargets, CreepStates, EnergyTargetTypes, TaskStates } from "./consts";

// Game
import * as Kernel from "./kernel";
type KernelType = typeof Kernel;
import * as Planner from "./planner";
import * as Creeps from "./creeps";
import * as Rooms from "./rooms";
import * as BodyShop from "./bodyshop";

export function checkCPUOverrun(mem: FooMemory): void {
    if (mem.finished !== true) {
        error(`Tick did not finish: ${Game.time - 1}`);
    }
}

export function init(Game: GameI, Memory: FooMemory): void {
    debug("tick: " + Game.time);
    Memory.finished = false;
    Stats.init(Game, Memory);
    Monitoring.init(Game, Memory);
    Kernel.init(Game, Memory);
    Tasks.init(Game, Memory);
    Planner.init(Game, Memory);
}

export function finish(Memory: FooMemory): void {
    Memory.finished = true;
    debug("tock");
}


export function assignLocalTasks(Kernel: KernelType, creep: Creep, Game: GameI): void {

    if (Creeps.getState(creep) === CreepStates.BUSY) {
        return;
    }

    debug(`[main] [${creep.name}] assigning local tasks`);

    const room : Room = creep.room; // FIXME make this assigned room?
    const task : ?TaskId = Kernel.getLocalWaiting(room.name /* , creep*/);
    if (!task) {
        //FIXME look for task somewhere else or recycle
        return;
    }

    info(`[main] [${creep.name}] takes up task ${task}`);
    Kernel.assign(task, creep);
}

export function spawnCreepsForLocalTasks(Kernel: KernelType, spawn: Spawn, Game: GameI): ?CreepName {
    return BodyShop.spawnCreepForTask(Kernel, spawn, Game);
}

export function processTasks(Kernel: KernelType, creep: Creep, Game: GameI) {

    if (creep.spawning) {
        return;
    }

    if (Creeps.getState(creep) === CreepStates.IDLE) {
        warn("[main] [" + creep.name +"] is idle")
        return;
    }

    debug(`processing task for ${creep.name}`);

    Kernel.processTask(creep);
    // - worker
    // - miner
    // - hauler
    // - LDH
    // - claim
}

export function collectGarbage(Game: GameI, Memory: FooMemory) {
    for (let c in Memory.creeps) {
        if(!Game.creeps[c]) {
            info(`[creep] [garbage] burying ${c}`);
            const creepMemory : CreepMemory = Memory.creeps[c];
            const taskId : ?TaskId = creepMemory.task.assignedId;
            if (taskId) {
                Kernel.collectGarbage(c, taskId);
            }
            delete Memory.creeps[c];
        }
    }
};


export function loopInternal(Game: GameI, FooMemory: FooMemory): void {

    checkCPUOverrun(FooMemory);

    init(Game, FooMemory);

    const rooms: RoomMap = Game.rooms;
    const creeps: CreepMap = Game.creeps;
    const spawns: SpawnMap = Game.spawns;

    for (let roomKey: string in rooms) {
        const room: Room = rooms[roomKey];
        Planner.generateLocalPriorityTasks(Kernel, room, Game);
    }

    // === GLOBAL ===
    // assign creeps

    for (let creepKey: string in creeps) {
        const creep: Creep = creeps[creepKey];
        assignLocalTasks(Kernel, creep, Game);
    }

    // create creeps
    for (let spawnKey: string in spawns) {
        const spawn: Spawn = spawns[spawnKey];
        spawnCreepsForLocalTasks(Kernel, spawn, Game);
    }

    // === CIVILIAN ACTION ===
    for (let creepKey: string in creeps) {
        const creep: Creep = creeps[creepKey];
        processTasks(Kernel, creep, Game);
    }

    // === ARMY ACTION ===
    // - defence
    // - offence


    // === UPGRADE ===
    for (let roomKey: string in rooms) {
        const room: Room = rooms[roomKey];
        Planner.generateLocalImprovementTasks(Kernel, room, Game);
    }

    // === DEFERREDS & MAINTENANCE ===
    collectGarbage(Game, FooMemory);
    // path caching
    // object caching

    Stats.recordStats(Game, FooMemory);

    finish(FooMemory);
}

export function loop(): void {
    const MemoryInternal: FooMemory = (ApiMemory.initializeMemory(Memory));
    loopInternal(Game, MemoryInternal);
}
