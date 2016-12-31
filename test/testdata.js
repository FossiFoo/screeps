/* @flow */

import type { Task, TaskMeta, TaskHolder,
              TaskStepNavigate,
              StatsMemory, OwnMemory, MonitoringMemory, GCLStats, CPUStats,
              KernelMemory,
              ProvisionTask, SourceTarget, EnergyTarget } from "../types/FooTypes.js";

import { TaskPriorities, TaskTypes, TaskStates, SourceTargets } from "../src/consts.js";

const validRoomName : RoomName = "N0W0";
const otherRoomName : RoomName = "N1W1";

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

const otherRoomSource : SourceTarget = {
    type: SourceTargets.ANY,
    room: otherRoomName
}

export const Sources = {
    valid: validSource,
    otherRoom: otherRoomSource
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

const validHolder : TaskHolder = {
    id: "test-1234",
    task: validTask,
    meta: validMeta
}

export const invalidTypeUnknown = {
    type: "UNKNOWN",
    assignedRoom: validRoomName,
    source: validSource,
    target: validTarget,
    created: 0,
    updated: 0,
    prio: TaskPriorities.MAX
}

export const validStep : TaskStepNavigate = {
    type: "NAVIGATE",
    destination: {
        room: "N0W0",
        position: {
            x: 1,
            y: 1
        }
    }
}

export const Tasks = {
    valid: validTask,
    invalidTypeUnknown: ((invalidTypeUnknown: any): Task),
    validMeta: validMeta,
    validHolder: validHolder,
    validStep: validStep
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
