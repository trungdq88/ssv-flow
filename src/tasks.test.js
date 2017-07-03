// @format
jest.mock('child_process');
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
      key: 'SE-123',
      fields: {summary: 'abc'},
    }));
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.checkout.mockImplementation(() => true);
    mockGit.isBranchLocalExists.mockImplementation(() => true);

    await tasks.start('issueKey');
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockJira.findIssue).toBeCalledWith('SE-issueKey');
    expect(mockGit.isBranchLocalExists).toBeCalledWith('SE-123/abc');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get issue SE-issueKey info',
      'Issue: SE-123 / abc',
      'Branch SE-123/abc already exist, checking out.',
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
      key: 'SE-123',
      fields: {summary: 'abc'},
    }));
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.createBranch.mockImplementation(() => true);
    mockGit.checkout.mockImplementation(() => true);
    mockGit.isBranchLocalExists.mockImplementation(() => false);
    mockGit.pull.mockImplementation(() => true);
    mockGit.push.mockImplementation(() => true);

    await tasks.start('issueKey');
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockJira.findIssue).toBeCalledWith('SE-issueKey');
    expect(mockGit.isBranchLocalExists).toBeCalledWith('SE-123/abc');
    expect(mockGit.checkout).toBeCalledWith('master');
    expect(mockGit.pull).toBeCalledWith();
    expect(mockGit.createBranch).toBeCalledWith('SE-123/abc');
    expect(mockGit.push).toBeCalledWith('remote', 'SE-123/abc');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get issue SE-issueKey info',
      'Issue: SE-123 / abc',
      'Check out master',
      'Pull master',
      'Creating branch SE-123/abc',
      'Push branch SE-123/abc',
      'Done! Happy coding!',
    ]);
    console.log = log;
  });

  it('create issue no start', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockJira = require('./jira.js');
    const mockInput = require('./input.js');
    mockJira.createIssue.mockImplementation(() => ({
      key: 'SE-123',
    }));
    mockInput.ask.mockImplementation(() => false);
    await tasks.createIssue('title');
    expect(mockJira.createIssue).toBeCalledWith('title');
    expect(mockInput.ask).toBeCalledWith('Start issue SE-123 now?');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Creating issue title',
    ]);
    console.log = log;
  });

  it('create issue start', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockJira = require('./jira.js');
    const mockInput = require('./input.js');
    mockJira.createIssue.mockImplementation(() => ({
      key: 'SE-123',
      summary: 'abc',
    }));
    mockInput.ask.mockImplementation(() => true);
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.createBranch.mockImplementation(() => true);
    mockGit.checkout.mockImplementation(() => true);
    mockGit.isBranchLocalExists.mockImplementation(() => true);
    await tasks.createIssue('title');
    expect(mockJira.createIssue).toBeCalledWith('title');
    expect(mockInput.ask).toBeCalledWith('Start issue SE-123 now?');
    expect(mockJira.findIssue).toBeCalledWith('SE-123');
    expect(mockGit.isBranchLocalExists).toBeCalledWith('SE-123/abc');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Creating issue title',
      'Get issue SE-123 info',
      'Issue: SE-123 / abc',
      'Branch SE-123/abc already exist, checking out.',
      'Done! Happy coding!',
    ]);
    console.log = log;
  });

  it('commit repo clean', async () => {
    const error = console.error;
    console.error = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    mockGit.isRepoClean.mockImplementation(() => true);
    await tasks.commit();
    expect(console.error.mock.calls.map(_ => _.join(''))).toEqual([
      'Repo is clean, there is nothing to commit!',
    ]);
    console.error = error;
  });

  it('commit user enter commit message', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    mockGit.isRepoClean.mockImplementation(() => false);
    mockGit.getStatusPrint.mockImplementation(() => 'dirty text');
    mockGit.addAll.mockImplementation(() => true);
    mockGit.getCurrentBranchName.mockImplementation(() => 'SE-123/branch');
    mockGit.getCommitTag.mockImplementation(() => '[TAG]');
    mockGit.commit.mockImplementation(() => true);
    mockInput.choice.mockImplementation(() => 'a');
    mockInput.enter.mockImplementation(() => 'user enter commit msg');
    await tasks.commit();
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockGit.getStatusPrint).toBeCalledWith();
    expect(mockGit.addAll).toBeCalledWith();
    expect(mockGit.getCurrentBranchName).toBeCalledWith();
    expect(mockGit.getCommitTag).toBeCalledWith();
    expect(mockGit.commit).toBeCalledWith(
      '[TAG] [SE-123] user enter commit msg',
    );
    expect(mockInput.choice).toBeCalledWith(
      'Please select an action',
      [
        {key: 'd', name: 'Show diff', value: 'd'},
        {key: 'a', name: 'Add all & write commit message', value: 'a'},
        {key: 'c', name: 'Cancel', value: 'c'},
      ],
      1,
    );
    expect(mockInput.enter).toBeCalledWith();
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      '----- GIT STATUS BEGIN -----',
      'dirty text',
      '----- GIT STATUS END -----',
      'Committing:[TAG] [SE-123] user enter commit msg',
      'Awesome!',
    ]);
    console.log = log;
  });

  it('commit use issue summary as commit message', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    const mockJira = require('./jira.js');
    mockJira.findIssue.mockImplementation(() => ({
      key: '222',
      fields: {summary: '555'},
    }));
    mockGit.isRepoClean.mockImplementation(() => false);
    mockGit.getStatusPrint.mockImplementation(() => 'dirty text');
    mockGit.addAll.mockImplementation(() => true);
    mockGit.getCurrentBranchName.mockImplementation(() => 'SE-123/branch');
    mockGit.getCommitTag.mockImplementation(() => '[TAG]');
    mockGit.commit.mockImplementation(() => true);
    mockInput.choice.mockImplementation(() => 'a');
    mockInput.enter.mockImplementation(() => '');
    await tasks.commit();
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockGit.getStatusPrint).toBeCalledWith();
    expect(mockGit.addAll).toBeCalledWith();
    expect(mockGit.getCurrentBranchName).toBeCalledWith();
    expect(mockGit.getCommitTag).toBeCalledWith();
    expect(mockGit.commit).toBeCalledWith('[TAG] [SE-123] 555');
    expect(mockInput.choice).toBeCalledWith(
      'Please select an action',
      [
        {key: 'd', name: 'Show diff', value: 'd'},
        {key: 'a', name: 'Add all & write commit message', value: 'a'},
        {key: 'c', name: 'Cancel', value: 'c'},
      ],
      1,
    );
    expect(mockInput.enter).toBeCalledWith();
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      '----- GIT STATUS BEGIN -----',
      'dirty text',
      '----- GIT STATUS END -----',
      'Fetching issue title as commit message...',
      'Committing:[TAG] [SE-123] 555',
      'Awesome!',
    ]);
    console.log = log;
  });

  it('commit fast message', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    mockGit.isRepoClean.mockImplementation(() => false);
    mockGit.addAll.mockImplementation(() => true);
    mockGit.getCurrentBranchName.mockImplementation(() => 'SE-123/branch');
    mockGit.getCommitTag.mockImplementation(() => '[TAG]');
    mockGit.commit.mockImplementation(() => true);
    await tasks.commit('fast message');
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockGit.addAll).toBeCalledWith();
    expect(mockGit.getCurrentBranchName).toBeCalledWith();
    expect(mockGit.getCommitTag).toBeCalledWith();
    expect(mockGit.commit).toBeCalledWith('[TAG] [SE-123] fast message');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Committing:[TAG] [SE-123] fast message',
    ]);
    console.log = log;
  });

  it('commit view diff', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    const mockChildProcess = require('child_process');
    mockChildProcess.spawn.mockImplementation(() => ({
      on: (event, callback) => callback(0),
    }));
    mockGit.isRepoClean.mockImplementation(() => false);
    mockGit.getStatusPrint.mockImplementation(() => 'dirty text');
    mockGit.addAll.mockImplementation(() => true);
    mockGit.getCurrentBranchName.mockImplementation(() => 'SE-123/branch');
    mockGit.getCommitTag.mockImplementation(() => '[123]');
    mockGit.commit.mockImplementation(() => true);
    mockInput.choice.mockImplementation(() => 'd');
    mockInput.enter.mockImplementation(() => '');
    await tasks.commit();
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockGit.getStatusPrint).toBeCalledWith();
    expect(mockGit.addAll).toBeCalledWith();
    expect(mockChildProcess.spawn).toBeCalledWith('git', ['diff', '--staged'], {
      stdio: 'inherit',
    });
    expect(mockInput.choice).toBeCalledWith(
      'Please select an action',
      [
        {key: 'd', name: 'Show diff', value: 'd'},
        {key: 'a', name: 'Add all & write commit message', value: 'a'},
        {key: 'c', name: 'Cancel', value: 'c'},
      ],
      1,
    );
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      '----- GIT STATUS BEGIN -----',
      'dirty text',
      '----- GIT STATUS END -----',
      'Awesome!',
    ]);
    console.log = log;
  });

  it('done no run on master', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    mockGit.getCurrentBranchName.mockImplementation(() => 'master');
    await tasks.done('username');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'You are not suppose to run this command on master',
    ]);
    console.log = log;
  });

  it('done repo clean', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    mockGit.getCurrentBranchName.mockImplementation(() => 'SE-123/abc');
    mockGit.isRepoClean.mockImplementation(() => false);
    await tasks.done('username');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Repo is not clean!',
    ]);
    console.log = log;
  });

  it('done conflict', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    mockGit.getCurrentBranchName.mockImplementation(() => 'SE-123/abc');
    mockGit.isRepoClean.mockImplementationOnce(() => true);
    mockGit.isRepoClean.mockImplementationOnce(() => false);
    mockGit.merge.mockImplementation(() => true);
    await tasks.done('username');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'There is conflict after merge, please fix it!',
    ]);
    console.log = log;
  });

  it('done happy case', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    const mockCmd = require('./cmd.js');
    const mockJira = require('./jira.js');
    mockGit.getCurrentBranchName.mockImplementation(() => 'SE-123/abc');
    mockGit.isRepoClean.mockImplementationOnce(() => true);
    mockGit.isRepoClean.mockImplementationOnce(() => true);
    mockGit.merge.mockImplementation(() => true);
    mockCmd.runTests.mockImplementation(() => true);
    mockGit.checkout.mockImplementation(() => true);
    mockJira.moveIssueToReadyToDeploy.mockImplementation(() => true);
    await tasks.done('username');
    expect(mockGit.getCurrentBranchName).toBeCalledWith();
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockGit.merge).toBeCalledWith('SE-123/abc', 'master');
    expect(mockGit.merge).toBeCalledWith('master', 'SE-123/abc');
    expect(mockCmd.runTests).toBeCalledWith();
    expect(mockGit.checkout).toBeCalledWith('master');
    expect(mockJira.moveIssueToReadyToDeploy).toBeCalledWith('SE-123');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual(['Done']);
    console.log = log;
  });
});
