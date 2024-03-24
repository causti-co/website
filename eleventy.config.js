const _ = require("lodash");
const ExifReader = require("exifreader");

const pad = length => number => ("0".repeat(length) + number.toString()).slice(-length);

const groupByMonth = tag => collection => {
  const pad2 = pad(2);
  const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  return _.chain(collection.getFilteredByTag(tag).reverse())
    .groupBy(item => {
      let date = item.page.date;

      return `${month[date.getUTCMonth()]}${pad2(date.getFullYear())}`
    })
    .toPairs()
    .value();
};

module.exports = function(eleventyConfig) {
  // Ignore `_drafts`
  eleventyConfig.ignores.add("**/_drafts/**");

  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/assets/fonts/**");
  eleventyConfig.addPassthroughCopy("src/assets/icons/**");
  eleventyConfig.addPassthroughCopy("src/assets/images/**");

  // Copy content images
  eleventyConfig.addPassthroughCopy({"src/photo/*.jpg": "assets/photo"});
  eleventyConfig.addPassthroughCopy("src/recs/*.jpg");

  // Get exif data from jpg files
  eleventyConfig.addDataExtension("jpg", {
    parser: async file => {
      const tags = await ExifReader.load(file);
      const config = {
        "height": "Image Height.value",
        "width": "Image Width.value",
        "make": "Make.description",
        "model": "Model.description",
        "exposure": "ExposureTime.description",
        "aperture": "FNumber.description",
        "iso": "ISOSpeedRatings.value",
        "focalLength": "FocalLength.description",
        "lens": "Lens.description"
      };

      let exif = _.mapValues(config, tag => _.get(tags, tag));

      // Canon repeats the Make in the Model
      if (exif.model && exif.make && exif.model.startsWith(exif.make))
        exif.model = exif.model.slice(exif.make.length + 1);
      
      // Remove trailing `f/` to get fstop value
      if (exif.aperture)
        exif.fstop = exif.aperture.slice("f/".length);
      else
        exif.fstop = undefined;

      return {
        exif
      };
    },
    // Pass file path to `parser` rather than file contents
    read: false
  });
  
  eleventyConfig.addFilter("shortDate", value => {
    const pad2 = pad(2);

    if (value instanceof Date)
      return `${pad2(value.getUTCDate())}.${pad2(value.getUTCMonth() + 1)}.${pad2(value.getUTCFullYear())}`;
    else
      return value;
  });

  eleventyConfig.addFilter("shortNumber", value => {
    const pad3 = pad(3);

    return `#${pad3(value)}`;
  });

  eleventyConfig.addCollection("textByMonth", groupByMonth("text"));
  eleventyConfig.addCollection("recsByMonth", groupByMonth("recs"));

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
};