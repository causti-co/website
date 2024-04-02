Design
  Review padding at the bottom of each section

  Flexbox for the Detailed Photo Footer

  Photo Details page w/ additional information
    exif dates

  Home Page
    Include latest updates

  Gallery navigation
    i.e., previous/next photo buttons

  Responsive Design
    Mobile / Small Screens

    Migrate font sizes from `em` to `rem`
      It will be easier to start from the most nested elements outwards, because then we don't have to deal with cascading changes

    Home & Photo are using a fixed-height header in the calc, but the actual header is dynamic based on content size.

  "New content" indicator, somehow?
    or maybe just freshness?

  Syntax Highlighting, whenever we first need it
    Then we will probably want to tweak it a bit e.g. to specify starting  line number
    https://www.11ty.dev/docs/plugins/syntaxhighlight/

  Wordcount/Read time
    Think abour redesigning this...

  Backlinks
  References/Footnotes
  
  Revision/Page History
    Last Updated date
    Links back to github

    We need to find a place to put this...
      commit history for file
        https://github.com/causti-co/website/commits/c153a1024f3caa5a9f03af335158736d1ba03c58/src/text/001-logarithmic-age.md
      view file contents at specific commit
        https://github.com/causti-co/website/blob/c153a1024f3caa5a9f03af335158736d1ba03c58/src/text/001-logarithmic-age.md
      view contents of specific commit
        https://github.com/causti-co/website/commit/c153a1024f3caa5a9f03af335158736d1ba03c58
      github landing page at specific commit
        https://github.com/causti-co/website/tree/c153a1024f3caa5a9f03af335158736d1ba03c58

      edit file
        https://github.com/causti-co/website/edit/main/src/text/001-logarithmic-age.md
  
  Global Content Statistics
  Keyword Collections
  Privacy Notice...

  Provide some variables that give information as to the kind of page being rendered
    i.e., is it a text? a photo? is a single, a list?
    I need this accesible from the _index layout
    And maybe we could re-access this data from the computed properties, where we're currently checking this a bunch
      then we have this logic in a single place, and use the computed results elsewhere

Chores
  sitemap.xml
  RSS feed
  Consider hosting somewhere else so i can get some non-cookie-requiring statistics?