module.exports = {
  layout: "photo.njk",
  tags: "photo",
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    og: {
      image: data => {
        if (data.responsive) {
          const largest = data.responsive[data.responsive.length - 1];

          return {
            url: largest.url,
            type: largest.sourceType,
            width: largest.width,
            height: largest.height,
            alt: data.alt
          };
        }
      }
    }
  }
};