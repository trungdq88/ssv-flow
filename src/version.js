const fs = require('fs');

exports.getLatestVersion = () => {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  return `v${packageJson.version}`;
};
