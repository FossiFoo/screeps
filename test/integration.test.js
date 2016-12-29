/* @flow */

import type { GameMock } from "../mocks/Game.js";

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
jest.unmock("../src/rooms.js");

it('should run a few ticks', function() {
    Memory.finished = true;
    Monitoring.setDebugEnabled(true);

    let mock : GameMock = ((Game: any): GameMock);

    for (let a: number = 0; a < 3; a++ ) {
        dut.loop();
        mock.tick();
    }
});
