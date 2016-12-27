/* @flow */

import Spawn from "./Spawn.js";
import MockRoom from "./RoomMock.js";
import Market from "./Market.js";
import GameMap from "./GameMap.js";
import Creep from "./Creep.js";

class TestSpawn extends Spawn {
    constructor() {
        super();
    }
}
const Spawn1 : Spawn = new TestSpawn();

class TestRoom extends MockRoom {
    constructor() {
        super();
    }
}
const Room1 : Room = new TestRoom();
const Room2 : Room = new TestRoom();

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
    constructor(name, room) {
        super();
        this.name = name;
        this.room = room;
        this.memory = {};
    }
}

const creep1 : Creep = new TestCreep("Flix", Room1);
const creep2 : Creep = new TestCreep("Leo", Room2);

const creeps : CreepMap = {
    "Flix": creep1,
    "Leo": creep2
}

const Game : GameI = {
    cpu: cpu,
    creeps: creeps,
    flags: {},
    gcl: gcl,
    map: map,
    market: market,
    rooms: {"N0W0": Room1, "N1W0": Room2},
    spawns: {"Spawn1": Spawn1},
    structures: {},
    constructionSites: {},
    time: 0,
    getObjectById: (id) => {return;},
    notify:(message, groupInterval) => {return;}
};

export default Game;
