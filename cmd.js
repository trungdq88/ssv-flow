exports.runTests = () => {
  return new Promise((resolve, reject) => {
    const spawn = require('child_process').spawn;
    var env = Object.create( process.env );
    env.CI = 'true';
    const gitDiff = spawn('yarn', ['test'], {
      stdio: 'inherit',
      env,
    });
    gitDiff.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
};

exports.deploy = () => {
  return new Promise((resolve, reject) => {
    const spawn = require('child_process').spawn;
    var env = Object.create( process.env );
    env.CI = 'true';
    const gitDiff = spawn('yarn', ['run', 'deploy'], {
      stdio: 'inherit',
      env,
    });
    gitDiff.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
};
