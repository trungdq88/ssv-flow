const changeLog = require('./change-log.js');

describe('change-log.js', () => {

  it('should generate change log from git commit message', () => {
    expect(
      changeLog(
        [
          '[HQ] [SE-2449] Optimize file read',
          '[HQ] [SE-2449] Test screenshot',
          '[HQ] [SE-2449] Read meta',
          'Add test-screenshot',
          '[SUP] [SE-2441] Analytics portal',
          '[SUP] [SE-2441] Submodule',
          '[SUP] [SE-2441] Change env vars',
          '[LOG/CDC] [SE-2440] Set timezone',
          '[LOG/CDC/SUP] [SE-2440] Bitbucket pipeline',
          '[CONFIG] [master] Use Bitbucket pipeline',
          'bitbucket-pipelines.yml created online with Bitbucket',
        ],
        'SE',
        issueKey =>
        Promise.resolve({fields: {
          summary: `issue key ${issueKey}`,
          creator: {name: `name-${issueKey}`},
        }}),
      ),
    ).resolves.toEqual([
      `Changes:`,
      ``,
      `JIRA issues:`,
      `- [SE-2449] issue key SE-2449 (@name-SE-2449)`,
      `- [SE-2441] issue key SE-2441 (@name-SE-2441)`,
      `- [SE-2440] issue key SE-2440 (@name-SE-2440)`,
      ``,
      `Others:`,
      `- Add test-screenshot`,
      `- [CONFIG] [master] Use Bitbucket pipeline`,
      `- bitbucket-pipelines.yml created online with Bitbucket`,
    ]);
  });

  it('no jira issues', () => {
    expect(
      changeLog(
        [
          'Add test-screenshot',
          '[CONFIG] [master] Use Bitbucket pipeline',
          'bitbucket-pipelines.yml created online with Bitbucket',
        ],
        'SE',
        issueKey =>
        Promise.resolve({fields: {
          summary: `issue key ${issueKey}`,
          creator: {name: `name-${issueKey}`},
        }}),
      ),
    ).resolves.toEqual([
      `Changes:`,
      ``,
      `- Add test-screenshot`,
      `- [CONFIG] [master] Use Bitbucket pipeline`,
      `- bitbucket-pipelines.yml created online with Bitbucket`,
    ]);
  });

  it('no others', () => {
    expect(
      changeLog(
        [
          '[HQ] [SE-2449] Optimize file read',
          '[HQ] [SE-2449] Test screenshot',
          '[HQ] [SE-2449] Read meta',
          '[SUP] [SE-2441] Analytics portal',
          '[SUP] [SE-2441] Submodule',
          '[SUP] [SE-2441] Change env vars',
          '[LOG/CDC] [SE-2440] Set timezone',
          '[LOG/CDC/SUP] [SE-2440] Bitbucket pipeline',
        ],
        'SE',
        issueKey =>
        Promise.resolve({fields: {
          summary: `issue key ${issueKey}`,
          creator: {name: `name-${issueKey}`},
        }}),
      ),
    ).resolves.toEqual([
      `Changes:`,
      ``,
      `- [SE-2449] issue key SE-2449 (@name-SE-2449)`,
      `- [SE-2441] issue key SE-2441 (@name-SE-2441)`,
      `- [SE-2440] issue key SE-2440 (@name-SE-2440)`,
    ]);
  });

});
