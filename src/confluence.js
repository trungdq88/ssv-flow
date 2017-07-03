// @format
const ConfluenceApi = require('./lib/confluence-api.js');
const config = require('./config.js');

const {CONFLUENCE_SPACE_KEY, CONFLUENCE_PATH} = config;

const options = {
  username: config.user,
  password: config.password,
  baseUrl: config.protocol + '://' + config.host + CONFLUENCE_PATH,
};

const confluenceApi = new ConfluenceApi(options);

exports.getPage = pageTitle =>
  new Promise((resolve, reject) => {
    confluenceApi.getContentByPageTitle(
      CONFLUENCE_SPACE_KEY,
      pageTitle,
      (err, page) => {
        if (err) {
          reject(err);
          return;
        }
        if (page.results.length === 0) {
          reject('No page found for title ' + pageTitle);
          return;
        }
        resolve(page.results[0]);
      },
    );
  });

exports.editPage = (pageTitle, content) =>
  new Promise(async (resolve, reject) => {
    const page = await exports.getPage(pageTitle);
    confluenceApi.putContent(
      CONFLUENCE_SPACE_KEY,
      page.id,
      page.version.number + 1,
      page.title,
      content,
      (err, success) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(success);
      },
    );
  });

exports.editPage('Release Note - Frontend Apps', 'hehehe').then(_ => console.log(_));
