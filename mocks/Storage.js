import {OwnedStructure} from "./Utils.js";

export default class Storage extends OwnedStructure {
    store: StoreDefinition;
    storeCapacity: number;
    transfer(target: Creep, resourceType: string, amount?: number) {return 0}
    transferEnergy(target: Creep, amount?: number){return 0}
}
