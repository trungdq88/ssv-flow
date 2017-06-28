#!/usr/bin/env node

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
  .command('new <issueTitle>')
  .description('Create new task')
  .action(issueTitle => {
    tasks.createIssue(issueTitle);
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
  .command('done <username>')
  .description('Complete an issue')
  .action(user => {
    tasks.done(user);
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}
