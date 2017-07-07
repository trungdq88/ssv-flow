#!/usr/bin/env node

process.on('unhandledRejection', e => {
  console.log(e);
  throw e;
});

const pkg = require('./package.json');
const program = require('commander');

const tasks = require('./src/tasks.js');

program
  .version(pkg.version);

program
  .command('open <issueNumber>')
  .description('Open issue in browser')
  .action(issueNumber => {
    tasks.openIssue(issueNumber);
  });

program
  .command('new <issueTitle> <storyPoint>')
  .description('Create new task')
  .action((issueTitle, storyPoint) => {
    tasks.createIssue(issueTitle, storyPoint);
  });

program
  .command('start <issueNumber>')
  .description('Start working on an issue')
  .action(issueNumber => {
    tasks.start(issueNumber);
  });

program
  .command('commit [commitMessage]')
  .description('Commit current changes')
  .action(commitMessage => {
    tasks.commit(commitMessage);
  });

program
  .command('done')
  .description('Complete an issue')
  .action(() => {
    tasks.done();
  });

program
  .command('deploy')
  .description('Deploy all remaining issues and move JIRA ticket to QA')
  .action(() => {
    tasks.deploy();
  });

program
  .command('move <issueKey> <username>')
  .description('Move an issue to QA and assign to a user')
  .action((issueKey, username) => {
    tasks.moveIssue(issueKey, username);
  });

program
  .command('generate-release-notes')
  .description('Generate release notes')
  .action((issueKey, username) => {
    tasks.generateReleaseNotes(issueKey, username);
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}
