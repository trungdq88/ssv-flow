// @format

jest.mock('inquirer');
jest.mock('child_process');
jest.mock('fs');
jest.mock('tmp');

const input = require('./input.js');

describe('input.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ask should return a promise', () => {
    require('inquirer').prompt = jest
      .fn()
      .mockImplementation(() => Promise.resolve({yes: true}));
    return expect(input.ask()).resolves.toBe(true);
  });

  it('choice should return a promise', () => {
    require('inquirer').prompt = jest
      .fn()
      .mockImplementation(() => Promise.resolve({choice: true}));
    return expect(input.choice()).resolves.toBe(true);
  });

  it('enter should return a promise', () => {
    const spawn = (require('child_process').spawn = jest
      .fn()
      .mockImplementation(() => ({
        on: (event, callback) => setTimeout(() => callback(), 1),
      })));
    require('fs').readFileSync = jest.fn().mockImplementation(() => '123');
    require('tmp').file = jest
      .fn()
      .mockImplementation(callback => callback(null, 'filePath'));
    const p = input.enter('hello');
    return expect(p).resolves.toBe("123");
  });
});
