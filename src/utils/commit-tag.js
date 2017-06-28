module.exports = (statusFilePaths) => {
  const tags = [];

  if (statusFilePaths.length === 0) return '';

  if (statusFilePaths.some(_ => /^src\/portals\/_shared/.test(_))) {
    tags.push('SHARED');
  }

  if (statusFilePaths.some(_ => /^src\/portals\/hq/.test(_))) {
    tags.push('HQ');
  }

  if (statusFilePaths.some(_ => /^src\/portals\/log/.test(_))) {
    tags.push('LOG');
  }

  if (statusFilePaths.some(_ => /^src\/portals\/sup/.test(_))) {
    tags.push('SUP');
  }

  if (statusFilePaths.some(_ => /^src\/portals\/cdc/.test(_))) {
    tags.push('CDC');
  }

  if (statusFilePaths.some(_ => /^src\/portals\/ana/.test(_))) {
    tags.push('ANA');
  }

  if (statusFilePaths.some(_ => /^src\/js\//.test(_))) {
    tags.push('LEGACY');
  }

  if (statusFilePaths.length > 0 && tags.length === 0) {
    tags.push('CONFIG');
  }

  return `[${tags.join('/')}]`;
};
