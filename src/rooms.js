/* @flow */

export function getSpawns(room: Room): Spawn[] {
    return room.find(FIND_MY_SPAWNS);
}
