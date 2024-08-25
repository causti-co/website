module.exports = {
  tags: ["recs"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => data.page.fileSlug !== "recs" ? false : undefined,
    og: data => {
      let og = {};

      og.type = "website";

      if (data.imageUrl) {
        og.image = {
          url: data.imageUrl,
          type: "image/jpeg",
          width: data.exif.width,
          height: data.exif.height,
          alt: data.title
        }
      }

      return { ...data.og, ...og };
    },
    imageUrl: data => 'exif' in data ? `/assets/recs/${data.page.fileSlug}.jpg` : undefined
  }
};