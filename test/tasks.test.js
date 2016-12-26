/* @flow */

import type { Tick, TaskPrio, SourceTarget, ProvisionTask } from "../types/FooTypes.js";

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js");
import { TASK_PRIO_MAX } from "../src/consts.js";

// DUT
jest.unmock("../src/tasks.js");
import * as dut from "../src/tasks.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks } from "../test/testdata.js";

it('should construct any source task', function() {
    const time: Tick = 0;
    const task = dut.constructProvisioning(time, TASK_PRIO_MAX, "SOURCE_ANY");

    expect(task).toEqual(Tasks.valid);
});
