/* @flow */

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js")
import { CreepStates } from "../src/consts.js";

// DUT
jest.unmock("../src/main.js");
import * as dut from "../src/main.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";
import * as Kernel from "../src/kernel.js";
import * as Tasks from "../src/tasks.js";
import * as Creeps from "../src/creeps.js";
import * as Rooms from "../src/rooms.js";

it('should check cpu overrun', function() {
    Memory.finished = false;
    Game.time = 123;
    dut.loopInternal(Game, Memory);

    expect(Monitoring.error).toBeCalled();
});

it('should error on create', function() {
    const spawn : Spawn = Game.spawns['Spawn1'];
    spawn.createCreep.mockReturnValueOnce(ERR_NOT_OWNER);

    const err : ?string = dut.createCreep(spawn, []);

    expect(err).not.toBeDefined();
    expect(Monitoring.error).toBeCalled();
});

it('should just return on spawn busy', function() {
    const spawn : Spawn = Game.spawns['Spawn1'];
    spawn.createCreep.mockReturnValueOnce(ERR_BUSY);

    const err : ?string = dut.createCreep(spawn, []);

    expect(err).not.toBeDefined();
    expect(Monitoring.error).not.toBeCalled();
});

it('should return creep name on create', function() {
    const spawn : Spawn = Game.spawns['Spawn1'];
    spawn.createCreep.mockReturnValueOnce("foobar");

    const val : ?string = dut.createCreep(spawn, []);

    expect(val).toBe("foobar");
});

it('should init modules', function() {
    dut.init(Game, Memory);

    expect(Stats.init).toBeCalled();
    expect(Monitoring.init).toBeCalled();
    expect(Kernel.init).toBeCalled();
});

it('should record stats', function() {
    dut.loopInternal(Game, Memory);

    expect(Stats.recordStats).toBeCalled();
});


it('should create provision task in bootup', function() {
    ((Kernel.getLocalWaitingCount: any): JestMockFn).mockReturnValue(1);
    ((Rooms.getSpawns: any): JestMockFn).mockReturnValue([Game.spawns["Spawn1"]]);

    const room : Room = Game.rooms["N0W0"];
    dut.bootup(Kernel, room, Game);

    expect(Tasks.constructProvisioning).toBeCalled();
    expect(Kernel.addTask).toBeCalled();
});

it('should not create task if too many already in bootup', function() {
    ((Kernel.getLocalWaitingCount: any): JestMockFn).mockReturnValue(3);
    const room : Room = Game.rooms["N0W0"];

    dut.bootup(Kernel, room, Game);

    expect(Tasks.constructProvisioning).not.toBeCalled();
    expect(Kernel.addTask).not.toBeCalled();
});

it('should assign task to creep if idle', function() {
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue("test-1234");
    ((Creeps.getState: any): JestMockFn).mockReturnValue(CreepStates.IDLE);

    const creep : Creep = Game.creeps["Flix"];

    dut.assignLocalTasks(Kernel, creep, Game);

    expect(Kernel.getLocalWaiting).toBeCalled();
    expect(Kernel.assign).toBeCalled();
});

it('should not touch creep if busy', function() {
    const creep : Creep = Game.creeps["Flix"];
    ((Creeps.getState: any): JestMockFn).mockReturnValue(CreepStates.BUSY);

    dut.assignLocalTasks(Kernel, creep, Game);

    expect(Kernel.getLocalWaiting).not.toBeCalled();
    expect(Kernel.assign).not.toBeCalled();
});

it('should spawn a creep for a local waiting task', function() {
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue("test-1234");
    ((Kernel.designAffordableCreep: any): JestMockFn).mockReturnValue([]);

    const spawn : Spawn = Game.spawns["Spawn2"];

    const name : ?CreepName = dut.spawnCreepsForLocalTasks(Kernel, spawn, Game);

    expect(name).toBeDefined();
    expect(name).toBe("Peter");
});

it('should return if spawn is busy', function() {
    const spawn : Spawn = Game.spawns["Spawn2"];
    spawn.spawning = {
        name: "foo",
        needTime: 1,
        remainingTime: 1
    };
    const name : ?CreepName = dut.spawnCreepsForLocalTasks(Kernel, spawn, Game);

    expect(name).not.toBeDefined();
});

it('should return if no task for spawning can be found', function() {
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue(null);

    const spawn : Spawn = Game.spawns["Spawn2"];
    spawn.spawning = undefined;
    const name : ?CreepName = dut.spawnCreepsForLocalTasks(Kernel, spawn, Game);

    expect(name).not.toBeDefined();
});

it('should return if body can be constructed (yet)', function() {
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue("test-1234");
    ((Kernel.designAffordableCreep: any): JestMockFn).mockReturnValue(null);

    const spawn : Spawn = Game.spawns["Spawn2"];
    spawn.spawning = undefined;
    const name : ?CreepName = dut.spawnCreepsForLocalTasks(Kernel, spawn, Game);

    expect(name).not.toBeDefined();
});

it('should warn if creep is idle', function() {
    ((Creeps.getState: any): JestMockFn).mockReturnValue(CreepStates.IDLE);
    const creep : Creep = Game.creeps["Flix"];

    dut.processTasks(Kernel, creep, Game);

    expect(Monitoring.warn).toBeCalled();
});

it('should noop if creep is spawning', function() {
    const creep : Creep = Game.creeps["Flix"];
    creep.spawning = true;

    dut.processTasks(Kernel, creep, Game);

    expect(Kernel.processTask).not.toBeCalled();
});
