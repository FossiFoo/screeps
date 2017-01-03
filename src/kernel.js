/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { Predicate,
              Task, TaskId, TaskState, TaskMeta, TaskHolder, TaskPrio, TaskType,
              TaskStep, TaskStepResult,
              Position,
              FooMemory, KernelMemory, TaskHolderMap, TaskMemoryHolder, TaskMemory,
              CreepBody } from "../types/FooTypes.js";

type HolderPredicate = Predicate<TaskHolder>;

/* import { BODYPART_COST } from "../types/FooTypes.js";*/
const BODYPART_COST = {
    "move": 50,
    "work": 100,
    "attack": 80,
    "carry": 50,
    "heal": 250,
    "ranged_attack": 150,
    "tough": 10,
    "claim": 600
};


import { TaskStates, TaskTypes } from "./consts";

import { debug, info, warn, error } from "./monitoring";


import * as Creeps from "./creeps";
import * as Tasks from "./tasks";

export let Memory: KernelMemory;

export function init(Game: GameI, mem: FooMemory): void {
    Memory = mem.kernel;
};

export function collectGarbage(creepName: CreepName, id: TaskId) {
    const holder : ?TaskHolder = getHolderById(id);
    if (!holder) {
        return;
    }
    warn(`[kernel] [garbage] aborting ${id}`);
    holder.meta.state = TaskStates.ABORTED;
    holder.meta.assigned = "";

    const cleanupTasks : TaskHolder[] = _.filter(Memory.scheduler.tasks, (holder: TaskHolder) => {
        return holder.meta.assigned === creepName ||
               holder.meta.state === TaskStates.ABORTED;
    });
    for (let h : TaskHolder of cleanupTasks) {
        delete Memory.scheduler.tasks[h.id];
    }
    // virtual
}

function makeTaskHolder(id: TaskId, task: Task, meta: TaskMeta): TaskHolder {
    return {
        id,
        task,
        meta
    }
};

function makeTaskMeta(state: TaskState, startRoom: RoomName, startPosition: Position): TaskMeta {
    return {
        state,
        startRoom,
        startPosition,
        assigned: null
    }
};

export function makeTaskId(room: RoomName): TaskId {
    return "task-" + room + "-" + _.random(100000, 100000000).toString(36).slice(0,4);
}

export function addTask(task: Task): ?TaskId {
    const room: RoomName = task.assignedRoom;
    const id: string = makeTaskId(room);
    const meta: TaskMeta = makeTaskMeta(TaskStates.WAITING, room, {x:0, y:0});
    Memory.scheduler.tasks[id] = makeTaskHolder(id, task, meta);
    warn("[kernel] added new task " + id);
    return id;
}

export function makeFnFilterLocalByStatus(localRoom: RoomName, status: TaskState): HolderPredicate {
    return makeFnFilterLocal(localRoom, (holder: TaskHolder) => {
        return holder.meta.state === status
    });
}

export function makeFnFilterLocal(localRoom: RoomName, filterFn: HolderPredicate): HolderPredicate {
    return (holder: TaskHolder) => {
        return holder.task.assignedRoom === localRoom && filterFn(holder);
    };
}

function filterHolders(filterFn: HolderPredicate): TaskHolder[] {
    // body, ticksToLive, carry, carryCapacity
    const tasks : TaskHolderMap = Memory.scheduler.tasks;
    const localTasks : TaskHolder[] = _.filter(tasks, filterFn);
    return localTasks;
}

export function getLocalWaiting(room: RoomName /* , creep: Creep*/): ?TaskId {
    const localTasks : TaskHolder[] = filterHolders(makeFnFilterLocalByStatus(room, TaskStates.WAITING));
    const sortedTasks : TaskHolder[] = _.sortBy(localTasks, (holder: TaskHolder): TaskPrio => holder.task.prio);
    const first : ?TaskHolder = _.last(sortedTasks); // highest prio
    info("[Kernel] found " + (first ? first.id : "none") + " as next task for " + room);
    return first && first.id;
}

export function getLocalCount(room: RoomName, filterFn: HolderPredicate): number {
    const localTasks : TaskHolder[] = filterHolders(makeFnFilterLocal(room, filterFn));
    return _.size(localTasks);
}

export function getLocalCountForState(room: RoomName, state: TaskState): number {
    const localTasks : TaskHolder[] = filterHolders(makeFnFilterLocalByStatus(room, state));
    return _.size(localTasks);
}

export function getTaskById(id: TaskId): ?Task {
    const holder : ?TaskHolder = getHolderById(id);
    return holder && holder.task;
}

export function getHolderById(id: TaskId): ?TaskHolder {
    const holder : ?TaskHolder = Memory.scheduler.tasks[id];
    if (!holder) {
        error("[kernel] Task not found: " + id);
        return null;
    }
    return holder;
}

export function assign(id: TaskId, creep: Creep): void {
    const holder : ?TaskHolder = getHolderById(id)
    if (!holder) {
        return;
    }

    warn(`[Kernel] assigned ${id} to ${creep.name}`);
    holder.meta.assigned = creep.name;
    holder.meta.state = TaskStates.ASSIGNED;
    Creeps.assign(creep, id, holder.task);
}

export function designAffordableWorker(maxEnergy: number): ?CreepBody {
    const maxCarry : number = maxEnergy - BODYPART_COST["work"];
    const partsCarry : number = Math.floor(maxCarry / (BODYPART_COST["carry"] + BODYPART_COST["move"]));
    if (partsCarry < 1) {
        return null;
    }

    let body: CreepBody = [WORK];
    for(let i:number = 0; i < partsCarry; i++) {
        body.push(CARRY);
        body.push(MOVE);
    }
    return body;
}

export function designAffordableCreep(taskId: TaskId, room: Room): ?CreepBody {
    const holder : ?TaskHolder = getHolderById(taskId);
    if (!holder) {
        return null;
    }
    const maxEnergy : number = room.energyAvailable;

    const taskType: TaskType = holder.task.type;
    switch (taskType) {
        case TaskTypes.UPGRADE:
        case TaskTypes.BUILD:
        case TaskTypes.PROVISION: {
            return designAffordableWorker(maxEnergy);
        }
    }
    error("[kernel] [population] task type not known " + taskType);
    return null;
}

export function getMemoryByTask(id: TaskId): TaskMemory {
    const holder : TaskMemoryHolder = Memory.virtual.tasks[id];
    if (holder) {
        return holder.memory;
    }
    const init : TaskMemory = {};
    Memory.virtual.tasks[id] = {memory: init};
    return init;
}

export function processTask(creep: Creep): void {
    const taskId : ?TaskId = Creeps.getAssignedTask(creep);
    if (!taskId) {
        error("[kernel] [" + creep.name + "] has no task");
        return;
    }
    const holder : ?TaskHolder = getHolderById(taskId);
    if (!holder) {
        error("[kernel] [" + creep.name + "] has unknown task " + taskId);
        Creeps.lift(creep, taskId);
        return;
    }

    const memory : TaskMemory = getMemoryByTask(taskId);

    //FIXME check task state for break

    const task : Task = holder.task;
    debug("[kernel] [" + creep.name + "] should " + task.type);

    const preStepState : TaskState = holder.meta.state;
    const step : TaskStep = Tasks.getNextStep(task, creep, preStepState, memory);
    debug("[kernel] [" + creep.name + "] is about to " + step.type);

    const result : TaskStepResult = Creeps.processTaskStep(creep, step, memory);

    // more state handling if finished, blocked, error
    if (!result.success) {
        if (preStepState === TaskStates.BLOCKED) {
            //FIXME check time or such
            warn(`[kernel] [${creep.name}] was blocked twice`);
        }
        holder.meta.state = TaskStates.BLOCKED;
        return;
    }

    if (step.final) {
        holder.meta.state = TaskStates.FINISHED;
        info(`[kernel] [${creep.name}] finished task ${taskId}`);
        Creeps.lift(creep, taskId);
        return;
    }

    holder.meta.state = TaskStates.RUNNING;
}
