const jest = require('jest');

const args = [];

if (!process.env.CI) {
  args.push('--watchAll');
}

jest.run(args);
