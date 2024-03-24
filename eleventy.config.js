module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/assets/fonts/**");
  eleventyConfig.addPassthroughCopy("src/assets/icons/**");
  eleventyConfig.addPassthroughCopy("src/assets/images/**");
  eleventyConfig.addPassthroughCopy("src/assets/styles/**"); // Eventually needs to be replaced w/ bundling or sass
  
  return {
    dir: {
      input: "src",
      output: "dist"
    }
  }
};