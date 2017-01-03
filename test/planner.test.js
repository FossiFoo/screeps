/* @flow */

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
    ((Rooms.getExtensions: any): JestMockFn).mockReturnValue([{id: "test-extension-1"}]);

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
    dut.upgradeController(Kernel, room);

    expect(Kernel.getLocalCountForState).toBeCalled();
    expect(Tasks.constructUpgrade).toBeCalled();
    expect(Kernel.addTask).toBeCalled();
});

it('should not upgrade the controller if too many tasks', function() {
    ((Kernel.getLocalCountForState: any): JestMockFn).mockReturnValue(3);
    const room : Room = Game.rooms["N0W0"];
    dut.upgradeController(Kernel, room);

    expect(Kernel.getLocalCountForState).toBeCalled();
    expect(Tasks.constructUpgrade).not.toBeCalled();
    expect(Kernel.addTask).not.toBeCalled();
});


it('should build extension', function() {
    ((Rooms.getConstructionSites: any): JestMockFn).mockReturnValue([{structureType: STRUCTURE_EXTENSION}]);
    ((Kernel.getLocalCount: any): JestMockFn).mockReturnValue(1);

    const room : Room = Game.rooms["N0W0"];

    dut.buildExtension(Kernel, room);

    expect(Rooms.getConstructionSites).toBeCalled();
    expect(Tasks.constructBuild).toBeCalled();
    expect(Kernel.addTask).toBeCalled();
});

it('should return if no extension to build', function() {
    ((Rooms.getConstructionSites: any): JestMockFn).mockReturnValue([]);
    const room : Room = Game.rooms["N0W0"];

    dut.buildExtension(Kernel, room);

    expect(Rooms.getConstructionSites).toBeCalled();
    expect(Tasks.constructBuild).not.toBeCalled();
    expect(Kernel.addTask).not.toBeCalled();
});

it('should not build extension if too busy with building', function() {
    ((Rooms.getConstructionSites: any): JestMockFn).mockReturnValue([{structureType: STRUCTURE_EXTENSION}]);
    ((Kernel.getLocalCount: any): JestMockFn).mockReturnValue(6);

    const room : Room = Game.rooms["N0W0"];

    dut.buildExtension(Kernel, room);

    expect(Rooms.getConstructionSites).toBeCalled();
    expect(Tasks.constructBuild).not.toBeCalled();
    expect(Kernel.addTask).not.toBeCalled();
});
