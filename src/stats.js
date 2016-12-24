/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { FooMemory, RoomStats, StatsMemory } from "../types/FooTypes.js";

export function init(): void {
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

export function recordStats(Game: GameI, Memory: FooMemory): void {
    Memory.stats = generateStats(Game.rooms);
}

export function generateStats(rooms: RoomMap): StatsMemory {

    let stats : StatsMemory = {
        "room": {}
    };

    for (let roomKey:string in rooms) {
        let room: Room = rooms[roomKey];
        /* console.error("!!!!!!!!");
         * console.error(roomKey);
         * console.error(room);*/

        stats.room[roomKey] = roomStats(room);
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

    return stats;
}
