/* @flow */
export default class RoomPosition  {
    constructor(x: number, y: number, roomName: string) {
        this.x = x;
        this.y = y;
        this.roomName = roomName;
    };
    roomName: string;
    x: number;
    y: number;
    createConstructionSite(structureType: string) {return 0;};
    createFlag(name?: string, color?: number, secondaryColor?: number) {return 0;};
    findClosestByPath<T>( type: number, opts?: FindPathOpts & { filter?: any | string, algorithm?: string } ) {return;}
    findClosestByPath<T>( objects: T[] | RoomPosition[], opts?: FindPathOpts & { filter?: any | string, algorithm?: string } ) {return;}
    findClosestByRange<T>(type: number, opts?: { filter: any | string }) {return;}
    findClosestByRange<T>(objects: T[] | RoomPosition[], opts?: { filter: any | string }) {return;}
    findInRange<T>(type: number, range: number, opts?: { filter?: any | string }) {return null;}
    findInRange<T>( objects: T[] | RoomPosition[], range: number, opts?: { filter?: any | string } ) {return}
    findPathTo(x: number, y: number, opts?: FindPathOpts) {return}
    findPathTo( target: RoomPosition | { pos: RoomPosition }, opts?: FindPathOpts ) {return}
    getDirectionTo(x: number, y: number) {return 0;}
    getDirectionTo(target: RoomPosition | { pos: RoomPosition }) {return 0;};
    getRangeTo(x: number, y: number) {return 0;}
    getRangeTo(target: RoomPosition | {	pos: RoomPosition }) {return 0;}
    inRangeTo(toPos: RoomPosition, range: number) {return false;}
    isEqualTo(x: number, y: number) {return false;}
    isEqualTo(target: RoomPosition | { pos: RoomPosition }) {return false;}
    isNearTo(x: number, y: number) {return false;}
    isNearTo(target: RoomPosition | { pos: RoomPosition }) {return false;};
    look() {return}
    lookFor<T>(type: string) {return}
}
