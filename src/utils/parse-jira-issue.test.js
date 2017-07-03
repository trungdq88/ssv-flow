const parseJiraIssue = require('./parse-jira-issue.js');

describe('parse-jira-issue.js', () => {

  it('should give me jira issue keys', () => {
    expect(
      parseJiraIssue(`Changes:

JIRA issues:
- [SE-2449] Test screenshot (@hoaiviet)
- [SE-2441] Update deprecated documents (@nguyenvu)
- [SE-2440] Bitbucket pipeline (@quangtrung)

Others:
- Add test-screenshot
- [CONFIG] [master] Use Bitbucket pipeline
- bitbucket-pipelines.yml created online with Bitbucket`, 'SE'),
    ).toEqual([
      {issueKey: `SE-2449`, username: 'hoaiviet'},
      {issueKey: `SE-2441`, username: 'nguyenvu'},
      {issueKey: `SE-2440`, username: 'quangtrung'},
    ]);
  });

  it('allow parse non-square jira issue', () => {
    expect(
      parseJiraIssue(`Changes:

JIRA issues:
- SE-2449 Test screenshot (@hoaiviet)
- SE-2441 Update deprecated documents (@nguyenvu)
- SE-2440 Bitbucket pipeline (@quangtrung)

Others:
- Add test-screenshot
- [CONFIG] [master] Use Bitbucket pipeline
- bitbucket-pipelines.yml created online with Bitbucket`, 'SE'),
    ).toEqual([
      {issueKey: `SE-2449`, username: 'hoaiviet'},
      {issueKey: `SE-2441`, username: 'nguyenvu'},
      {issueKey: `SE-2440`, username: 'quangtrung'},
    ]);
  });

});
