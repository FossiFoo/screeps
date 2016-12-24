/* @flow */

export type RoomStats = {
    myRoom: 0 | 1
};

export type StatsMemory = {
    room: {[name: string]: RoomStats}
};

export type OwnMemory = {
    "initialized": true,
    "stats": StatsMemory
};

export type FooMemory = OwnMemory & MemoryI;

export type CreepBody = BODYPART_TYPE[];
