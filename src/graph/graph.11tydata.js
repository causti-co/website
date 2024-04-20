module.exports = {
  tags: ["art"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => data.page.fileSlug !== "art" ? `${data.page.filePathStem}.svg` : undefined
  }
};