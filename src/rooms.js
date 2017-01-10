/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { Position } from "../types/FooTypes.js";

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
        const structures = room.lookForAtArea(LOOK_STRUCTURES, s.pos.y - 3, s.pos.x -3, s.pos.y + 3, s.pos.x + 3, true);
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
