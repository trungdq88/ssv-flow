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
