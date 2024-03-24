const _ = require("lodash");
const ExifReader = require("exifreader");

module.exports = function(eleventyConfig) {
  eleventyConfig.ignores.add("**/_drafts/**");

  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/assets/fonts/**");
  eleventyConfig.addPassthroughCopy("src/assets/icons/**");
  eleventyConfig.addPassthroughCopy("src/assets/images/**");

  eleventyConfig.addPassthroughCopy({"src/photo/*.jpg": "assets/photos"});
  eleventyConfig.addPassthroughCopy("src/recs/*.jpg");

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
      
      if (exif.aperture)
        exif.fstop = exif.aperture.slice(2);
      else
        exif.fstop = undefined;

      return {
        exif
      };
    },
    read: false
  });
  
  eleventyConfig.addFilter("shortDate", value => {
    const pad = number => ("0" + number.toString()).slice(-2);

    if (value instanceof Date)
      return `${pad(value.getUTCDate())}.${pad(value.getUTCMonth() + 1)}.${pad(value.getUTCFullYear())}`;
    else
      return value;
  });

  eleventyConfig.addFilter("shortNumber", value => {
    const pad = number => ("00" + number.toString()).slice(-3);

    return `#${pad(value)}`;
  });

  eleventyConfig.addCollection("textByMonth", (collection) => {
    const pad = number => ("0" + number.toString()).slice(-2);
    const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    return _.chain(collection.getFilteredByTag("text").reverse())
      .groupBy(text => {
        let date = text.page.date;
  
        return `${month[date.getUTCMonth()]}${pad(date.getFullYear())}`
      })
      .toPairs()
      .value();
  });

  eleventyConfig.addCollection("recsByMonth", (collection) => {
    const pad = number => ("0" + number.toString()).slice(-2);
    const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    return _.chain(collection.getFilteredByTag("recs").reverse())
      .groupBy(rec => {
        let date = rec.page.date;
  
        return `${month[date.getUTCMonth()]}${pad(date.getFullYear())}`
      })
      .toPairs()
      .value();
  });

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
};