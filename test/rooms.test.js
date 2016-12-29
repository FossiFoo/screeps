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
jest.unmock("../src/rooms.js");
import * as dut from "../src/rooms.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";
import * as Creeps from "../src/creeps.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks } from "../test/testdata.js";

it('should return all spawns for the room', function() {
    const room : Room = Game.rooms["N0W0"];
    room.find.mockReturnValueOnce([Game.spawns["Spawn1"]]);

    const spawns : Spawn[] = dut.getSpawns(room);
    expect(spawns.length).toBe(1);
});
