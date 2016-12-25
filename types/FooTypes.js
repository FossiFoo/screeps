/* @flow */

export type GCLStats = {
    level: number,
    progress: number,
    progressTotal: number
}

export type CPUStats = {
    limit: number,
    tickLimit: number,
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
    time: number,
    room: {[name: string]: RoomStats},
    spawn: {[name: string]: SpawnStats},
    gcl: GCLStats,
    cpu: CPUStats
};

export type ERRORTYPE =
    "GENERAL";

export type ErrorEntry = {
    time: number,
    type: ERRORTYPE,
    msg: string
}

export type MonitoringMemory = {
    errors: ErrorEntry[]
}

export type OwnMemory = {
    initialized: true,
    finished: boolean,
    stats: StatsMemory,
    monitoring: MonitoringMemory
};

export type FooMemory = OwnMemory & MemoryI;

export type SpawnMemory = {
    defenderIndex: ?number
}

export type CreepBody = BODYPART_TYPE[];
