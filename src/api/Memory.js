/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { FooMemory, OwnMemory } from "../../types/FooTypes.js";

export function initializeMemory(mem: MemoryI | FooMemory): FooMemory {

    if (mem && typeof mem.initialized !== "undefined") {
        return ((mem: any): FooMemory);
    }

    const initMem : OwnMemory = {
        "initialized": true,
        "stats": {
            "room": {}
        }
    };

    const assigned: FooMemory = Object.assign({}, mem, initMem);
    return assigned;
}

export const Memory: FooMemory = initializeMemory(Memory);
export default Memory;
