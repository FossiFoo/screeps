/* @flow */

import type { CreepMemory } from "../types/FooTypes.js";
import { CREEP_MEMORY_VERSION } from "../types/FooTypes.js";

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
jest.unmock("../src/creeps.js");
import * as dut from "../src/creeps.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";
import * as Creeps from "../src/creeps.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks } from "../test/testdata.js";

it('should initialize empty memory', function() {
    const creep : Creep = _.cloneDeep(Game.creeps["Leo"]);

    const mem : CreepMemory = dut.memory(creep);

    expect(mem).toBeDefined();
    expect(mem.version).toBe(CREEP_MEMORY_VERSION);
});

it('should initialize partial memory', function() {
    const creep : Creep = _.cloneDeep(Game.creeps["Leo"]);
    creep.memory.version = -1;

    const mem : CreepMemory = dut.memory(creep);

    expect(mem).toBeDefined();
    expect(mem.version).toBe(CREEP_MEMORY_VERSION);
});

it('should return initialized memory', function() {
    const creep : Creep = _.cloneDeep(Game.creeps["Leo"]);

    dut.memory(creep);

    const mem : CreepMemory = dut.memory(creep);

    expect(mem).toBeDefined();
    expect(mem.version).toBe(CREEP_MEMORY_VERSION);
});

it('should assign task to creep', function() {
    const creep : Creep = Game.creeps["Leo"];

    dut.assign(creep, "1234", Tasks.valid);

    expect(creep.memory.task.assignedId).toBe("1234");
});
