/* @flow */

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";
jest.unmock("../src/ApiMemory.js");
import Memory from "../src/ApiMemory.js";

// DUT
jest.unmock("../src/main.js");
import * as dut from "../src/main.js";

// Mocks
import * as Stats from "../src/stats.js";
import * as Monitoring from "../src/monitoring.js";

it('should check cpu overrun', function() {
    Memory.finished = false;
    Game.time = 123;
    dut.loop();

    expect(Monitoring.error).toBeCalled();
});

it('should error on create', function() {
    Game.spawns['Spawn1'].createCreep.mockReturnValueOnce(ERR_NOT_OWNER);
    let err : ?string = dut.createCreep(Game);

    expect(err).not.toBeDefined();
    expect(Monitoring.error).toBeCalled();
});

it('should just return on spawn busy', function() {
    Game.spawns['Spawn1'].createCreep.mockReturnValueOnce(ERR_BUSY);
    let err : ?string = dut.createCreep(Game);

    expect(err).not.toBeDefined();
    expect(Monitoring.error).not.toBeCalled();
});

it('should return creep name on create', function() {
    Game.spawns['Spawn1'].createCreep.mockReturnValueOnce("foobar");
    let val : ?string = dut.createCreep(Game);

    expect(val).toBe("foobar");
});

it('should init stats', function() {
    dut.init();

    expect(Stats.init).toBeCalled();
});

it('should record stats', function() {
    dut.loop();

    expect(Stats.recordStats).toBeCalled();
});
