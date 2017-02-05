/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { PlanningRoomData, TerrainUsageMatrix, TerrainUsageCell } from "../types/FooTypes.js";

import { error, warn, info, debug } from "./monitoring";

import { TaskStates } from "./consts";

// Utils
import * as Tasks from "./tasks";

// Game
import * as Rooms from "./rooms";

const CONSTRUCTION_ROAD_FREQUENCY : number = 100;
const CONSTRUCTION_ROAD_PERCENTAGE : number = 5;

export function constructExtension(room: Room, base: RoomPosition, current: number, missing: number): void {
    let toBuild : number = missing;
    let i : number = 1;
    while (toBuild > 0) {
        const y : YCoordinate = base.y + 2 + Math.floor((i - 1) / 6);
        const x : XCoordinate = base.x - ((i - 1) % 6) * 2 - (y % 2);
        info(`[architect] [extension] [${room.name}] construct ${i} of ${toBuild} at ${x}:${y}`);
        const err : number = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
        if (err === OK) {
            toBuild = toBuild - 1;
        } else if (err === ERR_INVALID_TARGET) {
            error(`[architect] [extension] [${room.name}] cant construct at ${x}/${y}`);
        } else {
            error(`[architect] [extension] [${room.name}] cant construct ${err}`);
            return;
        }
        i = i + 1;
    }
}

export function constructTower(room: Room, base: RoomPosition, current: number, missing: number): void {
    const x : XCoordinate = base.x - 10;
    const y : YCoordinate = base.y + (current % 2) * 13;
    const err : number = room.createConstructionSite(x, y, STRUCTURE_TOWER);
    info(`[architect] [tower] [${room.name}] construct at ${x}:${y}`);
    if (err !== OK) {
        error(`[architect] [tower] [${room.name}] cant construct ${err}`);
    }
}

export function constructStorage(room: Room, base: RoomPosition): void {
    const x : XCoordinate = base.x;
    const y : YCoordinate = base.y + 13;
    const err : number = room.createConstructionSite(x, y, STRUCTURE_STORAGE);
    info(`[architect] [storage] [${room.name}] construct at ${x}:${y}`);
    if (err !== OK) {
        error(`[architect] [storage] [${room.name}] cant construct ${err}`);
    }
}

export function constructRoadCell(room: Room, cell: TerrainUsageCell) {
    debug(cell.x + "/" + cell.y + ": has " + cell.count);
    const things : LookAtResult[] = room.lookAt(cell.x, cell.y);
    const hasConstructionSites : boolean = _.some(things, (l) => l.type === LOOK_CONSTRUCTION_SITES);
    if (things.constructionSite) {
        return;
    }
    const structureResults : LookAtResult[] = _.filter(things, (l) => l.type === LOOK_STRUCTURES);
    const structures = _.map(structureResults, (s) => s.structure);
    if (structures && _.some(structures, (s) => s && s.structureType === STRUCTURE_ROAD)) {
        return;
    }
    debug(cell.x + "/" + cell.y + ": building road " + cell.count);
    room.createConstructionSite(cell.x, cell.y, STRUCTURE_ROAD);
}

export function constructRoads(room: Room): void {
    const usage : TerrainUsageMatrix = Rooms.getTerrainUsage(room);
    usage.forEach((row) => {
        if (row) {
            row.forEach((cell) => {
                if (cell && cell.count > CONSTRUCTION_ROAD_FREQUENCY / CONSTRUCTION_ROAD_PERCENTAGE) {
                    constructRoadCell(room, cell);
                }
            });
        }
    });
    Rooms.clearTerrainUsage(room);
}

export function constructContainers(room: Room): void {
    const sources : Source[] = Rooms.getSources(room);
    for (let source of sources) {
        const sourcePosition : RoomPosition = source.pos;
        const containers : Container[] = sourcePosition.findInRange(FIND_STRUCTURES, 1, (s: Structure) => s.structureType === STRUCTURE_CONTAINER);
        if (_.isEmpty(containers)) {
            const constructions : ConstructionSite[] = _.filter(Rooms.getConstructionSites(room), (s: ConstructionSite) => s.structureType === STRUCTURE_CONTAINER);
            if (_.isEmpty(constructions)){
                const creeps : RoomObject[] = sourcePosition.findInRange(FIND_MY_CREEPS, 1);
                const creep : ?RoomObject = _.head(creeps);
                if (creep) {
                    const pos : RoomPosition = creep.pos;
                    info(`[architect] [container] [${room.name}] constructing at ${pos.x}:${pos.y}`);
                    room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                }
            }
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

export function constructBase(room: Room, data: PlanningRoomData, bootup: boolean) {
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
    const towerSites : ConstructionSite[] = _.filter(constructionSites, (s: ConstructionSite) => s.structureType === STRUCTURE_TOWER);
    const towerSiteCount : number = _.size(towerSites);
    const missingTowers : number = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][rcl] - (towerCount + towerSiteCount);
    if (missingTowers > 0) {
        constructTower(room, base, towerCount + towerSiteCount, missingTowers);
    }

    if (!bootup && Game.time % CONSTRUCTION_ROAD_FREQUENCY === 0) {
        constructRoads(room);
    }
    if (!bootup) {
        constructContainers(room);
        if (room.controller.level >= 4) {
            const storage : ?Storage = Rooms.getStorage(room);
            if (!storage) {
                constructStorage(room, base);
            }
        }
    }

    if (bootup) {
        Rooms.clearTerrainUsage(room);
    }
}
