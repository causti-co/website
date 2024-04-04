Design
  2. Flexbox for the Detailed Photo Footer

  Responsive Design
    Mobile / Small Screens

    3. Migrate font sizes from `em` to `rem`
      It will be easier to start from the most nested elements outwards, because then we don't have to deal with cascading changes

    Home & Photo are using a fixed-height header in the calc, but the actual header is dynamic based on content size.

  Home Page
    Include latest updates
      Park this until a month in or so, when we would have enough content to consider it
      Either way, the collection is already up, `contentAll`.

  NEEDS DESIGN, PHOTO
    Gallery navigation
      We need to display three buttons: prev/index/back
      most likely in a box floating above the menu
      but maybe attached to the photo box?
        try it out, see how it looks

    Photo Details page w/ additional information
      exif dates (shot , edited)
        I still struggle with the design for this...

  NEEDS DESIGN, TEXT
    Backlinks
    References/Footnotes
      these go at the bottom of the article
    
    Last Updated date
      Lets park this one until we actually have to revise an article and make this be known
      For the time being we have the git history which provides this info anyway

  NEEDS DESIGN, INDEX:
    Global Content Statistics, %
      Header Action
    Privacy Notice §
      Header Action
    Keyword Collections
      Could be an alternative view within /texts/, accessible from within /texts/
      https://www.webstoemp.com/blog/basic-custom-taxonomies-with-eleventy/

    "New content" indicator, somehow?
      or maybe just freshness?
        The design part is easy, but...
        Would require Browser-side JS, or a scheduled build just to re-generate this information statically every day

  404 page
    Some kind of full-screen image background with some text and a link to the main or something
    Basically an independent layout from the rest of the site
      Could be generated from the latest content?

  Somehow make it work?
    https://www.causti.co/


Chores
  Consider hosting somewhere else so i can get some non-cookie-requiring statistics?