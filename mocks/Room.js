class Room  {
    controller: Controller;
    energyAvailable: number;
    energyCapacityAvailable: number;
    memory: any;
    mode: string;
    name: string;
    storage: StructureStorage;
    survivalInfo: SurvivalGameInfo;
    terminal: Terminal;
    createConstructionSite(x: number, y: number, structureType: string) {return 0};
    createConstructionSite(pos: RoomPosition | { pos: RoomPosition }, structureType: string) {return -99};
    createFlag( x: number, y: number, name: string, color: number, secondaryColor?: number) {return -99};
    createFlag( pos: RoomPosition | { pos: RoomPosition	}, name: string, color: number, secondaryColor?: number ) {return -99};
    find(type: number, opts?: { filter: any | string }) {return []};
    findExitTo(room: string | Room) {return -99};
    findPath(fromPos: RoomPosition, toPos: RoomPosition, opts?: FindPathOpts) {return []};
    getPositionAt(x: number, y: number) {return null};
    lookAt(x: number, y: number) {}
    lookAt(target: RoomPosition | { pos: RoomPosition }) {}
    lookAtArea( top: number, left: number, bottom: number, right: number, asArray?: boolean ) {}
    lookForAt<T>(type: string, x: number, y: number) {}
    lookForAt<T>(type: string, target: RoomPosition | { pos: RoomPosition }) {}
    lookForAtArea( type: string, top: number, left: number, bottom: number, right: number, asArray?: boolean ) {}
    serializePath(path: PathStep[]) {}
    deserializePath(path: string) {}
}

module.exports = Room;
