module.exports = {
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => data.page.fileSlug !== "recs" ? false : undefined,
    tags: data => data.page.fileSlug !== "recs" ? ["recs"] : undefined,
    imageUrl: data => 'exif' in data ? `${data.page.filePathStem}.jpg` : undefined
  }
};