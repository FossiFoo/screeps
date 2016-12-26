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

// DUT
jest.unmock("../src/kernel.js");
import * as dut from "../src/kernel.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";

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
