/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { Tick, FooMemory, OwnMemory } from "../types/FooTypes.js";


export function initializeMemory(mem: any | FooMemory, now: Tick): FooMemory {

    if (mem && mem.initialized === true) {
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
        version: 1,
        stats: {
            time: 0,
            lastReport: 0,
            room: {},
            spawn: {},
            gcl: validGCLStats,
            cpu: validCPUStats
        },
        monitoring: {
            errors: []
        },
        kernel: {
            scheduler: {
                tasks: {}
            },
            virtual: {
                tasks: {}
            }
        },
        planner: {
            energyDistribution: {
                rooms: {}
            }
        },
        milestones: {
            cradle: null,
            respawnTime: now,
            gclLevel: {},
            spawnRclLevel: {},
            spawnCapacity: {},
            towers: {}
        }
    };

    const assigned: FooMemory = _.assign(mem, initMem);
    return assigned;
}

export const MemoryInternal: FooMemory = initializeMemory(Memory, Game.time);
export default MemoryInternal;
