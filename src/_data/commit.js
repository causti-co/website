const util = require('node:util');
const exec = util.promisify(require("node:child_process").exec);

module.exports = async () => {
  const { stdout } = await exec("git log -1 --format=%h%n%cI%n%s");
  const [hash, date, subject] = stdout.split("\n");
  
  return {
    hash,
    date: new Date(date),
    subject
  };
};