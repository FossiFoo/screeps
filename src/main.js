/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// types
import type { CreepBody, FooMemory, Task, TaskId, SourceTarget, EnergyTarget } from "../types/FooTypes.js";

// API
import Game from "./ApiGame";
import Memory from "./ApiMemory";

// Support
import * as Stats from "./stats";
import * as Monitoring from "./monitoring";
import { error, warn, info, debug } from "./monitoring";

// Utils
import * as Tasks from "./tasks";
import { TaskPriorities, SourceTargets, CreepStates, EnergyTargetTypes } from "./consts";

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

export function finish(): void {
    Memory.finished = true;
    debug("tock");
}

export function bootup(Kernel: KernelType, room: Room, Game: GameI): void {
    const creeps: CreepMap = Game.creeps; // FIXME make this room specific
    // min workers for a starting room
    const BOOTUP_THRESHOLD : number = 3;
    if (_.size(creeps) <= BOOTUP_THRESHOLD) {
        debug("[main] [" + room.name + "] bootup mode active");

        const openTaskCount : number = Kernel.getLocalWaitingCount(room.name); // FIXME check better
        if (openTaskCount > 1) {
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
        const target : EnergyTarget = {
            room: room.name,
            type: EnergyTargetTypes.SPAWN,
            name: spawn.name,
            targetId: spawn.id
        }
        const harvest: Task = Tasks.constructProvisioning(Game.time, TaskPriorities.URGENT, source, target);

        Kernel.addTask(harvest);
    }
}


export function generateLocalTasks(Kernel: KernelType, room: Room, Game: GameI): void {

    debug(`generating local tasks for ${room.name}`)

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

    debug(`assigning local tasks to ${creep.name}`)

    const room : Room = creep.room; // FIXME make this assigned room?
    const task : ?TaskId = Kernel.getLocalWaiting(room.name /* , creep*/);
    if (task) {
        Kernel.assign(task, creep);
    }
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
        debug("[main] no suitable body could be constructed for " + task + " in " + room.name);
        return;
    }
    return createCreep(spawn, creepBody);
}

export function loop(): void {

    checkCPUOverrun(Memory);

    init(Game, Memory);

    const rooms: RoomMap = Game.rooms;
    for (let roomKey: string in rooms) {
        const room: Room = rooms[roomKey];
        generateLocalTasks(Kernel, room, Game);
    }

    // === GLOBAL ===
    // assign creeps

    const creeps: CreepMap = Game.creeps;
    for (let creepKey: string in creeps) {
        const creep: Creep = creeps[creepKey];
        assignLocalTasks(Kernel, creep, Game);
    }

    // create creeps
    const spawns: SpawnMap = Game.spawns;
    for (let spawnKey: string in spawns) {
        const spawn: Spawn = spawns[spawnKey];
        spawnCreepsForLocalTasks(Kernel, spawn, Game);
    }

    // === CIVILIAN ACTION ===
    // - worker
    // - miner
    // - hauler
    // - LDH
    // - claim
    // - defence
    // - offence


    // === ARMY ACTION ===


    // === UPGRADE ===
    // - build extension
    // - build container
    // - build turret
    // - build storage
    // - build some road
    // - build some wall
    // - upgrade controller
    // - mine long distance
    // - claim room
    // - assist room
    // - ???

    // === DEFERREDS & MAINTENANCE ===
    // collectGarbage();
    // path caching
    // object caching

    Stats.recordStats(Game, Memory);

    finish();
}
