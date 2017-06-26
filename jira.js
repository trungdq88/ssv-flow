const JiraApi = require('./lib/jira.js').JiraApi;
const config = require('./config.js');
const opn = require('opn');

const {
  ME,
  PROJECT_SE,
  PRIORITY_MEDIUM,
  ISSUE_TYPE_TASK,
  SPRINT_CUSTOM_FIELD_ID,
  ACTIVE_BOARD,
  COMPONENT_HQ_FRONTEND,
} = config;

const jira = new JiraApi(
  config.protocol, config.host, config.port, config.user, config.password, 'latest'
);

exports.openIssue = issueNumber => {
  opn(
    config.protocol + '://' + config.host +
    '/browse/SE-' + issueNumber.replace(/^SE-/, '')
  );
  process.exit();
};

exports.createIssue = async issueTitle => {

  const projectKey = 'SE';

  console.log(`Get project information code "${projectKey}"`);
  const project = await jira.getProject(projectKey);

  console.log(`Get board information of project "${project.name}"`);
  const board = await jira.findRapidView(project.name, ACTIVE_BOARD);

  console.log(`Get active sprint of board "${board.name}"`);
  const activeSprint = await jira.getLastSprintForRapidView(board.id);

  const issueFields = {
    fields: {
      project: {
        id: PROJECT_SE
      },
      summary: issueTitle,
      issuetype: {
        id: ISSUE_TYPE_TASK
      },
      assignee: {
        name: ME
      },
      priority: {
        id: PRIORITY_MEDIUM
      },
      components: [{
        id: COMPONENT_HQ_FRONTEND
      }],
      [SPRINT_CUSTOM_FIELD_ID]: activeSprint.id,
    }
  };

  console.log(`Creating issue in ${activeSprint.name}: `, issueFields);
  const issue = await jira.addNewIssue(issueFields);

  console.log('Issue created: ', issue.key);
  return issue;
};

exports.findIssue = issueNumber => {
  return jira.findIssue('SE-' + issueNumber.replace(/^SE-/, ''));
};
