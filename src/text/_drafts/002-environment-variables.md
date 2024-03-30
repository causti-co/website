---
date: 2024-04-02
title: We need to talk about environment variables
keywords: [development, devops]
---
I've been delivering different versions of this rant over the past decade to whomever was there to hear. And seeing as people are still not getting the point, as exemplified by projects like [@dotenvx/dotenvx](https://github.com/dotenvx/dotenvx), [joho/godotenv](https://github.com/joho/godotenv), or [theskumar/python-dotenv](https://github.com/theskumar/python-dotenv), etc., it looks like it's time I get this down in written form.

Then at least I can start linking people to here rather than having to repeat myself again. And again. And again.

## TL;DR

`.env` files are an implementation detail of _your_ environment. **Nothing** in your project should care or know that `.env` files exist. If you want to use `.env` files, then you need to: 1/ Add `.env` to your global `~/.gitignore` file, and **never** to a project's `.gitignore` file. 2/ Configure **your environment** to load `.env` files (for example, using [hyperupcall/autoenv](https://github.com/hyperupcall/autoenv)), and **not** your project.

## Variables of the Environment

As a developer, you get exposed to environment variables out of necesity. They are not usually a thing that you need to care about until the first time you encounter a tool or program that is sensitive to the environment, or that expects to get configured via environment variables. So you start digging. You see that your shell seems to have a set of variables. You can list them with `printenv`. You recognize some of this stuff. You remember how some tools wanted you to add stuff to this `PATH` variable, and you see the stuff you added. Other stuff seems alien, and you have no clue where it's coming from. You can print a variable with `echo $VARIABLE`, so you figure you can use them in your shell scripts. You learn you can set new ones, and even pass additional variables to your shell scripts when you run them: `NEW_VAR=hello ./myscript.sh`. You learn that these variables are accessible to all programs you run from your shell, not just other shell scripts. You learn that this whole "environment variables" thing is actually quite old, and supported across all major platforms.

And before you know it, you have a new tool in your toolbox.

## Prepare for trouble...

So you use it. You want your programs to be cool programs that can be configured via environment variables. You've seen other do it: that's how you learned about environment variables in the first place. You learn about [The Twelve-Factor App](https://12factor.net/config), and how "The twelve-factor app stores config in environment variables", and your start passing all kinds of configuration to your application via environment variables.

At this point I need to stop what I'm doing and tell you to: Please don't. Configuration files are a good thing. They exist for a good reason. If you expect different environments to place their configuration files at different locations, then it makes sense to configure _the path from where to load configuration files_ via environment variables. But I don't have time for that discussion now, there's more important things I want to get to.

Regardless of whether it makes sense or not, the point is that by now you're writing applications that need to get configured via environment variables. So you need to set some environment varibles. So far you've seen how to pass values manually, and how to set them in your current shell, but you don't want to be doing this every time you're writing some code. There has to be a way to set environment variables once in a single place, and have them be available every time you open a new shell. And sure, there is, and you've done this already: your shell's rc file (`~/.bashrc`, `~/.zshrc`, etc.). But this feels... _wrong_... right? It feels weird having to go and edit a global file with project-specific configuration. And if you ever need to provide two projects with different values for the same variable, you're shit out of luck.

_There has to be a better way..._

## ...and make it double

So you learn about `.env` files. You find some convenient library for your either language of choice or JavaScript, add a couple of lines to your project, and that's it. It loads yout `.env` files and the rest just works. Don't forget to add your `.env` to your project's `.gitignore` file, you don't want to be committing any secrets, now, do you?

And it is quite likely that this is where your story ends, and that you never run into issues with this.

`.env` in prod
can you be certain your env variables reach your app?
you just invented configuration files, use a config file instead
`.env` used properly is quite good, actually. so just do it properly.

maybe add a few words about your "runtime environment" somewhere?