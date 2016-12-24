/* @flow */

import type { FooMemory } from "../types/FooTypes.js";

const Spawn = require("./Spawn.js");

let Spawn1 : Spawn = new Spawn();

const MemoryMock : any = {
    creeps: {},
    flags: {},
    rooms: {},
    spawns: {"Spawn1": Spawn1},
    initialized: undefined
};

export var Memory: FooMemory = MemoryMock;
