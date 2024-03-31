const pkg = require("./package.json");
const path = require("node:path");
const _ = require("lodash");
const ExifReader = require("exifreader");
const Image = require("@11ty/eleventy-img");
const eleventySass = require("eleventy-sass");
const markdownItAttrs = require("markdown-it-attrs");
const _Shiki = import("@shikijs/markdown-it");

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
  // Workaround until amendLibrary supports async functions
  eleventyConfig.on("eleventy.before", async () => {
    const { default: Shiki } = await _Shiki;

    const metaUnquoted = /(\w+)=(?!")([^\s]*)/ig;
    const metaQuoted = /(\w+)="([^"]*)"/ig;

    const syntaxHighlighter = await Shiki({
      // Light: min-light rose-pine-dawn
      // Dark: catppuccin-frappe material-theme material-theme-palenight nord
      theme: "nord",
      transformers: [{
        pre(node) {
          const rawMeta = this.options.meta.__raw;
          const matches = [
            ...rawMeta.matchAll(metaUnquoted),
            ...rawMeta.matchAll(metaQuoted)
          ].map(([oldValue, key, value]) => [key, value]);

          for (let [key, value] of matches) {
            if (key === "class") {
              this.addClassToHast(node, value);
            } else {
              node.properties[`data-${key}`] = value;
            }
          }

          delete node.properties["tabindex"];
        }
      }]
    });
    eleventyConfig.amendLibrary("md", mdLib => mdLib.use(syntaxHighlighter));
  });

  eleventyConfig.addPlugin(eleventySass);
  eleventyConfig.amendLibrary("md", mdLib => mdLib.use(markdownItAttrs));

  // Ignore `_drafts` in production
  const { ELEVENTY_ENV } = process.env;
  
  if (ELEVENTY_ENV === undefined || "production".startsWith(ELEVENTY_ENV)) {
    eleventyConfig.ignores.add("**/_drafts/**");
  }

  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/assets/fonts/**");
  eleventyConfig.addPassthroughCopy("src/assets/icons/**");
  eleventyConfig.addPassthroughCopy("src/assets/images/**");

  // Copy non-optimized content images
  eleventyConfig.addPassthroughCopy("src/recs/*.jpg");

  // Get exif data from jpg files
  eleventyConfig.addDataExtension("jpg", {
    parser: async file => {
      // Generate mobile-optimized images for the photos
      let responsive = undefined;
      if (file.startsWith("./src/photo/")) {
        const stats = await Image(file, {
          // widths: ["320", "640", "1024", "1280", "1440", "1920", "auto"],
          // widths generated by https://github.com/peter-neumann-dev/responsive-image-linter
          widths: ["256", "880", "1220", "1490", "1710", "1905", "2048", "auto"],

          formats: ["webp"],
          urlPath: "/assets/photo/",
          outputDir: "./dist/assets/photo/",
          filenameFormat: (id, src, width, format) => {
            const extension = path.extname(src);
            const name = path.basename(src, extension);
        
            return `${name}-${width}w.${format}`;
          }
        });

        responsive = stats.webp;
      }

      const exifDate = value => {
        const [ date, time ] = value.split(' ');
        return new Date(`${date.replaceAll(':', '-')}T${time}.000Z`);
      };
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
        "lens": "Lens.description",
        "date": "DateTime.description",
        "originalDate": "DateTimeOriginal.description"
      };
      const altModels = {
        "EOS DIGITAL REBEL XSi": "450D"
      };

      let exif = _.mapValues(config, tag => _.get(tags, tag));

      // Canon repeats the Make in the Model
      if (exif.model && exif.make && exif.model.startsWith(exif.make))
        exif.model = exif.model.slice(exif.make.length + 1);

      // Use alternative Models
      if (exif.model && exif.model in altModels)
        exif.model = altModels[exif.model];

      // Remove trailing `f/` to get fstop value
      if (exif.aperture)
        exif.fstop = exif.aperture.slice("f/".length);
      else
        exif.fstop = undefined;

      // Parse exif dates
      if (exif.date) exif.date = exifDate(exif.date);
      if (exif.originalDate) exif.originalDate = exifDate(exif.originalDate);

      return {
        exif,
        responsive
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

  const linkStartTag = /<a href="([^"]*)"([^>]*)>/ig;
  const targetAttr = /target=/ig;
  const relAttr = /rel=/ig;
  const { origin } = new URL(pkg.homepage);
  eleventyConfig.addFilter("safeLinks", value => {
    return value.replaceAll(linkStartTag, (oldValue, linkUrl, attrs) => {
      let url = new URL(linkUrl, origin);
      
      if (url.origin !== origin)
        return `<a href="${linkUrl}"${!targetAttr.test(attrs) ? ` target="_blank"` : ""}${!relAttr.test(attrs) ? ` rel="noopener noreferrer"` : ""}${attrs}>`
      else
        return oldValue;
    });
  });

  const preStartTag = /<pre([^>]*)>/ig;
  const preEndTag = /<\/pre>/ig;
  eleventyConfig.addFilter("betterIndent", (value, spaces) => {
    const [first, ...rest] = value.split("\n");
    let newValue = first;
    let insidePre = preStartTag.test(first);

    for (let line of rest) {
      if (preStartTag.test(line)) {
        insidePre = true;
      } else {
        if (!insidePre) line = `${" ".repeat(spaces)}${line}`;
        if (preEndTag.test(line)) insidePre = false;
      }

      newValue += `\n${line}`;
    }

    return newValue.trimEnd();
  });

  eleventyConfig.addShortcode("image", (responsive, alt, sizes) => {
    const largest = responsive[responsive.length - 1];
    const srcset = responsive.map(size => size.srcset).join(", ");

		return `<img src="${largest.url}" srcset="${srcset}" sizes="${sizes}" width="${largest.width}" height="${largest.height}" alt="${alt}" loading="lazy" decoding="async">`;
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