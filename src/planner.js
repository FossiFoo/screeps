/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { CreepBody, FooMemory, Task, TaskId,
              TaskHolder, TaskState,
              SourceTarget, EnergyTarget, EnergyTargetSpawn, EnergyTargetController, EnergyTargetConstruction } from "../types/FooTypes.js";

import { error, warn, info, debug } from "./monitoring";

import { TaskTypes, TaskPriorities, SourceTargets, CreepStates, EnergyTargetTypes, TaskStates } from "./consts";

// Utils
import * as Tasks from "./tasks";

// Game
import * as _unused from "./kernel";
type KernelType = typeof _unused;
import * as Rooms from "./rooms";

export function bootup(Kernel: KernelType, room: Room, Game: GameI): void {
    const creeps: CreepMap = Game.creeps; // FIXME make this room specific
    // min workers for a starting room
    const BOOTUP_THRESHOLD : number = 3;
    const roomDied : boolean = _.size(creeps) <= BOOTUP_THRESHOLD;
    const miniscule : boolean = room.energyCapacityAvailable < 550;
    if ( roomDied || miniscule) {
        warn("[planner] [" + room.name + "] bootup mode active");

        // FIXME check better
        const openTaskCount : number = Kernel.getLocalCount(room.name, (holder: TaskHolder) => {
            const state : TaskState = holder.meta.state;
            return holder.task.type === TaskTypes.PROVISION &&
                   (state === TaskStates.WAITING || state === TaskStates.RUNNING) ;
        });

        const extensions : Extension[] = Rooms.getExtensions(room);
        if (openTaskCount > (_.size(extensions) / 2) ) {
            debug("[planner] [" + room.name + "] [bootup] has too many pending jobs");
            return;
        }

        const spawns : Spawn[] = Rooms.getSpawns(room);
        if (!spawns) {
            warn("[planner] [" + room.name + "] has no spawn");
            return;
        }

        // use first non-full spawn
        const emptySpawns : Spawn[] = _.filter(spawns, (spawn: Spawn) => {
            return spawn.energy < spawn.energyCapacity * 0.5;
        });
        const spawn : ?Spawn = emptySpawns[0];

        let target : ?EnergyTarget;
        if (spawn) {
            const spawnTarget : EnergyTargetSpawn = {
                room: room.name,
                type: EnergyTargetTypes.SPAWN,
                name: spawn.name,
                targetId: spawn.id
            }
            target = spawnTarget;
        } else {
            const extensionsSorted : Extension[] = extensions.sort((e: Extension) => e.energy);
            const extension : ?Extension = _.head(extensionsSorted);
            if (extension) {
                const extensionTarget : EnergyTargetSpawn = {
                    room: room.name,
                    type: EnergyTargetTypes.SPAWN,
                    name: extension.id,
                    targetId: extension.id
                }
                target = extensionTarget;
            }
        }
        if (!target) {
            debug(`[planner] [bootup] all spawns and extensions full`);
            return;
        }

        // construct a task to harvest some energy from anywhere and fill a spawn

        const source : SourceTarget = {
            type: SourceTargets.ANY,
            room: room.name
        }
        const harvest: Task = Tasks.constructProvisioning(Game.time, TaskPriorities.URGENT, source, target);

        Kernel.addTask(harvest);
    }
}

export function generateLocalPriorityTasks(Kernel: KernelType, room: Room, Game: GameI): void {

    debug(`generating priority tasks for ${room.name}`)

    // === SURVIVAL ===
    // -> no spawn -> rebuild or abandon
    // -> low energy -> organize some energy
    bootup(Kernel, room, Game);
    // -> defence -> fill turret, repair, build defender, all repair
    // -> turret action

    // === UPKEEP ===
    // construct tasks
    // - mine source
    // - refill spawn
    // - refill extension
    // - refill turret
    // - refill storage
    // - refill container
}

export function upgradeController(Kernel: KernelType, room: Room): void {
    const openTaskCount : number = Kernel.getLocalCountForState(room.name, TaskStates.WAITING); // FIXME check better
    if (openTaskCount > 1) {
        debug(`[planner] [${room.name}] is busy, not adding upgrade`);
        return;
    }

    const source : SourceTarget = {
        type: SourceTargets.ANY,
        room: room.name
    }
    const controller : EnergyTargetController = {
        type: EnergyTargetTypes.CONTROLLER,
        room: room.name,
        targetId: room.controller.id
    }
    const upgradeController: Task = Tasks.constructUpgrade(Game.time, TaskPriorities.IDLE, source, controller);

    Kernel.addTask(upgradeController);
}

export function buildExtension(Kernel: KernelType, room: Room) {

    const constructionSites : ConstructionSite[] = Rooms.getConstructionSites(room);
    const extension : ?ConstructionSite = _.find(constructionSites, (s: ConstructionSite) => s.structureType === STRUCTURE_EXTENSION);
    if (!extension) {
        debug("[planner] no extensions found")
        return;
    }

    // FIXME check better
    const openTaskCount : number = Kernel.getLocalCount(room.name, (holder: TaskHolder) => {
        const state : TaskState = holder.meta.state;
        return holder.task.type === TaskTypes.BUILD &&
               (state === TaskStates.WAITING || state === TaskStates.RUNNING) ;
    });

    if (openTaskCount > 5 || openTaskCount > _.size(constructionSites) * 3) {
        debug("[planner] [" + room.name + "] [improve] too many pending jobs " + openTaskCount);
        return;
    }

    const source : SourceTarget = {
        type: SourceTargets.ANY,
        room: room.name
    }

    const site : EnergyTargetConstruction = {
        room: room.name,
        type: EnergyTargetTypes.CONSTRUCTION,
        targetId: extension.id
    }

    const buildTask : Task = Tasks.constructBuild(Game.time, TaskPriorities.UPGRADE, source, site);
    Kernel.addTask(buildTask)
}

export function generateLocalImprovementTasks(Kernel: KernelType, room: Room, Game: GameI): void {

    debug(`[planner] [${room.name}] generating improvement tasks`)

    // refactor into checking expenditure first, then constructing jobs

    // - construction sites

    // - build extension
    buildExtension(Kernel, room);
    // - build container
    // - build turret
    // - build storage
    // - build some road
    // - build some wall
    // - upgrade controller
    upgradeController(Kernel, room);
    // - mine long distance
    // - claim room
    // - assist room
    // - ???
}
