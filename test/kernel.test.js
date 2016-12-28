/* @flow */

import type { Task, TaskId, FooMemory, KernelMemory, TaskState, TaskMeta, TaskHolder } from "../types/FooTypes.js";

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js")
import { TaskStates } from "../src/consts.js";

// DUT
jest.unmock("../src/kernel.js");
import * as dut from "../src/kernel.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";
import * as Creeps from "../src/creeps.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks } from "../test/testdata.js";

it('should init', function() {
    dut.init(Game, Memory);

    expect(dut.Memory).toBeDefined();
});

it('should add task to list', function() {
    const taskId : ?TaskId = dut.addTask(Tasks.valid);
    expect(taskId).toBeDefined();

    const mem : ?KernelMemory = dut.Memory;
    if (!mem) {
        throw "broken test";
    }
    expect(_.size(mem.scheduler.tasks)).toEqual(1);
});

it('should get task by its id', function() {
    const id : TaskId = "test-task-1234";
    const mockTask : Task = Tasks.valid;

    Memory.kernel.scheduler.tasks[id] = {id, task: mockTask, meta: Tasks.validMeta};

    dut.init(Game, Memory);
    const task : ?Task = dut.getTaskById(id);

    expect(task).toEqual(mockTask);
});

it('should make Filter', function() {
    const room : RoomName = "N0W0";
    const filter = dut.makeFnFilterLocalByStatus(room, TaskStates.WAITING);

    expect(filter).toBeDefined();

    const localWaiting : TaskHolder = {id: "", task: Tasks.valid, meta: Tasks.validMeta};
    expect(filter(localWaiting)).toBeTruthy();

    const remoteTask: Task = _.cloneDeep(Tasks.valid);
    remoteTask.assignedRoom = "N0E0";
    const remoteWaiting : TaskHolder = {id: "", task: remoteTask, meta: Tasks.validMeta};
    expect(filter(remoteWaiting)).toBeFalsy();

    const runningMeta: TaskMeta = _.cloneDeep(Tasks.validMeta);
    runningMeta.state = TaskStates.RUNNING;
    const localRunning : TaskHolder = {id: "", task: Tasks.valid, meta: runningMeta};
    expect(filter(localRunning)).toBeFalsy();
});

it('should get local waiting task', function() {

    // local waiting
    Memory.kernel.scheduler.tasks = {};
    const validId : TaskId = "test-task-valid-1234";
    const validTask : Task = Tasks.valid;
    Memory.kernel.scheduler.tasks[validId] = {id: validId, task: validTask, meta: Tasks.validMeta};

    // local running
    const runningId : TaskId = "test-task-running-1236";
    const runningTask : Task = Tasks.valid;
    const runningMeta: TaskMeta = _.cloneDeep(Tasks.validMeta);
    runningMeta.state = TaskStates.RUNNING;
    Memory.kernel.scheduler.tasks[runningId] = {id: "", task: runningTask, meta: runningMeta};

    // remote waiting
    const remoteId : TaskId = "test-task-remote-1235";
    const remoteTask : Task = _.cloneDeep(Tasks.valid);
    remoteTask.assignedRoom = "N0E99";
    Memory.kernel.scheduler.tasks[remoteId] = {id: remoteId, task: remoteTask, meta: Tasks.validMeta};

    dut.init(Game, Memory);

    const room : RoomName = "N0W0";
    const taskId : ?TaskId = dut.getLocalWaiting(room);

    expect(taskId).toBeDefined();
    if (!taskId) {
        return;
    }
    let task : ?Task = dut.getTaskById(taskId)

    expect(task).toBeDefined();
    expect(task && task.assignedRoom).toEqual(room);
    expect(task).toEqual(validTask);
});

it('should assign task to creep', function() {
    const id : TaskId = "test-task-1234";
    const mockTask : Task = Tasks.valid;

    Memory.kernel.scheduler.tasks[id] = {id, task: mockTask, meta: Tasks.validMeta};

    dut.init(Game, Memory);

    const creep : Creep = Game.creeps["Flix"];
    dut.assign(id, creep);

    const mem = Memory.kernel.scheduler.tasks[id];
    expect(mem.meta.assigned).toBeDefined();
    expect(mem.meta.state).toEqual(TaskStates.RUNNING);

    expect(Creeps.assign).toBeCalled();
});

it('should error on assigning unknown id', function() {
    dut.init(Game, Memory);
    const creep : Creep = Game.creeps["Flix"];
    dut.assign("unknown", creep);

    expect(Monitoring.error).toBeCalled();
});