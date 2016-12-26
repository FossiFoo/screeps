/* @flow */

import { TaskStates, TaskTypes } from "../src/consts.js";

export type Tick = number;

export type GCLStats = {
    level: number,
    progress: number,
    progressTotal: number
};

export type CPUStats = {
    limit: number,
    tickLimit: number,
    bucket: number,
    stats: number,
    getUsed: number
};

export type SpawnStats = {
    defenderIndex: number
};

export type RoomStats = {
    myRoom: 0 | 1
};

export type StatsMemory = {
    time: Tick,
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
};

export type MonitoringMemory = {
    errors: ErrorEntry[]
};

export type KernelMemory = {
    scheduler: {
        tasks: {[taskId: TaskId]: TaskHolder}
    }
}

export type OwnMemory = {
    initialized: true,
    version: number,
    finished: boolean,
    stats: StatsMemory,
    monitoring: MonitoringMemory,
    kernel: KernelMemory
};

export type FooMemory = OwnMemory & MemoryI;

export type SpawnMemory = {
    defenderIndex: ?number
};

export type TaskPrio = number;

export type TaskType = $Keys<typeof TaskTypes>;

export type SourceId = string;
export type SourceAny = "SOURCE_ANY";

export type SourceTarget = SourceId | SourceAny;

export type ProvisionTask = {
    type: "PROVISION",
    source: SourceTarget
} & Task;

export type Task = {
    type: TaskType,
    created: Tick,
    updated: Tick,
    prio: TaskPrio
};

export type TaskId = string;

export type TaskState = $Keys<typeof TaskStates>;

export type TaskMeta = {
    state: TaskState
}

export type TaskHolder = {
    id: TaskId,
    task: Task,
    meta: TaskMeta
}

export type CreepBody = BODYPART_TYPE[];
