/* @flow */

import type { Tick, TaskPrio, ProvisionTask, UpgradeTask, TaskBuild, Task, TaskStep, TaskStepNavigate, Position, SourceId, TaskMemory } from "../types/FooTypes.js";

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
jest.unmock("../src/tasks.js");
import * as dut from "../src/tasks.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";

jest.mock("../mocks/RoomPosition.js");
import RoomPositionMock from "../mocks/RoomPosition.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks, Sources, Targets, Memories } from "../test/testdata.js";

it('should construct any source provisioning task', function() {
    const time: Tick = 0;
    const task : ProvisionTask = dut.constructProvisioning(time, TaskPriorities.MAX, Sources.valid, Targets.valid);

    expect(task).toEqual(Tasks.valid);
});

it('should construct upgrade task', function() {
    const time: Tick = 0;
    const task : UpgradeTask = dut.constructUpgrade(time, TaskPriorities.MAX, Sources.valid, Targets.validController);

    expect(task).toEqual(Tasks.validUpgrade);
});

it('should construct build task', function() {
    const time: Tick = 0;
    const task : TaskBuild = dut.constructBuild(time, TaskPriorities.MAX, Sources.valid, Targets.validConstruction);

    expect(task).toEqual(Tasks.validBuild);
});

it('should get the next step for the task', function() {
    const creep : Creep = Game.creeps["Leo"];

    const task : any = _.cloneDeep(Tasks.valid);
    task.type = "TEST";

    const step : TaskStep = dut.getNextStep(task, creep, TaskStates.ASSIGNED, Memories.validTaskMemory);

    expect(step).toEqual({type: "NOOP", init: true, final: true});
    expect(Monitoring.warn).toBeCalled();
});

it('should construct steps to move to a source', function() {
    const step : TaskStep = dut.constructMoveStep({x: 3, y:4}, "N1W1", {x: 3, y:4}, true, {});
    expect(step).toMatchObject({type: "NAVIGATE", destination:{position:{x:3, y:4}}});
});

it('should construct steps to harvest a source', function() {
    const step : TaskStep = dut.constructHarvestSourceStep("test-SourceId", true, {});
    expect(step).toMatchObject({type: "HARVEST", sourceId: "test-SourceId", mine: true});
});

it('should construct steps to transfer a source', function() {
    const step : TaskStep = dut.constructStepTransfer("test-SourceId", {});
    expect(step).toMatchObject({type: "TRANSFER", targetId: "test-SourceId"});
});

it('should find navigation target by id', function() {
    const position : Position = {x:1, y:2};
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: position});

    dut.init(Game, Memory);
    const target = dut.findNavigationTargetById("test-object-1");

    expect(target).toBe(position);
});

it('should find navigation target by id', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue(null);

    dut.init(Game, Memory);
    const target = dut.findNavigationTargetById("test-object-1");

    expect(target).toEqual(null);
    expect(Monitoring.warn).toBeCalled();
});

it('should return middle if target not found', function() {

    const positionMock : RoomPosition = (new RoomPositionMock(0,0,""): any);
    positionMock.findClosestByRange.mockReturnValueOnce(null);

    const pos = dut.findClosestNavigationTargetByType(FIND_SOURCES_ACTIVE, positionMock);

    expect(pos).toEqual({x:25,y:25});
    expect(Monitoring.error).toBeCalled();
});

it('should find closest target by type', function() {

    const positionMock : RoomPosition = (new RoomPositionMock(0,0,""): any);
    positionMock.findClosestByPath.mockReturnValueOnce({pos: {x:1,y:2}});

    const pos = dut.findClosestNavigationTargetByType(FIND_SOURCES_ACTIVE, positionMock);

    expect(pos).toEqual({x:1, y:2});
});

it('should return any position if any source target not in correct room', function() {
    const mockPosition : RoomPosition = ({roomName: "N0W0"}: any);
    const pos = dut.findNearestSourceTarget(mockPosition, Sources.otherRoom);
    expect(pos).toMatchObject({x:25, y:25});
});

it('should generate navigation step when given source', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: {x:10, y:20}});

    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.isNearTo.mockReturnValueOnce(false);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;

    const sourceId : SourceId = "source";
    const task : any = _.cloneDeep(Tasks.valid);

    task.source = {
        type: SourceTargets.FIXED,
        id: sourceId
    }
    const memory = Memories.validTaskMemory;
    const cb = jest.fn();

    dut.init(Game, Memory);
    const step : TaskStep = dut.energyTransmission(task, creep, true, memory, 1, cb);

    expect(step).toMatchObject({type: "NAVIGATE", destination:{position:{x:10, y:20}}});
});

it('should generate navigation step when ANY source', function() {
    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.findClosestByPath.mockReturnValueOnce({pos: {x:10,y:20}});
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(Tasks.valid, creep, true, Memories.validTaskMemory);

    expect(step).toMatchObject({type: "NAVIGATE", destination:{position:{x:10, y:20}}});
});

it('should generate harvest step when adjecent to source', function() {
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);

    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: positionMock});

    const creep : Creep = Game.creeps["Leo"];
    positionMock.findClosestByRange.mockReturnValueOnce({pos: positionMock});
    positionMock.findInRange.mockReturnValueOnce([]);
    positionMock.inRangeTo.mockReturnValue(true);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;


    const sourceId : SourceId = "source";
    const task : any = _.cloneDeep(Tasks.valid);

    task.source = {
        type: SourceTargets.FIXED,
        id: sourceId
    }

    const mem : TaskMemory = _.cloneDeep(Memories.validTaskMemory);
    mem.state = "AQUIRE";

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(task, creep, false, mem);

    expect(step).toMatchObject({type: "HARVEST"});
});

it('should generate harvest step when close to ANY source', function() {
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);

    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: positionMock});

    const creep : Creep = Game.creeps["Leo"];
    positionMock.findClosestByPath.mockReturnValue({pos: positionMock, id: "SourceId"});
    positionMock.findInRange.mockReturnValueOnce([]);
    positionMock.findInRange.mockReturnValueOnce([{id: "SourceId"}]);
    positionMock.inRangeTo.mockReturnValue(true);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;

    const mem : TaskMemory = _.cloneDeep(Memories.validTaskMemory);
    mem.state = "AQUIRE";

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(Tasks.valid, creep, false, mem);

    expect(step).toMatchObject({type: "HARVEST", sourceId: "SourceId"});
});

it('should move to target if full', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: {x:10, y:20}});

    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.isNearTo.mockReturnValueOnce(false);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;
    creep.carry.energy = 100;
    creep.carryCapacity = 100;

    const mem : TaskMemory = _.cloneDeep(Memories.validTaskMemory);
    mem.state = "AQUIRE";

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(Tasks.valid, creep, false, mem);

    expect(step).toMatchObject({type: "NAVIGATE", destination:{position:{x:10, y:20}}});
});

it('should transfer to target if full and in work range', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: {x:10, y:20}});

    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.inRangeTo.mockReturnValueOnce(true);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;
    creep.carry.energy = 99;
    creep.carryCapacity = 100;

    const mem : TaskMemory = _.cloneDeep(Memories.validTaskMemory);
    mem.state = "TRANSMIT";

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(Tasks.valid, creep, false, mem);

    expect(step).toMatchObject({type: "TRANSFER", targetId: Tasks.valid.target.targetId});
});

it('should build target if full and in work range', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: {x:10, y:20}});

    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.inRangeTo.mockReturnValueOnce(true);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;
    creep.carry.energy = 99;
    creep.carryCapacity = 100;

    const mem : TaskMemory = _.cloneDeep(Memories.validTaskMemory);
    mem.state = "TRANSMIT";

    dut.init(Game, Memory);
    const step : TaskStep = dut.buildStep(Tasks.validBuild, creep, false, mem);

    expect(step).toMatchObject({type: "BUILD", targetId: Tasks.validBuild.target.targetId});
});


it('should make a transmission if upgrading', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: {x:10, y:20}});

    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.inRangeTo.mockReturnValueOnce(true);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;
    creep.carry.energy = 100;
    creep.carryCapacity = 100;
    const memory = Memories.validTaskMemory;

    dut.init(Game, Memory);
    const step : TaskStep = dut.upgradeStep(Tasks.validUpgrade, creep, false, memory);

    expect(step).toMatchObject({type: "UPGRADE", targetId: Tasks.validUpgrade.target.targetId});
});

it('should be done if energy transmitted', function() {

    const creep : Creep = Game.creeps["Leo"];
    creep.carry.energy = 0;
    creep.carryCapacity = 100;
    const cb = jest.fn();

    const step : TaskStep = dut.energyTransmission(Tasks.validUpgrade, creep, false, {state: "TRANSMIT"}, 1, cb);

    expect(step).toMatchObject({type: "NOOP", final: true});
    expect(cb).not.toBeCalled();
});

it('should return with noop if source not found', function() {
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);

    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue(null);

    dut.init(GameMock, Memory);
    const step : TaskStep = dut.aquireEnergy(Sources.fixed, positionMock, true, Memories.validTaskMemory);

    expect(step).toMatchObject({type: "NOOP", final: true});
});

fit('should move to container when mining', function() {
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.findInRange.mockReturnValueOnce([{structureType: STRUCTURE_CONTAINER, pos: {x:1, y:2}}]);
    positionMock.inRangeTo.mockReturnValueOnce(true);

    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue(null);

    dut.init(GameMock, Memory);
    const fixedSource = Sources.fixed;
    const step : TaskStep = dut.miningFunction(fixedSource.id, positionMock, positionMock, true, Memories.validTaskMemory);

    expect(step).toMatchObject({type: "NAVIGATE", final: false});
});
