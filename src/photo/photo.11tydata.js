module.exports = {
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    imageUrl: data => `/assets/photos/${data.page.fileSlug}.jpg`
  }
};