// @format

jest.mock('./config.js');
require('./config.js').protocol = 'https';
require('./config.js').host = 'host';
require('./config.js').PROJECT_CODE = 'SE';
require('./config.js').ISSUE_TRANSITIONS = ['a', 'b', 'c'];
require('./config.js').ISSUE_TRANSITIONS_READY_TO_DEPLOY = ['a', 'b'];
jest.mock('opn');
jest.mock('./lib/jira-api.js');
require('./lib/jira-api.js').JiraApi.mockImplementation(() => ({
  findIssue: issueKey =>
    Promise.resolve({
      name: 'issueKey',
    }),
  listTransitions: issueKey =>
    Promise.resolve({
      transitions: [{name: 'a'}, {name: 'b'}, {name: 'c'}],
    }),
  transitionIssue: (issueKey, transition) => true,
  assignIssue: (issueKey, username) => Promise.resolve({name: 'assigned'}),
  addComment: (issueKey, comment) => Promise.resolve({name: 'comment'}),
  getProject: projectCode => ({
    name: 'getProject',
  }),
  findRapidView: (projectName, activeBoard) => ({
    id: 'board_id',
    name: 'board_name',
  }),
  getLastSprintForRapidView: boardId => ({
    id: 'sprint_id',
    name: 'sprint_name',
  }),
  addNewIssue: issue => ({
    key: 'issue_key',
  }),
}));

const jira = require('./jira.js');

describe('jira.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initiated ok', () => {
    expect(jira.openIssue).toBeTruthy();
  });

  it('should open browser via opn', () => {
    const opn = require('opn').mockImplementation(() => true);
    jira.openIssue('SE-1234');
    expect(opn).toBeCalledWith('https://host/browse/SE-1234');
  });

  it('should open browser via opn with project code', () => {
    const opn = require('opn').mockImplementation(() => true);
    jira.openIssue('SE-1234');
    expect(opn).toBeCalledWith('https://host/browse/SE-1234');
  });

  it('create issue', async () => {
    const log = console.log;
    console.log = jest.fn();
    await jira.createIssue('title');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get project information code "SE"',
      'Get board information of project "getProject"',
      'Get active sprint of board "board_name"',
      'Creating issue in sprint_name...',
      'Issue created: issue_key',
    ]);
    console.log = log;
  });

  it('find issue', () => {
    return expect(jira.findIssue('title')).resolves.toEqual({
      name: 'issueKey',
    });
  });

  it('assign issue', () => {
    return expect(jira.assignIssue('title')).resolves.toEqual({
      name: 'assigned',
    });
  });

  it('add comment', () => {
    return expect(jira.addComment('msg')).resolves.toEqual({
      name: 'comment',
    });
  });

  it('move issue', async () => {
    const log = console.log;
    console.log = jest.fn();
    await jira.moveIssue('issueKey');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Moving issueKey to a...',
      'Moving issueKey to b...',
      'Moving issueKey to c...',
      'Issue transition complete.',
    ]);
    console.log = log;
  });

  it('move issue to ready to deployed', async () => {
    const log = console.log;
    console.log = jest.fn();
    await jira.moveIssueToReadyToDeploy('issueKey');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Moving issueKey to a...',
      'Moving issueKey to b...',
      'Issue transition complete.',
    ]);
    console.log = log;
  });
});
