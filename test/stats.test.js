/* @flow */

import type { StatsMemory, OwnMemory, RoomStats } from "../types/FooTypes.js";

import _ from "lodash";

// API
jest.unmock("../src/api/Game.js");
import Game from "../src/api/Game.js";
jest.unmock("../src/api/Memory.js");
import Memory from "../src/api/Memory.js";

// DUT
jest.unmock("../src/stats.js");
import * as dut from "../src/stats.js";

// Mocks
import RoomMock from "../mocks/RoomMock.js";
import StructureController from "../mocks/StructureController.js";

// test data
const validStats: StatsMemory = {
    "room": {}
}
const validMemory: OwnMemory = {
    "initialized": true,
    "stats": validStats
};

class TestController extends StructureController {
    constructor(own: boolean) {
        super();
        this.my = own;
    }
}

class TestRoom extends RoomMock {
    controller: Controller;
    name: string;

    constructor(own: boolean) {
        super();
        this.name = "N0W0";
        this.controller = new TestController(own);
    }
}
const ownRoom: Room = new TestRoom(true);
const foreignRoom: Room = new TestRoom(false);


it('should init stats', function() {
    dut.init();
});

it('should generate foreign room stats', function() {
    const stats : RoomStats = dut.roomStats(foreignRoom);

    expect(stats.myRoom).toBe(0);
});

it('should generate owned room stats', function() {
    const stats : RoomStats = dut.roomStats(ownRoom);

    expect(stats.myRoom).toBe(1);
});

it('should generate stats', function() {
    const stats : StatsMemory = dut.generateStats({"N0W0": foreignRoom});

    expect(stats.room).toEqual({"N0W0": {"myRoom": 0}});
});

it('should record stats', function() {
    dut.recordStats(Game, Memory);

    expect(_.size(Memory.stats.room)).toBe(1);
});
