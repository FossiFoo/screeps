"use strict"
/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { CreepBody, FooMemory } from "../types/FooTypes.js";

import Game from "./ApiGame";
import Memory from "./ApiMemory";

import * as Stats from "./stats";


const CREEP_MINER_BODY : CreepBody  = [WORK, MOVE, CARRY];
const CREEP_MINER_MEMORY = {role: "miner"};

export function createCreep(Game: GameI): ?CreepName {
    let returnValue: number | string = Game.spawns['Spawn1'].createCreep(CREEP_MINER_BODY, undefined, CREEP_MINER_MEMORY);

    if (typeof returnValue !== "string") {
        console.error(returnValue);
        return;
    }

    console.log("creep spawned: " + returnValue);
    return returnValue;
}

export function checkCPUOverrun(mem: FooMemory): void {
    if (mem.finished !== true) {
        console.error(`Tick did not finish: ${Game.time - 1}`);
    }
}

export function init(): void {
    Memory.finished = false;
    Stats.init();
}

export function finish(): void {
    Memory.finished = true;
}

export function loop(): void {

    checkCPUOverrun(Memory);

    init();

    /* console.log("tick: " + Game.time);*/
    createCreep(Game);

    Stats.recordStats(Game, Memory);
    /* console.log("tock");*/

    finish();
}
