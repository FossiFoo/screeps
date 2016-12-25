/* @flow */

export type GCLStats = {
    level: number,
    progress: number,
    progressTotal: number
}

export type CPUStats = {
    limit: number,
    bucket: number,
    stats: number,
    getUsed: number
}

export type SpawnStats = {
    defenderIndex: number
}

export type RoomStats = {
    myRoom: 0 | 1
};

export type StatsMemory = {
    room: {[name: string]: RoomStats},
    spawn: {[name: string]: SpawnStats},
    gcl: GCLStats,
    cpu: CPUStats
};

export type OwnMemory = {
    "initialized": true,
    "stats": StatsMemory
};

export type FooMemory = OwnMemory & MemoryI;

export type SpawnMemory = {
    defenderIndex: ?number
}

export type CreepBody = BODYPART_TYPE[];
