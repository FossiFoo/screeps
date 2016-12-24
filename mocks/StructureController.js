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

class StructureController extends OwnedStructure {
    level: number;
    progress: number;
    progressTotal: number;
    reservation: ReservationDefinition;
    ticksToDowngrade: number;
    unclaim() {}
}


module.exports = StructureController;
