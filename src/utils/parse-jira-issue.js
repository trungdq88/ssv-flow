module.exports = (text, jiraTaskPrefix) => {
  const jiraRegExp = new RegExp(
    '^- \\[(' + jiraTaskPrefix + '-\\d+)\\].*?\\(@(.*?)\\)$',
  );
  return text
    .split('\n')
    .filter(line => jiraRegExp.test(line))
    .map(line => jiraRegExp.exec(line))
    .map(res => ({issueKey: res[1], username: res[2]}));
};
