/* @flow */

import type { Task, TaskMeta, TaskHolder,
              TaskStepNavigate,
              StatsMemory, OwnMemory, MonitoringMemory, GCLStats, CPUStats,
              KernelMemory, PlannerMemory,
              PlanningRoomData,
              CreepBodyDefinitionByType,
              ProvisionTask, SourceTarget, EnergyTargetSpawn, EnergyTarget,
              UpgradeTask, EnergyTargetController,
              TaskBuild, EnergyTargetConstruction } from "../types/FooTypes.js";

import { TaskPriorities, TaskTypes, TaskStates, SourceTargets, EnergyTargetTypes } from "../src/consts.js";

const validRoomName : RoomName = "N0W0";
const otherRoomName : RoomName = "N1W1";

const validTarget : EnergyTargetSpawn = {
    room: validRoomName,
    type: EnergyTargetTypes.SPAWN,
    name: "Spawn1",
    targetId: "test-spawn1-id",
    energyNeed: 300
}

const validController : EnergyTargetController = {
    room: validRoomName,
    type: EnergyTargetTypes.CONTROLLER,
    targetId: "test-controller-id",
    energyNeed: 100
}

const validConstruction : EnergyTargetConstruction = {
    room: validRoomName,
    type: EnergyTargetTypes.CONSTRUCTION,
    targetId: "test-construction-id",
    energyNeed: 300
}

export const Targets = {
    valid: validTarget,
    validController,
    validConstruction
}

const validSource : SourceTarget = {
    type: SourceTargets.ANY,
    room: validRoomName
}

const otherRoomSource : SourceTarget = {
    type: SourceTargets.ANY,
    room: otherRoomName
}

const fixedSource : SourceTarget = {
    type: SourceTargets.FIXED,
    room: validRoomName,
    id: "test-source-fixed-1"
}

export const Sources = {
    valid: validSource,
    otherRoom: otherRoomSource,
    fixed: fixedSource
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

const validUpgrade : UpgradeTask = {
    type: TaskTypes.UPGRADE,
    assignedRoom: validRoomName,
    source: validSource,
    target: validController,
    created: 0,
    updated: 0,
    prio: TaskPriorities.MAX
}

const validBuild : TaskBuild = {
    type: TaskTypes.BUILD,
    assignedRoom: validRoomName,
    source: validSource,
    target: validConstruction,
    created: 0,
    updated: 0,
    prio: TaskPriorities.MAX
}

const validMeta : TaskMeta = {
    state: TaskStates.WAITING,
    assigned: null,
    startRoom: validRoomName,
    startPosition: null,
    stateChanged: 0
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
    },
    init: true,
    final: false
}

export const Tasks = {
    valid: validTask,
    invalidTypeUnknown: ((invalidTypeUnknown: any): Task),
    validUpgrade,
    validBuild,
    validMeta: validMeta,
    validHolder: validHolder,
    validStep: validStep,
}

const validRoomData : PlanningRoomData = {
    name: "N0W0",
    energyPotential: 9001,
    sources: {"Source1": {id: "Source1", capacity: 700},
              "Source2": {id: "Source2", capacity: 9000},
              "Source3": {id: "Source3", capacity: 1}},
    paths: {
        base: {}
    }
};

export const Planner = {
    validRoomData
};

const work = ("work": WORK_TYPE);
const carry = ("carry": CARRY_TYPE);
const move = ("move": MOVE_TYPE);

const validBodyDefinition : CreepBodyDefinitionByType = {
    work: [{type: WORK, hits: 50}],
    carry: [{type: CARRY, hits: 100}, {type: CARRY, hits: 100}],
    move: [{type: MOVE, hits: 100}, {type: MOVE, hits: 100}],
};

const brokenBodyDefinition : CreepBodyDefinitionByType = {
    work: [{type: WORK, hits: 0}],
    carry: [{type: CARRY, hits: 50}, {type: CARRY, hits: 100}],
    move: [{type: MOVE, hits: 100}, {type: MOVE, hits: 100}],
};

export const BodyShop = {
    validBodyDefinition,
    brokenBodyDefinition
};

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
    lastReport: 0,
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
    },
    virtual: {
        tasks: {}
    }
}

const validPlanner: PlannerMemory = {
    energyDistribution: {
        rooms: {}
    }
}

const validMemory: OwnMemory = {
    initialized: true,
    version: 1,
    finished: true,
    stats: validStats,
    monitoring: validMonitoring,
    kernel: validKernel,
    planner: validPlanner
};

export const Memorys = {
    valid: validMemory
}
