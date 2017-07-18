jest.mock('fs');

const version = require('./version.js');

describe('version', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.only('should work', () => {
    require('fs').readFileSync.mockImplementation(() => '{ "version": 123 }');
    expect(version.getLatestVersion()).toBe(`v123`);
  });
});
