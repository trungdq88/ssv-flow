// @format
const dateFormat = require('dateformat');
const config = require('./config.js');
const jira = require('./jira.js');
const confluence = require('./confluence.js');
const version = require('./version.js');
const git = require('./git.js');
const input = require('./input.js');
const cmd = require('./cmd.js');
const slack = require('./slack.js');
const slug = require('./utils/slug.js');
const changeLog = require('./utils/change-log.js');
const parseJiraIssue = require('./utils/parse-jira-issue.js');
const mdToHtml = require('./utils/md-to-html.js');
const mdToSlack = require('./utils/md-to-slack.js');
const {
  getLatestFeatureTagRcNumber,
  parseBranchNameToJiraIssueKey,
} = require('./utils/utils.js');

const {
  PROJECT_CODE,
  REMOTE_NAME,
  CONFLUENCE_RELEASE_NOTE_PAGE,
  CONFLUENCE_RELEASE_NOTE_PAGE_URL,
} = config;

const jiraIssueLink = config.protocol + '://' + config.host + '/browse';

const getFullIssueKey = issueKey =>
  PROJECT_CODE +
  '-' +
  issueKey.replace(new RegExp('^' + PROJECT_CODE + '-'), '');

const generateSmartChangeLog = async (
  logs,
  { duplicateJiraIssue = false } = {},
) => {
  const changeLogText = await changeLog(
    logs,
    PROJECT_CODE,
    issueKey => {
      console.log(`Fetching ${issueKey}...`);
      return jira.findIssue(issueKey);
    },
    {
      jiraIssueLink,
      duplicateJiraIssue,
    },
  );
  const userChangeLog = await input.enter(changeLogText.join('\n'));
  return userChangeLog;
};

exports.generateReleaseNotes = async (issueKey, username) => {
  const tagRegExp = new RegExp('\\(tag: (v\\d+\\.\\d+\\.\\d+)\\)$');
  const fullLogs = await git.getLog('master');
  const tagLogs = [];
  let tagName = 'future';
  let tagDate = 'future';
  for (let i = 0; i < fullLogs.length; i++) {
    const message = fullLogs[i].message;
    if (tagRegExp.test(message)) {
      tagName = tagRegExp.exec(message)[1];
      tagDate = fullLogs[i].date;
    } else {
      tagLogs.push({ tag: tagName, message, date: tagDate });
    }
  }
  const tags = Array.from(new Set(tagLogs.map(_ => _.tag))).map(tag =>
    tagLogs.find(_ => _.tag === tag),
  );

  const getTagLogs = tag =>
    tagLogs.filter(_ => _.tag === tag).map(_ => _.message);

  const releaseNotes = [
    `# Frontend Apps Release Notes`,
    ...(await Promise.all(
      tags.map(tag => getTagLogs(tag.tag)).map(log =>
        changeLog(log, PROJECT_CODE, issueKey => {
          console.log(`Fetching ${issueKey}...`);
          return jira.findIssue(issueKey).catch(_ => ({
            fields: {
              summary: '(Issue not found)',
              creator: { name: 'error' },
            },
          }));
        }),
      ),
    )).map((notes, index) =>
      [
        ``,
        `## Release ${tags[index].tag} (${tags[index].date}):`,
        notes.join('\n'),
      ].join('\n'),
    ),
  ].join('\n');
  console.log(releaseNotes);
};

exports.openIssue = issueKey => jira.openIssue(getFullIssueKey(issueKey));

exports.moveIssue = async (issueKey, username) => {
  return jira.moveIssue(getFullIssueKey(issueKey), username);
};

exports.start = async shortIssueKey => {
  const issueKey = getFullIssueKey(shortIssueKey);
  // Check repo clean
  if (!await git.isRepoClean()) {
    console.error('Repo is not clean!');
    return;
  }

  console.log(`Get issue ${issueKey} info`);
  const issue = await jira.findIssue(issueKey);
  const branchName = issue.key + '/' + slug(issue.fields.summary);

  console.log(`Issue: ${issue.key} / ${issue.fields.summary}`);

  if (!await git.isBranchLocalExists(branchName)) {
    console.log('Check out master');
    await git.checkout('master');

    console.log('Pull master');
    await git.pull();

    console.log(`Creating branch ${branchName}`);
    await git.createBranch(branchName);

    console.log(`Push branch ${branchName}`);
    await git.push(REMOTE_NAME, branchName, { '-u': true });
  } else {
    console.log(`Branch ${branchName} already exist, checking out.`);
    await git.checkout(branchName);
  }

  try {
    console.log('Move issue to Start Progress...');
    await jira.moveIssueToStartProgress(issueKey);
  } catch (e) {
    console.log(e);
    console.log('Error: cannot move issue');
  }

  console.log('Done! Happy coding!');
};

exports.createIssue = async (issueTitle, storyPoint, type, linkIssueKey) => {
  console.log(`Creating issue ${issueTitle}`);
  const issue = await jira.createIssue(
    issueTitle,
    storyPoint,
    type,
    linkIssueKey && getFullIssueKey(linkIssueKey),
  );

  if (await input.ask(`Start issue ${issue.key} now?`)) {
    return exports.start(issue.key);
  }
};

exports.commit = async fastCommitMessage => {
  const isClean = await git.isRepoClean();

  if (isClean) {
    console.error('Repo is clean, there is nothing to commit!');
    return;
  }

  if (fastCommitMessage) {
    await addAll();
    await commit(fastCommitMessage);
    return;
  }

  console.log('----- GIT STATUS BEGIN -----');
  const text = await git.getStatusPrint();
  console.log(text);
  console.log('----- GIT STATUS END -----');

  async function diff() {
    await addAll();
    return await new Promise((resolve, reject) => {
      const spawn = require('child_process').spawn;
      const gitDiff = spawn('git', ['diff', '--staged'], { stdio: 'inherit' });
      gitDiff.on('exit', resolve);
    });
  }

  async function addAll() {
    await git.addAll();
  }

  async function commit(fastCommitMessage) {
    let userMessage = fastCommitMessage;
    const branchName = await git.getCurrentBranchName();
    const issueKey = branchName.split('/')[0];

    if (!userMessage) {
      userMessage = await input.enter();
    }

    if (!userMessage) {
      console.log('Fetching issue title as commit message...');
      const issue = await jira.findIssue(issueKey);
      userMessage = `${issue.fields.summary}`;
    }

    const commitTag = await git.getCommitTag();
    const commitMessage = `${commitTag} [${issueKey}] ${userMessage}`;

    console.log('Committing:', commitMessage);
    git.commit(commitMessage);
  }

  function cancel() {
    console.log('Cancelled');
  }

  const choice = await input.choice(
    'Please select an action',
    [
      { value: 'd', key: 'd', name: 'Show diff' },
      { value: 'a', key: 'a', name: 'Add all & write commit message' },
      { value: 'c', key: 'c', name: 'Cancel' },
    ],
    1,
  );
  switch (choice) {
    case 'd':
      await diff();
      break;
    case 'a':
      await addAll();
      await commit();
      break;
    case 'c':
      await cancel();
      break;
    default:
      console.log('No action received.');
  }

  console.log('Awesome!');
};

exports.done = async (featureName, username, aliasIssueKey) => {
  const currentBranchName = await git.getCurrentBranchName();
  const issueKey = aliasIssueKey || currentBranchName.split('/')[0];
  if (currentBranchName === 'master') {
    console.log('You are not suppose to run this command on master');
    return;
  }

  if (!await git.isRepoClean()) {
    console.log('Repo is not clean!');
    return;
  }

  const latestVersion = await version.getLatestVersion();
  const tags = await git.getAllTags();
  const rcNumber = getLatestFeatureTagRcNumber(
    tags,
    featureName,
    latestVersion,
  );
  const tag = `${latestVersion}.${featureName}.rc${rcNumber + 1}`;

  let rcChangeLog = '';
  if (rcNumber > 0) {
    // Need change log
    const changeLogSinceLastRc = await git.getLogSinceLastTag(
      currentBranchName,
    );
    const userChangeLog = await generateSmartChangeLog(changeLogSinceLastRc, {
      duplicateJiraIssue: true,
    });
    if (!userChangeLog) {
      console.log('Cancelled.');
      return;
    }
    console.log(userChangeLog);
    rcChangeLog = userChangeLog;
  }

  console.log('Running tests...');
  await cmd.runTests();

  console.log(`Creating tag ${tag}...`);
  await git.addTag(tag);
  console.log(`Pushing tag ${tag}...`);
  await git.pushTags('origin');
  console.log(`Pushing branch ${currentBranchName}...`);
  await git.push(REMOTE_NAME, currentBranchName, { '-u': true });
  console.log(`Moving issue ${issueKey}...`);
  await jira.moveIssueToReadyToDeploy(issueKey);
  await jira.moveIssueToDeployed(issueKey);
  console.log(`Adding comment...`);
  await jira.addComment(issueKey, `Done at feature-${tag}\n${rcChangeLog}`);
  console.log(`Assign issue to ${username}...`);
  await jira.assignIssue(issueKey, username);
  const issue = await jira.findIssue(issueKey);
  console.log(`Notify to Slack...`);
  await slack.sendNotification({
    text: [
      `<${CONFLUENCE_RELEASE_NOTE_PAGE_URL}|` +
        `*Frontend Apps Feature Branch Released: \`feature-${tag}\` (${dateFormat(
          new Date(),
          'yyyy-mm-dd HH:MM',
        )})*>`,
      `Deployed: <${jiraIssueLink}/${issueKey}|${issueKey}> ` +
        `${issue.fields.summary} (<@${username}>)\n${mdToSlack(rcChangeLog)}`,
    ].join('\n'),
  });

  console.log('Back to master...');
  await git.checkout('master');

  // console.log('Wait a little for JIRA to update');
  // await new Promise(r => setTimeout(r, 3000));

  console.log('Update Unreleased note...');
  await exports.updateUnreleasedNote();

  console.log('Done');
};

exports.deploy = async () => {
  const currentBranchName = await git.getCurrentBranchName();
  const issueKey = currentBranchName.split('/')[0];
  if (currentBranchName !== 'master') {
    console.log('You can only to run this command on master');
    return;
  }

  if (!await git.isRepoClean()) {
    console.log('Repo is not clean!');
    return;
  }

  console.log('Fetching issues info from JIRA...');
  const logs = await git.getLogSinceLastTag('master');

  const userChangeLog = await generateSmartChangeLog(logs);

  if (!userChangeLog) {
    console.log('Cancelled');
    return;
  }

  console.log(userChangeLog);

  console.log('Creating new tag & trigger deploy...');
  await cmd.deploy();

  const pendingIssues = parseJiraIssue(userChangeLog, PROJECT_CODE);
  const latestTag = await git.getLatestTag();

  console.log(
    [`Pending issues: ${pendingIssues.length} issue(s)`]
      .concat(pendingIssues.map(_ => ` - ${_.issueKey} (${_.username})`))
      .join('\n'),
  );

  console.log(`Moving && assigning ${pendingIssues.length} issue(s)...`);
  await Promise.all(
    pendingIssues.map(({ issueKey, username }) =>
      (async () => {
        // await jira.moveIssueToDeployed(issueKey);
        await jira.addComment(issueKey, `Released at ${latestTag}.`);
        // await jira.assignIssue(issueKey, username);
        console.log(`Issue ${issueKey}... Done.`);
      })(),
    ),
  );

  const releaseNote = [
    `## Frontend Apps Release **${latestTag}** (${dateFormat(
      new Date(),
      'yyyy-mm-dd HH:MM',
    )}):`,
  ]
    .concat([userChangeLog])
    .join('\n');

  console.log('Notify on Slack...');

  await slack.sendNotification({
    text: mdToSlack(releaseNote, CONFLUENCE_RELEASE_NOTE_PAGE_URL),
  });

  console.log('Updating release note...');

  let releaseNoteUrl;
  try {
    releaseNoteUrl = await confluence.appendToPage(
      CONFLUENCE_RELEASE_NOTE_PAGE,
      mdToHtml(releaseNote),
    );
  } catch (e) {
    console.error(e);
    console.log(
      'Error: could not update release note. Please update manually.',
    );
    console.log(releaseNote);
  }

  console.log('Done.');
};

exports.getPendingIssues = async () => {
  const unmergedBranches = await git.getAllUnmergedBranches();
  const issueKeys = parseBranchNameToJiraIssueKey(
    unmergedBranches,
    PROJECT_CODE,
  );

  if (issueKeys.length === 0) {
    console.log('No pending issues! :-)');
    return;
  }

  const issues = await Promise.all(
    issueKeys.map(issueKey => jira.findIssue(issueKey)),
  );
  const issueFeatureTags = await Promise.all(
    issueKeys.map(issueKey => git.getIssueFeatureTag(issueKey)),
  );

  const output = issues
    .map(
      (issue, index) =>
        `- [${issue.key}](${jiraIssueLink}/${issue.key})` +
        ` ${issue.fields.summary}` +
        ` (@${issue.fields.creator.name})${issueFeatureTags[index]
          ? ` (\`feature-${issueFeatureTags[index]}\`)`
          : ''}`,
    )
    .join('\n');

  console.log(`* Pending issues *`);
  console.log(output);
  console.log('===================');

  return output;
};

exports.updateUnreleasedNote = async () => {
  const template = '';
  const page = await confluence.getPage(CONFLUENCE_RELEASE_NOTE_PAGE);
  const content = page.body.storage.value;
  const pendingIssues = await exports.getPendingIssues();

  let unreleasedNote;

  if (pendingIssues) {
    const html = mdToHtml(pendingIssues);
    unreleasedNote =
      `<blockquote>` +
      `<h1>Unreleased (${dateFormat(new Date(), 'yyyy-mm-dd HH:MM')})</h1>` +
      `<p id="unreleased-note">` +
      html +
      `</p>` +
      `</blockquote>`;
  } else {
    unreleasedNote =
      `<blockquote>` +
      `<h1>Unreleased (${dateFormat(new Date(), 'yyyy-mm-dd HH:MM')})</h1>` +
      `<p id="unreleased-note">` +
      `No pending issue :-)` +
      `</p>` +
      `</blockquote>`;
  }

  let newContent;

  if (content.indexOf('<blockquote>') === 0) {
    newContent = content.replace(
      /<blockquote>[\s\S]*?<\/blockquote>/,
      unreleasedNote,
    );
  } else {
    newContent = unreleasedNote + content;
  }

  await confluence.editPage(CONFLUENCE_RELEASE_NOTE_PAGE, newContent);
};
