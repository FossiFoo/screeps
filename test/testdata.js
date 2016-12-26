/* @flow */

import type { Task, ProvisionTask, TaskMeta,
              StatsMemory, OwnMemory, MonitoringMemory, GCLStats, CPUStats,
              KernelMemory } from "../types/FooTypes.js";

import { TASK_PRIO_MAX, TaskStates } from "../src/consts.js";

const validTask : ProvisionTask = {
    type: "PROVISION",
    source: "SOURCE_ANY",
    created: 0,
    updated: 0,
    prio: TASK_PRIO_MAX
};

const validMeta : TaskMeta = {
    state: TaskStates.WAITING
}

export const Tasks = {
    valid: validTask,
    validMeta: validMeta
}

const validGCLStats: GCLStats = {
    level: 0,
    progress: 0,
    progressTotal: 0
}

const validCPUStats: CPUStats = {
    limit: 1,
    tickLimit: 500,
    bucket: 9001,
    stats: 1,
    getUsed: 0
}

const validStats: StatsMemory = {
    time: 0,
    room: {},
    spawn: {},
    gcl: validGCLStats,
    cpu: validCPUStats
}

const validMonitoring: MonitoringMemory = {
    errors: []
}

const validKernel: KernelMemory = {
    scheduler: {
        tasks: {}
    }
}

const validMemory: OwnMemory = {
    initialized: true,
    version: 1,
    finished: true,
    stats: validStats,
    monitoring: validMonitoring,
    kernel: validKernel
};

export const Memorys = {
    valid: validMemory
}
