"use strict"
/* @flow */
/* eslint-disable no-console */

/* eslint-disable no-unused-vars, no-undef */
// hack to get flow to recognize the existing "_" as lodash
const unused = require("lodash");
declare var _ : typeof unused;

const Game : GameI = require("./api/Game.js");
/* eslint-enable no-unused-vars, no-undef */

type CreepBody = BODYPART_TYPE[];

const CREEP_MINER_BODY : CreepBody  = [WORK, MOVE, CARRY];
const CREEP_MINER_MEMORY = {role: "miner"};

function createCreep(): number | CreepName {
    console.error(Game);
    return Game.spawns['Spawn1'].createCreep(CREEP_MINER_BODY, undefined, CREEP_MINER_MEMORY);
}
module.exports.createCreep = createCreep;

module.exports.loop = function () {
    console.log("tick");
    let err = createCreep();
    if (_.isString(err)) {
        console.log("creep spawned: " + err);
    } else {
        console.log(err);
    }
    console.log("tock");
    return err;
}
