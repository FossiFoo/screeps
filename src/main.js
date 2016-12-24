"use strict"
/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { CreepBody } from "../types/FooTypes.js";

import Game from "./api/Game.js";
import Memory from "./api/Memory.js";

import * as Stats from "./stats.js";


const CREEP_MINER_BODY : CreepBody  = [WORK, MOVE, CARRY];
const CREEP_MINER_MEMORY = {role: "miner"};

export function createCreep(Game: GameI): ?CreepName {
    let err: number | string = Game.spawns['Spawn1'].createCreep(CREEP_MINER_BODY, undefined, CREEP_MINER_MEMORY);
    if (typeof err === "string") {
        console.log("creep spawned: " + err);
        return err;
    } else {
        console.log(err);
    }
}

export function init(): void {
    Stats.init();
}

export function loop(): void {

    init();

    console.log("tick");
    createCreep(Game);

    Stats.recordStats(Game, Memory);
    console.log("tock");
}
