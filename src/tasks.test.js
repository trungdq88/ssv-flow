// @format
jest.mock('./config.js');
require('./config.js').protocol = 'https';
require('./config.js').host = 'host';
require('./config.js').PROJECT_CODE = 'SE';
require('./config.js').ISSUE_TRANSITIONS = ['a', 'b', 'c'];
require('./config.js').REMOTE_NAME = 'remote';
jest.mock('./jira.js');
jest.mock('./git.js');
jest.mock('./input.js');
jest.mock('./cmd.js');
jest.mock('./utils/slug.js');

const tasks = require('./tasks.js');

describe('tasks.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initiated ok', () => {
    expect(tasks.start).toBeTruthy();
  });

  it('start issue, already has branch', async () => {
    const log = console.log;
    console.log = jest.fn();

    const mockGit = require('./git.js');
    const mockJira = require('./jira.js');
    const mockSlug = require('./utils/slug.js');
    mockSlug.mockImplementation(_ => _);
    mockJira.findIssue.mockImplementation(() => ({
      key: '123',
      fields: {summary: 'abc'},
    }));
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.checkoutBranch.mockImplementation(() => true);
    mockGit.isBranchLocalExists.mockImplementation(() => true);

    await tasks.start('issueKey');
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockJira.findIssue).toBeCalledWith('issueKey');
    expect(mockGit.isBranchLocalExists).toBeCalledWith('123/abc');
    expect(mockGit.checkoutBranch).toBeCalledWith('123/abc');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get issue issueKey info',
      'Branch 123/abc already exist, checking out.',
      'Done! Happy coding!',
    ]);
    console.log = log;
  });

  it('start issue, new branch', async () => {
    const log = console.log;
    console.log = jest.fn();

    const mockGit = require('./git.js');
    const mockJira = require('./jira.js');
    const mockSlug = require('./utils/slug.js');
    mockSlug.mockImplementation(_ => _);
    mockJira.findIssue.mockImplementation(() => ({
      key: '123',
      fields: {summary: 'abc'},
    }));
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.checkoutBranch.mockImplementation(() => true);
    mockGit.isBranchLocalExists.mockImplementation(() => false);
    mockGit.pull.mockImplementation(() => true);
    mockGit.push.mockImplementation(() => true);

    await tasks.start('issueKey');
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockJira.findIssue).toBeCalledWith('issueKey');
    expect(mockGit.isBranchLocalExists).toBeCalledWith('123/abc');
    expect(mockGit.checkoutBranch).toBeCalledWith('master');
    expect(mockGit.pull).toBeCalledWith();
    expect(mockGit.checkoutBranch).toBeCalledWith('123/abc');
    expect(mockGit.push).toBeCalledWith('remote', '123/abc');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get issue issueKey info',
      'Check out master',
      'Pull master',
      'Creating branch 123/abc',
      'Push branch 123/abc',
      'Done! Happy coding!',
    ]);
    console.log = log;
  });
});
