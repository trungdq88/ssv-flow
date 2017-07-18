const { getLatestFeatureTagRcNumber } = require('./utils.js');

describe('utils.js', () => {
  it('getLatestFeatureTagRcNumber', () => {
    expect(
      getLatestFeatureTagRcNumber(
        [
          'v0.0.3',
          'v0.0.4.feature1.rc1',
          'v0.0.4.feature1.rc2',
          'v0.0.7',
          'v0.0.8',
        ],
        'feature1',
        'v0.0.4',
      ),
    ).toBe(2);
  });

  it('getLatestFeatureTagRcNumber not exists', () => {
    expect(
      getLatestFeatureTagRcNumber(
        [
          'v0.0.3',
          'v0.0.4.feature1.rc1',
          'v0.0.4.feature1.rc2',
          'v0.0.7',
          'v0.0.8',
        ],
        'feature1',
        'v0.0.5',
      ),
    ).toBe(0);
  });

  it('getLatestFeatureTagRcNumber not exists', () => {
    expect(
      getLatestFeatureTagRcNumber(
        [
          'v0.0.3',
          'v0.0.4.feature1.rc1',
          'v0.0.5.feature1.rc1',
          'v0.0.7',
          'v0.0.8',
        ],
        'feature1',
        'v0.0.5',
      ),
    ).toBe(1);
  });

  it('getLatestFeatureTagRcNumber not exists', () => {
    expect(
      getLatestFeatureTagRcNumber(
        [
          'v0.0.3',
          'v0.0.4.feature1.rc1',
          'v0.0.5.feature1.rc1',
          'v0.0.7',
          'v0.0.8',
        ],
        'aoeuaoeu',
        'v0.0.5',
      ),
    ).toBe(0);
  });
});
