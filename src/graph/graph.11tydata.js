module.exports = {
  tags: ["graph"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => data.page.templateSyntax === "11ty.js" ? `${data.page.filePathStem}.svg` : undefined
  }
};