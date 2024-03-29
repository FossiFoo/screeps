/* @flow */

import type { RoomStats, SpawnStats, StatsMemory } from "../types/FooTypes.js";

import _ from "lodash";

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";

// DUT
jest.unmock("../src/stats.js");
import * as dut from "../src/stats.js";

// Mocks
import RoomMock from "../mocks/RoomMock.js";
import StructureController from "../mocks/StructureController.js";
import Spawn from "../mocks/Spawn.js";
import * as Monitoring from "../src/monitoring.js";

// test data

class TestController extends StructureController {
    constructor(own: boolean): void{
        super();
        this.my = own;
    }
}

class TestRoom extends RoomMock {
    controller: Controller;
    name: string;

    constructor(own: boolean): void {
        super();
        this.name = "N0W0";
        this.controller = new TestController(own);
    }
}
const ownRoom: Room = new TestRoom(true);
const foreignRoom: Room = new TestRoom(false);

class TestSpawn extends Spawn {
    constructor(): void {
        super();
        this.memory = {
            defenderIndex: 1
        }
    }
}

const spawn: Spawn = new TestSpawn();

const validCPU: CPU = {
    limit: 1,
    bucket: 9001,
    tickLimit: 500,
    getUsed(): number {return 0}
}

const validGCL: GlobalControlLevel = {
    level: 0,
    progress: 0,
    progressTotal: 0
}

it('should init stats', function() {
    dut.init(Game, Memory);
});

it('should generate foreign room stats', function() {
    const stats : RoomStats = dut.roomStats(foreignRoom);

    expect(stats.myRoom).toBe(0);
});

it('should generate owned room stats', function() {
    const stats : RoomStats = dut.roomStats(ownRoom);

    expect(stats.myRoom).toBe(1);
});

it('should generate owned spawn stats', function() {
    const stats : SpawnStats = dut.spawnStats(spawn);

    expect(stats.defenderIndex).toBe(1);
});


it('should generate stats', function() {
    const stats : StatsMemory = dut.generateStats(
        1000000,
        {"N0W0": foreignRoom},
        {"Spawn1": spawn},
        validGCL,
        validCPU,
        0,
        0
    );

    expect(stats.room).toEqual({"N0W0": {"myRoom": 0}});
});

it('should record stats', function() {
    Game.time = 1000000;
    dut.recordStats(Game, Memory);

    expect(Monitoring.info).toBeCalled();
    expect(_.size(Memory.stats.room)).toBe(2);
});
