/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { ErrorEntry } from "../types/FooTypes.js";

import Game from "./ApiGame";
import Memory from "./ApiMemory";

export function init(): void {
}

export function error(...args: any[]): void {
    let msg : string = "" + args[0];
    let err: ErrorEntry = {
        time: Game.time,
        type: "GENERAL",
        msg: msg
    }
    Memory.monitoring.errors.push(err);
    console.log("[ERROR] " + msg);
    Game.notify(msg, 10);
}
