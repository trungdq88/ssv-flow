const inquirer = require('inquirer');

exports.ask = question => {
  return inquirer.prompt([{
    type: 'confirm',
    name: 'yes',
    message: question,
  }]).then(answer => answer.yes);
};
