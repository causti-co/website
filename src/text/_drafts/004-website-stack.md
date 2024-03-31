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

A few decisions I made at this stage: 1/ No 3rd party resources, 2/ Don't do anything that would require a cookie banner, 3/ Avoid JS as much as possible.

## 11ty

Since I wanted to keep things as simple as possible, a "traditional" n-tier stack was absolutely out of the question. The alternative was to use a static site generator. After reviewing the most popular choices, I settled for [11ty](https://github.com/11ty/eleventy/) as it appeared to be the least opinionated one of the bunch, allowing me to start with an empty directory and slowly bring content and complexity in as needed. I followed my traditional approach of reading the entire docs to figure out what it can and cannot do before getting to adapting my static content to [nunjucks](https://mozilla.github.io/nunjucks/). I chose nunjucks simply because it was the default templating language used in the documentation.

I decided to manually number content items by adopting the following naming convention: `###-desired-content-url.ext`, and to manually provide content dates via Front Matter data, rather than use the mechanisms provided by 11ty based on either filesystem or Git dates.

My first challenge was implementing the "group by month+year" feature I had mocked up for the [text](/text/) section. Lucky for us, 11ty lets you do a lot of pre-processing to prepare the right data structures you need in your templates using JavaScript, so I used [lodash](https://lodash.com/) to do the grouping for me.

```js
eleventyConfig.addCollection("textByMonth", (collection) => {
  const pad = number => ("0" + number.toString()).slice(-2);
  const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  return _.chain(collection.getFilteredByTag("text").reverse())
    .groupBy(text => {
      let date = text.page.date;

      return `${month[date.getUTCMonth()]}${pad(date.getFullYear())}`;
    })
    .toPairs()
    .value();
});
```

This code is fragile: 1/ It depends on the collection being sorted by creation date in ascending order (before we reverse it). 2/ It depends on traversal order as specified by ECMAScript. But since I'm in full control of the environment where this code runs (either my laptop or the CD environment), I'm ok with this. The alternative would be to group by a key that is sortable, sort the resulting array by this key, then map this key back to a human-readable value. No reason to make things more complex than they need to be.

exif-data

markdown for content

continuous deployment
  drafts

image processing

sass

safe links