# Task automate for ssv-portals

## Config

Example `src/env.json`:

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
      "ISSUE_TYPE_BUG": "10103",
      "ISSUE_TYPE_CHANGE": "10303",
      "ISSUE_TYPE_OTHER": "10101",
      "SPRINT_CUSTOM_FIELD_ID": "customfield_10115",
      "STORY_POINT_FIELD_ID": "customfield_10117",
      "ACTIVE_BOARD": "7-Eleven Technical Board",
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
      "CONFLUENCE_SPACE_KEY": "7EL",
      "CONFLUENCE_PATH": "/wiki",
      "CONFLUENCE_RELEASE_NOTE_PAGE": "Release Note - Frontend Apps",
      "CONFLUENCE_RELEASE_NOTE_PAGE_URL": "https://msv-tech.atlassian.net/wiki/display/7EL/Release+Note+-+Frontend+Apps",
      "SLACK_NOTIFY_ENDPOINT": "https://hooks.slack.com/services/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"
    }

## Spec:

Check `/p` file in project root to see documentation of each command

## Install:

    npm install -g $(pwd)

