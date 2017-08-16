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
          Promise.resolve({
            fields: {
              summary: `issue key ${issueKey}`,
              creator: { name: `name-${issueKey}` },
            },
          }),
        {
          jiraIssueLink: 'http://jira-link',
        },
      ),
    ).resolves.toEqual([
      `Changes:`,
      ``,
      `### JIRA issues:`,
      `- [[SE-2449]](http://jira-link/SE-2449) issue key SE-2449 (@name-SE-2449)`,
      `- [[SE-2441]](http://jira-link/SE-2441) issue key SE-2441 (@name-SE-2441)`,
      `- [[SE-2440]](http://jira-link/SE-2440) issue key SE-2440 (@name-SE-2440)`,
      ``,
      `### Others:`,
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
          Promise.resolve({
            fields: {
              summary: `issue key ${issueKey}`,
              creator: { name: `name-${issueKey}` },
            },
          }),
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
          Promise.resolve({
            fields: {
              summary: `issue key ${issueKey}`,
              creator: { name: `name-${issueKey}` },
            },
          }),
      ),
    ).resolves.toEqual([
      `Changes:`,
      ``,
      `- [SE-2449] issue key SE-2449 (@name-SE-2449)`,
      `- [SE-2441] issue key SE-2441 (@name-SE-2441)`,
      `- [SE-2440] issue key SE-2440 (@name-SE-2440)`,
    ]);
  });

  it('jiraIssueOnly', () => {
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
          Promise.resolve({
            fields: {
              summary: `issue key ${issueKey}`,
              creator: { name: `name-${issueKey}` },
            },
          }),
        {
          jiraIssueOnly: true,
        },
      ),
    ).resolves.toEqual([
      `Changes:`,
      ``,
      `- [SE-2449] issue key SE-2449 (@name-SE-2449)`,
      `- [SE-2441] issue key SE-2441 (@name-SE-2441)`,
      `- [SE-2440] issue key SE-2440 (@name-SE-2440)`,
    ]);
  });

  it('allow parse non-square jira issue', () => {
    expect(
      changeLog(
        [
          '[HQ] SE-2449 Optimize file read',
          '[HQ] SE-2449 Test screenshot',
          '[HQ] SE-2449 Read meta',
          'Add test-screenshot',
          '[SUP] SE-2441 Analytics portal',
          '[SUP] SE-2441 Submodule',
          '[SUP] SE-2441 Change env vars',
          '[LOG/CDC] SE-2440 Set timezone',
          '[LOG/CDC/SUP] SE-2440 Bitbucket pipeline',
          '[CONFIG] [master] Use Bitbucket pipeline',
          'bitbucket-pipelines.yml created online with Bitbucket',
        ],
        'SE',
        issueKey =>
          Promise.resolve({
            fields: {
              summary: `issue key ${issueKey}`,
              creator: { name: `name-${issueKey}` },
            },
          }),
      ),
    ).resolves.toEqual([
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
    ]);
  });

  it('allow parse non-square jira issue', () => {
    expect(
      changeLog(
        [
          "Merge branch 'SE-2501/correct-display-export-supplier-product-id-on-logi' (HEAD -> master)",
          "Merge branch 'SE-3001/hq-fe-enable-1000-products-for-product-list'",
          "Merge branch 'SE-3018/upgrade-to-react-scripts-1-0-11'",
          "Merge branch 'upgrade_react_scripts' into SE-3018/upgrade-to-react-scripts-1-0-11 (tag: v2.4.48.react_script_1_0_11.rc2, tag: v2.4.48.react_script_1_0_11.rc1, origin/SE-3018/upgrade-to-react-scripts-1-0-11, SE-3018/upgrade-to-react-scripts-1-0-11)",
          'Upgrade react-scripts@1.0.11 (upgrade_react_scripts)',
          "Merge branch 'SE-3003/add-delete-button-in-user-management' (origin/master)",
          "Merge branch 'SE-2993/hqfe-product-master-should-allow-user-enter-0-for'",
          'Merge SE-2992/',
          "Merge branch 'SE-2852/hq-fe-allow-user-to-edit-sub-cat-filter-by-produc'",
          '[HQ] [SE-3001] [HQ][FE] Enable 1000 products for product list (tag: v2.4.48.enable_1000_product_perpage.rc1, origin/SE-3001/hq-fe-enable-1000-products-for-product-list, SE-3001/hq-fe-enable-1000-products-for-product-list)',
          '[HQ] [SE-2992] Move to bottom righT (tag: v2.4.47.inventory_adjustment_checkbox_position.rc2, origin/SE-2992/hq-fe-inventory-adjustment-move-select-column-app, SE-2992/hq-fe-inventory-adjustment-move-select-column-app)',
          '[TEST] [SE-3003] Add test case (tag: v2.4.48.delete_user.rc1, origin/SE-3003/add-delete-button-in-user-management, SE-3003/add-delete-button-in-user-management)',
          '[HQ] [SE-3003] Add allowDelete to MasterEdit',
        ],
        'SE',
        issueKey =>
          Promise.resolve({
            fields: {
              summary: `issue key ${issueKey}`,
              creator: { name: `name-${issueKey}` },
            },
          }),
      ),
    ).resolves.toEqual([
      `Changes:`,
      ``,
      `### JIRA issues:`,
      `- [SE-2501] issue key SE-2501 (@name-SE-2501)`,
      `- [SE-3001] issue key SE-3001 (@name-SE-3001)`,
      `- [SE-3018] issue key SE-3018 (@name-SE-3018)`,
      `- [SE-3003] issue key SE-3003 (@name-SE-3003)`,
      `- [SE-2993] issue key SE-2993 (@name-SE-2993)`,
      `- [SE-2992] issue key SE-2992 (@name-SE-2992)`,
      `- [SE-2852] issue key SE-2852 (@name-SE-2852)`,
      ``,
      `### Others:`,
      `- Upgrade react-scripts@1.0.11 (upgrade_react_scripts)`,
    ]);
  });
});
