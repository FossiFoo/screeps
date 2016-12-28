/* @flow */

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";
import * as Monitoring from "../src/monitoring.js";

// DUT
jest.unmock("../src/main.js");
import * as dut from "../src/main.js";

// Mocks
jest.unmock("../src/main.js");
jest.unmock("../src/stats.js");
jest.unmock("../src/monitoring.js");
jest.unmock("../src/kernel.js");
jest.unmock("../src/tasks.js");
jest.unmock("../src/creeps.js");

xit('should run a few ticks', function() {
    Memory.finished = true;
    Monitoring.setDebugEnabled(true);

    for (let a: number = 0; a < 3; a++ ) {
        Game.time = a;
        dut.loop();
    }
});
