const util = require('node:util');
const exec = util.promisify(require("node:child_process").exec);

module.exports = async () => {
  const { stdout } = await exec("git log -1 --format=%H%n%h%n%cI%n%s");
  const [hash, shortHash, date, subject] = stdout.split("\n");
  
  return {
    hash,
    shortHash,
    date: new Date(date),
    subject
  };
};