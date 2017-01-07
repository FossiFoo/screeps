/* @flow */

// get flow to recognize the existing "_" as lodash
import typeof * as Lodash from "lodash";
declare var _ : Lodash;

import type { FooMemory, PlannerMemory,
              PlanningRoomData, PlanningEnergyDistribution, PlanningRoomDistribution,
              PlanningSourceDistribution, PlanningSourceData,
              PathMap, PathData,
              Task, TaskType, TaskId, TaskHolder, TaskState, TaskPrio,
              SourceTarget, EnergyTarget,
              EnergyTargetSpawn, EnergyTargetController, EnergyTargetConstruction } from "../types/FooTypes.js";

import { error, warn, info, debug } from "./monitoring";

import { TaskTypes, TaskPriorities, SourceTargets, EnergyTargetTypes, TaskStates } from "./consts";

// Utils
import * as Tasks from "./tasks";

// Game
import * as _unused from "./kernel";
type KernelType = typeof _unused;
import * as Rooms from "./rooms";
import * as BodyShop from "./bodyshop";

export let memory: PlannerMemory;

export function init(game: GameI, mem: FooMemory): void {
    memory = mem.planner;
};

export function convertSourceDataToDistribution(s: PlanningSourceData): PlanningSourceDistribution {
    return {
        id: s.id,
        totalCapacity: s.capacity,
        totalUse: 0
    };
};

export function initializeDistributionFromData(data: PlanningRoomData): PlanningRoomDistribution {
    const sources : {[sourceId: SourceId]: PlanningSourceDistribution} =
        _.mapValues(data.sources, convertSourceDataToDistribution);

    const initialDistribution : PlanningRoomDistribution = {
        id: data.name,
        sources,
        any: 0
    };
    return initialDistribution;
}

export function determineSource(room: Room,
                                data: PlanningRoomData,
                                distribution: PlanningEnergyDistribution,
                                amount: EnergyUnit,
                                prio: TaskPrio,
                                taskType: TaskType): SourceTarget {

    let roomDistribution : ?PlanningRoomDistribution = distribution.rooms[room.name];

    if (!roomDistribution) {
        const initialDistribution : PlanningRoomDistribution = initializeDistributionFromData(data);
        roomDistribution = initialDistribution;
        distribution.rooms[room.name] = roomDistribution; //FIXME write to memory? => should be mutable for now
    }

    const maxCarry : ?number = BodyShop.calculateMaximumCarry(taskType, room.energyCapacityAvailable);
    const maxNeed : number = maxCarry ? Math.min(maxCarry, amount) :  amount;
    const sources : PlanningSourceDistribution[] = _.values(roomDistribution.sources);

    const possibleSources : PlanningSourceDistribution[] =
        _.filter(sources, (s: PlanningSourceDistribution): boolean => {
        const availableEnergy : EnergyUnit = s.totalCapacity - s.totalUse;
            return availableEnergy >= maxNeed;
    });
    const sortedSources = _.sortBy(possibleSources, (s: PlanningSourceDistribution): EnergyUnit => {
        const pathToSource : ?PathData = data.paths.base[s.id];
        return pathToSource ? pathToSource.length : 1000;
    });

    if (_.isEmpty(sortedSources)) {
        //FIXME make this saner
        warn(`[planner] [${room.name}] no underutilized source found for task`);
        return {
            type: SourceTargets.ANY,
            room: room.name,
            amount: maxNeed
        };
    }

    let sourceId : SourceId;
    if (prio >= TaskPriorities.UPKEEP) {
        sourceId = _.head(sortedSources).id;
    } else if (prio <= TaskPriorities.IDLE) {
        sourceId = _.last(sortedSources).id;
    } else {
        sourceId = _.sample(sortedSources).id;
    }

    //FIXME write to memory? => should be mutable for now
    const sourceDistribution : ?PlanningSourceDistribution = roomDistribution.sources[sourceId];
    if (!sourceDistribution) {
        error(`[planner] [${room.name}] source plan not found for ${sourceId}`);
    } else {
        sourceDistribution.totalUse += maxNeed;
    }
    distribution.rooms[room.name] = roomDistribution;

    return {
        type: SourceTargets.FIXED,
        room: room.name,
        id: sourceId,
        amount: maxNeed
    };
};

export function  constructTargetSpawn(roomName: RoomName, spawn: Spawn): EnergyTargetSpawn {
    return {
        room: roomName,
        type: EnergyTargetTypes.SPAWN,
        name: spawn.name,
        targetId: spawn.id,
        energyNeed: spawn.energyCapacity - spawn.energy
    };
};

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
                   (state === TaskStates.WAITING || state === TaskStates.RUNNING);
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

        let prio : TaskPrio = TaskPriorities.UPKEEP;
        let target : ?EnergyTarget;
        if (spawn) {
            target = constructTargetSpawn(room.name, spawn);
        } else {
            const extensionsSorted : Extension[] = extensions.sort((e: Extension) => e.energy);
            const extension : ?Extension = _.head(extensionsSorted);
            if (extension && extension.energy < extension.energyCapacity) {
                const capacity : number = EXTENSION_ENERGY_CAPACITY[room.controller.level];
                const extensionTarget : EnergyTargetSpawn = {
                    room: room.name,
                    type: EnergyTargetTypes.SPAWN,
                    name: extension.id,
                    targetId: extension.id,
                    energyNeed: capacity
                }
                target = extensionTarget;
            }
        }
        if (!target) {
            const anySpawn : Spawn = spawns[0];
            if (anySpawn && anySpawn.energy < anySpawn.energyCapacity) {
                target = constructTargetSpawn(room.name, anySpawn);
                prio = TaskPriorities.UPGRADE;
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

        const runningTaskCount : number = Kernel.getLocalCount(room.name, (holder: TaskHolder) => {
            const state : TaskState = holder.meta.state;
            return holder.task.type === TaskTypes.PROVISION &&
                   state === TaskStates.RUNNING;
        });

        prio = runningTaskCount === 0 ? TaskPriorities.URGENT : prio;
        const harvest: Task = Tasks.constructProvisioning(Game.time, prio, source, target);

        Kernel.addTask(harvest);
    }
}

export function generateLocalPriorityTasks(Kernel: KernelType, room: Room, Game: GameI): void {

    if (!room.controller.my) {
        return;
    }

    warn(`generating priority tasks for ${room.name}`)

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

export function upgradeController(Kernel: KernelType, room: Room, data: PlanningRoomData, distribution: PlanningEnergyDistribution): void {

    // FIXME check better if we have too many updates waiting
    const openTaskCount : number = Kernel.getLocalCountForState(room.name, TaskStates.WAITING);
    if (openTaskCount > 1) {
        debug(`[planner] [${room.name}] is busy, not adding upgrade`);
        return;
    }

    const controller : Controller = room.controller;
    const prio : TaskPrio = controller.ticksToDowngrade < 1000 ? TaskPriorities.URGENT : TaskPriorities.IDLE;
    const energy: EnergyUnit = 100; //FIXME
    const source : SourceTarget = determineSource(room, data, distribution, energy, prio, TaskTypes.UPGRADE);

    const target : EnergyTargetController = {
        type: EnergyTargetTypes.CONTROLLER,
        room: room.name,
        targetId: controller.id,
        energyNeed: energy
    }
    const upgradeController: Task = Tasks.constructUpgrade(Game.time, prio, source, target);

    Kernel.addTask(upgradeController);
}

export function buildExtension(Kernel: KernelType, room: Room, data: PlanningRoomData, distribution: PlanningEnergyDistribution): void {

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

    const prio : TaskPrio = TaskPriorities.UPGRADE;
    const energyNeed : EnergyUnit = extension.progressTotal - extension.progress;
    const source : SourceTarget = determineSource(room, data, distribution, energyNeed, prio, TaskTypes.BUILD);

    const site : EnergyTargetConstruction = {
        room: room.name,
        type: EnergyTargetTypes.CONSTRUCTION,
        targetId: extension.id,
        energyNeed
    }

    const buildTask : Task = Tasks.constructBuild(Game.time, prio, source, site);
    Kernel.addTask(buildTask)
}

export function getRoomData(room: Room): PlanningRoomData {
    // reduce by creep cost (measure?)
    const sources : Source[] = Rooms.getSources(room);
    const energyPotential : number = _.sum(sources, (s: Source) => s.energyCapacity);
    const base : RoomPosition = Rooms.getBase(room);
    const sourcesById : {[id: SourceId]: Source} = _.indexBy(sources, (s: Source) => s.id);
    const paths : PathMap = _.mapValues(sourcesById, (s: Source): number => {
        return Rooms.calculatePathLength(room, base, s.pos);
    });
    const sourceEntriesById: {[id: SourceId]: PlanningSourceData} =
        _.mapValues(sourcesById, (s: Source): PlanningSourceData => {
        return {id: s.id, capacity: s.energyCapacity};
    })

    return {
        name: room.name,
        energyPotential,
        paths: {
            base: paths
        },
        sources: sourceEntriesById
    };
}

export function getCurrentEnergyDistribution(): PlanningEnergyDistribution {
    //FIXME recalculate/recover from memory wipe?
    return memory.energyDistribution;
}

export function generateLocalImprovementTasks(Kernel: KernelType, room: Room, Game: GameI): void {

    if (!room.controller.my) {
        return;
    }

    warn(`[planner] [${room.name}] generating improvement tasks`)

    // refactor into checking expenditure first, then constructing jobs

    const data : PlanningRoomData = getRoomData(room);
    const distribution : PlanningEnergyDistribution = getCurrentEnergyDistribution();

    // - construction sites

    // - build extension
    buildExtension(Kernel, room, data, distribution);
    // - build container
    // - build turret
    // - build storage
    // - build some road
    // - build some wall
    // - upgrade controller
    upgradeController(Kernel, room, data, distribution);
    // - mine long distance
    // - claim room
    // - assist room
    // - ???
}
