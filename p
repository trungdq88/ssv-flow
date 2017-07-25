#!/usr/bin/env node

process.on('unhandledRejection', e => {
  console.log(e);
  throw e;
});

const pkg = require('./package.json');
const program = require('commander');

const tasks = require('./src/tasks.js');

program.version(pkg.version);

program
  .command('open <issueNumber>')
  .description('Open issue in browser')
  .action(issueNumber => {
    tasks.openIssue(issueNumber);
  });

program
  .command('new <issueTitle> <storyPoint> [type]')
  .description(
    [` - Create JIRA issue with title`, ` - Ask if want to start`].join('\n'),
  )
  .action((issueTitle, storyPoint, type) => {
    tasks.createIssue(issueTitle, storyPoint, type);
  });

program
  .command('start <issueNumber>')
  .description(
    [
      ` - Check repo clean`,
      ` - Checkout & pull master`,
      ` - Create branch with issue number & issue title`,
      ` - Checkout created branch`,
      ` - Push branch to all remote`,
      ` - Assign issue to me`,
      ` - Move issue to Start Progress`,
    ].join('\n'),
  )
  .action(issueNumber => {
    tasks.start(issueNumber);
  });

program
  .command('commit [commitMessage]')
  .description(
    [
      ` - Print git status`,
      ` - Ask view diff / add message / cancel`,
      ` - Create commit with commit message tagged`,
    ].join('\n'),
  )
  .action(commitMessage => {
    tasks.commit(commitMessage);
  });

program
  .command('done <featureName> <username> [aliasIssueKey]')
  .description(
    [
      ` - Not allow run on master branch`,
      ` - Check repo clean`,
      ` - Merge from master`,
      ` - Check repo conflict`,
      ` - Run tests`,
      ` - Checkout master`,
      ` - Merge back from branch`,
      ` - Push master to remotes`,
      ` - Move issues to ready to deploy`,
    ].join('\n'),
  )
  .action((featureName, username, aliasIssueKey) => {
    tasks.done(featureName, username, aliasIssueKey);
  });

program
  .command('deploy')
  .description(
    [
      ` - Only allow run in master`,
      ` - Check repo clean`,
      ` - Check for pending issues not empty`,
      ` - Allow enter usernames for issues`,
      ` - Bump version && push all branches & tags to all remotes`,
      ` - Move all pending issues to Deployed`,
      ` - Comment version number`,
      ` - Assign issue to coresponding usernames`,
      ` - Update release notes on Confluence`,
      ` - Notify via Slack`,
    ].join('\n'),
  )
  .action(() => {
    tasks.deploy();
  });

program
  .command('move <issueKey> <username>')
  .description('Move issue')
  .action((issueKey, username) => {
    tasks.moveIssue(issueKey, username);
  });

program
  .command('pending')
  .description('See all pending JIRA issues (not merged to master)')
  .action(() => {
    tasks.getPendingIssues();
  });

program
  .command('generate-release-notes')
  .description('Generate release notes')
  .action((issueKey, username) => {
    tasks.generateReleaseNotes(issueKey, username);
  });

program
  .command('update-unreleased-note')
  .description('updateUnreleasedNote')
  .action(() => {
    tasks.updateUnreleasedNote();
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}
