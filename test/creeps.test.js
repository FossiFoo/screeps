/* @flow */

import type { CreepMemory, TaskId, CreepState } from "../types/FooTypes.js";
import { CREEP_MEMORY_VERSION } from "../src/consts";

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js")
import { CreepStates } from "../src/consts.js";

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

    const taskId : TaskId = "test-manual-1234";
    dut.assign(creep, taskId, Tasks.valid);

    expect(creep.memory.task.assignedId).toBe(taskId);
});

it('should get the assigned task from memory', function() {
    const creep : Creep = Game.creeps["Leo"];
    const taskId : TaskId = "test-manual-1234";
    creep.memory.task.assignedId = taskId;

    const id: ?TaskId = dut.getAssignedTask(creep);

    expect(id).toBe(taskId);
});

it('should get the creeps state if task is assigned', function() {
    const creep : Creep = Game.creeps["Leo"];
    creep.memory.task.assignedId = "test-1234";

    const state: ?CreepState = dut.getState(creep);

    expect(state).toBe(CreepStates.BUSY);
});

it('should get the creeps state if task is assigned', function() {
    const creep : Creep = Game.creeps["Leo"];
    creep.memory.task.assignedId = null;

    const state: ?CreepState = dut.getState(creep);

    expect(state).toBe(CreepStates.IDLE);
});

it('should call task processing according to type', function() {
    const creep : Creep = Game.creeps["Leo"];

    const result = dut.processTaskStep(creep, {type: "NOOP", init: true, final: true});

    expect(creep.say).toBeCalled();
});

it('should move the creep on a navigation step', function() {
    const creep : Creep = Game.creeps["Leo"];
    creep.moveTo.mockReturnValueOnce(OK);
    dut.memory(creep).task.assignedId = "test-1234";

    const result = dut.navigate(creep, Tasks.validStep);

    expect(creep.moveTo).toBeCalled();
    expect(result.success).toBeTruthy();
});

it('should error if creep cant move on a navigation step', function() {
    const creep : Creep = Game.creeps["Leo"];
    creep.moveTo.mockReturnValueOnce(ERR_TIRED);

    const result = dut.navigate(creep, Tasks.validStep);

    expect(Monitoring.warn).toBeCalled();
    expect(result.error).toBe("" + ERR_TIRED);
});

it('should harvest on a harvest step', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue("Source");

    const creep : Creep = Game.creeps["Leo"];
    creep.harvest.mockReturnValueOnce(OK);

    const result = dut.harvest(creep, {type: "HARVEST", sourceId: "Source"});

    expect(creep.harvest).toBeCalled();
    expect(result.success).toBeTruthy();
});

it('should error if source not found on harvest', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue(null);

    const creep : Creep = Game.creeps["Leo"];

    const result = dut.harvest(creep, {type: "HARVEST", sourceId: "Source"});

    expect(creep.harvest).not.toBeCalled();
    expect(Monitoring.error).toBeCalled();
    expect(result.error).toBeTruthy();
});

it('should error if harvest fails', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue("Source");

    const creep : Creep = Game.creeps["Leo"];
    creep.harvest.mockReturnValueOnce(ERR_NOT_IN_RANGE);

    const result = dut.harvest(creep, {type: "HARVEST", sourceId: "Source"});

    expect(creep.harvest).toBeCalled();
    expect(Monitoring.warn).toBeCalled();
    expect(result.error).toBeTruthy();
});

it('should transfer on a transfer step', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue("Source");

    const creep : Creep = Game.creeps["Leo"];
    creep.transfer.mockReturnValueOnce(OK);

    const result = dut.transfer(creep, {type: "TRANSFER", sourceId: "Source"});

    expect(creep.transfer).toBeCalled();
    expect(result.success).toBeTruthy();
});

it('should error if source not found on transfer', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue(null);

    const creep : Creep = Game.creeps["Leo"];

    const result = dut.transfer(creep, {type: "TRANSFER", sourceId: "Source"});

    expect(creep.transfer).not.toBeCalled();
    expect(Monitoring.error).toBeCalled();
    expect(result.error).toBeTruthy();
});

it('should error if transfer fails', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue("Source");

    const creep : Creep = Game.creeps["Leo"];
    creep.transfer.mockReturnValueOnce(ERR_NOT_IN_RANGE);

    const result = dut.transfer(creep, {type: "TRANSFER", sourceId: "Source"});

    expect(creep.transfer).toBeCalled();
    expect(Monitoring.warn).toBeCalled();
    expect(result.error).toBeTruthy();
});

it('should upgrade on a upgrade step', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue("Source");

    const creep : Creep = Game.creeps["Leo"];
    creep.upgradeController.mockReturnValueOnce(OK);

    const result = dut.upgrade(creep, {type: "UPGRADE", sourceId: "Source"});

    expect(creep.upgradeController).toBeCalled();
    expect(result.success).toBeTruthy();
});

it('should error if source not found on upgrade', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue(null);

    const creep : Creep = Game.creeps["Leo"];

    const result = dut.upgrade(creep, {type: "UPGRADE", sourceId: "Source"});

    expect(creep.upgradeController).not.toBeCalled();
    expect(Monitoring.error).toBeCalled();
    expect(result.error).toBeTruthy();
});

it('should error if upgrade fails', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue("Source");

    const creep : Creep = Game.creeps["Leo"];
    creep.upgradeController.mockReturnValueOnce(ERR_NOT_IN_RANGE);

    const result = dut.upgrade(creep, {type: "UPGRADE", sourceId: "Source"});

    expect(creep.upgradeController).toBeCalled();
    expect(Monitoring.warn).toBeCalled();
    expect(result.error).toBeTruthy();
});
