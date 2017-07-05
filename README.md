# Task automate for ssv-portals

## Config

Example `env.json`:

    {
      "protocol": "https",
      "host": "example.atlassian.net",
      "port": "443",
      "user": "quangtrung@example.vn",
      "password": "yourpassword",
      "ME": "quangtrung",
      "PROJECT_SE": "10100",
      "PRIORITY_MEDIUM": "3",
      "ISSUE_TYPE_TASK": "10400",
      "SPRINT_CUSTOM_FIELD_ID": "customfield_10115",
      "ACTIVE_BOARD": "Board Name",
      "COMPONENT_HQ_FRONTEND": "10101",
      "PROJECT_CODE": "SE",
      "REPO_PATH": "./",
      "ISSUE_TRANSITIONS": [
        "Start Analysis",
        "Analysis Complete",
        "Start Progress",
        "Code Review",
        "Start Review",
        "Review Passed",
        "Deployed"
      ],
      "ISSUE_TRANSITIONS_START_PROGRESS": [
        "Start Analysis",
        "Analysis Complete",
        "Start Progress"
      ],
      "ISSUE_TRANSITIONS_READY_TO_DEPLOY": [
        "Code Review",
        "Start Review",
        "Review Passed"
      ],
      "ISSUE_TRANSITIONS_DEPLOYED": [
        "Deployed"
      ],
      "REMOTE_NAME": "origin",
      "CONFLUENCE_SPACE_KEY": "key",
      "CONFLUENCE_PATH": "/wiki",
      "CONFLUENCE_RELEASE_NOTE_PAGE": "page title",
      "SLACK_NOTIFY_ENDPOINT": "url"
    }

## Spec:

### `p new (:issueTitle)`

  - Create JIRA issue with title
  - Ask if want to start

### `p start (:issueNumber)`

  - Check repo clean
  - Checkout & pull master
  - Create branch with issue number & issue title, checkout created branch
  - Push branch to all remote
  - Assign issue to me
  - Move issue to Start Progress

### `p commit (:issueMessage)`

  - Print git status
  - Ask view diff / add message / cancel
  - Create commit with commit message tagged

### `p done (:username)`

  - Not allow run on master branch
  - Check repo clean
  - Merge from master
  - Check repo conflict
  - Run tests
  - Checkout master
  - Merge back from branch
  - Push master to remotes
  - Move issues to ready to deploy

### `p deploy`
  - Only allow run in master
  - Check repo clean
  - Check for pending issues not empty
  - Allow enter usernames for issues
  - Bump version && push all branches & tags to all remotes
  - Move all pending issues to Deployed
  - Comment version number
  - Assign issue to coresponding usernames
  - Update release notes on Confluence
  - Notify via Slack

### `p open (:issueNumber)`

  - Open browser link to the issue
