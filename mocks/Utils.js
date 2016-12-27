export class RoomObject  {
    // prototype: RoomObject;
    pos: RoomPosition;
    room: Room
}

export class Structure extends RoomObject {
    hits: number;
    hitsMax: number;
    id: string;
    structureType: string;
    destroy() {return -99;};
    isActive() {return true;}
    notifyWhenAttacked(enabled: boolean) {return false;}
}

export class OwnedStructure extends Structure {
    my: boolean;
    owner: Owner
}
