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

it('should check cpu overrun', function() {
    const _console  = console;
    console.error = jest.fn();

    Memory.finished = false;
    Game.time = 123;
    dut.loop();

    expect(console.error).toBeCalled();

    console = _console;
});

it('should error on create', function() {
    let err : ?string = dut.createCreep(Game);

    expect(err).not.toBeDefined();
});

it('should return creep name on create', function() {
    Game.spawns['Spawn1'].createCreep.mockReturnValueOnce("foobar");
    let err : ?string = dut.createCreep(Game);

    expect(err).toBe("foobar");
});

it('should init stats', function() {
    dut.init();

    expect(Stats.init).toBeCalled();
});

it('should record stats', function() {
    dut.loop();

    expect(Stats.recordStats).toBeCalled();
});
