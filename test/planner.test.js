/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { PlanningRoomData, PlanningSourceData, PlanningRoomDistribution, PlanningSourceDistribution, SourceTarget } from "../types/FooTypes.js";

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js")
import { CreepStates, SourceTargets, TaskPriorities, TaskTypes } from "../src/consts.js";

// DUT
jest.unmock("../src/planner.js");
import * as dut from "../src/planner.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";
import * as Kernel from "../src/kernel.js";
import * as Tasks from "../src/tasks.js";
import * as Creeps from "../src/creeps.js";
import * as Rooms from "../src/rooms.js";

import * as Testdata from "../test/testdata.js";


it('should create provision task for spawn in bootup', function() {
    const holder = Testdata.Tasks.validHolder;
    ((Kernel.getLocalCount: any): JestMockFn).mockImplementation((name, fn) => {
        fn(holder); return 0;
    });
    const spawn : Spawn = _.cloneDeep(Game.spawns["Spawn1"]);
    spawn.energy = 10;
    ((Rooms.getSpawns: any): JestMockFn).mockReturnValue([spawn]);
    ((Rooms.getExtensions: any): JestMockFn).mockReturnValue([{id: "test-extension-1"}]);

    const room : Room = Game.rooms["N0W0"];
    dut.bootup(Kernel, room, Game);

    expect(Tasks.constructProvisioning).toBeCalled();
    expect(Kernel.addTask).toBeCalled();
});

it('should create provision task for extension in bootup', function() {
    const holder = Testdata.Tasks.validHolder;
    ((Kernel.getLocalCount: any): JestMockFn).mockImplementation((name, fn) => {
        fn(holder); return 0;
    });
    // Testdata spawn is full
    ((Rooms.getSpawns: any): JestMockFn).mockReturnValue([Game.spawns["Spawn1"]]);
    const mockExtension = {id: "test-extension-1", energy: 50, energyCapacity: 100};
    ((Rooms.getExtensions: any): JestMockFn).mockReturnValue([mockExtension]);

    const room : Room = Game.rooms["N0W0"];
    dut.bootup(Kernel, room, Game);

    expect(Tasks.constructProvisioning).toBeCalled();
    expect(Kernel.addTask).toBeCalled();
});

it('should create provision task for spawn in bootup if ex ful, but spawn isnt', function() {
    const holder = Testdata.Tasks.validHolder;
    ((Kernel.getLocalCount: any): JestMockFn).mockImplementation((name, fn) => {
        fn(holder); return 0;
    });
    const spawn : Spawn = _.cloneDeep(Game.spawns["Spawn1"]);
    spawn.energy = 200;
    ((Rooms.getSpawns: any): JestMockFn).mockReturnValue([spawn]);
    const mockExtension = {id: "test-extension-1", energy: 100, energyCapacity: 100};
    ((Rooms.getExtensions: any): JestMockFn).mockReturnValue([mockExtension]);

    const room : Room = Game.rooms["N0W0"];
    dut.bootup(Kernel, room, Game);

    expect(Tasks.constructProvisioning).toBeCalled();
    expect(Kernel.addTask).toBeCalled();
});

it('should not create task if too many already in bootup', function() {
    ((Kernel.getLocalCount: any): JestMockFn).mockReturnValue(3);
    const room : Room = Game.rooms["N0W0"];

    dut.bootup(Kernel, room, Game);

    expect(Tasks.constructProvisioning).not.toBeCalled();
    expect(Kernel.addTask).not.toBeCalled();
});

it('should upgrade the controller', function() {
    ((Kernel.getLocalCountForState: any): JestMockFn).mockReturnValue(1);
    const room : Room = Game.rooms["N0W0"];

    dut.init(Game, Memory);
    dut.upgradeController(Kernel, room, Testdata.Planner.validRoomData, {rooms: {}});

    expect(Kernel.getLocalCountForState).toBeCalled();
    expect(Tasks.constructUpgrade).toBeCalled();
    expect(Kernel.addTask).toBeCalled();
});

it('should not upgrade the controller if too many tasks', function() {
    ((Kernel.getLocalCountForState: any): JestMockFn).mockReturnValue(3);
    const room : Room = Game.rooms["N0W0"];
    dut.upgradeController(Kernel, room, Testdata.Planner.validRoomData, {rooms: {}});

    expect(Kernel.getLocalCountForState).toBeCalled();
    expect(Tasks.constructUpgrade).not.toBeCalled();
    expect(Kernel.addTask).not.toBeCalled();
});


it('should build extension', function() {
    ((Rooms.getConstructionSites: any): JestMockFn).mockReturnValue([{structureType: STRUCTURE_EXTENSION}]);
    ((Kernel.getLocalCount: any): JestMockFn).mockReturnValue(1);

    const room : Room = Game.rooms["N0W0"];

    const data : PlanningRoomData = Testdata.Planner.validRoomData;
    const distribution : any = {rooms: {}};

    dut.init(Game, Memory);
    dut.buildExtension(Kernel, room, data, distribution);

    expect(Rooms.getConstructionSites).toBeCalled();
    expect(Tasks.constructBuild).toBeCalled();
    expect(Kernel.addTask).toBeCalled();
});

it('should return if no extension to build', function() {
    ((Rooms.getConstructionSites: any): JestMockFn).mockReturnValue([]);
    const room : Room = Game.rooms["N0W0"];

    const data : PlanningRoomData = Testdata.Planner.validRoomData;
    const distribution : any = {rooms: {}};

    dut.buildExtension(Kernel, room, data, distribution);

    expect(Rooms.getConstructionSites).toBeCalled();
    expect(Tasks.constructBuild).not.toBeCalled();
    expect(Kernel.addTask).not.toBeCalled();
});

it('should not build extension if too busy with building', function() {
    ((Rooms.getConstructionSites: any): JestMockFn).mockReturnValue([{structureType: STRUCTURE_EXTENSION}]);
    ((Kernel.getLocalCount: any): JestMockFn).mockReturnValue(6);

    const room : Room = Game.rooms["N0W0"];

    const data : PlanningRoomData = Testdata.Planner.validRoomData;
    const distribution : any = {rooms: {}};

    dut.buildExtension(Kernel, room, data, distribution);

    expect(Rooms.getConstructionSites).toBeCalled();
    expect(Tasks.constructBuild).not.toBeCalled();
    expect(Kernel.addTask).not.toBeCalled();
});

it('should get planning data for a room', function() {
    const mockSources : Source[] = ([{id:"Source1", energyCapacity: 9000}, {id:"Source2", energyCapacity: 1}]: any);
    ((Rooms.getSources: any): JestMockFn).mockReturnValue(mockSources);
    ((Rooms.getBase: any): JestMockFn).mockReturnValue({room: "N0W0", pos: {x: 10, y: 20}});
    ((Rooms.calculatePathLength: any): JestMockFn).mockReturnValue(1);

    const room : Room = Game.rooms["N0W0"];
    const data : PlanningRoomData = dut.getRoomData(room);

    expect(data).toMatchObject({name: "N0W0",
                                energyPotential: 9001,
                                paths: {base: {"Source1": 1, "Source2": 1}},
                                sources: {"Source1": {id: "Source1", capacity: 9000},
                                          "Source2": {id: "Source2", capacity: 1}}});
});

it('should convert sources data to distribution', function() {
    const data : PlanningSourceData = Testdata.Planner.validRoomData.sources["Source1"];

    const distribution : PlanningSourceDistribution = dut.convertSourceDataToDistribution(data);

    expect(distribution).toMatchObject({id: "Source1", totalCapacity: 700, totalUse: 0});
});

it('should initialize distribution from room data', function() {
    const data : PlanningRoomData = Testdata.Planner.validRoomData;

    const distribution : PlanningRoomDistribution = dut.initializeDistributionFromData(data);

    expect(distribution).toMatchObject({id: "N0W0", sources:
                                                            {"Source1": {id: "Source1", totalCapacity: 700, totalUse: 0},
                                                             "Source2": {id: "Source2", totalCapacity: 9000, totalUse: 0},
                                                             "Source3": {id: "Source3", totalCapacity: 1, totalUse: 0}}});
});

it('should determine an underutilized source', function() {

    const room : Room = Game.rooms["N0W0"];

    const data : PlanningRoomData = Testdata.Planner.validRoomData;
    const distribution : any = {rooms: {}};

    dut.init(Game, Memory);
    const target : SourceTarget = dut.determineSource(room, data, distribution, 666, TaskPriorities.UPKEEP, TaskTypes.UPGRADE);

    expect(target).toMatchObject({type: SourceTargets.FIXED, id: "Source1", room: room.name, amount: 666});
});
