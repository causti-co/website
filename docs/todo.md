Sass?
  https://github.com/kentaroi/eleventy-sass
    rather than
      https://www.11ty.dev/docs/languages/custom/

Make Photo in Home Page link to the respective photo?

Add build information
  https://www.aleksandrhovhannisyan.com/blog/eleventy-build-info/

performance optimization
  minify css
  size images
    https://developer.chrome.com/docs/lighthouse/performance/uses-responsive-images/
  transform all to webp?
    https://www.11ty.dev/docs/plugins/image/
      this does its own processing, and generates output files that need to be placed correctly
      this means that if you use this, it makes no sense to copy the original files, unless you link to them outside of the <img> tag, which looks like this

      i think the better approach would be to add a data processing step to the images-as-data routine, enforce our own naming convention, then use our own shortcode to generate the <img> tags
      but first i need to learn how these sizes work...

      <img alt="A textual description of this photo" loading="lazy" decoding="async" src="/assets/photo/cdt3nN7VBm-300.webp" width="1905" height="1905" srcset="/assets/photo/cdt3nN7VBm-300.webp 300w, /assets/photo/cdt3nN7VBm-600.webp 600w, /assets/photo/cdt3nN7VBm-1905.webp 1905w" sizes="(min-width: 30em) 50vw, 100vw">

Easter Eggs...

Open Graph headers for the different content pages
  Text
  Photo

  Also get the Last Photo as the OG photo for non-photos...
  ... and test how this whole thing works, before actually bothering with it, tbh...

consider hosting somewhere else so i can get some non-cookie-requiring statistics?