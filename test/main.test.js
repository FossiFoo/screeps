/* @flow */

// API
jest.unmock("../src/ApiGame.js");
import Game from "../src/ApiGame.js";

// DUT
jest.unmock("../src/main.js");
import * as dut from "../src/main.js";

// Mocks
import * as Stats from "../src/stats.js";

it('should export loop', function() {
    const _console  = console;
    console.log = jest.fn();

    dut.loop();

    expect(console.log).toBeCalled();

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
