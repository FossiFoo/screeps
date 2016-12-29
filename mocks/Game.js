/* @flow */

import Spawn from "./Spawn.js";
import MockRoom from "./RoomMock.js";
import Market from "./Market.js";
import GameMap from "./GameMap.js";
import Creep from "./Creep.js";


class TestRoom extends MockRoom {
    constructor(name: string) {
        super();
        this.name = name;
        this.energyAvailable = 300;
    }
}

const Room1 : Room = new TestRoom("N0W0");
const Room2 : Room = new TestRoom("N1W0");

class TestSpawn extends Spawn {
    constructor(name, room) {
        super();
        this.name = name;
        this.room = room;
        this.memory = {};
        this.energy = 300;
    }
    createCreep(body: BODYPART_TYPE[], name?: string, memory?: any) {
        if (this.energy > 0) {
            return name || "Peter";
        }
        return -99;
    }
}

const Spawn1 : Spawn = new TestSpawn("Spawn1", Room1);
const Spawn2 : Spawn = new TestSpawn("Spawn2", Room2);

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
const creep2 : Creep = new TestCreep("Leo", Room1);

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
    rooms: {[Room1.name]: Room1, [Room2.name]: Room2},
    spawns: {[Spawn1.name]: Spawn1, [Spawn2.name]: Spawn2},
    structures: {},
    constructionSites: {},
    time: 0,
    getObjectById: (id) => {return;},
    notify:(message, groupInterval) => {return;}
};

export default Game;
