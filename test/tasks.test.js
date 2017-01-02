/* @flow */

import type { Tick, TaskPrio, ProvisionTask, UpgradeTask, Task, TaskStep, TaskStepNavigate, Position, SourceId } from "../types/FooTypes.js";

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
import RoomPositionMock from "../mocks/RoomPosition.js";

// test data
jest.unmock("../test/testdata.js");
import { Tasks, Sources, Targets } from "../test/testdata.js";

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

it('should get the next step for the task', function() {
    const creep : Creep = Game.creeps["Leo"];

    const task : any = _.cloneDeep(Tasks.valid);
    task.type = "TEST";

    const step : TaskStep = dut.getNextStep(task, creep, TaskStates.ASSIGNED, {});

    expect(step).toEqual({type: "NOOP", init: true, final: true});
    expect(Monitoring.warn).toBeCalled();
});

it('should construct steps to move to a source', function() {
    const step : TaskStep = dut.constructMoveStep({x: 3, y:4}, "N1W1", {});
    expect(step).toMatchObject({type: "NAVIGATE", destination:{position:{x:3, y:4}}});
});

it('should construct steps to harvest a source', function() {
    const step : TaskStep = dut.constructHarvestSourceStep("test-SourceId", {});
    expect(step).toMatchObject({type: "HARVEST", sourceId: "test-SourceId"});
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

    expect(target).toEqual({x:0,y:0});
    expect(Monitoring.warn).toBeCalled();
});

it('should find closest target by type', function() {

    const positionMock : RoomPosition = (new RoomPositionMock(0,0,""): any);
    positionMock.findClosestByRange.mockReturnValueOnce(null);

    const pos = dut.findClosestNavigationTargetByType(FIND_SOURCES_ACTIVE, positionMock);

    expect(pos).toEqual({x:0,y:0});
    expect(Monitoring.error).toBeCalled();
});

it('should find closest target by type', function() {

    const positionMock : RoomPosition = (new RoomPositionMock(0,0,""): any);
    positionMock.findClosestByRange.mockReturnValueOnce({pos: {x:1,y:2}});

    const pos = dut.findClosestNavigationTargetByType(FIND_SOURCES_ACTIVE, positionMock);

    expect(pos).toEqual({x:1, y:2});
});

it('should return any position if any source target not in correct room', function() {
    const mockPosition : RoomPosition = ({roomName: "N0W0"}: any);
    const pos = dut.findNearestSourceTarget(mockPosition, Sources.otherRoom);
    expect(pos).toMatchObject({x:0, y:0});
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
    const memory = {};
    const cb = jest.fn();

    dut.init(Game, Memory);
    const step : TaskStep = dut.energyTransmission(task, creep, true, memory, cb);

    expect(step).toMatchObject({type: "NAVIGATE", destination:{position:{x:10, y:20}}});
});

it('should generate navigation step when ANY source', function() {
    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.findClosestByRange.mockReturnValueOnce({pos: {x:10,y:20}});
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(Tasks.valid, creep, true, {});

    expect(step).toMatchObject({type: "NAVIGATE", destination:{position:{x:10, y:20}}});
});

it('should generate harvest step when adjecent to source', function() {
    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.findClosestByRange.mockReturnValueOnce({pos: {x:1,y:2}});
    positionMock.isNearTo.mockReturnValueOnce(true);
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

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(task, creep, false, {state: "AQUIRE"});

    expect(step).toMatchObject({type: "HARVEST"});
});

it('should generate harvest step when close to ANY source', function() {
    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.findClosestByRange.mockReturnValue({pos: {x:1,y:2}, id: "SourceId"});
    positionMock.isNearTo.mockReturnValueOnce(true);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(Tasks.valid, creep, false, {state: "AQUIRE"});

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

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(Tasks.valid, creep, false, {state: "AQUIRE"});

    expect(step).toMatchObject({type: "NAVIGATE", destination:{position:{x:10, y:20}}});
});

it('should transfer to target if full and adjacent', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: {x:10, y:20}});

    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.isNearTo.mockReturnValueOnce(true);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;
    creep.carry.energy = 99;
    creep.carryCapacity = 100;

    dut.init(Game, Memory);
    const step : TaskStep = dut.provisioningStep(Tasks.valid, creep, false, {state: "TRANSMIT"});

    expect(step).toMatchObject({type: "TRANSFER", targetId: Tasks.valid.target.targetId});
});


it('should make a transmission if upgrading', function() {
    const GameMock : GameMock = ((Game: any): GameMock);
    GameMock.setGetObjectByIdReturnValue({pos: {x:10, y:20}});

    const creep : Creep = Game.creeps["Leo"];
    const positionMock : RoomPosition = (new RoomPositionMock(1, 2, "N0W0"): any);
    positionMock.isNearTo.mockReturnValueOnce(true);
    positionMock.roomName = "N0W0";
    positionMock.x = 1;
    positionMock.y = 2;
    creep.pos = positionMock;
    creep.carry.energy = 100;
    creep.carryCapacity = 100;
    const memory = {};

    dut.init(Game, Memory);
    const step : TaskStep = dut.upgradeStep(Tasks.validUpgrade, creep, false, memory);

    expect(step).toMatchObject({type: "UPGRADE", targetId: Tasks.validUpgrade.target.targetId});
});

it('should be done if energy transmitted', function() {

    const creep : Creep = Game.creeps["Leo"];
    creep.carry.energy = 0;
    creep.carryCapacity = 100;

    const step : TaskStep = dut.energyTransmission(Tasks.validUpgrade, creep, false, {state: "TRANSMIT"});

    expect(step).toMatchObject({type: "NOOP", final: true});
});
