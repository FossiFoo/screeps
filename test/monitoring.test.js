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

it('should record errors', function() {
    const _console  = console;
    console.log = jest.fn();

    dut.error("foo");

    expect(console.log).toBeCalled();
    expect(_.size(Memory.monitoring.errors)).toBe(1);

    console = _console;
});
