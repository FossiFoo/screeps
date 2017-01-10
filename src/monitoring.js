/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { ErrorEntry } from "../types/FooTypes.js";

import Game from "./ApiGame";
import Memory from "./ApiMemory";

import * as Config from "./config";

export let DEBUG_ENABLED: boolean = (Config.LOG_LEVEL >= Config.LOG_LEVEL_DEBUG) || false;
export let INFO_ENABLED: boolean = (Config.LOG_LEVEL >= Config.LOG_LEVEL_INFO) === undefined ? true : (Config.LOG_LEVEL >= Config.LOG_LEVEL_INFO);
export let WARN_ENABLED: boolean = (Config.LOG_LEVEL >= Config.LOG_LEVEL_WARN) === undefined ? true : (Config.LOG_LEVEL >= Config.LOG_LEVEL_WARN);


export function init(): void {
}

export function consoleLog(...args: any[]): void {
    /* eslint-disable no-console */
    console.log.apply(console, args);
    /* eslint-enable no-console */
}

export function makeMsg(...args: any[]): string {
    return "" + args[0];
}

export function makeLogMsg(level: string, ...args: any[]): string {
    return "[" + level + "] " + makeMsg(args);
}

export function error(...args: any[]): void {
    let msg : string = makeMsg(args);
    let err: ErrorEntry = {
        time: Game.time,
        type: "GENERAL",
        msg: msg
    }
    Memory.monitoring.errors.push(err);
    consoleLog("[ERROR] " + msg);
    Game.notify(msg, 10);
}

export function warn(...args: any[]): void {
    if (WARN_ENABLED) {
        consoleLog(makeLogMsg("WARN", args));
    }
}

export function info(...args: any[]): void {
    if (INFO_ENABLED) {
        consoleLog(makeLogMsg("INFO", args));
    }
}

export function debug(...args: any[]): void {
    if (DEBUG_ENABLED) {
        consoleLog(makeLogMsg("DEBUG", args));
    }
}

export function setDebugEnabled(enabled: boolean) {
    DEBUG_ENABLED = enabled;
}
