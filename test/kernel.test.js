/* @flow */

import type { Task, TaskId, FooMemory, KernelMemory, TaskState, TaskMeta, TaskHolder, CreepBody } from "../types/FooTypes.js";

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
import * as Tasks from "../src/tasks.js";

// test data
jest.unmock("../test/testdata.js");
import * as Testdata from "../test/testdata.js";

it('should init', function() {
    dut.init(Game, Memory);

    expect(dut.Memory).toBeDefined();
});

it('should add task to list', function() {
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
    const validTask : Task = Testdata.Tasks.valid;
    Memory.kernel.scheduler.tasks[validId] = {id: validId, task: validTask, meta: Testdata.Tasks.validMeta};

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
    const taskCount : number = dut.getLocalWaitingCount(room);

    expect(taskCount).toBe(2);
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
    expect(mem.meta.state).toEqual(TaskStates.RUNNING);

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

    Memory.kernel.scheduler.tasks[validHolder.id] = validHolder;

    dut.init(Game, Memory);

    const creep : Creep = Game.creeps["Flix"];

    //when
    dut.processTask(creep);

    expect(Tasks.getNextStep).toBeCalled();
    expect(Creeps.processTaskStep).toBeCalled();
});
