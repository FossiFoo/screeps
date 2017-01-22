/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { Position, RoomMemory, TerrainUsageMatrix, TerrainUsageCell } from "../types/FooTypes.js";

import { ROOM_MEMORY_VERSION } from "./consts";

export function memory(room: Room): RoomMemory {
    if (room.memory.version === ROOM_MEMORY_VERSION) {
        return (room.memory: RoomMemory);
    }
    const initRoom: RoomMemory = {
        version: ROOM_MEMORY_VERSION,
        usage: {
            terrain: []
        }
    }
    _.defaultsDeep(room.memory, initRoom);
    room.memory.version = ROOM_MEMORY_VERSION;
    return (room.memory: RoomMemory);
}

export function incrementTerrainUsage(room: Room, x: XCoordinate, y: YCoordinate): void {
    const mem : RoomMemory = memory(room);
    const terrain : TerrainUsageMatrix = mem.usage.terrain;
    if (!terrain[x]) {
        terrain[x] = [];
    }
    if (!terrain[x][y]) {
        terrain[x][y] = {
            x,
            y,
            count: 0
        }
    }
    const cell : TerrainUsageCell = terrain[x][y];
    if (cell) {
        cell.count = cell.count + 1;
    }
}

export function getTerrainUsage(room: Room): TerrainUsageMatrix {
    const mem : RoomMemory = memory(room);
    return mem.usage.terrain;
}

export function clearTerrainUsage(room: Room): void {
    const mem : RoomMemory = memory(room);
    mem.usage.terrain = [];
}

export function getSpawns(room: Room): Spawn[] {
    return room.find(FIND_MY_SPAWNS);
}

export function getBase(room: Room): RoomPosition {
    const storage : ?Storage = room.storage;
    if (storage) {
        return storage.pos;
    }
    const spawn : Spawn = _.head(getSpawns(room));
    if (spawn) {
        return spawn.pos;
    }
    return new RoomPosition(25, 25, room.name); //FIXME analyse room terrain for open field near sources
}

export function getSources(room: Room): Source[] {
    // ignore SK lair sources for usual operations
    const allSources : Source[] = room.find(FIND_SOURCES);
    const sources = _.filter(allSources, (s: Source): boolean => {
        const top : number = Math.max(0, s.pos.y - 3);
        const left : number = Math.max(0, s.pos.x - 3);
        const bottom : number = Math.min(50, s.pos.y + 3);
        const right : number = Math.min(50, s.pos.x + 3);
        const structures = room.lookForAtArea(LOOK_STRUCTURES, top, left, bottom, right, true);
        return !_.some(structures, (f) => f && f.structure && f.structure.structureType === STRUCTURE_KEEPER_LAIR);
    });
    return sources;
}

export function getConstructionSites(room: Room): ConstructionSite[] {
    return room.find(FIND_MY_CONSTRUCTION_SITES);
}

export function getExtensions(room: Room): Extension[] {
    const structures : Structure[] = room.find(FIND_MY_STRUCTURES);
    const extensions : any[] = _.filter(structures, (s: Structure) => s.structureType === STRUCTURE_EXTENSION);
    return extensions;
}

export function getTowers(room: Room): Tower[] {
    const structures : Structure[] = room.find(FIND_MY_STRUCTURES);
    const extensions : any[] = _.filter(structures, (s: Structure) => s.structureType === STRUCTURE_TOWER);
    return extensions;
}

export function calculatePathLength(room: Room, from: RoomPosition, to: RoomPosition) {
    const path = room.findPath(from, to, {
        ignoreCreeps: true,
        ignoreRoads: true
    });
    return _.size(path);
}
