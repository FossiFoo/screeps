/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// types
import type { CreepBody, FooMemory, Task, TaskId,
              TaskHolder, TaskState,
              SourceTarget, EnergyTargetSpawn, EnergyTargetController } from "../types/FooTypes.js";

// API
/* import Game from "./ApiGame";*/
import * as ApiMemory from "./ApiMemory";
// $FlowFixMe
const Memory: FooMemory = (ApiMemory.initializeMemory(Memory));

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
import * as Creeps from "./creeps";
import * as Rooms from "./rooms";

export function createCreep(spawn: Spawn, creepBody: CreepBody): ?CreepName {
    const returnValue: number | string = spawn.createCreep(creepBody);

    if (typeof returnValue !== "string") {
        switch (returnValue) {
            case ERR_BUSY: return;
            case ERR_NOT_ENOUGH_ENERGY: return;
        }
        error("[main] ["+ spawn.name + "] create creep failed: " + returnValue);
        return;
    }

    debug("[main] ["+ spawn.name + "] creep spawned: " + returnValue);
    return returnValue;
}

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
}

export function finish(Memory: FooMemory): void {
    Memory.finished = true;
    debug("tock");
}

export function bootup(Kernel: KernelType, room: Room, Game: GameI): void {
    const creeps: CreepMap = Game.creeps; // FIXME make this room specific
    // min workers for a starting room
    const BOOTUP_THRESHOLD : number = 3;
    if (_.size(creeps) <= BOOTUP_THRESHOLD) {
        warn("[main] [" + room.name + "] bootup mode active");

        // FIXME check better
        const openTaskCount : number = Kernel.getLocalCount(room.name, (holder: TaskHolder) => {
            const state : TaskState = holder.meta.state;
            return holder.task.type === TaskTypes.PROVISION &&
                   (state === TaskStates.WAITING || state === TaskStates.RUNNING) ;
        });

        if (openTaskCount > 0) {
            debug("[main] [" + room.name + "] [bootup] has too many pending jobs");
            return;
        }

        const spawns : Spawn[] = Rooms.getSpawns(room);
        if (!spawns) {
            warn("[main] [" + room.name + "] has no spawn");
            return;
        }

        // simply use first spawn
        const spawn : Spawn = spawns[0];

        // construct a task to harvest some energy from anywhere and fill a spawn
        const source : SourceTarget = {
            type: SourceTargets.ANY,
            room: room.name
        }
        const target : EnergyTargetSpawn = {
            room: room.name,
            type: EnergyTargetTypes.SPAWN,
            name: spawn.name,
            targetId: spawn.id
        }
        const harvest: Task = Tasks.constructProvisioning(Game.time, TaskPriorities.URGENT, source, target);

        Kernel.addTask(harvest);
    }
}


export function generateLocalPriorityTasks(Kernel: KernelType, room: Room, Game: GameI): void {

    debug(`generating priority tasks for ${room.name}`)

    // === SURVIVAL ===
    // -> no spawn -> rebuild or abandon
    // -> low energy -> organize some energy
    bootup(Kernel, room, Game);
    // -> defence -> fill turret, repair, build defender, all repair
    // -> turret action

    // === UPKEEP ===
    // construct tasks
    // - mine source
    // - refill spawn
    // - refill extension
    // - refill turret
    // - refill storage
    // - refill container
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
    if (spawn.spawning) {
        return;
    }

    const room: Room = spawn.room;
    const task : ?TaskId = Kernel.getLocalWaiting(room.name /* , creep*/);
    if (!task) {
        return;
    }

    const creepBody : ?CreepBody = Kernel.designAffordableCreep(task, room);
    if (!creepBody) {
        debug(`[main] [${room.name}] no suitable body could be constructed for ${task}`);
        return;
    }
    return createCreep(spawn, creepBody);
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

export function upgradeController(Kernel: KernelType, room: Room): void {
    const openTaskCount : number = Kernel.getLocalCountForState(room.name, TaskStates.WAITING); // FIXME check better
    if (openTaskCount > 1) {
        debug(`[main] [${room.name}] is busy, not adding upgrade`);
        return;
    }

    const source : SourceTarget = {
        type: SourceTargets.ANY,
        room: room.name
    }
    const controller : EnergyTargetController = {
        type: EnergyTargetTypes.CONTROLLER,
        room: room.name,
        targetId: room.controller.id
    }
    const upgradeController: Task = Tasks.constructUpgrade(Game.time, TaskPriorities.UPGRADE, source, controller);

    Kernel.addTask(upgradeController);
}

export function generateLocalImprovementTasks(Kernel: KernelType, room: Room, Game: GameI): void {

    debug(`[main] [${room.name}] generating improvement tasks`)

    // - build extension
    // - build container
    // - build turret
    // - build storage
    // - build some road
    // - build some wall
    // - upgrade controller
    upgradeController(Kernel, room);
    // - mine long distance
    // - claim room
    // - assist room
    // - ???
}

export function loopInternal(Game: GameI, Memory: FooMemory): void {

    checkCPUOverrun(Memory);

    init(Game, Memory);

    const rooms: RoomMap = Game.rooms;
    const creeps: CreepMap = Game.creeps;
    const spawns: SpawnMap = Game.spawns;

    for (let roomKey: string in rooms) {
        const room: Room = rooms[roomKey];
        generateLocalPriorityTasks(Kernel, room, Game);
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
        generateLocalImprovementTasks(Kernel, room, Game);
    }

    // === DEFERREDS & MAINTENANCE ===
    // collectGarbage();
    // path caching
    // object caching

    Stats.recordStats(Game, Memory);

    finish(Memory);
}

export function loop(): void {
    loopInternal(Game, Memory);
}
