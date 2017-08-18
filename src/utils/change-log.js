// @format
module.exports = async (
  logs,
  jiraTaskPrefix,
  getJiraIssueInfo,
  {
    jiraIssueOnly = false,
    jiraIssueLink = null,
    duplicateJiraIssue = false,
  } = {},
) => {
  const jiraRegExp = new RegExp(
    `[\\[\\s'](` + jiraTaskPrefix + `-\\d+)[\\]\\s\/]`,
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
  let others = [];
  if (jiraIssueOnly) {
    others = [];
  } else if (duplicateJiraIssue) {
    others = logs;
  } else {
    others = logs.filter(log => !jiraRegExp.test(log));
  }

  let sectionCount = 0;
  if (jiraIssues.length) sectionCount++;
  if (others.length) sectionCount++;

  let output = [`Changes:`, ``];

  if (jiraIssues.length) {
    if (sectionCount >= 2) {
      output = output.concat([`### JIRA issues:`]);
    }
    let lineTransform = line =>
      `- [${line.key}] ${line.title} (@${line.creator})`;
    if (jiraIssueLink !== null) {
      lineTransform = line =>
        `- [[${line.key}]](${jiraIssueLink}/${line.key})` +
        ` ${line.title} (@${line.creator})`;
    }
    output = output.concat(jiraIssues.map(lineTransform));
  }

  if (others.length) {
    if (sectionCount >= 2) {
      output = output.concat([``, `### Others:`]);
    }
    output = output.concat(others.map(_ => `- ${_}`));
  }

  return output;
};
