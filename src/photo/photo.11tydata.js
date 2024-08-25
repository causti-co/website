module.exports = {
  layout: "photo.njk",
  tags: ["photo"],
  eleventyComputed: {
    number: data => parseInt(data.page.fileSlug.split("-")[0]),
    permalink: data => {
      if (data.page.filePathStem.includes("/_drafts/")) {
        return `${data.page.filePathStem.replace("/_drafts/", "/")}/`;
      }
    },
    description: data => data.description ? data.description : data.alt,
    og: data => {
      let og = {};

      og.type = data.page.fileSlug !== "photo" ? "article" : "website";

      if (data.responsive) {
        const largest = data.responsive[data.responsive.length - 1];

        og.image = {
          url: largest.url,
          type: largest.sourceType,
          width: largest.width,
          height: largest.height,
          alt: data.alt
        }
      };

      return { ...data.og, ...og };
    }
  }
};