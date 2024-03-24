module.exports = {
  layout: "text.njk",
  tags: "text",
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0])
  }
};