# Task automate for ssv-portals

## Config

Example `config.js`:

    exports.protocol = 'https';
    exports.host = 'yourcompany.atlassian.net';
    exports.port = '443';
    exports.user = 'myemail@compary.vn';
    exports.password = 'mypassword';

    exports.ME = 'quangtrung';
    exports.PROJECT_SE = '10100';
    exports.PRIORITY_MEDIUM = '3';
    exports.ISSUE_TYPE_TASK = '10400';
    exports.SPRINT_CUSTOM_FIELD_ID = 'customfield_10115';
    exports.ACTIVE_BOARD = 'Broad name';
    exports.COMPONENT_HQ_FRONTEND = '10101';
    exports.PROJECT_CODE = 'SE';

    exports.REPO_PATH = './';

    exports.ISSUE_TRANSITIONS = [
      'Start Analysis',
      'Analysis Complete',
      'Start Progress',
      'Code Review',
      'Start Review',
      'Review Passed',
      'Deployed',
    ];

    exports.REMOTE_NAME = 'origin';

## Spec:

### `p new (:issueTitle)`

  - Create issue with title
  - Ask if want to start

### `p start (:issueNumber)`

  - Check repo clean
  - Checkout & pull master
  - Create branch with issue number & issue title, checkout created branch
  - Push branch to all remote

### `p commit (:issueMessage)`

  - Print git status
  - Ask view diff / add message / cancel
  - Create commit with commit message tagged

### `p done (:username)`

  - Now allow run on master branch
  - Check repo clean
  - Merge from master
  - Check repo conflict
  - Run tests
  - Checkout master
  - Merge back from branch
  - Bump version
  - Push all branches & tags to all remotes
  - Move issue
  - Comment version number
  - Assign issue to username

### `p open (:issueNumber)`

  - Open browser link to the issue
