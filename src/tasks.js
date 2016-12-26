/* @flow */

import type { Tick, TaskPrio, SourceTarget, EnergyTarget, ProvisionTask } from "../types/FooTypes.js";
import  { TaskTypes } from "./consts";

export function constructProvisioning(now: Tick, prio: TaskPrio, source: SourceTarget, target: EnergyTarget): ProvisionTask {
    return {
        type: TaskTypes.PROVISION,
        source,
        target,
        created: now,
        updated: now,
        prio
    };
}
