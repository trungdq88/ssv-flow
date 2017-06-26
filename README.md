# Task automate for ssv-portals

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
  - Assign issue to username

### `p open (:issueNumber)`

  - Open browser link to the issue
