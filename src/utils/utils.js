exports.getLatestFeatureTagRcNumber = (tags, featureName, version) => {
  const versionString = version + '.' + featureName + '.rc';
  const versionFeature = tags.filter(tag => tag.indexOf(versionString) === 0);
  if (versionFeature.length === 0) return 0;
  versionFeature.sort();
  return Number(
    versionFeature[versionFeature.length - 1].split(versionString)[1],
  );
};

exports.parseBranchNameToJiraIssueKey = (names, issuePrefix) => {
  return names
    .filter(name => name.match(new RegExp(`^${issuePrefix}-\\d+?/.*$`)))
    .map(name => name.replace(new RegExp(`^(${issuePrefix}-\\d+?)/.*$`), '$1'));
};
