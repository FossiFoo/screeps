/* @flow */

import type { SourceAny, SourceFixed, TaskTypeProvision, CreepMemoryVersion } from "../types/ConstTypes.js"

export const CREEP_MEMORY_VERSION : CreepMemoryVersion = "0.0.1";

const TASK_PRIO_MAX = 1000000;

export const TaskPriorities = {
    MIN:             0,
    SUSPENDED:      10,
    IDLE:          100,
    UPGRADE:      1000,
    UPKEEP:      10000,
    URGENT:     100000,
    IMMEDIATE: 1000000,
    MAX: TASK_PRIO_MAX
}

export const TaskStates = {
    WAITING: "WAITING",
    RUNNING: "RUNNING",
    BLOCKED: "BLOCKED",
    FINISHED: "FINISHED",
    ABORTED: "ABORTED"
}

export const TaskTypes = {
    PROVISION: ("PROVISION": TaskTypeProvision)
}

export const TaskStepTypes = {
    NOOP: "NOOP",
    NAVIGATE: "NAVIGATE"
}

export const SourceTargets = {
    ANY: ("SOURCE_ANY": SourceAny),
    FIXED: ("SOURCE_FIXED": SourceFixed)
}

export const CreepStates = {
    IDLE: "IDLE",
    BLOCKED: "BLOCKED",
    SUSPENDED: "SUSPENDED",
    BUSY: "BUSY",
    PANIC: "PANIC"
}

export const EnergyTargetTypes = {
    SPAWN: "SPAWN",
    OTHER: "OTHER"
}
