const path = require('path');
const SimpleGit = require('simple-git');
require('colors');

const config = require('./config.js');
const commitTag = require('./utils/commit-tag.js');

const pathToRepo = path.resolve(config.REPO_PATH);

exports.getCommitTag = () => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .status((err, statusSummary) => {
        if (err) {
          reject(err);
          return;
        }
        const files = statusSummary.files.map(file => file.path);
        resolve(commitTag(files));
      });
  });
};

exports.isRepoClean = () => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .status((err, status) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(status.files.length === 0);
      });
  });
};

exports.pull = () => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .pull((err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success);
      });
  });
};

exports.checkoutBranch = branchName => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .checkoutLocalBranch(branchName, (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success);
      });
  });
};

exports.push = (remote, branchName) => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .push(remote, branchName, (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success);
      });
  });
};

exports.isBranchLocalExists = branchName => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .branchLocal((err, branchSummary) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(branchSummary.all.indexOf(branchName) > -1);
      });
  });
};

exports.getStatusPrint = () => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .status((err, statusSummary) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(
          statusSummary.files.map(file => (
            file.index.red + file.working_dir.red + ' ' + file.path.yellow
          )).join('\n')
        )
      });
  });
};

exports.addAll = () => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .add('./*', (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success)
      });
  });
};

exports.commit = async message => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .commit(message, (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success)
      });
  });
};

exports.getCurrentBranchName = () => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .branchLocal((err, branchSummary) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(
          branchSummary
          .all
          .map(name => branchSummary.branches[name])
          .find(branch => branch.current)
          .name
        )
      });
  });
};

exports.merge = (from, to) => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .mergeFromTo(from, to, (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success);
      });
  });
};

exports.getLatestTag = () => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .tags((err, tags) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(tags.latest);
      });
  });
};