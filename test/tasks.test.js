/* @flow */

import type { Tick, TaskPrio, ProvisionTask } from "../types/FooTypes.js";

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js");
import { TaskPriorities } from "../src/consts.js";

// DUT
jest.unmock("../src/tasks.js");
import * as dut from "../src/tasks.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks, Sources, Targets } from "../test/testdata.js";

it('should construct any source task', function() {
    const time: Tick = 0;
    const task : ProvisionTask = dut.constructProvisioning(time, TaskPriorities.MAX, Sources.valid, Targets.valid);

    expect(task).toEqual(Tasks.valid);
});