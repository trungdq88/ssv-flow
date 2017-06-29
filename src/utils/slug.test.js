const branchName = require('./slug.js');

describe('branch-name.js', () => {
  it('should works', () => {
    expect(branchName('[HQ-Report] Integrating With Task Service')).toBe(
      'hq-report-integrating-with-task-service',
    );
    expect(branchName('[HQ-Report] Integrating With Task-----Service')).toBe(
      'hq-report-integrating-with-task-service',
    );
    expect(
      branchName('[HQ-Report] Integrating With Task-----Service--(@#&$'),
    ).toBe('hq-report-integrating-with-task-service');
    expect(
      branchName(
        '[HQ-Report] Integrating With Task-----Service' +
          '--(@#&$[HQ-Report] Integrating With Task-----Service--(@#&$',
      ),
    ).toBe('hq-report-integrating-with-task-service-hq-report');
  });
});
