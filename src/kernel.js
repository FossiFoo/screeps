/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { Task, TaskId, TaskState, TaskMeta, TaskHolder, TaskPrio, TaskType,
              Position,
              FooMemory, KernelMemory, TaskMap,
              CreepBody } from "../types/FooTypes.js";

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

import { debug, info, error } from "./monitoring";


import * as Creeps from "./creeps"

export let Memory: KernelMemory;

export function init(Game: GameI, mem: FooMemory): void {
    Memory = mem.kernel;
};

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
    info("[kernel] added new task " + id);
    return id;
}

export function makeFnFilterLocalByStatus(localRoom: RoomName, status: TaskState): (holder: TaskHolder) => boolean {
    return (holder: TaskHolder) => {
        return holder.task.assignedRoom === localRoom &&
               holder.meta.state === status
    };
}

export function getLocalWaiting(room: RoomName /* , creep: Creep*/): ?TaskId {
    // body, ticksToLive, carry, carryCapacity
    const tasks : TaskMap = Memory.scheduler.tasks;
    const localRoom : RoomName = room;
    const filterFn = makeFnFilterLocalByStatus(localRoom, TaskStates.WAITING);
    const localTasks : TaskHolder[] = _.filter(tasks, filterFn);
    const sortedTasks : TaskHolder[] = _.sortBy(localTasks, (holder: TaskHolder): TaskPrio => holder.task.prio);
    const first : ?TaskHolder = _.head(sortedTasks);
    info("[Kernel] found " + (first ? first.id : "no") + " task for " + localRoom);
    return first && first.id;
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

    info(`[Kernel] assigned ${id} to ${creep.name}`);
    holder.meta.assigned = creep.name;
    holder.meta.state = TaskStates.RUNNING;
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
    const holder : ?TaskHolder = getHolderById(taskId, room);
    if (!holder) {
        return null;
    }
    const maxEnergy : number = room.energyAvailable;

    const taskType: TaskType = holder.task.type;
    switch (taskType) {
        case TaskTypes.PROVISION: {
            return designAffordableWorker(maxEnergy);
        }
    }
    error("[kernel] task type not known " + taskType);
    return null;
}
