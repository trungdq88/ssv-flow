// @format
const mdToSlack = require('./md-to-slack.js');

describe('md-to-slack.js', () => {
  it('should works', () => {
    expect(
      mdToSlack(
        [
          `## Release **v1.2.3** (2017 12 23):`,
          `Changes:`,
          ``,
          `### JIRA issues:`,
          `- [SE-2449] issue key SE-2449 (@name-SE-2449)`,
          `- [SE-2441] issue key SE-2441 (@name-SE-2441)`,
          `- [SE-2440] issue key SE-2440 (@name-SE-2440)`,
          ``,
          `### Others:`,
          `- Add test-screenshot`,
          `- [CONFIG] [master] Use Bitbucket pipeline`,
          `- bitbucket-pipelines.yml created online with Bitbucket`,
        ].join('\n'),
      ),
    ).toBe(
      [
        `*Release \`v1.2.3\` (2017 12 23):*`,
        `Changes:`,
        ``,
        `*JIRA issues:*`,
        `- [SE-2449] issue key SE-2449 (<@name-SE-2449>)`,
        `- [SE-2441] issue key SE-2441 (<@name-SE-2441>)`,
        `- [SE-2440] issue key SE-2440 (<@name-SE-2440>)`,
        ``,
        `*Others:*`,
        `- Add test-screenshot`,
        `- [CONFIG] [master] Use Bitbucket pipeline`,
        `- bitbucket-pipelines.yml created online with Bitbucket`,
      ].join('\n'),
    );
  });

  it('Title link', () => {
    expect(
      mdToSlack(
        [
          `## Release **v1.2.3** (2017 12 23):`,
          `Changes:`,
          ``,
          `### JIRA issues:`,
          `- [SE-2449] issue key SE-2449 (@name-SE-2449)`,
          `- [SE-2441] issue key SE-2441 (@name-SE-2441)`,
          `- [SE-2440] issue key SE-2440 (@name-SE-2440)`,
          ``,
          `### Others:`,
          `- Add test-screenshot`,
          `- [CONFIG] [master] Use Bitbucket pipeline`,
          `- bitbucket-pipelines.yml created online with Bitbucket`,
        ].join('\n'),
        'http://aoeuaoeu.com',
      ),
    ).toBe(
      [
        `<http://aoeuaoeu.com|*Release \`v1.2.3\` (2017 12 23):*>`,
        `Changes:`,
        ``,
        `*JIRA issues:*`,
        `- [SE-2449] issue key SE-2449 (<@name-SE-2449>)`,
        `- [SE-2441] issue key SE-2441 (<@name-SE-2441>)`,
        `- [SE-2440] issue key SE-2440 (<@name-SE-2440>)`,
        ``,
        `*Others:*`,
        `- Add test-screenshot`,
        `- [CONFIG] [master] Use Bitbucket pipeline`,
        `- bitbucket-pipelines.yml created online with Bitbucket`,
      ].join('\n'),
    );
  });

  it('Jira link', () => {
    expect(
      mdToSlack(
        [
          `## Release **v1.2.3** (2017 12 23):`,
          `Changes:`,
          ``,
          `### JIRA issues:`,
          `- [SE-2449] issue key SE-2449 (@name-SE-2449)`,
          `- [SE-2441] issue key SE-2441 (@name-SE-2441)`,
          `- [SE-2440] issue key SE-2440 (@name-SE-2440)`,
          ``,
          `### Others:`,
          `- Add test-screenshot`,
          `- [CONFIG] [master] Use Bitbucket pipeline`,
          `- bitbucket-pipelines.yml created online with Bitbucket`,
        ].join('\n'),
        'http://aoeuaoeu.com',
      ),
    ).toBe(
      [
        `<http://aoeuaoeu.com|*Release \`v1.2.3\` (2017 12 23):*>`,
        `Changes:`,
        ``,
        `*JIRA issues:*`,
        `- [SE-2449] issue key SE-2449 (<@name-SE-2449>)`,
        `- [SE-2441] issue key SE-2441 (<@name-SE-2441>)`,
        `- [SE-2440] issue key SE-2440 (<@name-SE-2440>)`,
        ``,
        `*Others:*`,
        `- Add test-screenshot`,
        `- [CONFIG] [master] Use Bitbucket pipeline`,
        `- bitbucket-pipelines.yml created online with Bitbucket`,
      ].join('\n'),
    );
  });
});
