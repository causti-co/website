WORKING ON RIGHT NOW
  review passthrough copy and shit for graph
    i dont think we will need this unless we decide to delete/rename legacy stuff
  add general menu to editor/detail view?
    for the moment we added backlink to /graphs/ in the logo

  add <audio> to sound feed and in all feed for sound items?
  extend legacy editor so i can migrate the other 6 legacy graphs?


BUG REPORT
  Photo 016 does not load ISO correctly, renders as `[Object object]` on the list view.
  Set a manual override via Markdown, delete to reproduce.

STUFF THAT I CAN WORK ON RIGHT NOW
  Global Content Statistics
    % in Header Action

  Privacy Notice
    § in Header Action

  TEXT
    A way to build a list of important resources from the links spread throughout the article.
    This would basically be a "references" section, I guess. But I think I want to either selectively put links there, or at least be able to highlight some from the others.

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
      these go at the bottom of the article

    Last Updated date
      Lets park this one until we actually have to revise an article and make this be known
      For the time being we have the git history which provides this info anyway

    Keyword Collections
      Could be an alternative view within /texts/, accessible from within /texts/
      https://www.webstoemp.com/blog/basic-custom-taxonomies-with-eleventy/


STUFF THAT I MIGHT WANT TO CONSIDER EVENTUALLY
  hosting somewhere else so i can get some non-cookie-requiring statistics?


I DELETED THE CODE THAT GENERATES THE PNGs FOR THE GRAPHS. THE GRAPHS ARE THERE BECAUSE THEY ARE THERE FROM A PAST BUILT, AND ONE OF THEM IS REFERENCED IN THE OG DATA


TO CLASSIFY
  inner links
    in recs, to specific recs
    in recs, to specific months
    in texts, to specific months