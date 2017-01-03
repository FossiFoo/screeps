/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

export function getSpawns(room: Room): Spawn[] {
    return room.find(FIND_MY_SPAWNS);
}

export function getConstructionSites(room: Room): ConstructionSite[] {
    return room.find(FIND_MY_CONSTRUCTION_SITES);
}

export function getExtensions(room: Room): Extension[] {
    const structures : Structure[] = room.find(FIND_MY_STRUCTURES);
    const extensions : any[] = _.filter(structures, (s: Structure) => s.structureType === STRUCTURE_EXTENSION);
    return extensions;
}
