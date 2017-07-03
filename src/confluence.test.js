// @format

const mockPage = {id: 123, title: 'title', body: 'body', version: {number: 1}};
jest.mock('./config.js');
require('./config.js').protocol = 'https';
require('./config.js').host = 'host';
require('./config.js').PROJECT_CODE = 'SE';
require('./config.js').CONFLUENCE_SPACE_KEY = 'SPACE_KEY';
require('./config.js').CONFLUENCE_PATH = 'path';
jest.mock('./lib/confluence-api.js');
require('./lib/confluence-api.js').mockImplementation(() => ({
  getContentByPageTitle: (spaceKey, title, callback) =>
    setTimeout(
      () =>
        callback(null, {
          results: [mockPage],
        }),
      1,
    ),
  putContent: (spaceKey, id, version, title, content, callback) =>
    setTimeout(() => callback(null, id), 1),
}));

const confluence = require('./confluence.js');

describe('confluence.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initiated ok', () => {
    expect(confluence).toBeTruthy();
  });

  it('getPage', () => {
    return expect(confluence.getPage('title')).resolves.toBe(mockPage);
  });

  it('editPage', () => {
    return expect(confluence.editPage('title')).resolves.toBe(123);
  });
});
