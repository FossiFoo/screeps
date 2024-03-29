/* @flow */

import Spawn from "./Spawn.js";
import MockRoom from "./RoomMock.js";
import Market from "./Market.js";
import GameMap from "./GameMap.js";
import Creep from "./Creep.js";
import Controller from "./Controller.js";
import RoomPosition from "./RoomPosition.js";

class TestController extends Controller {
}

class TestRoom extends MockRoom {
    constructor(name: string) {
        super();
        this.name = name;
        this.energyAvailable = 300;
        this.controller = new TestController();
    }
    find<T>(type: ScreepsConstantFind, opts?: { filter: any | string }): T[] {
        switch(type) {
            case FIND_MY_SPAWNS: return [Spawn1];
        }
        return [];

    }
}

const Room1 : Room = new TestRoom("N0W0");
const Room2 : Room = new TestRoom("N1W0");

let counter = {counter: 0};

class TestRoomPosition extends RoomPosition {
    constructor(x: number, y: number, roomName: string) {
        super(x, y, roomName);
        this.x = x;
        this.y = y;
        this.roomName = roomName;
    };
    roomName: string;
    x: number;
    y: number;
}

class TestSpawn extends Spawn {
    constructor(name, room, counter) {
        super();
        this.name = name;
        this.room = room;
        this.memory = {};
        this.energy = 300;
        this.energyCapacity = 300;
        this.spawning = null;
        this.pos = new TestRoomPosition(12,23,room.name);
        // mock
        this.counter = counter;
    }
    createCreep(body: BODYPART_TYPE[], name?: string, memory?: any) {
        if (this.energy > 0) {
            const counter = this.counter.counter;
            const creepName = name || (counter === 0 ? "Peter" : (counter === 1 ? "Klaus" : "Creep" + counter));
            this.counter.counter++;
            this.spawning = {
                name: creepName,
                needTime: 1,
                remainingTime: 1
            }
            Game.creeps[creepName] = new TestCreep(creepName, this.room);
            return creepName;
        }
        return -99;
    }
}

const Spawn1 : Spawn = new TestSpawn("Spawn1", Room1, counter);
const Spawn2 : Spawn = new TestSpawn("Spawn2", Room2, counter);

const cpu : CPU = {
    limit: 0,
    tickLimit: 0,
    bucket: 0,
    getUsed: () => {return 0;}
};
const gcl : GlobalControlLevel = {
    level: 1,
    progress: 1,
    progressTotal: 1
}

const map : GameMap = new GameMap();

const market : Market = new Market();

class TestCreep extends Creep {
    constructor(name: string, room: Room) {
        super();
        this.name = name;
        this.room = room;
        this.memory = {};
        this.pos = new RoomPosition(1, 2, room.name);
        this.carry = {
            RESOURCE_ENERGY: 0
        }
        this.body = [
            {type: "work", hits: 0},
            {type: "carry", hits: 50},
            {type: "carry", hits: 100},
            {type: "move", hits: 100},
            {type: "move", hits: 100},
        ]
    }
}

const creep1 : Creep = new TestCreep("Flix", Room1);
const creep2 : Creep = new TestCreep("Leo", Room1);

const creeps : CreepMap = {
    "Flix": creep1,
    "Leo": creep2
}

class TestGame {
    cpu: CPU;
    creeps: CreepMap;
    flags: FlagMap;
    gcl: GlobalControlLevel;
    map: GameMap;
    market: Market;
    rooms: RoomMap;
    spawns: SpawnMap;
    structures: StructureMap;
    constructionSites: ConstructionSiteMap;
    time: number;
    getObjectByIdReturnValue: any;
    constructor() {
        this.cpu = cpu;
        this.creeps = creeps;
        this.flags = {};
        this.gcl = gcl;
        this.map = map;
        this.market = market;
        this.rooms = {[Room1.name]: Room1, [Room2.name]: Room2};
        this.spawns = {[Spawn1.name]: Spawn1, [Spawn2.name]: Spawn2};
        this.structures = {};
        this.constructionSites = {};
        this.time = 0;
    }
    getObjectById(id) {return this.getObjectByIdReturnValue;}
    notify(message, groupInterval) {return;}
    //---
    tick() {
        this.time++;
    }
    setGetObjectByIdReturnValue(obj) {this.getObjectByIdReturnValue = obj;}
}

export interface GameMock {
    +tick: () => void
}

const Game : GameI & GameMock = new TestGame();

export default Game;
