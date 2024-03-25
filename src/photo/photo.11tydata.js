module.exports = {
  layout: "photo.njk",
  tags: "photo",
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0])
  }
};