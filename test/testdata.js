/* @flow */

import type { Task, TaskMeta,
              StatsMemory, OwnMemory, MonitoringMemory, GCLStats, CPUStats,
              KernelMemory,
              ProvisionTask, SourceTarget, EnergyTarget } from "../types/FooTypes.js";

import { TaskPriorities, TaskTypes, TaskStates, SourceTargets } from "../src/consts.js";

const validRoomName : RoomName = "N0W0";

const validTarget : EnergyTarget = {
    room: validRoomName
}

export const Targets = {
    valid: validTarget
}

const validSource : SourceTarget = {
    type: SourceTargets.ANY,
    room: validRoomName
}

export const Sources = {
    valid: validSource
}

const validTask : ProvisionTask = {
    type: TaskTypes.PROVISION,
    assignedRoom: validRoomName,
    source: validSource,
    target: validTarget,
    created: 0,
    updated: 0,
    prio: TaskPriorities.MAX
};

const validMeta : TaskMeta = {
    state: TaskStates.WAITING,
    assigned: null,
    startRoom: validRoomName,
    startPosition: null
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
