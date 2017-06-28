exports.runTests = () => {
  return new Promise((resolve, reject) => {
    const spawn = require('child_process').spawn;
    var env = Object.create(process.env);
    env.CI = 'true';
    const p = spawn('yarn', ['test'], {
      stdio: 'inherit',
      env,
    });
    p.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(code);
      }
    });
  });
};

exports.deploy = () => {
  return new Promise((resolve, reject) => {
    const spawn = require('child_process').spawn;
    var env = Object.create(process.env);
    env.CI = 'true';
    const p = spawn('yarn', ['run', 'deploy'], {
      stdio: 'inherit',
      env,
    });
    p.on('exit', (code) => {
      if (code === 0) {
        resolve(0);
      } else {
        reject(code);
      }
    });
  });
};
