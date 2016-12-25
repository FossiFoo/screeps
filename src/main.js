"use strict"
/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { CreepBody, FooMemory } from "../types/FooTypes.js";

import Game from "./ApiGame";
import Memory from "./ApiMemory";

import * as Stats from "./stats";
import * as Monitoring from "./monitoring";
import { error } from "./monitoring";


const CREEP_MINER_BODY : CreepBody  = [WORK, MOVE, CARRY];
const CREEP_MINER_MEMORY = {role: "miner"};

export function createCreep(Game: GameI): ?CreepName {
    let returnValue: number | string = Game.spawns['Spawn1'].createCreep(CREEP_MINER_BODY, undefined, CREEP_MINER_MEMORY);

    if (typeof returnValue !== "string") {
        switch (returnValue) {
            case ERR_BUSY: return;
            case ERR_NOT_ENOUGH_ENERGY: return;
        }
        error(returnValue);
        return;
    }

    console.log("creep spawned: " + returnValue);
    return returnValue;
}

export function checkCPUOverrun(mem: FooMemory): void {
    if (mem.finished !== true) {
        error(`Tick did not finish: ${Game.time - 1}`);
    }
}

export function init(): void {
    /* console.log("tick: " + Game.time);*/
    Memory.finished = false;
    Stats.init();
    Monitoring.init();
}

export function finish(): void {
    Memory.finished = true;
    /* console.log("tock");*/
}

export function loop(): void {

    checkCPUOverrun(Memory);

    init();

    // === SURVIVAL ===
    // -> low energy -> organize some energy
    // -> defence -> fill turret, repair, build defender, all repair
    // -> turret action

    // === UPKEEP ===
    // construct tasks
    // - refill spawn
    // - refill extension
    // - refill turret
    // - refill storage
    // - refill container

    // create creeps
    // - worker
    // - miner
    // - hauler
    // - LDH
    // - claim
    // - defence
    // - offence

    // === ARMY ACTION ===

    // === UPGRADE ===
    // - build extension
    // - build container
    // - build turret
    // - build storage
    // - build some road
    // - build some wall
    // - upgrade controller
    // - ???

    // === DEFERREDS & MAINTENANCE ===
    // collectGarbage();
    // path caching
    // object caching

    Stats.recordStats(Game, Memory);

    finish();
}
