/* @flow */

import type { Tick, TaskPrio, ProvisionTask, UpgradeTask, TaskBuild, Task, TaskStep, TaskStepNavigate, Position, SourceId } from "../types/FooTypes.js";

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js");
import { TaskPriorities, SourceTargets, TaskStates } from "../src/consts.js";

// DUT
jest.unmock("../src/architect.js");
import * as dut from "../src/architect.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";

jest.mock("../mocks/RoomPosition.js");
import RoomPositionMock from "../mocks/RoomPosition.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks, Sources, Targets } from "../test/testdata.js";

it('should construct missing extensions', function() {
    const room : Room = Game.rooms["N0W0"];
    const base : RoomPosition = new RoomPosition(10, 20, room.name);

    dut.constructExtension(room, base, 6, 3);

    expect(room.createConstructionSite).toHaveBeenCalledTimes(3);
    expect(room.createConstructionSite).toHaveBeenCalledWith(9, 23, STRUCTURE_EXTENSION);
});
