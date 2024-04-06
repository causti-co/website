STUFF I SHOULD FOCUS ON INSTEAD OF DOING OTHER THINGS
  Responsive Design
    Mobile / Small Screens
      1. Use the right settings and calc, not just hardcoded coords.

      3. Once we're done, we need to recompute responsive img sizes attributes
        The extension breaks if the website uses media queries, which kind of defeats the purpose xD
        So I eyeballed the home/photo ones

    2. Home & Photo are using a fixed-height header/footer in the calc, but the actual header/footer is dynamic based on content size.
      Just measure again and call it a day. We now have a media query which switches to absolute positioning, after which point we're no longer using this fake height anyway

STUFF THAT I CAN WORK ON RIGHT NOW
  Global Content Statistics
    % in Header Action

  Privacy Notice
    § in Header Action

STUFF THAT CAN WAIT UNTIL I HAVE MORE CONTENT
  HOME
    Include latest updates
      Park this until a month in or so, when we would have enough content to consider it
      Either way, the collection is already up, `contentAll`.

    "New content" indicator, somehow?
      or maybe just freshness?
        The design part is easy, but...
        Would require Browser-side JS, or a scheduled build just to re-generate this information statically every day

  PHOTO
    Gallery navigation
      We need to display three buttons: prev/index/back
      most likely in a box floating above the menu
      but maybe attached to the photo box?
        try it out, see how it looks

    Photo Details page w/ additional information
      exif dates (shot , edited)
        I still struggle with the design for this...

  TEXT
    Backlinks
    References/Footnotes
      these go at the bottom of the article

    Last Updated date
      Lets park this one until we actually have to revise an article and make this be known
      For the time being we have the git history which provides this info anyway

    Keyword Collections
      Could be an alternative view within /texts/, accessible from within /texts/
      https://www.webstoemp.com/blog/basic-custom-taxonomies-with-eleventy/


STUFF THAT I MIGHT WANT TO CONSIDER EVENTUALLY
  hosting somewhere else so i can get some non-cookie-requiring statistics?