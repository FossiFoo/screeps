/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { FooMemory, RoomStats } from "../types/FooTypes.js";

import * as Memory from "./api/Memory.js";

export function init(): void {
}

export function roomStats(room: Room): RoomStats {

    const roomStats = {};

    const isMyRoom: boolean = (room.controller && room.controller.my);
    roomStats.myRoom = isMyRoom ? 1 : 0;
    if (!isMyRoom) {
        roomStats.energyAvailable = room.energyAvailable;
        roomStats.energyCapacityAvailable = room.energyCapacityAvailable;
        roomStats.controllerProgress = room.controller.progress;
        roomStats.controllerProgressTotal = room.controller.progressTotal;

        const stored = room.storage ?  room.storage.store[RESOURCE_ENERGY] : 0;
        /* const storedTotal =  room.storage ? room.storage.storeCapacity[RESOURCE_ENERGY] : 0;

        Memory.stats['room.' + room.name + '.storedEnergy'] = stored;
        /* Memory.stats['room.' + room.name + '.storedCapacity'] = storedTotal;*/
    }

    return roomStats;
}

export function recordStats(rooms: RoomMap): void {

    for (let roomKey:string in rooms) {
        let room: Room = rooms[roomKey];

        /* Memory.stats.room[roomKey] = roomStats(room);*/
    }

    /* const spawns = Game.spawns*/
    /* Memory.stats['gcl.progress'] = Game.gcl.progress
     * Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal
     * Memory.stats['gcl.level'] = Game.gcl.level
     * for (let spawnKey in spawns) {
     *     let spawn = Game.spawns[spawnKey]
     *     Memory.stats['spawn.' + spawn.name + '.defenderIndex'] = spawn.memory['defenderIndex']
     * }

     * Memory.stats['cpu.CreepManagers'] = creepManagement
     * Memory.stats['cpu.Towers'] = towersRunning
     * Memory.stats['cpu.Links'] = linksRunning
     * Memory.stats['cpu.SetupRoles'] = roleSetup
     * Memory.stats['cpu.Creeps'] = functionsExecutedFromCreeps
     * Memory.stats['cpu.SumProfiling'] = sumOfProfiller
     * Memory.stats['cpu.Start'] = startOfMain
     * Memory.stats['cpu.bucket'] = Game.cpu.bucket
     * Memory.stats['cpu.limit'] = Game.cpu.limit
     * Memory.stats['cpu.stats'] = Game.cpu.getUsed() - lastTick
     * Memory.stats['cpu.getUsed'] = Game.cpu.getUsed()*/
}
