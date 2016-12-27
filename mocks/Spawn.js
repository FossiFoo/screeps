import {OwnedStructure} from "./Utils.js";

class Spawn extends OwnedStructure {
    energy: number;
    energyCapacity: number;
    memory: any;
    name: string;
    spawning: {
        name: string,
        needTime: number,
        remainingTime: number
    }
    canCreateCreep(body: BodyPartDefinition[], name?: string) {return 0;}
    createCreep(body: BODYPART_TYPE[], name?: string, memory?: any) {return -99;}
    renewCreep(target: Creep) {return -99};
    recycleCreep(target: Creep) {return -99;}
    transferEnergy(target: Creep, amount?: number) {return -99;}
}


module.exports = Spawn;
