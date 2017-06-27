const jira = require('./jira.js');
const git = require('./git.js');
const input = require('./input.js');
const slug = require('./utils/slug.js').default;

const REMOTE_NAME = 'all';

exports.openIssue = (...args) => jira.openIssue(...args);

exports.start = async (issueNumber) => {
  // Check repo clean
  const isClean = await git.isRepoClean();

  if (!isClean) {
    console.error('Repo is not clean!');
    return;
  }

  console.log(`Get issue ${issueNumber} info`);
  const issue = await jira.findIssue(issueNumber);
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

exports.commit = async commitMessage => {

  const isClean = await git.isRepoClean();

  if (isClean) {
    console.error('Repo is clean, there is nothing to commit!');
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

  async function commit() {
    let userMessage = await input.enter();
    const branchName = await git.getCurrentBranchName();
    const issueNumber = branchName.split('/')[0];

    if (!userMessage) {
      console.log('Fetching issue title as commit message...');
      const issue = await jira.findIssue(issueNumber);
      userMessage = `${issue.fields.summary}`;
    }

    const commitTag = await git.getCommitTag()
    const commitMessage = `${commitTag} [${issueNumber}] ${userMessage}`;

    console.log('Committing:', commitMessage);
    git.commit(commitMessage);
  }

  function cancel() {
    console.log('cancel');
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
