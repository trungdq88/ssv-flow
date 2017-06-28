const cmd = require('./cmd.js');

jest.mock('child_process');

describe('cmd.js', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call yarn test', () => {
    const spawn = require('child_process').spawn = jest.fn()
      .mockImplementation(() => ({
        on: (event, callback) => setTimeout(() => callback(0), 1)
      }));
    const run = cmd.runTests();
    expect(spawn).toBeCalledWith(
      "yarn", ["test"], {"env": {"CI": "true"}, "stdio": "inherit"}
    );
    return expect(run).resolves.toBe(0);
  });

  it('should resolve if test success', () => {
    const spawn = require('child_process').spawn = jest.fn()
      .mockImplementation(() => ({
        on: (event, callback) => setTimeout(() => callback(0), 1)
      }));
    return expect(cmd.runTests()).resolves.toBe(0);
  });

  it('should reject if test failed', () => {
    const spawn = require('child_process').spawn = jest.fn()
      .mockImplementation(() => ({
        on: (event, callback) => setTimeout(() => callback(1), 1)
      }));
    return expect(cmd.runTests()).rejects.toBe(1);
  });

  it('should call yarn deploy', () => {
    const spawn = require('child_process').spawn = jest.fn()
      .mockImplementation(() => ({
        on: (event, callback) => setTimeout(() => callback(0), 1)
      }));
    const run = cmd.deploy();
    expect(spawn).toBeCalledWith(
      "yarn", ["run", "deploy"], {"env": {"CI": "true"}, "stdio": "inherit"}
    );
    return expect(run).resolves.toBe(0);
  });

  it('should reject if deploy failed', () => {
    const spawn = require('child_process').spawn = jest.fn()
      .mockImplementation(() => ({
        on: (event, callback) => setTimeout(() => callback(1), 1)
      }));
    return expect(cmd.runTests()).rejects.toBe(1);
  });

});
