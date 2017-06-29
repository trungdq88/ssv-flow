const JiraApi = require('./lib/jira-api.js').JiraApi;
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
  ISSUE_TRANSITIONS,
} = config;

const jiraApi = new JiraApi(
  config.protocol,
  config.host,
  config.port,
  config.user,
  config.password,
  'latest',
);

exports.openIssue = issueKey => {
  opn(
    config.protocol +
      '://' +
      config.host +
      '/browse/SE-' +
      issueKey.replace(/^SE-/, ''),
  );
  process.exit();
};

exports.createIssue = async issueTitle => {
  const projectKey = 'SE';

  console.log(`Get project information code "${projectKey}"`);
  const project = await jiraApi.getProject(projectKey);

  console.log(`Get board information of project "${project.name}"`);
  const board = await jiraApi.findRapidView(project.name, ACTIVE_BOARD);

  console.log(`Get active sprint of board "${board.name}"`);
  const activeSprint = await jiraApi.getLastSprintForRapidView(board.id);

  const issueFields = {
    fields: {
      project: {
        id: PROJECT_SE,
      },
      summary: issueTitle,
      issuetype: {
        id: ISSUE_TYPE_TASK,
      },
      assignee: {
        name: ME,
      },
      priority: {
        id: PRIORITY_MEDIUM,
      },
      components: [
        {
          id: COMPONENT_HQ_FRONTEND,
        },
      ],
      [SPRINT_CUSTOM_FIELD_ID]: activeSprint.id,
    },
  };

  console.log(`Creating issue in ${activeSprint.name}...`);
  const issue = await jiraApi.addNewIssue(issueFields);

  console.log('Issue created: ', issue.key);
  return issue;
};

exports.findIssue = issueKey => {
  return jiraApi.findIssue('SE-' + issueKey.replace(/^SE-/, ''));
};

exports.assignIssue = async (issueKey, username) => {
  for (let i = 0; i < ISSUE_TRANSITIONS.length; i++) {
    const transitionName = ISSUE_TRANSITIONS[i];
    const availableTransitions = (await jiraApi.listTransitions(issueKey))
      .transitions;
    const nextTransition = availableTransitions.find(
      transition =>
        transition.name.toLowerCase() === transitionName.toLowerCase(),
    );

    if (!nextTransition) {
      throw new Error(
        `Transition "${transitionName}" not found in available` +
          ` transitions of issue ${issueKey}:\n` +
          `${availableTransitions.map(_ => _.name).join('\n')}`,
      );
    }

    console.log(`Moving ${issueKey} to ${nextTransition.name}...`);
    await jiraApi.transitionIssue(issueKey, {
      transition: nextTransition,
    });
  }

  console.log(`Issue transition complete.`);
  return true;
};

exports.addComment = (issueKey, comment) => {
  return jiraApi.addComment(issueKey, comment);
};

exports.assignIssue = (issueKey, username) => {
  return jiraApi.assignIssue(issueKey, username);
};
