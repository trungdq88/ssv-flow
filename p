#!/usr/bin/env node

const pkg = require('./package.json');
const program = require('commander');

const jira = require('./jira.js');

program
  .version(pkg.version);

program
  .command('open <issueNumber>')
  .description('Open issue in browser')
  .action(issueNumber => {
    jira.openIssue(issueNumber);
  });

program
  .command('new <issueTitle>')
  .description('Create new task')
  .action(issueTitle => {
    jira.createIssue(issueTitle);
  });

program.parse(process.argv);
