module.exports = {
  tags: ["graph"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => data.page.fileSlug !== "graph" ? `${data.page.filePathStem}.svg` : undefined
  }
};