/* @flow */

import type { Task, TaskId, FooMemory, KernelMemory, TaskState, TaskMeta, TaskHolder, CreepBody, TaskStep, TaskStepResult } from "../types/FooTypes.js";

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js")
import { TaskStates, TaskPriorities } from "../src/consts.js";

// DUT
jest.unmock("../src/kernel.js");
import * as dut from "../src/kernel.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";
import * as Creeps from "../src/creeps.js";
import * as Tasks from "../src/tasks.js";

// test data
jest.unmock("../test/testdata.js");
import * as Testdata from "../test/testdata.js";

it('should init', function() {
    dut.init(Game, Memory);

    expect(dut.Memory).toBeDefined();
});

it('should collect garbage for creep', function() {

    // local waiting
    Memory.kernel.scheduler.tasks = {};
    const validId : TaskId = "test-task-valid-1234";
    const validTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    Memory.kernel.scheduler.tasks[validId] = {id: validId, task: validTask, meta: _.cloneDeep(Testdata.Tasks.validMeta)};
    const otherValidId : TaskId = "test-task-valid-1235";
    const otherTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    otherTask.prio = TaskPriorities.IDLE;
    Memory.kernel.scheduler.tasks[otherValidId] = {id: otherValidId, task: otherTask, meta: _.cloneDeep(Testdata.Tasks.validMeta)};

    // local running
    const runningId : TaskId = "test-task-running-1236";
    const runningTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    const runningMeta: TaskMeta = _.cloneDeep(Testdata.Tasks.validMeta);
    runningMeta.state = TaskStates.RUNNING;
    Memory.kernel.scheduler.tasks[runningId] = {id: runningId, task: runningTask, meta: runningMeta};

    // remote waiting
    const remoteId : TaskId = "test-task-remote-1235";
    const remoteTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    remoteTask.assignedRoom = "N0E99";
    Memory.kernel.scheduler.tasks[remoteId] = {id: remoteId, task: remoteTask, meta: _.cloneDeep(Testdata.Tasks.validMeta)};

    // local aborted
    const abortedId : TaskId = "test-task-aborted-1236";
    const abortedTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    const abortedMeta: TaskMeta = _.cloneDeep(Testdata.Tasks.validMeta);
    abortedMeta.state = TaskStates.ABORTED;
    Memory.kernel.scheduler.tasks[abortedId] = {id: abortedId, task: abortedTask, meta: abortedMeta};

    dut.init(Game, Memory);
    dut.collectGarbage("Foo", "test-task-valid-1234");

    expect(Memory.kernel.scheduler.tasks[validId]).not.toBeDefined();
    expect(Memory.kernel.scheduler.tasks[abortedId]).not.toBeDefined();

    expect(Memory.kernel.scheduler.tasks[otherValidId]).toBeDefined();
    expect(Memory.kernel.scheduler.tasks[runningId]).toBeDefined();
});

it('should add task to list', function() {
    Memory.kernel.scheduler.tasks = {};

    dut.init(Game, Memory);
    const taskId : ?TaskId = dut.addTask(Testdata.Tasks.valid);
    expect(taskId).toBeDefined();

    const mem : ?KernelMemory = dut.Memory;
    if (!mem) {
        throw "broken test";
    }
    expect(_.size(mem.scheduler.tasks)).toEqual(1);
});

it('should get task by its id', function() {
    const id : TaskId = "test-task-1234";
    const mockTask : Task = Testdata.Tasks.valid;

    Memory.kernel.scheduler.tasks[id] = {id, task: mockTask, meta: Testdata.Tasks.validMeta};

    dut.init(Game, Memory);
    const task : ?Task = dut.getTaskById(id);

    expect(task).toEqual(mockTask);
});

it('should make Filter', function() {
    const room : RoomName = "N0W0";
    const filter = dut.makeFnFilterLocalByStatus(room, TaskStates.WAITING);

    expect(filter).toBeDefined();

    const localWaiting : TaskHolder = {id: "", task: Testdata.Tasks.valid, meta: Testdata.Tasks.validMeta};
    expect(filter(localWaiting)).toBeTruthy();

    const remoteTask: Task = _.cloneDeep(Testdata.Tasks.valid);
    remoteTask.assignedRoom = "N0E0";
    const remoteWaiting : TaskHolder = {id: "", task: remoteTask, meta: Testdata.Tasks.validMeta};
    expect(filter(remoteWaiting)).toBeFalsy();

    const runningMeta: TaskMeta = _.cloneDeep(Testdata.Tasks.validMeta);
    runningMeta.state = TaskStates.RUNNING;
    const localRunning : TaskHolder = {id: "", task: Testdata.Tasks.valid, meta: runningMeta};
    expect(filter(localRunning)).toBeFalsy();
});

it('should get local waiting task', function() {

    // local waiting
    Memory.kernel.scheduler.tasks = {};
    const validId : TaskId = "test-task-valid-1234";
    const validTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    Memory.kernel.scheduler.tasks[validId] = {id: validId, task: validTask, meta: _.cloneDeep(Testdata.Tasks.validMeta)};
    const otherValidId : TaskId = "test-task-valid-1235";
    const otherTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    otherTask.prio = TaskPriorities.IDLE;
    Memory.kernel.scheduler.tasks[otherValidId] = {id: otherValidId, task: otherTask, meta: _.cloneDeep(Testdata.Tasks.validMeta)};

    // local running
    const runningId : TaskId = "test-task-running-1236";
    const runningTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    const runningMeta: TaskMeta = _.cloneDeep(Testdata.Tasks.validMeta);
    runningMeta.state = TaskStates.RUNNING;
    Memory.kernel.scheduler.tasks[runningId] = {id: runningId, task: runningTask, meta: runningMeta};

    // remote waiting
    const remoteId : TaskId = "test-task-remote-1235";
    const remoteTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    remoteTask.assignedRoom = "N0E99";
    Memory.kernel.scheduler.tasks[remoteId] = {id: remoteId, task: remoteTask, meta: _.cloneDeep(Testdata.Tasks.validMeta)};

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

it('should get count of local waiting tasks', function() {
    // local waiting
    Memory.kernel.scheduler.tasks = {};
    const validId : TaskId = "test-task-valid-1234";
    const otherValidId : TaskId = "test-task-valid-1235";
    const validTask : Task = Testdata.Tasks.valid;
    Memory.kernel.scheduler.tasks[validId] = {id: validId, task: validTask, meta: Testdata.Tasks.validMeta};
    Memory.kernel.scheduler.tasks[otherValidId] = {id: otherValidId, task: validTask, meta: Testdata.Tasks.validMeta};

    // local running
    const runningId : TaskId = "test-task-running-1236";
    const runningTask : Task = Testdata.Tasks.valid;
    const runningMeta: TaskMeta = _.cloneDeep(Testdata.Tasks.validMeta);
    runningMeta.state = TaskStates.RUNNING;
    Memory.kernel.scheduler.tasks[runningId] = {id: "", task: runningTask, meta: runningMeta};

    // remote waiting
    const remoteId : TaskId = "test-task-remote-1235";
    const remoteTask : Task = _.cloneDeep(Testdata.Tasks.valid);
    remoteTask.assignedRoom = "N0E99";
    Memory.kernel.scheduler.tasks[remoteId] = {id: remoteId, task: remoteTask, meta: Testdata.Tasks.validMeta};

    dut.init(Game, Memory);

    const room : RoomName = "N0W0";
    const taskCount : number = dut.getLocalCountForState(room, TaskStates.WAITING);

    expect(taskCount).toBe(2);
});

it('should return local count', function() {
    const count : number = dut.getLocalCount("N0W0", () => true);
    expect(count).toBe(3);
});

it('should set state change time if updating state', function() {
    Game.time = 123;
    dut.init(Game, Memory);
    const holder : TaskHolder = _.cloneDeep(Testdata.Tasks.validHolder);
    dut.updateTaskState(holder, TaskStates.ABORTED);

    expect(holder.meta).toMatchObject({state: TaskStates.ABORTED, stateChanged: 123});
});

it('should not set state change time if not changing state', function() {
    Game.time = 123;
    dut.init(Game, Memory);
    const holder : TaskHolder = _.cloneDeep(Testdata.Tasks.validHolder);
    dut.updateTaskState(holder, TaskStates.WAITING);

    expect(holder.meta).toMatchObject({state: TaskStates.WAITING, stateChanged: 0});
});

it('should assign task to creep', function() {
    const id : TaskId = "test-task-1234";
    const mockTask : Task = Testdata.Tasks.valid;

    Memory.kernel.scheduler.tasks[id] = {id, task: mockTask, meta: Testdata.Tasks.validMeta};

    dut.init(Game, Memory);

    const creep : Creep = Game.creeps["Flix"];
    dut.assign(id, creep);

    const mem = Memory.kernel.scheduler.tasks[id];
    expect(mem.meta.assigned).toBeDefined();
    expect(mem.meta.state).toEqual(TaskStates.ASSIGNED);

    expect(Creeps.assign).toBeCalled();
});

it('should error on assigning unknown id', function() {
    dut.init(Game, Memory);
    const creep : Creep = Game.creeps["Flix"];
    dut.assign("unknown", creep);

    expect(Monitoring.error).toBeCalled();
});

it('should initialze task memory if not present', function() {
    const id : TaskId = "test-task-1234";

    dut.init(Game, Memory);
    const memory = dut.getMemoryByTask(id);

    expect(memory).toEqual(Testdata.Memories.validTaskMemory);
    expect(Memory.kernel.virtual.tasks[id]).toBeDefined();
});

it('should return task memory if present', function() {
    const id : TaskId = "test-task-1234";

    const mem = _.cloneDeep(Testdata.Memories.validTaskMemory);
    mem.present = true;
    Memory.kernel.virtual.tasks[id].memory = mem;

    dut.init(Game, Memory);
    const memory = dut.getMemoryByTask(id);

    expect(memory.present).toBe(true);
});

it('should error if processing creep has unknwon task', function() {
    ((Creeps.getAssignedTask: any): JestMockFn).mockReturnValue("test-unknown");

    const creep : Creep = Game.creeps["Flix"];

    const state : TaskState = dut.processTask(creep, "test-task-unknown");

    expect(Monitoring.error).toBeCalled();
    expect(state).toBe(TaskStates.ABORTED);
});

it('should get next step for task', function() {
    const validHolder : TaskHolder = Testdata.Tasks.validHolder;

    ((Tasks.getNextStep: any): JestMockFn).mockReturnValue(Testdata.Tasks.validStep);
    ((Creeps.processTaskStep: any): JestMockFn).mockReturnValue({success: true});

    Memory.kernel.scheduler.tasks[validHolder.id] = validHolder;

    dut.init(Game, Memory);

    const creep : Creep = Game.creeps["Flix"];

    //when
    const state : TaskState = dut.processTask(creep, validHolder.id);

    expect(Tasks.getNextStep).toBeCalled();
    expect(Creeps.processTaskStep).toBeCalled();
    expect(validHolder.meta.state).toBe(TaskStates.RUNNING);
    expect(state).toBe(TaskStates.RUNNING);
});

it('should set task to finished on final step', function() {
    const validHolder : TaskHolder = _.cloneDeep(Testdata.Tasks.validHolder);
    const step : TaskStep = _.cloneDeep(Testdata.Tasks.validStep);
    step.final = true;

    ((Tasks.getNextStep: any): JestMockFn).mockReturnValue(step);
    ((Creeps.processTaskStep: any): JestMockFn).mockReturnValue({success: true});

    Memory.kernel.scheduler.tasks[validHolder.id] = validHolder;

    dut.init(Game, Memory);

    const creep : Creep = Game.creeps["Flix"];

    //when
    const state : TaskState = dut.processTask(creep, validHolder.id);

    expect(validHolder.meta.state).toBe(TaskStates.FINISHED);
    expect(state).toBe(TaskStates.FINISHED);
});


it('should set task to aborted if blocked for some ticks', function() {
    const validHolder : TaskHolder = _.cloneDeep(Testdata.Tasks.validHolder);
    validHolder.meta.state = TaskStates.BLOCKED;
    validHolder.meta.stateChanged = 0;
    const step : TaskStep = _.cloneDeep(Testdata.Tasks.validStep);
    step.final = true;

    ((Tasks.getNextStep: any): JestMockFn).mockReturnValue(step);
    ((Creeps.processTaskStep: any): JestMockFn).mockReturnValue({success: false});

    Game.time = 123;
    Memory.kernel.scheduler.tasks[validHolder.id] = validHolder;

    dut.init(Game, Memory);

    const creep : Creep = Game.creeps["Flix"];

    //when
    const state : TaskState = dut.processTask(creep, validHolder.id);

    expect(validHolder.meta.state).toBe(TaskStates.ABORTED);
    expect(state).toBe(TaskStates.ABORTED);
});
