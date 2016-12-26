/* @flow */
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
    WAITING: "WAITING"
}

export const TaskTypes = {
    PROVISION: "PROVISION"
}

export const SourceTargets = {
    ANY: "SOURCE_ANY",
    FIXED: "SOURCE_FIXED"
}
