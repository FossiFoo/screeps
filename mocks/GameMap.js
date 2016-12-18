class GameMap {
    describeExits(roomName: string) {return {"1": "",
	                                     "3": "",
	                                     "5": "",
	                                     "7": ""}
                                         }
    findExit(fromRoom: string | Room, toRoom: string | Room) {return ERR_INVALID_ARGS;}
    findRoute ( fromRoom: string | Room,
                 toRoom: string | Room,
                 opts?: { routeCallback: { (roomName: string, fromRoomName: string): any } }
              ) {return ERR_NO_PATH;}
    getRoomLinearDistance(roomName1: string, roomName2: string) {return 0;}
    getTerrainAt(x: number, y: number, roomName: string) {return "";}
    isRoomProtected(roomName: string) {return true;}
};
// getTerrainAt(pos: RoomPosition) {return "";}

module.exports = GameMap;
