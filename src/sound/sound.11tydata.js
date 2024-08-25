module.exports = {
  tags: ["sound"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => data.page.fileSlug !== "sound" ? false : undefined,
    fileUrl: data => `/assets/sound/${data.page.fileSlug}.mp3`,
    title: data => 'id3' in data && data.title === undefined? data.id3.title : data.title
  }
};