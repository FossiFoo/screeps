/* @flow */

import type { Task, TaskId, FooMemory, KernelMemory, TaskState, TaskMeta, TaskHolder, CreepBody, TaskStep } from "../types/FooTypes.js";

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

function checkWorkerBody(energy: number, body: ?CreepBody): void {
    const design : ?CreepBody = dut.designAffordableWorker(energy);
    expect(design).toEqual(body);
}

it('should construct affordable workers', function() {
    checkWorkerBody(0, null);
    checkWorkerBody(199, null);
    checkWorkerBody(200, [WORK, CARRY, MOVE]);
    checkWorkerBody(250, [WORK, CARRY, MOVE]);
    checkWorkerBody(300, [WORK, CARRY, MOVE, CARRY, MOVE]);
});

it('should error if task is unknown', function() {
    const taskId : TaskId = "test-1234";
    const room : Room = Game.rooms["N0W0"];

    const design : ?CreepBody = dut.designAffordableCreep(taskId, room);
    expect(design).toBeNull();
    expect(Monitoring.error).toBeCalled();
});

it('should error if task type is unknown', function() {
    const id : TaskId = "test-task-1234";
    const mockTask : Task = Testdata.Tasks.invalidTypeUnknown;

    Memory.kernel.scheduler.tasks[id] = {id, task: mockTask, meta: Testdata.Tasks.validMeta};
    const room : Room = Game.rooms["N0W0"];

    const design : ?CreepBody = dut.designAffordableCreep(id, room);

    expect(design).toBeNull();
    expect(Monitoring.error).toBeCalled();
});


it('should design an affordable creep according to task', function() {
    const id : TaskId = "test-task-1234";
    const mockTask : Task = Testdata.Tasks.valid;

    Memory.kernel.scheduler.tasks[id] = {id, task: mockTask, meta: Testdata.Tasks.validMeta};
    const room : Room = Game.rooms["N0W0"];

    const design : ?CreepBody = dut.designAffordableCreep(id, room);
    expect(design).toEqual([WORK, CARRY, MOVE, CARRY, MOVE]);
});

it('should initialze task memory if not present', function() {
    const id : TaskId = "test-task-1234";

    dut.init(Game, Memory);
    const memory = dut.getMemoryByTask(id);

    expect(memory).toEqual({});
    expect(Memory.kernel.virtual.tasks[id]).toBeDefined();
});

it('should return task memory if present', function() {
    const id : TaskId = "test-task-1234";

    Memory.kernel.virtual.tasks[id].memory = {present: true};
    dut.init(Game, Memory);
    const memory = dut.getMemoryByTask(id);

    expect(memory.present).toBe(true);
});

it('should error if processing creep has no task', function() {
    ((Creeps.getAssignedTask: any): JestMockFn).mockReturnValue(null);

    const creep : Creep = Game.creeps["Flix"];

    dut.processTask(creep);

    expect(Monitoring.error).toBeCalled();
});

it('should error if processing creep has unknwon task', function() {
    ((Creeps.getAssignedTask: any): JestMockFn).mockReturnValue("test-unknown");

    const creep : Creep = Game.creeps["Flix"];

    dut.processTask(creep);

    expect(Monitoring.error).toBeCalled();
});

it('should get next step for task', function() {
    const validHolder : TaskHolder = Testdata.Tasks.validHolder;

    ((Creeps.getAssignedTask: any): JestMockFn).mockReturnValue(validHolder.id);
    ((Tasks.getNextStep: any): JestMockFn).mockReturnValue(Testdata.Tasks.validStep);
    ((Creeps.processTaskStep: any): JestMockFn).mockReturnValue({success: true});

    Memory.kernel.scheduler.tasks[validHolder.id] = validHolder;

    dut.init(Game, Memory);

    const creep : Creep = Game.creeps["Flix"];

    //when
    dut.processTask(creep);

    expect(Tasks.getNextStep).toBeCalled();
    expect(Creeps.processTaskStep).toBeCalled();
    expect(validHolder.meta.state).toBe(TaskStates.RUNNING);
});

it('should set task to finished on final step', function() {
    const validHolder : TaskHolder = _.cloneDeep(Testdata.Tasks.validHolder);
    const step : TaskStep = _.cloneDeep(Testdata.Tasks.validStep);
    step.final = true;

    ((Creeps.getAssignedTask: any): JestMockFn).mockReturnValue(validHolder.id);
    ((Tasks.getNextStep: any): JestMockFn).mockReturnValue(step);
    ((Creeps.processTaskStep: any): JestMockFn).mockReturnValue({success: true});

    Memory.kernel.scheduler.tasks[validHolder.id] = validHolder;

    dut.init(Game, Memory);

    const creep : Creep = Game.creeps["Flix"];

    //when
    dut.processTask(creep);

    expect(validHolder.meta.state).toBe(TaskStates.FINISHED);
    expect(Creeps.lift).toBeCalled();
});
