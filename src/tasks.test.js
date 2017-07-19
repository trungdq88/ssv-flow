// @format
jest.mock('child_process');
jest.mock('./config.js');
require('./config.js').protocol = 'https';
require('./config.js').host = 'host';
require('./config.js').PROJECT_CODE = 'SE';
require('./config.js').ISSUE_TRANSITIONS = ['a', 'b', 'c'];
require('./config.js').REMOTE_NAME = 'remote';
require('./config.js').CONFLUENCE_RELEASE_NOTE_PAGE =
  'Release Note - Frontend Apps';
jest.mock('./jira.js');
jest.mock('./confluence.js');
jest.mock('./git.js');
jest.mock('./input.js');
jest.mock('./cmd.js');
jest.mock('./slack.js');
jest.mock('./version.js');
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
    mockJira.moveIssueToStartProgress.mockImplementation(() => true);
    mockJira.findIssue.mockImplementation(() => ({
      key: 'SE-123',
      fields: { summary: 'abc' },
    }));
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.checkout.mockImplementation(() => true);
    mockGit.isBranchLocalExists.mockImplementation(() => true);

    await tasks.start('issueKey');
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockJira.findIssue).toBeCalledWith('SE-issueKey');
    expect(mockGit.isBranchLocalExists).toBeCalledWith('SE-123/abc');
    expect(mockJira.moveIssueToStartProgress).toBeCalledWith('SE-issueKey');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get issue SE-issueKey info',
      'Issue: SE-123 / abc',
      'Branch SE-123/abc already exist, checking out.',
      'Move issue to Start Progress...',
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
      fields: { summary: 'abc' },
    }));
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.createBranch.mockImplementation(() => true);
    mockGit.checkout.mockImplementation(() => true);
    mockGit.isBranchLocalExists.mockImplementation(() => false);
    mockGit.pull.mockImplementation(() => true);
    mockGit.push.mockImplementation(() => true);
    mockJira.moveIssueToStartProgress.mockImplementation(() => true);

    await tasks.start('issueKey');
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockJira.findIssue).toBeCalledWith('SE-issueKey');
    expect(mockGit.isBranchLocalExists).toBeCalledWith('SE-123/abc');
    expect(mockGit.checkout).toBeCalledWith('master');
    expect(mockGit.pull).toBeCalledWith();
    expect(mockGit.createBranch).toBeCalledWith('SE-123/abc');
    expect(mockGit.push).toBeCalledWith('remote', 'SE-123/abc', { '-u': true });
    expect(mockJira.moveIssueToStartProgress).toBeCalledWith('SE-issueKey');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get issue SE-issueKey info',
      'Issue: SE-123 / abc',
      'Check out master',
      'Pull master',
      'Creating branch SE-123/abc',
      'Push branch SE-123/abc',
      'Move issue to Start Progress...',
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
    await tasks.createIssue('title', 3, 'bug');
    expect(mockJira.createIssue).toBeCalledWith('title', 3, 'bug');
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
    mockJira.moveIssueToStartProgress.mockImplementation(() => true);
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.createBranch.mockImplementation(() => true);
    mockGit.checkout.mockImplementation(() => true);
    mockGit.isBranchLocalExists.mockImplementation(() => true);
    await tasks.createIssue('title', 4, 'bug');
    expect(mockJira.createIssue).toBeCalledWith('title', 4, 'bug');
    expect(mockInput.ask).toBeCalledWith('Start issue SE-123 now?');
    expect(mockJira.findIssue).toBeCalledWith('SE-123');
    expect(mockGit.isBranchLocalExists).toBeCalledWith('SE-123/abc');
    expect(mockJira.moveIssueToStartProgress).toBeCalledWith('SE-123');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Creating issue title',
      'Get issue SE-123 info',
      'Issue: SE-123 / abc',
      'Branch SE-123/abc already exist, checking out.',
      'Move issue to Start Progress...',
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
        { key: 'd', name: 'Show diff', value: 'd' },
        { key: 'a', name: 'Add all & write commit message', value: 'a' },
        { key: 'c', name: 'Cancel', value: 'c' },
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
      fields: { summary: '555' },
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
        { key: 'd', name: 'Show diff', value: 'd' },
        { key: 'a', name: 'Add all & write commit message', value: 'a' },
        { key: 'c', name: 'Cancel', value: 'c' },
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
        { key: 'd', name: 'Show diff', value: 'd' },
        { key: 'a', name: 'Add all & write commit message', value: 'a' },
        { key: 'c', name: 'Cancel', value: 'c' },
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

  it('done happy case', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    const mockCmd = require('./cmd.js');
    const mockJira = require('./jira.js');
    const mockVersion = require('./version.js');
    const mockSlack = require('./slack.js');
    const originalDate = global.Date;
    global.Date = jest
      .fn()
      .mockImplementation(() => new originalDate(1499138753854));
    mockGit.getCurrentBranchName.mockImplementation(() => 'SE-123/abc');
    mockGit.isRepoClean.mockImplementationOnce(() => true);
    mockCmd.runTests.mockImplementation(() => true);
    mockJira.moveIssueToReadyToDeploy.mockImplementation(() => true);
    mockJira.moveIssueToDeployed.mockImplementation(() => true);
    mockGit.getAllTags.mockImplementationOnce(() => []);
    mockGit.addTag.mockImplementationOnce(() => true);
    mockGit.pushTags.mockImplementationOnce(() => true);
    mockVersion.getLatestVersion.mockImplementationOnce(() => 'v1.2.3');
    mockJira.addComment.mockImplementation(() => true);
    mockJira.assignIssue.mockImplementation(() => true);
    mockSlack.sendNotification.mockImplementation(() => true);
    await tasks.done('feature', 'username');
    expect(mockGit.getCurrentBranchName).toBeCalledWith();
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockCmd.runTests).toBeCalledWith();
    expect(mockJira.moveIssueToReadyToDeploy).toBeCalledWith('SE-123');
    expect(mockJira.moveIssueToDeployed).toBeCalledWith('SE-123');
    expect(mockGit.getAllTags).toBeCalledWith();
    expect(mockGit.addTag).toBeCalledWith('v1.2.3.feature.rc1');
    expect(mockGit.pushTags).toBeCalledWith('origin');
    expect(mockVersion.getLatestVersion).toBeCalledWith();
    expect(mockJira.addComment).toBeCalledWith(
      'SE-123',
      'Done at feature-v1.2.3.feature.rc1',
    );
    expect(mockJira.assignIssue).toBeCalledWith('SE-123', 'username');
    expect(mockSlack.sendNotification).toBeCalledWith({
      text:
        '*Frontend Apps Feature Branch Released: `v1.2.3.feature.rc1` ' +
        '(2017-07-04 10:25)*\nChanges: <https://host/browse/SE-123|SE-123> ' +
        '555 (<@username>)',
    });
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Running tests...',
      'Creating tag v1.2.3.feature.rc1...',
      'Pushing tag v1.2.3.feature.rc1...',
      'Moving issue SE-123...',
      'Adding comment...',
      'Assign issue to username...',
      'Notify to Slack...',
      'Done',
    ]);
    console.log = log;
    global.Date = originalDate;
  });

  it('deploy happy case', async () => {
    const log = console.log;
    console.log = jest.fn();
    const originalDate = global.Date;
    global.Date = jest
      .fn()
      .mockImplementation(() => new originalDate(1499138753854));
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    const mockCmd = require('./cmd.js');
    const mockJira = require('./jira.js');
    const mockConfluence = require('./confluence.js');
    const mockSlack = require('./slack.js');
    mockSlack.sendNotification.mockImplementation(() => 'master');
    mockGit.getCurrentBranchName.mockImplementation(() => 'master');
    mockGit.isRepoClean.mockImplementation(() => true);
    mockGit.getLogSinceLastTag.mockImplementation(() => [
      '[HQ] [SE-2449] Optimize file read',
      '[HQ] [SE-2449] Test screenshot',
      '[HQ] [SE-2449] Read meta',
      'Add test-screenshot',
      '[SUP] [SE-2441] Analytics portal',
      '[SUP] [SE-2441] Submodule',
      '[SUP] [SE-2441] Change env vars',
      '[LOG/CDC] [SE-2440] Set timezone',
      '[LOG/CDC/SUP] [SE-2440] Bitbucket pipeline',
      '[CONFIG] [master] Use Bitbucket pipeline',
      'bitbucket-pipelines.yml created online with Bitbucket',
    ]);
    mockJira.findIssue.mockImplementation(issueKey => ({
      fields: {
        summary: 'issue ' + issueKey,
        creator: { name: 'name-' + issueKey },
      },
    }));
    mockInput.enter.mockImplementation(text => text + 'enter');
    mockCmd.deploy.mockImplementation(() => true);
    mockGit.getLatestTag.mockImplementation(() => 'v1.2.3');
    mockJira.moveIssueToDeployed.mockImplementation(() => true);
    mockJira.addComment.mockImplementation(() => true);
    mockJira.assignIssue.mockImplementation(() => true);
    mockConfluence.appendToPage.mockImplementation(() => 'link here');
    await tasks.deploy('username');
    expect(mockGit.getCurrentBranchName).toBeCalledWith();
    expect(mockGit.isRepoClean).toBeCalledWith();
    expect(mockGit.getLogSinceLastTag).toBeCalledWith('master');
    expect(mockJira.findIssue.mock.calls).toEqual([
      ['SE-2449'],
      ['SE-2441'],
      ['SE-2440'],
    ]);
    expect(mockInput.enter).toBeCalledWith(
      [
        `Changes:`,
        ``,
        `### JIRA issues:`,
        `- [[SE-2449]](https://host/browse/SE-2449) ` +
          `issue SE-2449 (@name-SE-2449)`,
        `- [[SE-2441]](https://host/browse/SE-2441) ` +
          `issue SE-2441 (@name-SE-2441)`,
        `- [[SE-2440]](https://host/browse/SE-2440) ` +
          `issue SE-2440 (@name-SE-2440)`,
        ``,
        `### Others:`,
        `- Add test-screenshot`,
        `- [CONFIG] [master] Use Bitbucket pipeline`,
        `- bitbucket-pipelines.yml created online with Bitbucket`,
      ].join('\n'),
    );
    expect(mockCmd.deploy).toBeCalledWith();
    expect(mockGit.getLatestTag).toBeCalledWith();
    // expect(mockJira.moveIssueToDeployed.mock.calls).toEqual([
    //   ['SE-2449'],
    //   ['SE-2441'],
    //   ['SE-2440'],
    // ]);
    expect(mockJira.addComment.mock.calls).toEqual([
      ['SE-2449', 'Released at v1.2.3.'],
      ['SE-2441', 'Released at v1.2.3.'],
      ['SE-2440', 'Released at v1.2.3.'],
    ]);
    // expect(mockJira.assignIssue.mock.calls).toEqual([
    //   ['SE-2449', 'name-SE-2449'],
    //   ['SE-2441', 'name-SE-2441'],
    //   ['SE-2440', 'name-SE-2440'],
    // ]);
    expect(mockConfluence.appendToPage).toBeCalledWith(
      'Release Note - Frontend Apps',
      [
        `<h2 id=\"frontendappsreleasev123201707041025\">` +
          `Frontend Apps Release <strong>v1.2.3</strong> (2017-07-04 10:25):` +
          `</h2>`,
        `<p>Changes:</p>`,
        `<h3 id=\"jiraissues\">JIRA issues:</h3>`,
        `<ul>`,
        `<li><a href=\"https://host/browse/SE-2449\">[SE-2449]</a> ` +
          `issue SE-2449 (@name-SE-2449)</li>`,
        `<li><a href=\"https://host/browse/SE-2441\">[SE-2441]</a> ` +
          `issue SE-2441 (@name-SE-2441)</li>`,
        `<li><a href=\"https://host/browse/SE-2440\">[SE-2440]</a> ` +
          `issue SE-2440 (@name-SE-2440)</li>`,
        `</ul>`,
        `<h3 id=\"others\">Others:</h3>`,
        `<ul>`,
        `<li>Add test-screenshot</li>`,
        `<li>[CONFIG] [master] Use Bitbucket pipeline</li>`,
        `<li>bitbucket-pipelines.yml created online with Bitbucketenter</li>`,
        `</ul>`,
      ].join('\n'),
    );
    expect(mockSlack.sendNotification).toBeCalledWith({
      text: [
        '<link here|*Frontend Apps Release `v1.2.3` (2017-07-04 10:25):*>',
        'Changes:',
        '',
        '*JIRA issues:*',
        `- <https://host/browse/SE-2449|SE-2449> ` +
          `issue SE-2449 (<@name-SE-2449>)`,
        `- <https://host/browse/SE-2441|SE-2441> ` +
          `issue SE-2441 (<@name-SE-2441>)`,
        `- <https://host/browse/SE-2440|SE-2440> ` +
          `issue SE-2440 (<@name-SE-2440>)`,
        '',
        '*Others:*',
        '- Add test-screenshot',
        '- [CONFIG] [master] Use Bitbucket pipeline',
        '- bitbucket-pipelines.yml created online with Bitbucketenter',
      ].join('\n'),
    });
    expect(global.Date).toBeCalledWith();
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Fetching issues info from JIRA...',
      'Fetching SE-2449...',
      'Fetching SE-2441...',
      'Fetching SE-2440...',
      [
        `Changes:`,
        ``,
        `### JIRA issues:`,
        `- [[SE-2449]](https://host/browse/SE-2449) ` +
          `issue SE-2449 (@name-SE-2449)`,
        `- [[SE-2441]](https://host/browse/SE-2441) ` +
          `issue SE-2441 (@name-SE-2441)`,
        `- [[SE-2440]](https://host/browse/SE-2440) ` +
          `issue SE-2440 (@name-SE-2440)`,
        ``,
        `### Others:`,
        `- Add test-screenshot`,
        `- [CONFIG] [master] Use Bitbucket pipeline`,
        `- bitbucket-pipelines.yml created online with Bitbucketenter`,
      ].join('\n'),
      'Creating new tag & trigger deploy...',
      [
        'Pending issues: 3 issue(s)',
        ' - SE-2449 (name-SE-2449)',
        ' - SE-2441 (name-SE-2441)',
        ' - SE-2440 (name-SE-2440)',
      ].join('\n'),
      'Moving && assigning 3 issue(s)...',
      'Issue SE-2449... Done.',
      'Issue SE-2441... Done.',
      'Issue SE-2440... Done.',
      'Updating release note...',
      'Notify on Slack...',
      'Done.',
    ]);
    console.log = log;
    global.Date = originalDate;
  });

  it('deploy only run on master', async () => {
    const log = console.log;
    console.log = jest.fn();
    const mockGit = require('./git.js');
    const mockInput = require('./input.js');
    mockGit.getCurrentBranchName.mockImplementation(() => 'abc');
    await tasks.deploy();
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'You can only to run this command on master',
    ]);
    console.log = log;
  });

  it('getPendingIssues', async () => {
    const log = console.log;
    console.log = jest.fn();

    const mockGit = require('./git.js');
    const mockJira = require('./jira.js');
    mockJira.findIssue.mockImplementation(issueKey => ({
      key: issueKey,
      fields: {
        summary: issueKey + ' summary',
        creator: { name: issueKey + ' creator' },
      },
    }));
    mockGit.getAllUnmergedBranches.mockImplementation(() => [
      'SE-1234/aoehulrcaoheu',
      'SE-222/98457894597843',
      'aoeu',
      '123',
    ]);
    await tasks.getPendingIssues();

    expect(mockGit.getAllUnmergedBranches).toBeCalledWith();
    expect(mockJira.findIssue.mock.calls).toEqual([['SE-1234'], ['SE-222']]);
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      '* Pending issues *',
      '- SE-1234: SE-1234 summary (@SE-1234 creator)\n' +
        '- SE-222: SE-222 summary (@SE-222 creator)',
      '===================',
    ]);
    console.log = log;
  });
});
