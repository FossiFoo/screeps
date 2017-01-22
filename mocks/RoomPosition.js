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
    createConstructionSite(structureType: string) {return 0;}
    createFlag(name?: string, color?: number, secondaryColor?: number) {return 0;};
    findClosestByPath( type: number, opts?: FindPathOpts & { filter?: any | string, algorithm?: string } ) {return;}
    findClosestByPath( objects: [] | RoomPosition[], opts?: FindPathOpts & { filter?: any | string, algorithm?: string } ) {return;}
    findClosestByRange(type: number, opts?: { filter: any | string }) {return;}
    findClosestByRange(objects: [] | RoomPosition[], opts?: { filter: any | string }) {return;}
    findInRange(type: number, range: number, opts?: { filter?: any | string }) {return null;}
    findInRange( objects: [] | RoomPosition[], range: number, opts?: { filter?: any | string } ) {return}
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
