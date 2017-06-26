const Promise = require('promise');
const path = require('path');
const SimpleGit = require('simple-git');

const config = require('./config.js');
const commitTag = require('./utils/commit-tag.js').default;

const pathToRepo = path.resolve(config.REPO_PATH);

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

exports.checkOut = branchName => {
  return new Promise((resolve, reject) => {
    SimpleGit(pathToRepo)
      .checkout(branchName, (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success);
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
