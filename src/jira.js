// @format
const JiraApi = require('./lib/jira-api.js').JiraApi;
const config = require('./config.js');
const opn = require('opn');

const {
  ME,
  PROJECT_SE,
  PRIORITY_MEDIUM,
  ISSUE_TYPE_TASK,
  SPRINT_CUSTOM_FIELD_ID,
  STORY_POINT_FIELD_ID,
  ACTIVE_BOARD,
  COMPONENT_HQ_FRONTEND,
  ISSUE_TRANSITIONS,
  ISSUE_TRANSITIONS_READY_TO_DEPLOY,
  ISSUE_TRANSITIONS_DEPLOYED,
  ISSUE_TRANSITIONS_START_PROGRESS,
  PROJECT_CODE,
} = config;

const jiraApi = new JiraApi(
  config.protocol,
  config.host,
  config.port,
  config.user,
  config.password,
  'latest',
);

const moveIssue = async (transitionList, issueKey) => {
  for (let i = 0; i < transitionList.length; i++) {
    const transitionName = transitionList[i];
    const availableTransitions = (await jiraApi.listTransitions(issueKey))
      .transitions;
    const nextTransition = availableTransitions.find(
      transition =>
        transition.name.toLowerCase() === transitionName.toLowerCase(),
    );

    if (!nextTransition) {
      console.log(
        `Transition "${transitionName}" not found in available` +
          ` transitions of issue ${issueKey}:\n` +
          `${availableTransitions.map(_ => _.name).join('\n')}`,
      );
      console.log('Skip to next transition');
      continue;
    }

    console.log(`Moving ${issueKey} to ${nextTransition.name}...`);
    await jiraApi.transitionIssue(issueKey, {
      transition: nextTransition,
    });
  }

  console.log(`Issue transition complete.`);
  return true;
};

exports.openIssue = issueKey => {
  opn(config.protocol + '://' + config.host + '/browse/' + issueKey);
};

exports.createIssue = async (issueTitle, storyPoint) => {
  console.log(`Get project information code "${PROJECT_CODE}"`);
  const project = await jiraApi.getProject(PROJECT_CODE);

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
      [STORY_POINT_FIELD_ID]: Number(storyPoint),
    },
  };

  console.log(`Creating issue in ${activeSprint.name}...`);
  const issue = await jiraApi.addNewIssue(issueFields);

  console.log('Issue created: ', issue.key);
  return issue;
};

exports.findIssue = issueKey => {
  return jiraApi.findIssue(issueKey);
};

exports.addComment = (issueKey, comment) => {
  return jiraApi.addComment(issueKey, comment);
};

exports.assignIssue = (issueKey, username) => {
  return jiraApi.assignIssue(issueKey, username);
};

exports.moveIssue = issueKey => moveIssue(ISSUE_TRANSITIONS, issueKey);

exports.moveIssueToStartProgress = issueKey =>
  moveIssue(ISSUE_TRANSITIONS_START_PROGRESS, issueKey);

exports.moveIssueToReadyToDeploy = issueKey =>
  moveIssue(ISSUE_TRANSITIONS_READY_TO_DEPLOY, issueKey);

exports.moveIssueToDeployed = issueKey =>
  moveIssue(ISSUE_TRANSITIONS_DEPLOYED, issueKey);
