/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { Task, TaskId, FooMemory, KernelMemory, TaskState, TaskMeta, TaskHolder } from "../types/FooTypes.js";
import  { TaskStates} from "./consts";

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

function makeTaskMeta(state: TaskState): TaskMeta {
    return {
        state
    }
};

export function makeTaskId(): TaskId {
    return "task-" + _.random(100000, 100000000).toString(36).slice(0,4);
}

export function addTask(task: Task): ?TaskId {
    const id: string = makeTaskId();
    Memory.scheduler.tasks[id] = makeTaskHolder(id, task, makeTaskMeta(TaskStates.WAITING));
    return id;
}

export function getWaiting(): ?Task {
}

export function getTaskById(id: TaskId): ?Task {
    const holder : ?TaskHolder = Memory.scheduler.tasks[id];
    return holder && holder.task;
}
