/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { PlanningRoomData } from "../types/FooTypes.js";

import { error, warn, info, debug } from "./monitoring";

import { TaskStates } from "./consts";

// Utils
import * as Tasks from "./tasks";

// Game
import * as Rooms from "./rooms";

export function constructExtension(room: Room, base: RoomPosition, current: number, missing: number) {
    for (var i = current + 1; i <= current + missing; i++) {
        const y : number = base.y + 2 + Math.floor((i - 1) / 6);
        const x : number = base.x - ((i - 1) % 6) * 2 - (y % 2);
        debug("generate extension at" +x + ":" +y);
        const err : number = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
        if (err !== OK) {
            error("[architect] cant construct extension: " + err);
        }
    }
}

export function getBaseArea(room: Room, base: RoomPosition): LookAtResultMatrix {
    if ( base.x > 13 && base.y + 13 < 50 ) {
        const area : LookAtResultMatrix = (room.lookAtArea(base.y, base.x - 13, base.y + 13, base.x, false): any);
        return area;
    }
    //FIXME
    return (room.lookAtArea(base.y, base.x - 13, base.y + 13, base.x, false): any);
}

export function constructBase(room: Room, data: PlanningRoomData) {
    const base: RoomPosition = Rooms.getBase(room);
    const area: LookAtResultMatrix = getBaseArea(room, base);

    /* const hasWalls = _.some(area, (r: LookAtResult): boolean => r.type === LOOK_TERRAIN && r.terrain === "wall");
     * if (hasWalls) {
     *     warn(`[architect] [${room.name}] has walls at base`);
     * }*/

    const rcl : number = room.controller.level;
    const extensionCount : number = _.size(Rooms.getExtensions(room));
    const constructionSites: ConstructionSite[] = Rooms.getConstructionSites(room);
    const extensionSites : ConstructionSite[] = _.filter(constructionSites, (s: ConstructionSite) => s.structureType === STRUCTURE_EXTENSION);
    const extensionSiteCount : number = _.size(extensionSites);
    const missingExtensions : number = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][rcl] - (extensionCount + extensionSiteCount);
    if (missingExtensions > 0) {
        constructExtension(room, base, extensionCount + extensionSiteCount, missingExtensions);
    }
    const towerCount : number = _.size(Rooms.getTowers(room));
}
