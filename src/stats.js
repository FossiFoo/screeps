/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { FooMemory, RoomStats, SpawnStats, GCLStats, CPUStats, StatsMemory, SpawnMemory } from "../types/FooTypes.js";
import { debug, info } from "./monitoring";

const REPORT_FREQUENCY = 10;

export function init(Game: GameI, Memory: FooMemory): void {
}

export function roomStats(room: Room): RoomStats {

    const roomStats = {};

    const isMyRoom: boolean = (room.controller && room.controller.my);
    roomStats.myRoom = isMyRoom ? 1 : 0;
    if (isMyRoom) {
        roomStats.energyAvailable = room.energyAvailable;
        roomStats.energyCapacityAvailable = room.energyCapacityAvailable;
        roomStats.controllerProgress = room.controller.progress;
        roomStats.controllerProgressTotal = room.controller.progressTotal;

        roomStats.storedEnergy = room.storage ?  room.storage.store[RESOURCE_ENERGY] : 0;
        roomStats.storedCapacity =  room.storage ? room.storage.storeCapacity : 0; //FIXME this correct?
    }

    return roomStats;
}

export function spawnStats(spawn: Spawn): SpawnStats {
    const memory: SpawnMemory = spawn.memory;
    const defenderIndex: ?number = memory && memory.defenderIndex;
    return {
        "defenderIndex": defenderIndex ? defenderIndex : 0
    }
}

export function gclStats(gcl: GlobalControlLevel): GCLStats {
    return {
        "progress": gcl.progress,
        "progressTotal": gcl.progressTotal,
        "level": gcl.level
    }
}

export function cpuStats(cpu: CPU,  lastTick: number): CPUStats {

    /* Memory.stats['cpu.CreepManagers'] = creepManagement
     * Memory.stats['cpu.Towers'] = towersRunning
     * Memory.stats['cpu.Links'] = linksRunning
     * Memory.stats['cpu.SetupRoles'] = roleSetup
     * Memory.stats['cpu.Creeps'] = functionsExecutedFromCreeps
     * Memory.stats['cpu.SumProfiling'] = sumOfProfiller
     * Memory.stats['cpu.Start'] = startOfMain*/
    const used : number = cpu.getUsed();
    return {
        "bucket": cpu.bucket,
        "tickLimit": cpu.tickLimit,
        "limit": cpu.limit,
        "stats": used - lastTick,
        "getUsed": used
    }
}

export function generateStats(
    time: number,
    rooms: RoomMap,
    spawns: SpawnMap,
    gcl: GlobalControlLevel,
    cpu: CPU,
    lastTick: number): StatsMemory {

    let stats = {};
    stats.time = time;

    stats.room = {};
    for (let roomKey:string in rooms) {
        let room: Room = rooms[roomKey];
        stats.room[roomKey] = roomStats(room);
    }

    stats.spawn = {};
    for (let spawnKey:string in spawns) {
        let spawn: Spawn = spawns[spawnKey];
        stats.spawn[spawnKey] = spawnStats(spawn);
    }

    stats.gcl = gclStats(gcl);

    stats.cpu = cpuStats(cpu, lastTick);

    return stats;
}

export function reportStats(tick: number, stats: StatsMemory) {
    info("");
    info("");
    info("");
    info(`= FooStats ================================`);
    info(`Tick: ${tick}`);
    info("");
    info("");
    info(`- GCL -------------------------------------`);
    info(`Level: ${stats.gcl.level}`);
    info("");
    info("");
    info(`- ROOMS -----------------------------------`);
    info(`Room count: ${_.size(stats.room)}`);
    info("");
    info("");
    info(`- SPAWNS ----------------------------------`);
    info(`Spawn count: ${_.size(stats.spawn)}`);
    info("");
    info("");
    info(`- CPU -------------------------------------`);
    info(`cpu limit: ${stats.cpu.limit}`);
    info(`tick limit: ${stats.cpu.tickLimit}`);
    info(`bucket: ${stats.cpu.bucket}`);
    info(`used: ${stats.cpu.getUsed}`);
    info("");
    info("");
    info(`===========================================`);
}

export function recordStats(Game: GameI, Memory: FooMemory): void {
    const time: number = Game.time;
    const lastTime: number = Memory.stats.time;
    const lastTick: number = Memory.stats.cpu.getUsed;
    Memory.stats = generateStats(time, Game.rooms, Game.spawns, Game.gcl, Game.cpu, lastTick);
    if ((time - lastTime) > REPORT_FREQUENCY) {
        reportStats(Game.time, Memory.stats);
    }
}
