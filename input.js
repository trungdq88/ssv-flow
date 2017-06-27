const inquirer = require('inquirer');
const tmp = require('tmp');
const fs = require('fs');

exports.ask = question => {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'yes',
    message: question,
  }]).then(answer => answer.yes);
};

exports.choice = (message, options, defaultValue) => {
  return inquirer.prompt([{
    type: 'expand',
    name: 'choice',
    message,
    choices: options,
    default: defaultValue,
  }]).then(answer => answer.choice);
};

exports.enter = defaultMessage => {
  return new Promise((resolve, reject) => {
    tmp.file((err, filePath) => {
      const spawn = require('child_process').spawn;
      const gitDiff = spawn('nvim', [filePath], { stdio: 'inherit' });
      gitDiff.on('exit', () => {
        const content = fs.readFileSync(filePath, 'utf-8').replace(/\s*$/, '');
        resolve(content);
      });
    });
  });
};
