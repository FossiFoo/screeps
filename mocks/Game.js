/* @flow */

import Spawn from "./Spawn.js";
import MockRoom from "./RoomMock.js";
import Market from "./Market.js";
import GameMap from "./GameMap.js";

class TestSpawn extends Spawn {
    constructor() {
        super();
    }
}
let Spawn1 : Spawn = new TestSpawn();

class TestRoom extends MockRoom {
    constructor() {
        super();
    }
}
let Room1 : Room = new TestRoom();

let cpu : CPU = {
    limit: 0,
    tickLimit: 0,
    bucket: 0,
    getUsed: () => {return 0;}
};
let gcl : GlobalControlLevel = {
    level: 1,
    progress: 1,
    progressTotal: 1
}

let map : GameMap = new GameMap();

let market : Market = new Market();

const Game : GameI = {
    cpu: cpu,
    creeps: {},
    flags: {},
    gcl: gcl,
    map: map,
    market: market,
    rooms: {"N0W0": Room1},
    spawns: {"Spawn1": Spawn1},
    structures: {},
    constructionSites: {},
    time: 0,
    getObjectById: (id) => {return;},
    notify:(message, groupInterval) => {return;}
};

module.exports = Game;
