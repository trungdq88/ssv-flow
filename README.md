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

Check `/p` file in project root to see documentation of each command
