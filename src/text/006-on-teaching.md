---
date: 2024-04-26
title: Thoughts on teaching
keywords: [education, debugging, solution architecture]
description: >-
  i would be so happy,
  if i were a teacher.
  but i'd be broke.
  somehow what i do now is more important
  to society.
---
I guess most people don't know, but a for a few years before moving to Germany I was a member of the [Argentinean Socialist Party](https://www.partidosocialista.org.ar/). There's some fun stories of _light political vandalism_ to be told, but I'll save those for another time. The main thing I did as a party member was provide [remedial education](https://en.wikipedia.org/wiki/Remedial_education) to whomever would show up at the local party office every Saturday afternoon, which would be a mixture of children currently at elementary or high school, as well as older people going through [adult education](https://en.wikipedia.org/wiki/Adult_education), mostly high-school.

It was usually me and one or two more tutors, and we would pick up whichever topic was needed: mathematics, physics, chemistry, history, grammar, you name it. And we're talking remedial education, so these were not students who were cruising through their classes, rather the opposite. They were usually struggling, and their families were not able to afford a private tutor. Needless to say, I have absolutely no training as an educator, but I was willing to admit my ignorance and use it as a starting point to learn.

## There are no stupid students

My main take-away was that there is no such a thing as a stupid student. There is such a thing, however, as a horrible teacher. The one thing that every single person I tutored was in dire need for, was time. Having someone sit next to them, engage with them as they solve a problem, ask them to guide you through their actions and though process, and take the time to understand how they see things. And that was mostly all I had to do, offer them my time.

By sitting next to them, I noticed an interesting thing: These people rarely made any _mistakes_. By this I mean things like "forgetting" to carry over a minus sign from a previous line or silly things like that. These were universally scarce, and all you had to do was point them out. Once you did, they were as obvious to them as they were to me.

But they were still getting the answers to their exercises wrong.

Not because they were making mistakes, but because they were operating logically and rationally based on a model of the world that was no longer sound. They had allowed a single falsehood to ingrain itself into their model of the world, and none of their teachers was able to notice and correct this in time.

That became my job. Sit next to them, let them work through a problem, and whenever I spotted something that was off, start working backwards until I could finally arrive to this single falsehood and correct it. And then, it's as if you had suddenly removed stone that was jamming a gear mechanism. Everything else suddenly clicks into place, and all of a sudden they are getting all the exercises right (And if you're thinking "Hey, that sounds an awful lot like debugging code" then you'll most likely enjoy my upcoming article on debugging).

Imagine how frustrated you would feel if you did everything you thought was right, and still arrived at an incorrect result, and got absolutely no feedback as to why or how to address it, only that you got it wrong and you suck.

## Work is not that different

At this point in my career, I'm mostly paid to write and talk to people. And some of the people I have to talk to are wrong. Now, here's a funny thing about people for all the non-humans out there reading this: People **really do not like** being told they are wrong. Luckily, many of the things we just mentioned are still valid in this context.

People who are wrong, for the most part, are not making _mistakes_ when they arrive to a wrong conclusion. They are acting logically and rationally, but there's something in their model of the world that is off. There are a couple of differences that we need to account for, however.

First, unlike students, these people are not in the room with me _to be taught_. In the best case they are looking for advice as peers, and in the worst case they think I'm there to try and sell them something. So even if I can identify the falsehood in their world model, I need to guide them into noticing it themselves, rather than pointing it out directly. Otherwise, they'll most likely reject it. I'd say that this feels more like therapy, but my understanding of therapy is based purely on [US fiction](https://tvtropes.org/pmwiki/pmwiki.php/Main/HollywoodPsych).

Second, **they might actually be right**. When a student makes a mistake, there's usually no room for debate. But in this case, I always have to entertain the notion that it might be me who is wrong. I'm not _that_ full of myself. This is also inherently a good thing: It's how I grow. I am my worst, most relentless critic, and this helps keep myself in check.

A framework I've found incredibly helpful in both helping me explore the possibility that I might be wrong, as well as helping me identify the potential falsehood in someone's world model, is to honestly ask myself:

> What do they know that I don't know?

What vital piece of information am I missing, that where I to add it to my own world model, would cause me to arrive to the same conclusion as they are?

Work backwards from their apparently wrong conclusion, applying logic and reason, and reverse-engineer a path to the knowledge that you might be lacking. If you're only going to take one thing away from this article, this should be it.

There's another silly anecdote that comes to mind about the multiple choice exams I had to take for my introductory [Algebra](http://www.mate.cbc.uba.ar/27/teoricas.htm) and [Calculus](http://www.mate.cbc.uba.ar/66/teoricas.htm) courses, but that too will have to wait for another time.