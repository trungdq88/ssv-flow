// @format
const mdToHtml = require('./md-to-html.js');

describe('md-to-html.js', () => {
  it('should works', () => {
    expect(
      mdToHtml(
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
        `<h2 id="releasev12320171223">` +
          `Release <strong>v1.2.3</strong> (2017 12 23):</h2>`,
        `<p>Changes:</p>`,
        `<h3 id="jiraissues">JIRA issues:</h3>`,
        `<ul>`,
        `<li>[SE-2449] issue key SE-2449 (@name-SE-2449)</li>`,
        `<li>[SE-2441] issue key SE-2441 (@name-SE-2441)</li>`,
        `<li>[SE-2440] issue key SE-2440 (@name-SE-2440)</li>`,
        `</ul>`,
        `<h3 id="others">Others:</h3>`,
        `<ul>`,
        `<li>Add test-screenshot</li>`,
        `<li>[CONFIG] [master] Use Bitbucket pipeline</li>`,
        `<li>bitbucket-pipelines.yml created online with Bitbucket</li>`,
        `</ul>`,
      ].join('\n'),
    );
  });

  it('jira link', () => {
    expect(
      mdToHtml(
        [
          `## Release **v1.2.3** (2017 12 23):`,
          `Changes:`,
          ``,
          `### JIRA issues:`,
          `- [[SE-2449]](http://jira-link/SE-2449) SE-2449 (@name-SE-2449)`,
          `- [[SE-2441]](http://jira-link/SE-2441) SE-2441 (@name-SE-2441)`,
          `- [[SE-2440]](http://jira-link/SE-2440) SE-2440 (@name-SE-2440)`,
          ``,
          `### Others:`,
          `- Add test-screenshot`,
          `- [CONFIG] [master] Use Bitbucket pipeline`,
          `- bitbucket-pipelines.yml created online with Bitbucket`,
        ].join('\n'),
      ),
    ).toBe(
      [
        `<h2 id="releasev12320171223">` +
          `Release <strong>v1.2.3</strong> (2017 12 23):</h2>`,
        `<p>Changes:</p>`,
        `<h3 id="jiraissues">JIRA issues:</h3>`,
        `<ul>`,
        `<li><a href="http://jira-link/SE-2449">[SE-2449]</a> ` +
          `SE-2449 (@name-SE-2449)</li>`,
        `<li><a href="http://jira-link/SE-2441">[SE-2441]</a> ` +
          `SE-2441 (@name-SE-2441)</li>`,
        `<li><a href="http://jira-link/SE-2440">[SE-2440]</a> ` +
          `SE-2440 (@name-SE-2440)</li>`,
        `</ul>`,
        `<h3 id="others">Others:</h3>`,
        `<ul>`,
        `<li>Add test-screenshot</li>`,
        `<li>[CONFIG] [master] Use Bitbucket pipeline</li>`,
        `<li>bitbucket-pipelines.yml created online with Bitbucket</li>`,
        `</ul>`,
      ].join('\n'),
    );
  });
});
