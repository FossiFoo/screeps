/* @flow */

import type { Tick, TaskPrio, SourceTarget, ProvisionTask } from "../types/FooTypes.js";
import  { TaskTypes } from "./consts";

export function constructProvisioning(now: Tick, prio: TaskPrio, source: SourceTarget): ProvisionTask {
    return {
        type: TaskTypes.PROVISION,
        source,
        created: now,
        updated: now,
        prio
    };
}
