/* @flow */

import { TaskStates, TaskTypes, TaskStepTypes, CREEP_MEMORY_VERSION, CreepStates, EnergyTargetTypes } from "../src/consts.js";
import type { SourceFixed, SourceAny, TaskTypeProvision, EnergyTargetTypeSpawn, CreepMemoryVersion } from "../types/ConstTypes.js";

export type Predicate<T> = (t: T) => boolean;

export type Tick = number;

export type Position = {
    x: number,
    y: number
}

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

export type TaskMap = {[name: TaskId]: TaskHolder};

export type KernelMemory = {
    scheduler: {
        tasks: TaskMap
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

export type SourceTargetFixed = {
    type: SourceFixed,
    id: SourceId
} & SourceTargetBase;

export type SourceTargetAny = {
    type: SourceAny
} & SourceTargetBase;

export type SourceTargetBase = {
    room: RoomName;
}

export type SourceTarget = SourceTargetFixed | SourceTargetAny;

export type EnergyTargetTypesType = $Keys<typeof EnergyTargetTypes>;

export type EnergyTargetSpawn = {
    type: EnergyTargetTypeSpawn;
    name: SpawnName;
    targetId: SpawnId;
} & EnergyTargetBase;

export type EnergyTargetBase = {
    room: RoomName;
};

export type EnergyTarget = any;

export type ProvisionTask = {
    type: TaskTypeProvision,
    source: SourceTarget,
    target: EnergyTarget
} & TaskBase;

export type TaskBase = {
    type: TaskType,
    assignedRoom: RoomName,
    created: Tick,
    updated: Tick,
    prio: TaskPrio
};

export type Task = ProvisionTask;

export type TaskId = string;

export type TaskState = $Keys<typeof TaskStates>;

export type TaskMeta = {
    state: TaskState,
    assigned: ?CreepName,
    startRoom: RoomName,
    startPosition: ?Position
}

export type TaskHolder = {
    id: TaskId,
    task: Task,
    meta: TaskMeta
}

export type CreepName = string;

export type CreepMemory = {
    version: CreepMemoryVersion,
    task: {
        assignedId: ?TaskId
    }
}

export type CreepBody = BODYPART_TYPE[];

export type CreepState = $Keys<typeof CreepStates>;

export type TaskStepResult = {
    error?: string;
    success?: any;
}

export type TaskStepType = $Keys<typeof TaskStepTypes>;

export type TaskStep = {
    type: TaskStepType
};

export type TaskStepNavigate = {
    type: "NAVIGATE",
    destination: {
        room: RoomName,
        position: Position
    }
} & TaskStep;

export type TaskStepHarvest = {
    type: "HARVEST",
    sourceId: SourceId
} & TaskStep;

export type TaskStepTransfer = {
    type: "TRANSFER",
    targetId: ObjectId
} & TaskStep;

export type TaskStepNoop = {
    type: "NOOP"
} & TaskStep;
