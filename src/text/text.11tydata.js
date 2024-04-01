const util = require('node:util');
const exec = util.promisify(require("node:child_process").exec);

module.exports = {
  layout: "text.njk",
  tags: "text",
  og: {
    type: "article"
  },
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => {
      if (data.page.filePathStem.includes("/_drafts/")) {
        return `${data.page.filePathStem.replace("/_drafts/", "/")}/`;
      }
    },
    history: async data => {
      if (data.page.fileSlug !== "text" && "history" in data === false) {
        const { stdout } = await exec(`git log --format=%H%n%h%n%cI%n%s%n ${data.page.inputPath}`);
        const history = stdout.trimEnd().split("\n\n").map(logEntry => {
          const [hash, shortHash, date, subject] = logEntry.split("\n");

          return {
            hash,
            shortHash,
            date: new Date(date),
            subject
          };
        });

        return history;
      }
    }
  }
};