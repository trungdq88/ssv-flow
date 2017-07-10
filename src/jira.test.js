// @format

jest.mock('./config.js');
require('./config.js').protocol = 'https';
require('./config.js').host = 'host';
require('./config.js').PROJECT_CODE = 'SE';
require('./config.js').PROJECT_SE = '123123';
require('./config.js').ISSUE_TYPE_TASK = 'task';
require('./config.js').ISSUE_TYPE_BUG = 'bug';
require('./config.js').ME = 'me';
require('./config.js').PRIORITY_MEDIUM = 'medium';
require('./config.js').COMPONENT_HQ_FRONTEND = 'hq-frontend';
require('./config.js').SPRINT_CUSTOM_FIELD_ID = 'sprint';
require('./config.js').STORY_POINT_FIELD_ID = 'story-point';
require('./config.js').ISSUE_TRANSITIONS = ['a', 'b', 'c'];
require('./config.js').ISSUE_TRANSITIONS_READY_TO_DEPLOY = ['b'];
require('./config.js').ISSUE_TRANSITIONS_DEPLOYED = ['c'];
require('./config.js').ISSUE_TRANSITIONS_START_PROGRESS = ['a'];
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
    issue,
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

  it('create issue task', async () => {
    const log = console.log;
    console.log = jest.fn();
    const issue = await jira.createIssue('title', 1);
    expect(issue).toEqual({
      issue: {
        fields: {
          assignee: {name: 'me'},
          components: [{id: 'hq-frontend'}],
          issuetype: {id: 'task'},
          priority: {id: 'medium'},
          project: {id: '123123'},
          sprint: 'sprint_id',
          'story-point': 1,
          summary: 'title',
        },
      },
      key: 'issue_key',
    });
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get project information code "SE"',
      'Get board information of project "getProject"',
      'Get active sprint of board "board_name"',
      'Creating issue (task) in sprint_name...',
      'Issue created: issue_key',
    ]);
    console.log = log;
  });

  it('create issue bug', async () => {
    const log = console.log;
    console.log = jest.fn();
    const issue = await jira.createIssue('title', 1, 'bug');
    expect(issue).toEqual({
      issue: {
        fields: {
          assignee: {name: 'me'},
          components: [{id: 'hq-frontend'}],
          issuetype: {id: 'bug'},
          priority: {id: 'medium'},
          project: {id: '123123'},
          sprint: 'sprint_id',
          'story-point': 1,
          summary: 'title',
        },
      },
      key: 'issue_key',
    });
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Get project information code "SE"',
      'Get board information of project "getProject"',
      'Get active sprint of board "board_name"',
      'Creating issue (bug) in sprint_name...',
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

  it('move issue to start progress', async () => {
    const log = console.log;
    console.log = jest.fn();
    await jira.moveIssueToStartProgress('issueKey');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Moving issueKey to a...',
      'Issue transition complete.',
    ]);
    console.log = log;
  });

  it('move issue to ready to deployed', async () => {
    const log = console.log;
    console.log = jest.fn();
    await jira.moveIssueToReadyToDeploy('issueKey');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Moving issueKey to b...',
      'Issue transition complete.',
    ]);
    console.log = log;
  });

  it('move issue to deployed', async () => {
    const log = console.log;
    console.log = jest.fn();
    await jira.moveIssueToDeployed('issueKey');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Moving issueKey to c...',
      'Issue transition complete.',
    ]);
    console.log = log;
  });
});
