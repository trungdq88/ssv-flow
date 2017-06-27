const config = require('./config.js');
const jira = require('./jira.js');
const git = require('./git.js');
const input = require('./input.js');
const cmd = require('./cmd.js');
const slug = require('./utils/slug.js').default;

const { REMOTE_NAME } = config;

exports.openIssue = (...args) => jira.openIssue(...args);

exports.start = async (issueKey) => {
  // Check repo clean
  if (!await git.isRepoClean()) {
    console.error('Repo is not clean!');
    return;
  }

  console.log(`Get issue ${issueKey} info`);
  const issue = await jira.findIssue(issueKey);
  const branchName = issue.key + '/' + slug(issue.fields.summary);

  if (!(await git.isBranchLocalExists(branchName))) {
    console.log('Check out master');
    await git.checkOut('master');

    console.log('Pull master');
    await git.pull();

    console.log(`Creating branch ${branchName}`);
    await git.checkoutBranch(branchName);

    console.log(`Push branch ${branchName}`);
    await git.push(REMOTE_NAME, branchName);
  } else {
    console.log(`Branch ${branchName} already exist, checking out.`);
    await git.checkOut(branchName);
  }

  console.log('Done! Happy coding!');
};

exports.createIssue = async (issueTitle) => {
  console.log(`Creating issue ${issueTitle}`);
  const issue = await jira.createIssue(issueTitle);

  if (await input.ask(`Start issue ${issue.key} now?`)) {
    exports.start(issue.key);
  }
};

exports.commit = async fastCommitMessage => {

  const isClean = await git.isRepoClean();

  if (isClean) {
    console.error('Repo is clean, there is nothing to commit!');
    return;
  }

  if (fastCommitMessage) {
    await addAll();
    await commit(fastCommitMessage);
    return;
  }

  console.log('----- GIT STATUS BEGIN -----');
  const text = await git.getStatusPrint();
  console.log(text);
  console.log('----- GIT STATUS END -----');

  async function diff() {
    await addAll();
    return await new Promise((resolve, reject) => {
      const spawn = require('child_process').spawn;
      const gitDiff = spawn('git', ['diff', '--staged'], { stdio: 'inherit' });
      gitDiff.on('exit', resolve);
    });
  }

  async function addAll() {
    await git.addAll();
  }

  async function commit(fastCommitMessage) {
    let userMessage = fastCommitMessage;
    const branchName = await git.getCurrentBranchName();
    const issueKey = branchName.split('/')[0];

    if (!userMessage) {
      userMessage = await input.enter();
    }

    if (!userMessage) {
      console.log('Fetching issue title as commit message...');
      const issue = await jira.findIssue(issueKey);
      userMessage = `${issue.fields.summary}`;
    }

    const commitTag = await git.getCommitTag()
    const commitMessage = `${commitTag} [${issueKey}] ${userMessage}`;

    console.log('Committing:', commitMessage);
    git.commit(commitMessage);
  }

  function cancel() {
    console.log('Cancelled');
  }

  const choice = await input.choice('Please select an action', [
    { value: 'd', key: 'd', name: 'Show diff' },
    { value: 'a', key: 'a', name: 'Add all & write commit message' },
    { value: 'c', key: 'c', name: 'Cancel' },
  ], 1);
  switch (choice) {
    case 'd':
      await diff();
      break;
    case 'a':
      await addAll();
      await commit();
      break;
    case 'c':
      await cancel();
      break;
    default:
      console.log('No action received.');
  }

  console.log('Awesome!');
};

exports.done = async username => {
  const currentBranchName = await git.getCurrentBranchName();
  const issueKey = currentBranchName.split('/')[0];
  if (currentBranchName === 'master') {
    console.log('You are not suppose to run this command on master');
    return;
  }

  if (!await git.isRepoClean()) {
    console.error('Repo is not clean!');
    return;
  }

  await git.merge('master', currentBranchName);

  if (!await git.isRepoClean()) {
    console.error('There is conflict after merge, please fix it!');
    return;
  }

  await cmd.runTests();

  await git.checkOut('master');

  await git.merge(currentBranchName, 'master');

  await cmd.deploy();

  await jira.assignIssue(issueKey, username);

  const latestTag = await git.getLatestTag();

  await jira.addComment(issueKey, `Done at ${latestTag}.`);

  console.log('Done');
};
