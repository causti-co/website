module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/assets/fonts/**");
  eleventyConfig.addPassthroughCopy("src/assets/icons/**");
  eleventyConfig.addPassthroughCopy("src/assets/images/**");
  eleventyConfig.addPassthroughCopy("src/assets/styles/**"); // Eventually needs to be replaced w/ bundling or sass
  
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

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
};