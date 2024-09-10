const { extname, dirname } = require("path");
const { access, readFile, copyFile, constants } = require('node:fs/promises');
const imageSize = require("image-size")
// XXX once/if we get rid of editor and automata pages, review this
// make it look like text.11tydata.js
const pageSlugs = ["graph", "editor", "automata"];
const mimeTypes = {"jpg": "image/jpeg", "png": "image/png", "svg": "image/svg+xml", "webp": "image/webp"};

const basepath = inputPath => inputPath.slice(0, -extname(inputPath).length);

module.exports = {
  tags: ["graph"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => {
      if (data.page.filePathStem.includes("/_drafts/")) {
        return `${data.page.filePathStem.replace("/_drafts/", "/")}/`;
      }
    },
    og: data => {
      let og = {};

      og.type = !pageSlugs.includes(data.page.fileSlug) ? "article" : "website";

      if (data.imageUrl) {
        let basePath = basepath(data.page.inputPath);
        let extension = extname(data.imageUrl);
        let size = imageSize(`${basePath}${extension}`);

        og.image = {
          url: data.imageUrl,
          type: mimeTypes[extension.slice(1)],
          width: size.width,
          height: size.height,
          alt: data.alt || data.title
        }
      }

      return { ...data.og, ...og };
    },
    rawCode: async data => {
      if (!pageSlugs.includes(data.page.fileSlug)) {
        let basePath = basepath(data.page.inputPath);

        try {
          let code = await readFile(`${basePath}.code.js`, "utf8");
          return code;
        } catch (exception) {
          // No luck
        }
      }
    },
    codeUrl: async data => {
      if (!pageSlugs.includes(data.page.fileSlug) && data.layout === "graph-cables" && data.page.outputPath !== "") {
        let basePath = basepath(data.page.inputPath);
        let outputPath = dirname(data.page.outputPath);

        try {
          await copyFile(`${basePath}.code.js`, `${outputPath}/patch.js`);
          console.log(`[11ty] Writing ${outputPath}/patch.js from ${basePath}.code.js`);
          return `${data.page.url}patch.js`;
        } catch (exception) {
          // No luck
        }
      }
    },
    imageUrl: async data => {
      if (!pageSlugs.includes(data.page.fileSlug)) {
        let basePath = basepath(data.page.inputPath);
        let extensions = Object.keys(mimeTypes);

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