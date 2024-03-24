module.exports = {
  permalink: false,
  tags: "recs",
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    imageUrl: data => 'exif' in data ? `${data.page.filePathStem}.jpg` : undefined
  }
};