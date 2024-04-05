module.exports = {
  tags: ["recs"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => data.page.fileSlug !== "recs" ? false : undefined,
    imageUrl: data => 'exif' in data ? `/recs/${data.page.fileSlug}.jpg` : undefined
  }
};