const commitTag = require('./commit-tag.js');

describe('commit-tag.js', () => {
  it('HQ', () => {
    expect(commitTag(['src/portals/hq/aoeu/aoeu'])).toBe('[HQ]');
  });

  it('SUP', () => {
    expect(commitTag(['src/portals/sup/aoeu/aoeu'])).toBe('[SUP]');
  });

  it('CDC', () => {
    expect(commitTag(['src/portals/cdc/aoeu/aoeu'])).toBe('[CDC]');
  });

  it('LOGISTICS', () => {
    expect(commitTag(['src/portals/log/aoeu/aoeu'])).toBe('[LOG]');
  });

  it('ANALYTICS', () => {
    expect(commitTag(['src/portals/ana/aoeu/aoeu'])).toBe('[ANA]');
  });

  it('HQ ANALYTICS', () => {
    expect(
      commitTag(['src/portals/ana/aoeu/aoeu', 'src/portals/hq/aoeu/aoeu']),
    ).toBe('[HQ/ANA]');
  });

  it('CDC LOG', () => {
    expect(
      commitTag(['src/portals/log/aoeu/aoeu', 'src/portals/cdc/aoeu/aoeu']),
    ).toBe('[LOG/CDC]');
  });

  it('HQ SUPPLIER CDC', () => {
    expect(
      commitTag([
        'src/portals/sup/aoeu/aoeu',
        'src/portals/hq/aoeu/aoeu',
        'src/portals/cdc/aoeu/aoeu',
      ]),
    ).toBe('[HQ/SUP/CDC]');
  });

  it('SHARED', () => {
    expect(commitTag(['src/portals/_shared/aoeu/aoeu'])).toBe('[SHARED]');
  });

  it('SHARED HQ', () => {
    expect(
      commitTag(['src/portals/_shared/aoeu/aoeu', 'src/portals/hq/aoeu/aoeu']),
    ).toBe('[SHARED/HQ]');
  });

  it('LEGACY', () => {
    expect(commitTag(['src/js/business/entity-info.js'])).toBe('[LEGACY]');
  });

  it('CONFIG', () => {
    expect(commitTag(['src/portals/aoeu', 'src/portals/index.js'])).toBe(
      '[CONFIG]',
    );
  });

  it('TEST', () => {
    expect(
      commitTag(['src/__tests__/aoeu/aeou.,/,p.']),
    ).toBe('[TEST]');
  });

  it('TEST, CDC', () => {
    expect(
      commitTag(['src/__tests__/aoeu/aeou.,/,p.', 'src/portals/cdc/aoeu']),
    ).toBe('[TEST/CDC]');
  });

  it('Empty', () => {
    expect(commitTag([])).toBe('');
  });
});
