// @format
const request = require('request');
const config = require('./config.js');
const {SLACK_NOTIFY_ENDPOINT} = config;

exports.sendNotification = message =>
  new Promise((resolve, reject) => {
    request.post(
      SLACK_NOTIFY_ENDPOINT,
      {
        json: message,
      },
      (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }
        if (response && response.statusCode === 200) {
          resolve(body);
          return;
        }
        reject(body);
      },
    );
  });
