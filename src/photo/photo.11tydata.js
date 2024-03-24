module.exports = {
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    imageUrl: data => `${data.page.filePathStem}/${data.page.fileSlug}.jpg`
  }
};