const fs = require('fs')

let environmentVariables;

try {
  fs.readFileSync('./env.json');
  environmentVariables = require('./env.json');
} catch (e) {
  environmentVariables = {};
}

module.exports = environmentVariables;
