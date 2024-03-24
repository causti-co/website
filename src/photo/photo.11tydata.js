module.exports = {
  layout: "photo.njk",
  tags: "photo",
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    imageUrl: data => `/assets/photo/${data.page.fileSlug}.jpg`
  }
};