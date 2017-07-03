// @format
module.exports = async (
  logs,
  jiraTaskPrefix,
  getJiraIssueInfo,
  {jiraIssueOnly = false} = {},
) => {
  const jiraRegExp = new RegExp(
    '[\\[\\s](' + jiraTaskPrefix + '-\\d+)[\\]\\s]',
  );
  const issueKeys = Array.from(
    new Set(
      logs
        .filter(log => jiraRegExp.test(log))
        .map(log => jiraRegExp.exec(log)[1]),
    ),
  );
  const jiraIssues = (await Promise.all(
    issueKeys.map(issueKey => getJiraIssueInfo(issueKey)),
  )).map((issueInfo, index) => ({
    key: issueKeys[index],
    title: issueInfo.fields.summary,
    creator: issueInfo.fields.creator.name,
  }));
  const others = jiraIssueOnly ? [] : logs.filter(log => !jiraRegExp.test(log));

  let sectionCount = 0;
  if (jiraIssues.length) sectionCount++;
  if (others.length) sectionCount++;

  let output = [`Changes:`, ``];

  if (jiraIssues.length) {
    if (sectionCount >= 2) {
      output = output.concat([`### JIRA issues:`]);
    }
    output = output.concat(
      jiraIssues.map(_ => `- [${_.key}] ${_.title} (@${_.creator})`),
    );
  }

  if (others.length) {
    if (sectionCount >= 2) {
      output = output.concat([``, `### Others:`]);
    }
    output = output.concat(others.map(_ => `- ${_}`));
  }

  return output;
};
