// @format
jest.mock('./config.js');
require('./config.js').SLACK_NOTIFY_ENDPOINT = 'endpointttttttt';
jest.mock('request');

const slack = require('./slack.js');

describe('slack.js', () => {
  it('should send request to the right endpoint with the right options', () => {
    const done = (require('request').post = jest
      .fn()
      .mockImplementation((options, callback) => {
        setTimeout(() => callback(null, 'hello'), 1);
      }));
    slack.sendNotification({
      text: 'content',
    });
    expect(done.mock.calls[0].slice(0, 2)).toEqual([
      'endpointttttttt',
      { json: { text: 'content' } },
    ]);
  });
});
