const util = require('node:util');
const exec = util.promisify(require("node:child_process").exec);
const { readFile } = require('node:fs/promises');
const readingTime = require('reading-time');

module.exports = {
  layout: "text.njk",
  tags: ["text"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => {
      if (data.page.filePathStem.includes("/_drafts/")) {
        return `${data.page.filePathStem.replace("/_drafts/", "/")}/`;
      }
    },
    og: {
      type: data => data.page.fileSlug !== "text" ? "article" : "website"
    },
    history: async data => {
      if (data.page.fileSlug !== "text") {
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
    },
    stats: async data => {
      if (data.page.fileSlug !== "text") {
        const contents = await readFile(data.page.inputPath, { encoding: 'utf8' });
        const fragments = contents.split("---\n");

        const { words, minutes } = readingTime(fragments[fragments.length - 1]);

        return {
          words,
          minutes: Math.ceil(minutes)
        };
      }
    }
  }
};