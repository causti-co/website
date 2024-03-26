module.exports = {
  layout: "text.njk",
  tags: "text",
  og: {
    type: "article"
  },
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0])
  }
};