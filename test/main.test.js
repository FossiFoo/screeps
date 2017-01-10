/* @flow */

import type { CreepMemory } from "../types/FooTypes.js";

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js")
import { CreepStates } from "../src/consts.js";

// DUT
jest.unmock("../src/main.js");
import * as dut from "../src/main.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";
import * as Kernel from "../src/kernel.js";
import * as Tasks from "../src/tasks.js";
import * as Creeps from "../src/creeps.js";
import * as Rooms from "../src/rooms.js";
import * as BodyShop from "../src/bodyshop.js";

import * as Testdata from "../test/testdata.js";

it('should check cpu overrun', function() {
    Memory.finished = false;
    Game.time = 123;
    dut.loopInternal(Game, Memory);

    expect(Monitoring.error).toBeCalled();
});


it('should init modules', function() {
    dut.init(Game, Memory);

    expect(Stats.init).toBeCalled();
    expect(Monitoring.init).toBeCalled();
    expect(Kernel.init).toBeCalled();
});

it('should collect dead creeps memory', function() {
    const oldMemory : CreepMemory = {version: "0.0.1", task: {assignedId: "test-garbage-1"}};
    Memory.creeps["fake"] = oldMemory;

    dut.collectGarbage(Game, Memory);

    expect(Memory.creeps["fake"]).not.toBeDefined();
    expect(Kernel.collectGarbage).toBeCalledWith("fake", "test-garbage-1");
});

it('should record stats', function() {
    dut.loopInternal(Game, Memory);

    expect(Stats.recordStats).toBeCalled();
});

it('should assign task to creep if idle', function() {
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue("test-1234");
    ((Creeps.getState: any): JestMockFn).mockReturnValue(CreepStates.IDLE);

    const creep : Creep = Game.creeps["Flix"];

    dut.assignLocalTasks(Kernel, creep, Game);

    expect(Kernel.getLocalWaiting).toBeCalled();
    expect(Kernel.assign).toBeCalled();
});

it('should not touch creep if busy', function() {
    const creep : Creep = Game.creeps["Flix"];
    ((Creeps.getState: any): JestMockFn).mockReturnValue(CreepStates.BUSY);

    dut.assignLocalTasks(Kernel, creep, Game);

    expect(Kernel.getLocalWaiting).not.toBeCalled();
    expect(Kernel.assign).not.toBeCalled();
});

it('should move creep if broken', function() {
    const creep : Creep = Game.creeps["Flix"];
    ((Creeps.getState: any): JestMockFn).mockReturnValue(CreepStates.IDLE);
    ((BodyShop.isCreepBroken: any): JestMockFn).mockReturnValue(true);

    dut.assignLocalTasks(Kernel, creep, Game);

    expect(creep.moveTo).toBeCalled();
    expect(Kernel.getLocalWaiting).not.toBeCalled();
    expect(Kernel.assign).not.toBeCalled();
});

it('should spawn a creep for a local waiting task', function() {
    ((BodyShop.spawnCreepForTask: any): JestMockFn).mockReturnValue("Peter");

    const spawn : Spawn = Game.spawns["Spawn2"];

    const name : ?CreepName = dut.spawnCreepsForLocalTasks(Kernel, spawn, Game);

    expect(name).toBe("Peter");
});

it('should warn if creep is idle', function() {
    ((Creeps.getState: any): JestMockFn).mockReturnValue(CreepStates.IDLE);
    const creep : Creep = Game.creeps["Flix"];

    dut.processTasks(Kernel, creep, Game);

    expect(Monitoring.warn).toBeCalled();
});

it('should noop if creep is spawning', function() {
    const creep : Creep = Game.creeps["Flix"];
    creep.spawning = true;

    dut.processTasks(Kernel, creep, Game);

    expect(Kernel.processTask).not.toBeCalled();
});

it('should kill memory if flag is set', function() {

    expect(Memory.version).toBe(1);

    jest.mock("../src/ApiMemory.js");
    const mem = (Memory: any);
    mem.killMeYesReally = true;
    dut.loop();
    jest.unmock("../src/ApiMemory.js");

    expect(Memory).toEqual({});
});

it('should call loop', function() {
    dut.loop();
});
