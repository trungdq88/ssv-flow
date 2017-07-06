module.exports = (text, jiraTaskPrefix) => {
  const jiraRegExp = new RegExp(
    '\\s?[\\[\\s](' + jiraTaskPrefix + '-\\d+)[\\]\\s].*?\\(@(.*?)\\)$',
  );
  return text
    .split('\n')
    .filter(line => jiraRegExp.test(line))
    .map(line => jiraRegExp.exec(line))
    .map(res => ({issueKey: res[1], username: res[2]}));
};
