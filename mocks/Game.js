/* @flow */

const Spawn = require("./Spawn.js");
const Market = require("./Market.js");
const GameMap = require("./GameMap.js");

let Spawn1 : Spawn = new Spawn();

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
    rooms: {},
    spawns: {"Spawn1": Spawn1},
    structures: {},
    constructionSites: {},
    time: 0,
    getObjectById: (id) => {return;},
    notify:(message, groupInterval) => {return;}
};

module.exports = Game;
