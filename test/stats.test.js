/* @flow */

import type { StatsMemory, OwnMemory, RoomStats } from "../types/FooTypes.js";

// API
jest.unmock("../src/api/Game.js");
import * as Game from "../src/api/Game.js";
jest.unmock("../src/api/Memory.js");
import * as Memory from "../src/api/Memory.js";

// DUT
jest.unmock("../src/stats.js");
import * as dut from "../src/stats.js";

// Mocks
import Room from "../mocks/Room.js";
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
}

class TestRoom extends Room {
    constructor() {
        super();
        this.controller = new TestController();
    }
}
const testRoom: Room = new TestRoom();


it('should init stats', function() {
    dut.init();
});

it('should generate room stats', function() {
    const stats : RoomStats = dut.roomStats(testRoom);

    expect(stats.myRoom).toBe(0);
});
