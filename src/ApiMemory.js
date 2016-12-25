/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { FooMemory, OwnMemory } from "../types/FooTypes.js";

export function initializeMemory(mem: MemoryI | FooMemory): FooMemory {

    if (mem && typeof mem.initialized !== "undefined") {
        return ((mem: any): FooMemory);
    }

    const validGCLStats = {
        level: 0,
        progress: 0,
        progressTotal: 0
    }

    const validCPUStats = {
        limit: 0,
        tickLimit: 0,
        bucket: 0,
        stats: 0,
        getUsed: 0
    }

    const initMem : OwnMemory = {
        initialized: true,
        finished: false,
        stats: {
            time: 0,
            room: {},
            spawn: {},
            gcl: validGCLStats,
            cpu: validCPUStats
        },
        monitoring: {
            errors: []
        }
    };

    const assigned: FooMemory = _.assign(mem, initMem);
    return assigned;
}

export const Memory: FooMemory = initializeMemory(Memory);
export default Memory;
