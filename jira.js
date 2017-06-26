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

exports.createIssue = issueTitle => {

  jira.getProject('SE', (err, project) => {
    jira.findRapidView(project.name, ACTIVE_BOARD, (err, board) => {
      jira.getLastSprintForRapidView(board.id, (err, activeSprint) => {

        const issue = {
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

        console.log('Creating issue: ', issue);

        jira.addNewIssue(issue, (err, issue) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Issue created: ', issue.key);
        });
      });
    });
  });
};

