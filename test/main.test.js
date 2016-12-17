/* @flow:weak */
jest.dontMock("../src/main.js");

const dut = require("../src/main.js");


it('should export loop', function() {
    const _console  = console;
    console.log = jest.fn();

    dut.loop();

    expect(console.log).toBeCalled();

    console = _console;
});
