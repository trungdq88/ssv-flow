const fs = require('fs')

let environmentVariables;

try {
  environmentVariables = require('./env.json');
} catch (e) {
  environmentVariables = {};
}

module.exports = environmentVariables;
