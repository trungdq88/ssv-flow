jest.mock('./config.js');
require('./config.js').protocol = 'https';
require('./config.js').host = 'host';
require('./config.js').PROJECT_CODE = 'SE';
require('./config.js').ISSUE_TRANSITIONS = ['a', 'b', 'c'];
jest.mock('opn');
jest.mock('./lib/jira-api.js');
require('./lib/jira-api.js').JiraApi.mockImplementation(() => ({
  findIssue: issueKey =>
    Promise.resolve({
      name: 'issueKey',
    }),
  listTransitions: issueKey =>
    Promise.resolve({
      transitions: [{name: 'a'}, {name: 'd'}, {name: 'c'}],
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

describe('jira-2.js', () => {
  it('move issue skip if transition failed', async () => {
    const log = console.log;
    console.log = jest.fn();
    require('./lib/jira-api.js').JiraApi.mockImplementation(() => ({
      listTransitions: issueKey =>
        Promise.resolve({
          transitions: [{name: 'a'}, {name: 'd'}, {name: 'c'}],
        }),
    }));
    await jira.moveIssue('issueKey', 'username');
    expect(console.log.mock.calls.map(_ => _.join(''))).toEqual([
      'Moving issueKey to a...',
      'Transition "b" not found in available transitions' +
      ' of issue issueKey:\na\nd\nc',
      'Skip to next transition',
      'Moving issueKey to c...',
      'Issue transition complete.',
    ]);
    console.log = log;
  });
});
