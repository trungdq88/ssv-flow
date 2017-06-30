jest.mock('./config.js');
jest.mock('simple-git');
jest.mock('colors');
jest.mock('./utils/commit-tag.js');
require('./config.js').REPO_PATH = '/DUMMY';
require('colors');

const git = require('./git.js');

describe('git.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCommitTag', () => {
    const dummyFiles = [{path: '123'}, {path: '345'}];
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      status: callback =>
        callback(null, {
          files: dummyFiles,
        }),
    }));
    const mockCommitTag = require('./utils/commit-tag.js').mockReturnValue(
      'DUMMY',
    );
    const commitTag = git.getCommitTag();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    expect(mockCommitTag).toBeCalledWith(['123', '345']);
    return expect(commitTag).resolves.toBe('DUMMY');
  });

  it('getCommitTag reject', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      status: callback => callback('error'),
    }));
    const commitTag = git.getCommitTag();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(commitTag).rejects.toBe('error');
  });

  it('isRepoClean false', () => {
    const dummyFiles = [{path: '123'}, {path: '345'}];
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      status: callback =>
        callback(null, {
          files: dummyFiles,
        }),
    }));
    const p = git.isRepoClean();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe(false);
  });

  it('isRepoClean true', () => {
    const dummyFiles = [];
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      status: callback =>
        callback(null, {
          files: dummyFiles,
        }),
    }));
    const p = git.isRepoClean();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe(true);
  });

  it('isRepoClean error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      status: callback => callback('error'),
    }));
    const p = git.isRepoClean();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('createBranch', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      checkoutLocalBranch: (name, callback) => callback(null, name),
    }));
    const p = git.createBranch('abc');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('abc');
  });

  it('createBranch error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      checkoutLocalBranch: (branchName, callback) => callback('error'),
    }));
    const p = git.createBranch('abc');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('checkout', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      checkout: (name, callback) => callback(null, name),
    }));
    const p = git.checkout('abc');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('abc');
  });

  it('checkout error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      checkout: (branchName, callback) => callback('error'),
    }));
    const p = git.checkout('abc');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('pull', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      pull: callback => callback(null, 'pull success'),
    }));
    const p = git.pull();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('pull success');
  });

  it('pull error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      pull: callback => callback('error'),
    }));
    const p = git.pull();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('push', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      push: (remote, branch, callback) => callback(null, remote),
    }));
    const p = git.push('aaa', 'bbb');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('aaa');
  });

  it('push error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      push: (remote, branch, callback) => callback('error'),
    }));
    const p = git.push('aaa', 'bbb');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('isBranchLocalExists error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      branchLocal: callback => callback('error'),
    }));
    const p = git.isBranchLocalExists('aaa');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('isBranchLocalExists true', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      branchLocal: callback =>
        callback(null, {
          all: ['1', '2'],
        }),
    }));
    const p = git.isBranchLocalExists('1');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe(true);
  });

  it('isBranchLocalExists true', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      branchLocal: callback =>
        callback(null, {
          all: ['1', '2'],
        }),
    }));
    const p = git.isBranchLocalExists('3');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe(false);
  });

  it('getStatusPrint error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      status: callback => callback('error'),
    }));
    const p = git.getStatusPrint();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('getStatusPrint', () => {
    const dummyFiles = [
      {path: '123', working_dir: '1', index: '2'},
      {path: '345', working_dir: '3', index: '4'},
    ];
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      status: callback =>
        callback(null, {
          files: dummyFiles,
        }),
    }));
    const p = git.getStatusPrint();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe(
      [
        '2'.red + '1'.red + ' ' + '123'.yellow,
        '4'.red + '3'.red + ' ' + '345'.yellow,
      ].join('\n'),
    );
  });

  it('addAll', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      add: (path, callback) => callback(null, path),
    }));
    const p = git.addAll();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('./*');
  });

  it('addAll error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      add: (path, callback) => callback('error'),
    }));
    const p = git.addAll();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('commit', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      commit: (message, callback) => callback(null, message),
    }));
    const p = git.commit('aoeu');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('aoeu');
  });

  it('commit error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      commit: (message, callback) => callback('error'),
    }));
    const p = git.commit('aoeu');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('getCurrentBranchName', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      branchLocal: callback =>
        callback(null, {
          all: ['1', '2'],
          branches: {
            '1': {current: true, name: 'mot'},
            '2': {current: false, name: 'hai'},
          },
        }),
    }));
    const p = git.getCurrentBranchName();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('mot');
  });

  it('getCurrentBranchName error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      branchLocal: callback => callback('error'),
    }));
    const p = git.getCurrentBranchName();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('merge', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      mergeFromTo: (from, to, callback) => callback(null, 'merge'),
    }));
    const p = git.merge('aaa', 'bbb');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('merge');
  });

  it('merge error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      mergeFromTo: (from, to, callback) => callback('error'),
    }));
    const p = git.merge('aaa', 'bbb');
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });

  it('getLatestTag', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      tags: callback =>
        callback(null, {
          latest: '1.2.3',
        }),
    }));
    const p = git.getLatestTag();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).resolves.toBe('1.2.3');
  });

  it('getLatestTag error', () => {
    const mockSimpleGit = require('simple-git').mockImplementation(() => ({
      tags: callback => callback('error'),
    }));
    const p = git.getLatestTag();
    expect(mockSimpleGit).toBeCalledWith('/DUMMY');
    return expect(p).rejects.toBe('error');
  });
});
