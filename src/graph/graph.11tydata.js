const { extname, basename } = require("path");
const { access, constants } = require('node:fs/promises');
// XXX once we get rid of editor and automata pages, review this
// make it look like text.11tydata.js
const pageSlugs = ["graph", "editor", "automata"];

module.exports = {
  //layout: "graph.njk",
  tags: ["graph"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => {
      if (data.page.filePathStem.includes("/_drafts/")) {
        return `${data.page.filePathStem.replace("/_drafts/", "/")}/`;
      }
    },
    og: {
      type: data => !pageSlugs.includes(data.page.fileSlug) ? "article" : "website"
    },
    imageUrl: async data => {
      if (!pageSlugs.includes(data.page.fileSlug)) {
        let basePath = data.page.inputPath.slice(0, -extname(data.page.inputPath).length);
        let extensions = ["jpg", "png", "svg", "webp"];

        for (let extension of extensions) {
          try {
            await access(`${basePath}.${extension}`, constants.R_OK);
            return `/assets/graph/${data.page.fileSlug}.${extension}`;
          } catch (exception) {
            // No luck
          }
        }
      }
    }
  }
};