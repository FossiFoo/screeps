/* @flow */

import type { StatsMemory, OwnMemory, MonitoringMemory, RoomStats, SpawnStats, GCLStats, CPUStats } from "../types/FooTypes.js";

import _ from "lodash";

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";

// DUT
jest.unmock("../src/monitoring.js");
import * as dut from "../src/monitoring.js";

// Mocks
import RoomMock from "../mocks/RoomMock.js";
import StructureController from "../mocks/StructureController.js";
import Spawn from "../mocks/Spawn.js";

function testLogs(fn) {
    const _console  = console;
    console.log = jest.fn();

    fn();
    expect(console.log).toBeCalled();

    console = _console;
}

it('should log to console', function() {
    testLogs(dut.consoleLog);
});

it('should record errors', function() {
    testLogs(dut.error);
    expect(_.size(Memory.monitoring.errors)).toBe(1);
});

it('should record warns', function() {
    testLogs(dut.warn);
});

it('should record infos', function() {
    testLogs(dut.info);
});

it('should record debugs', function() {
    testLogs(dut.debug);
});

it('should record make a string', function() {
    const msg : string = dut.makeLogMsg("TEST", "foo");
    expect(msg).toEqual("[TEST] foo");
});
