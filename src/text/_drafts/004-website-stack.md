---
date: 2024-04-04
title: How does this website work
keywords: [development, web, devops]
---
It's the obligatory "how does this website work" blogpost!

I'll try to keep this one on the less-refined side of things, but let's see. First off, I assume you already checked the [about](/about/) page, which gives a very quick overview of why this place even exists in the first place.

So I wanted to have a personal website. I've had the idea on my mind for a while, and mostly kept postponing it to avoid having to deal with the design-side of things. I've never been on the artistic side so the kind of things I can come up with on my own is quite limited, but after looking at some older software UIs for inspiration I decided to just get something out there so I could move on to actually writing content.

## html/css

I did the first design directly in HTML and CSS. And if HTML had some kind of native way of code reuse/includes, I might've been tempted to just stick to writing HTML for my content. But soon enough I found myself wanting to test more than a single page at a time, and that meant I had to create multiple HTML files, and at that point making a change meant having to make that same change across multiple files.

A few decisions I made at this stage: 1/ No 3rd party resources, 2/ Don't do anything that would require a cookie banner, 3/ Avoid JS as much as possible, 4/ Don't bother with older browsers (yes, this includes IE11).

## 11ty

Since I wanted to keep things as simple as possible, a "traditional" n-tier stack was absolutely out of the question. The alternative was to use a static site generator. After reviewing the most popular choices, I settled for [11ty](https://github.com/11ty/eleventy/) as it appeared to be the least opinionated one of the bunch, allowing me to start with an empty directory and slowly bring content and complexity in as needed. I followed my traditional approach of reading the entire docs to figure out what it can and cannot do before getting to adapting my static content to [nunjucks](https://mozilla.github.io/nunjucks/). I chose nunjucks simply because it was the default templating language used in the documentation.

I decided to manually number content items by adopting the following naming convention: `###-desired-content-url.ext`, and to manually provide content dates via Front Matter data, rather than use the mechanisms provided by 11ty based on either filesystem or Git dates.

### Folder structure

```txt [class=tree]
website/
├─ dist/
├─ src/
   ├─ _data/
   ├─ _includes/
   ├─ about/
   ├─ assets/
   │  ├─ fonts/
   │  ├─ icons/
   │  ├─ images/
   │  ├─ styles/
   ├─ photo/
   │  ├─ _drafts/
   ├─ recs/
   ├─ text/
      ├─ _drafts/
```

### Sass

I migrated all the styles from CSS to SCSS, since writing plain CSS is extremeky repetitive. I'm using the [eleventy-sass](https://github.com/kentaroi/eleventy-sass) plugin with no further configuration. Setting the `ELEVENTY_ENV` [environment variable](/text/002-environment-variables/) to a non-production value will generate uncompressed CSS with source maps, which is nice.

### Custom collections

My first challenge was implementing the "group by month+year" feature I had mocked up for the [text](/text/) section. Lucky for us, 11ty lets you do a lot of pre-processing to prepare the right data structures you need in your templates using JavaScript, so I used [lodash](https://lodash.com/) to do the grouping for me:

```js
const _ = require("lodash");

module.exports = function(eleventyConfig) {
  eleventyConfig.addCollection("textByMonth", (collection) => {
    const pad = number => ("00" + number.toString()).slice(-2);
    const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    return _.chain(collection.getFilteredByTag("text").reverse())
      .groupBy(text => {
        let date = text.page.date;

        return `${month[date.getUTCMonth()]}${pad(date.getFullYear())}`;
      })
      .toPairs()
      .value();
  });
};
```

This code is fragile: 1/ It depends on the collection being sorted by creation date in ascending order (before we reverse it). 2/ It depends on traversal order as specified by ECMAScript. But since I'm in full control of the environment where this code runs (either my laptop or the CD environment), I'm ok with this. The alternative would be to group by a key that is sortable, sort the resulting array by this key, then map this key back to a human-readable value. No reason to make things more complex than they need to be.

### Exif data

The next thing I wanted to do was automatically extract information like shutter speed, focal length, etc. from photos automatically from their [Exif data](https://en.wikipedia.org/wiki/Exif). Lucky for me, 11ty's documentation on [custom data file formats](https://www.11ty.dev/docs/data-custom/) describes this exact use-case. I picked a more up-to-date Exif library, and used lodash again to help me get the data I needed. I also had to do some tweaking along the way to get things just right for me. Here's the final result:

```js
const ExifReader = require("exifreader");
const _ = require("lodash");

module.exports = function(eleventyConfig) {
  eleventyConfig.addDataExtension("jpg", {
    parser: async file => {
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

      return { exif };
    },
    // Pass file path to `parser` rather than file contents
    read: false
  });
};
```
Yes, all my input images are `*.jpg`. I'll update this if that ever changes.

### Responsive images

Keeping on the photos (and images in general), I also wanted to automatically convert all my images to [WebP](https://en.wikipedia.org/wiki/WebP) and provide images of different sizes to optimize bandwidth use for my visitors. Again, 11ty has you covered out of the box with the [Image plugin](https://www.11ty.dev/docs/plugins/image/). However, this plugin appears designed to be used for embedding static content, so I had to adapt it to do the processing as part of the custom data pipeline, and provide my own shortcode:

```js
const path = require("node:path");
const Image = require("@11ty/eleventy-img");

module.exports = function(eleventyConfig) {
  eleventyConfig.addDataExtension("jpg", {
    parser: async file => {
      // Generate mobile-optimized images for the photos
      let responsive = undefined;
      
      if (file.startsWith("./src/photo/")) {
        const stats = await Image(file, {
          // widths generated by
          // https://github.com/peter-neumann-dev/responsive-image-linter
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

      return { responsive };
    },
    // Pass file path to `parser` rather than file contents
    read: false
  });

  eleventyConfig.addShortcode("image", (responsive, alt, sizes) => {
    const largest = responsive[responsive.length - 1];
    const srcset = responsive.map(size => size.srcset).join(", ");

    return `<img src="${largest.url}" srcset="${srcset}" sizes="${sizes}" width="${largest.width}" height="${largest.height}" alt="${alt}" loading="lazy" decoding="async">`;
  });
};
```

A few more things to call-out: I'm using my own paths here, and I also chose to do away with the "unique identifiers" the plugin generates by default, in favor of predictable filenames instead. I'd also like to add a huge shout-out to the [Responsive Image Linter](https://github.com/peter-neumann-dev/responsive-image-linter) Chrome extension, which automatically resizes your webpage and provides a recommendation for both image resolutions and `<img sizes="..." />` configuration.

In my actual code both of these snippets are merged into a single processing pipeline. I've split them here in for convenience in case anyone wants only one part of the functionality.

### Better external links

I wanted to automatically make external links open in a new window by having `target=_blank` added to them. And while at it, I also wanted to add `rel="noopener noreferrer"`. I built this as a filter using regular expressions for the parsing. I know, I know, HTML is not a regular language. But I don't need to parse HTML. I just need to find opening `<a>` tags, on HTML that ultimately I control, so this does the job perfectly well.

I don't try to do anything smarter than that. If the attributes are not set, they will be set. If they are set, they will be left alone.

This snippet needs to know where the website is hosted, so we get that information from the `homepage` field in the `package.json` file. Cute, right?

```js
const pkg = require("./package.json");

module.exports = function(eleventyConfig) {
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
};
```

### Drafts

Somewhere in the 11ty docs they suggest using a `_drafts` folder, and I liked the idea. At the same time, I wanted to be able to test my drafts, so I configured 11ty to only ignore drafts in production, using the same logic as the that eleventy-sass plugin uses (I just copied their code here).

```js
module.exports = function(eleventyConfig) {
  // Environment-sensitive configuration
  const { ELEVENTY_ENV } = process.env;
  
  // Use same logic as `eleventy-sass` for now
  if (ELEVENTY_ENV === undefined || "production".startsWith(ELEVENTY_ENV)) {
    // Ignore `_drafts`
    eleventyConfig.ignores.add("**/_drafts/**");
  }
};
```

I've created folders for the different content categories in my site (text, photo, etc.), and I have a `_drafts` folder inside each of these folders. Since I'm already using folder data files for each of my content categories, I enhanced the computed data to automatically remove `_drafts` from the generated content path, so that I can fully test draft content with the same URLs as I would have in production.

```js
module.exports = {
  eleventyComputed: {
    permalink: data => {
      if (data.page.filePathStem.includes("/_drafts/")) {
        return `${data.page.filePathStem.replace("/_drafts/", "/")}/`;
      }
    }
  }
};
```

### Feature flags

Actually, I left a couple of lines out of that "Environment-sensitive configuration" snippet. Here's how it really looks like:

```js
module.exports = function(eleventyConfig) {
  // Environment-sensitive configuration
  const { ELEVENTY_ENV } = process.env;
  
  // Use same logic as `eleventy-sass` for now
  if (ELEVENTY_ENV === undefined || "production".startsWith(ELEVENTY_ENV)) {
    // Ignore `_drafts`
    eleventyConfig.ignores.add("**/_drafts/**");
  } else {
    // Feature-flag for experimental features
    eleventyConfig.addGlobalData("experimental", true);
  }
};
```

I'm using this opportunity to conditionally set feature flags (at the moment just one, the `experimental` flag). Just like `_drafts` lets me work on content without publishing it, the `experimental` flag lets me work on entire features without publishing them:

{% raw%}
```handlebars
{%- if experimental %}
<h1>my next amazing feature</h1>
{%- endif %}
```
{% endraw %}

This way I can be in the middle of working on a new feature, and still be able to publish a hotfix to production without having to create a new brach or stash my work in progress.

### Syntax Highlgihting

As I was writing this, I needed to add some syntax highlighting support for the code samples. I tried the [official plugin](https://www.11ty.dev/docs/plugins/syntaxhighlight/) which uses [PrismJS](https://prismjs.com/). It worked, but it needed its CSS to be loaded externally. PrismJS itself felt clunky and outdated, and I could not find a theme I liked, so I started looking for alternatives.

Luckily for me, things in 11ty are relatively straightforward. Markdown itself is processed by [markdown-it](https://github.com/markdown-it/markdown-it), and this component can be [easily enhanced and/or reconfigured](https://www.11ty.dev/docs/languages/markdown/) if needed.

With that in mind, I settled for [Shiki](https://shiki.style/) as a better alternative. This highlighter comes with its own [markdown-it plugin](https://shiki.style/packages/markdown-it), and has a [nice API](https://shiki.style/guide/transformers) for further ehnancing the generated output.

There are a couple of things to consider though: I've been working with CommonJS modules thus far, because I'm an old fart, but Shiki ship as an ECMAScript module only. That means using the [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) syntax, which loads the module asyncrhonously and returns a `Promise` that resolves to the module. This is not a problem, except 11ty does not support async funcrions as arguments for `eleventyConfig.amendLibrary`. The [current workaround](https://github.com/11ty/eleventy-plugin-syntaxhighlight/issues/32#issuecomment-1410641845), until 11ty V3 releases with support for async configuration functions, is to use the `eleventy.before` event, as event handlers can be async.

```js
const _Shiki = import("@shikijs/markdown-it");

module.exports = function(eleventyConfig) {
  // Workaround until amendLibrary supports async functions
  eleventyConfig.on("eleventy.before", async () => {
    const { default: Shiki } = await _Shiki;

    const metaUnquoted = /([\w\-_]+)=(?!")([^\s]*)/ig;
    const metaQuoted = /([\w\-_]+)="([^"]*)"/ig;

    const syntaxHighlighter = await Shiki({
      theme: "rose-pine-dawn",
      transformers: [{
        pre(node) {
          let rawMeta = this.options.meta.__raw;
          if (rawMeta.startsWith("[") && rawMeta.endsWith("]"))
            rawMeta = rawMeta.slice(1, -1);

          const matches = [
            ...rawMeta.matchAll(metaUnquoted),
            ...rawMeta.matchAll(metaQuoted)
          ].map(([oldValue, key, value]) => [key, value]);

          for (let [key, value] of matches) {
            if (key === "class") {
              this.addClassToHast(node, value);
            } else {
              if (key.startsWith("data-")) key = key.slice("data-".length);
              node.properties[`data-${key}`] = value;
            }
          }

          delete node.properties["tabindex"];
        }
      }]
    });
    eleventyConfig.amendLibrary("md", mdLib => mdLib.use(syntaxHighlighter));
  });
};
```

I took the liberty of providing a basic transformer that removes the `tabindex` property from the `<pre>` tag (Is there a reason to want to make these available to tab navigation that I'm not getting?), as well as allowing additional classes and attributes to be defined by adding them next to the codeblock fence, like so:

````md [class="line-numbers diff" start-line=53]
```js [class="line-numbers diff" start-line=53]
// (... code here ...)
```
````

You can inspect the source of this page and see this working for the codeblock above.

### Better Indent

I've been using Nunjuck's [indent](https://mozilla.github.io/nunjucks/templating.html#indent) filter to ensure that content included in layouts has the right indentation in the overall generated HTML. Sadly, I had to make an exception for codeblocks, as `<pre>` render their content including whitespace.

Anyway, I wrote my own indent filter that skips `<pre>` blocks:

```js
module.exports = function(eleventyConfig) {
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
};
```

### Git

I thought it would be cool to show the currently deployed version by displaying information about the current commit. I'm just using `child_process` to call the Git CLI directly and providing what I need as a global data file:

```js
const util = require('node:util');
const exec = util.promisify(require("node:child_process").exec);

module.exports = async () => {
  const { stdout } = await exec("git log -1 --format=%H%n%h%n%cI%n%s");
  const [hash, shortHash, date, subject] = stdout.split("\n");
  
  return {
    hash,
    shortHash,
    date: new Date(date),
    subject
  };
};
```

Then I thought it would be even cooler to show a git-powered revision history, so I did it all over again as a folder data file:

```js
const util = require('node:util');
const exec = util.promisify(require("node:child_process").exec);

module.exports = {
    history: async data => {
      if (data.page.fileSlug !== "text") {
        const { stdout } = await exec(`git log --format=%H%n%h%n%cI%n%s%n ${data.page.inputPath}`);
        const history = stdout.trimEnd().split("\n\n").map(logEntry => {
          const [hash, shortHash, date, subject] = logEntry.split("\n");

          return {
            hash,
            shortHash,
            date: new Date(date),
            subject
          };
        });

        return history;
      }
    }
  }
};
```

### Reading time

I wanted to provide an indicator of length for the text content, so I used the [reading-time](https://github.com/ngryman/reading-time/) library to add a word count and estimated reading time. I really wanted to get as precise a word count as possible, so I chose to re-load the Markdown and use that as the starting point (after skipping any Front Matter), rather than process the Markdown content already rendered into HTML and try to remove the tags:

```js
const { readFile } = require('node:fs/promises');
const readingTime = require('reading-time');

module.exports = {
    stats: async data => {
      if (data.page.fileSlug !== "text") {
        const contents = await readFile(data.page.inputPath, { encoding: 'utf8' });
        const fragments = contents.split("---\n");

        const { words, minutes } = readingTime(fragments[fragments.length - 1]);

        return {
          words,
          minutes: Math.ceil(minutes)
        };
      }
    }
  }
};
```

Ideally I would be able to configure `markdown-it` to perform plain-text rendering with some additional tweaking such as completely ignoring codeblocks. I tried going through the documentation but could not find a suitable example to use as a starting point, I guess I'll need to look at some plugins or similar and see if I can figure it out. For the time-being this will have to do.

## Continuous Deployment

The `build-and-deploy` workflow handles continuous deployment to GitHub Pages, with a twist: The repository that hosts the actual GitHub Pages is not this repository, it's [causti-co/causti-co.github.io](https://github.com/causti-co/causti-co.github.io). So the deploy step is actually just pushing the latest static content into this repository, using [deploy keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys#deploy-keys):

```yaml
name: build and deploy

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
    - uses: actions/checkout@v4
      with:
        repository: causti-co/causti-co.github.io
        ssh-key: '${% raw %}{{ secrets.DEPLOY_KEY }}{% endraw %}'
    - uses: actions/download-artifact@v4
      with:
        name: dist-bundle
    - name: git config
      run: |
        git config --global user.name "${% raw %}{{ github.event.head_commit.author.name }}{% endraw %}"
        git config --global user.email "${% raw %}{{ github.event.head_commit.author.email }}{% endraw %}"
    - run: git add .
    - run: git commit -am "${% raw %}{{ github.event.head_commit.message }}{% endraw %}"
      continue-on-error: true
    - run: git push
```

We can use the event data provided by GitHub actions at `github.event.head_commit` to reuse the information from the latest commit of this repo when pushing to the deployment repository. Also, we want the `git commit` step to tolerate errors: This step will fail when the working tree is empty (e.g., when there's nothing to commit). This just means that whatever we changed had no effect on the generated content. This is not an error, and we do not want the workflow to fail and get paged.

So, why am I deploying to a different repository just to use GitGub Pages over there and not here? Because I really did not want to use `docs/` for GitHub Pages, and the only way I'd be happy with the static content sitting at the root of a repository is by having a dedicated repostory just for the static content.

Overall I'm happy with this approach, and from the point of view of this repository, we're 100% agnostic of GitHub Pages which makes it easier for me to change hosting providers in the future.

## What's next?

Well, I now have a personal website. The first priority will be to keep it fresh with content. I've a [backlog of content ideas](https://github.com/causti-co/website/blob/main/docs/ideas.md) (and as a matter of fact, it was [the first thing I did in this repository](https://github.com/causti-co/website/tree/26b720d50f9fea29dfd2bb140d6dd8e55a6c7b6e), even before starting with the design), that I'll be working through, and thanks to the drafts I can decouple authoring from publishing.

I'll try to keep to one text and one photo per week, and see how I feel with that rhythm.

Meanwhile, I've also a [backlog of website features](https://github.com/causti-co/website/blob/main/docs/todo.md) to work on whenever I get the urge to ship something before my next publishing date comes up. Lets see. So far, I've been having a blast. I hope you stay along for the ride.