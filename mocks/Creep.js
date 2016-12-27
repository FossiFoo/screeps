import {RoomObject} from "./Utils.js"
export default class Creep extends RoomObject {
    body: BodyPartDefinition[];
    carry: StoreDefinition;
    carryCapacity: number;
    fatigue: number;
    hits: number;
    hitsMax: number;
    id: string;
    memory: any;
    my: boolean;
    name: string;
    owner: Owner;
    spawning: boolean;
    saying: string;
    ticksToLive: number;
    attack(target: Creep | Spawn | Structure) {return 0}
    attackController(target: Structure) {return 0}
    build(target: ConstructionSite) {return 0}
    cancelOrder(methodName: string) {return 0}
    claimController(target: Controller) {return 0}
    dismantle(target: Spawn | Structure) {return 0}
    drop(resourceType: string, amount?: number) {return 0}
    getActiveBodyparts(type: string) {return 0}
    harvest(target: Source | Mineral) {return 0}
    heal(target: Creep) {return 0}
    move(direction: number) {return 0}
    moveByPath(path: PathStep[] | RoomPosition[] | string) {return 0}
    moveTo(x: number, y: number, opts?: MoveToOpts & FindPathOpts) {return 0}
    moveTo( target: RoomPosition | { pos: RoomPosition }, opts?: MoveToOpts & FindPathOpts ) {return 0}
    notifyWhenAttacked(enabled: boolean) {return 0}
    pickup(target: Resource) {return 0}
    rangedAttack(target: Creep | Spawn | Structure) {return 0}
    rangedHeal(target: Creep) {return 0}
    rangedMassAttack() {return 0}
    repair(target: Spawn | Structure) {return 0}
    reserveController(target: Controller) {return 0}
    say(message: string, toPublic?: boolean) {return 0}
    suicide() {return 0}
    transfer( target: Creep | Spawn | Structure, resourceType: string, amount?: number ) {return 0}
    upgradeController(target: Controller) {return 0}
    withdraw(target: Structure, resourceType: string, amount?: number) {return 0}
}
