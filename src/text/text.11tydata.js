module.exports = {
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0])
  }
};