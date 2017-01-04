/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { TaskId, Task, TaskType, CreepBody } from "../types/FooTypes.js";

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
jest.unmock("../src/consts.js")
import { CreepStates, TaskPriorities } from "../src/consts.js";

// DUT
jest.unmock("../src/bodyshop.js");
import * as dut from "../src/bodyshop.js";

// Mocks
import * as Monitoring from "../src/monitoring.js";
import * as Kernel from "../src/kernel.js";

import { Tasks } from "../test/testdata.js";

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


function checkWorkerBody(energy: number, body: ?CreepBody): void {
    const design : ?CreepBody = dut.designAffordableWorker(energy);
    expect(design).toEqual(body);
}

it('should construct affordable workers', function() {
    checkWorkerBody(0, null);
    checkWorkerBody(199, null);
    checkWorkerBody(200, [WORK, CARRY, MOVE]);
    checkWorkerBody(250, [WORK, CARRY, MOVE]);
    checkWorkerBody(300, [WORK, CARRY, MOVE, CARRY, MOVE]);
});

it('should error if task type is unknown', function() {
    const mockTask : Task = Tasks.invalidTypeUnknown;

    const room : Room = Game.rooms["N0W0"];

    const design : ?CreepBody = dut.designAffordableCreep(mockTask, room);

    expect(design).toBeNull();
    expect(Monitoring.error).toBeCalled();
});


it('should design an affordable creep according to task', function() {
    const mockTask : Task = Tasks.valid;

    const room : Room = Game.rooms["N0W0"];

    const design : ?CreepBody = dut.designAffordableCreep(mockTask, room);
    expect(design).toEqual([WORK, CARRY, MOVE, CARRY, MOVE]);
});

it('should design an optimal creep according to task', function() {
    const mockTask : Task = Tasks.valid;

    const room : Room = Game.rooms["N0W0"];
    room.energyCapacityAvailable = 600;

    const design : ?CreepBody = dut.designOptimalCreep(mockTask, room);
    expect(design).toBeDefined();
    if (design) {
        expect(design.length).toBe(11);
    }
});

it('should spawn a creep for a local waiting task', function() {
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue("test-1234");
    ((Kernel.getTaskById: any): JestMockFn).mockReturnValue(Tasks.valid);

    const spawn : Spawn = Game.spawns["Spawn2"];
    spawn.createCreep.mockReturnValueOnce("Peter");

    const name : ?CreepName = dut.spawnCreepForTask(Kernel, spawn, Game);

    expect(name).toBe("Peter");
});

it('should spawn a creep for a local waiting task', function() {

    const mockTask : Task = _.cloneDeep(Tasks.valid);
    mockTask.prio = TaskPriorities.UPKEEP;
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue("test-1234");
    ((Kernel.getTaskById: any): JestMockFn).mockReturnValue(mockTask);

    const spawn : Spawn = Game.spawns["Spawn2"];
    spawn.createCreep.mockReturnValueOnce("Peter");
    spawn.room.energyCapacityAvailable = 400;

    const name : ?CreepName = dut.spawnCreepForTask(Kernel, spawn, Game);

    expect(name).toBe("Peter");
    expect(spawn.createCreep).toBeCalledWith([WORK, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE]);
});

it('should return if spawn is busy', function() {
    const spawn : Spawn = Game.spawns["Spawn2"];
    spawn.spawning = {
        name: "foo",
        needTime: 1,
        remainingTime: 1
    };
    const name : ?CreepName = dut.spawnCreepForTask(Kernel, spawn, Game);

    expect(name).not.toBeDefined();
});

it('should return if no task for spawning can be found', function() {
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue(null);

    const spawn : Spawn = Game.spawns["Spawn2"];
    spawn.spawning = undefined;
    const name : ?CreepName = dut.spawnCreepForTask(Kernel, spawn, Game);

    expect(name).not.toBeDefined();
});

it('should return if body can be constructed (yet)', function() {
    ((Kernel.getLocalWaiting: any): JestMockFn).mockReturnValue("test-1234");

    const spawn : Spawn = Game.spawns["Spawn2"];
    spawn.spawning = undefined;
    const name : ?CreepName = dut.spawnCreepForTask(Kernel, spawn, Game);

    expect(name).not.toBeDefined();
});
