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
import { TaskTypes, TaskPriorities, SourceTargets, CreepStates, EnergyTargetTypes, TaskStates, ENERGY_CAPACITY_MAX } from "./consts";

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

    const broken : boolean = BodyShop.isCreepBroken(creep);
    if (broken) {
        warn(`[main] ${creep.name} is broken`);
        creep.moveTo(0,0);
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

    const taskId : ?TaskId = Creeps.getAssignedTask(creep);
    if (!taskId) {
        error("[kernel] [" + creep.name + "] has no task");
        return;
    }
    const taskState : TaskState = Kernel.processTask(creep, taskId);
    if (taskState === TaskStates.FINISHED || taskState === TaskStates.ABORTED) {
        Creeps.lift(creep, taskId);
        Planner.taskEnded(Kernel, taskId);
    }

    // - worker
    // - miner
    // - hauler
    // - LDH
    // - claim
}

export function recordMilestones(Game: GameI, Memory: FooMemory) {
    if (!Memory.milestones.cradle) {
        Memory.milestones.cradle = _.keys(Game.rooms)[0];
    }
    const cradleName : RoomName = Memory.milestones.cradle;
    const cradle : Room = Game.rooms[cradleName];
    if (!Memory.milestones.gclLevel[Game.gcl.level]) {
        Memory.milestones.gclLevel[Game.gcl.level] = Game.time;
    }
    const rcl : number = cradle.controller.level;
    if (!Memory.milestones.spawnRclLevel[rcl]) {
        Memory.milestones.spawnRclLevel[rcl] = Game.time;
    }
    const capacity : number = cradle.energyCapacityAvailable;
    console.log(ENERGY_CAPACITY_MAX[rcl])
    const max : number = ENERGY_CAPACITY_MAX[rcl];
    if (!Memory.milestones.spawnCapacity[rcl] && capacity === max) {
        Memory.milestones.spawnCapacity[rcl] = Game.time;
    }
    const towerCount : number = _.size(Rooms.getTowers(cradle));
    if (!Memory.milestones.towers[rcl] && towerCount === CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl]) {
        Memory.milestones.towers[rcl] = Game.time;
    }
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
    recordMilestones(Game, FooMemory);

    finish(FooMemory);
}

export function loop(): void {
    if (Memory.killMeYesReally) {
        for (let prop in Memory) {
            delete Memory[prop];
        }
        return;
    }

    const MemoryInternal: FooMemory = (ApiMemory.initializeMemory(Memory, Game.time));
    loopInternal(Game, MemoryInternal);
}
