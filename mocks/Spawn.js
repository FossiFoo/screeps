class RoomObject  {
    // prototype: RoomObject;
    pos: RoomPosition;
    room: Room
}

class Structure extends RoomObject {
    hits: number;
    hitsMax: number;
    id: string;
    structureType: string;
    destroy() {return -99;};
    isActive() {return true;}
    notifyWhenAttacked(enabled: boolean) {return false;}
}

class OwnedStructure extends Structure {
    my: boolean;
    owner: Owner
}

class Spawn extends OwnedStructure {
    // energy: number;
    // energyCapacity: number;
    // hits: number;
    // hitsMax: number;
    // id: string;
    // memory: any;
    // my: boolean;
    // name: string;
    // owner: Owner;
    // pos: RoomPosition;
    // room: Room;
    // structureType: string;
    // spawning: {
    //     name: string,
    //     needTime: number,
    //     remainingTime: number
    // }
    canCreateCreep(body: BodyPartDefinition[], name?: string) {return 0;}
    createCreep(body: BODYPART_TYPE[], name?: string, memory?: any) {return -99;}
    renewCreep(target: Creep) {return -99};
    recycleCreep(target: Creep) {return -99;}
    transferEnergy(target: Creep, amount?: number) {return -99;}
}


module.exports = Spawn;
