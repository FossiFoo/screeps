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
import { TaskPriorities, SourceTargets } from "./consts";

// Game
import * as Kernel from "./kernel";
type KernelType = typeof Kernel;


const CREEP_MINER_BODY : CreepBody  = [WORK, MOVE, CARRY];
const CREEP_MINER_MEMORY = {role: "miner"};

export function createCreep(Game: GameI): ?CreepName {
    let returnValue: number | string = Game.spawns['Spawn1'].createCreep(CREEP_MINER_BODY, undefined, CREEP_MINER_MEMORY);

    if (typeof returnValue !== "string") {
        switch (returnValue) {
            case ERR_BUSY: return;
            case ERR_NOT_ENOUGH_ENERGY: return;
        }
        error("[main] spawn failed: " + returnValue);
        return;
    }

    debug("[main] creep spawned: " + returnValue);
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
    let creeps: CreepMap = Game.creeps; // FIXME make this room specific
    if (_.size(creeps) <= 3) {
        debug("[main] bootup mode for " + room.name);
        const source : SourceTarget = {
            type: SourceTargets.ANY,
            room: room.name
        }
        const target : EnergyTarget = {
            room: room.name
        }
        const harvest: Task = Tasks.constructProvisioning(Game.time, TaskPriorities.URGENT, source, target);
        Kernel.addTask(harvest);
    }
}


export function generateLocalTasks(Kernel: KernelType, room: Room, Game: GameI): void {

    debug(`generating local tasks for ${room.name}`)

    // === SURVIVAL ===
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

    debug(`assigning local tasks to ${creep.name}`)

    const room : Room = creep.room; // FIXME make this assigned room?
    const task : ?TaskId = Kernel.getLocalWaiting(room.name /* , creep*/);
    if (task) {
        Kernel.assign(task, creep);
    }
}

export function loop(): void {

    checkCPUOverrun(Memory);
    debug()

    init(Game, Memory);

    const rooms: RoomMap = Game.rooms;
    for (let roomKey:string in rooms) {
        const room: Room = rooms[roomKey];
        generateLocalTasks(Kernel, room, Game);
    }

    // === GLOBAL ===
    // assign creeps

    const creeps: CreepMap = Game.creeps;
    for (let creepKey:string in creeps) {
        const creep: Creep = creeps[creepKey];
        assignLocalTasks(Kernel, creep, Game);
    }

    // create creeps
    // - worker
    // - miner
    // - hauler
    // - LDH
    // - claim
    // - defence
    // - offence

    // === CIVILIAN ACTION ===


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
