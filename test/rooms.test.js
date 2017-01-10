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
import RoomPositionMock from "../mocks/RoomPosition.js";

// DUT
jest.unmock("../src/rooms.js");
import * as dut from "../src/rooms.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";
import * as Creeps from "../src/creeps.js";
import StructureStorage from "../mocks/Storage.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks } from "../test/testdata.js";

it('should return all spawns for the room', function() {
    const room : Room = Game.rooms["N0W0"];
    room.find.mockReturnValueOnce([Game.spawns["Spawn1"]]);

    const spawns : Spawn[] = dut.getSpawns(room);
    expect(spawns.length).toBe(1);
    expect(room.find).toBeCalled();
});

it('should return construction sites', function() {
    const room : Room = Game.rooms["N0W0"];
    room.find.mockReturnValueOnce(["bar"]);

    const constructionSite : ConstructionSite[] = dut.getConstructionSites(room);
    expect(constructionSite.length).toBe(1);
    expect(room.find).toBeCalled();
});

it('should return sources', function() {
    const room : Room = Game.rooms["N0W0"];
    room.find.mockReturnValueOnce([{id: "bar", pos: {x:25, y:25}}]);

    const source : Source[] = dut.getSources(room);
    expect(source.length).toBe(1);
    expect(room.find).toBeCalled();
});

it('should not return sources near keeper lairs', function() {
    const room : Room = Game.rooms["N0W0"];
    room.find.mockReturnValueOnce([{id: "bar", pos: {x:25, y:25}}]);
    room.lookForAtArea.mockReturnValueOnce([{structure:{structureType: STRUCTURE_KEEPER_LAIR}}]);

    const source : Source[] = dut.getSources(room);
    expect(source.length).toBe(0);
    expect(room.find).toBeCalled();
});

it('should return extensions', function() {
    const room : Room = Game.rooms["N0W0"];
    room.find.mockReturnValueOnce([{structureType: STRUCTURE_EXTENSION},
                                   {structureType: STRUCTURE_EXTENSION},
                                   {structureType: STRUCTURE_SPAWN}]);

    const extensions : Extension[] = dut.getExtensions(room);
    expect(extensions.length).toBe(2);
    expect(room.find).toBeCalled();
});

it('should return storage as room center if exists', function() {
    const room : Room = _.cloneDeep(Game.rooms["N0W0"]);
    room.storage = new StructureStorage();
    room.storage.pos = new RoomPositionMock(11, 22, "N0W0");

    const base : RoomPosition = dut.getBase(room);

    expect(base).toMatchObject({x:11, y:22});
});

it('should return spawn as room center if exists', function() {
    const room : Room = Game.rooms["N0W0"];

    const base : RoomPosition = dut.getBase(room);

    expect(base).toMatchObject({x:12, y:23});
});

it('should return the room center if nothing exists', function() {
    const room : Room = _.cloneDeep(Game.rooms["N0W0"]);
    room.find.mockReturnValueOnce([]);

    const base : RoomPosition = dut.getBase(room);

    expect(base).toMatchObject({x:25, y:25});
});

it('should calculate the path length between two positions', function() {
    const room : Room = _.cloneDeep(Game.rooms["N0W0"]);
    room.findPath.mockReturnValueOnce([1, 2]);

    const pos1 : RoomPosition = (new RoomPositionMock(0, 0, room.name): any);
    const pos2 : RoomPosition = (new RoomPositionMock(1, 1, room.name): any);

    const length : number = dut.calculatePathLength(room, pos1, pos2);

    expect(length).toBe(2);
});
