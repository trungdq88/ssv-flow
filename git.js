const NodeGit = require('nodegit');
const pathToRepo = require('path').resolve('../ssv-portals/.git');

const commitTag = require('./utils/commit-tag.js').default;

NodeGit.Repository.open(pathToRepo).then(async repo => {
  const status = await repo.getStatus();
  console.log(commitTag(status.map(s => s.path())));
}).catch(error => {
  console.error('Could not load repo ', pathToRepo);
});
