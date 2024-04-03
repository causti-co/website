---
date: 2024-04-02
title: |-
  We need to talk about: Environment variables
keywords: [development, devops, wntta]
description: >-
  do you ever think about the environment?
  what it is, and also, what it isn't.
  convenience is good.
  convenience can be dangerous.
  we need to talk.
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

At this point I need to stop what I'm doing and tell you: Please don't. Configuration files are a good thing. They exist for a good reason. If you expect different environments to place their configuration files at different locations, then it makes sense to configure _the path from where to load configuration files_ via environment variables. But I don't have time for that right now, there's more important things I want to get to.

Regardless of whether it makes sense or not, the point is that by now you're writing applications that need to get configured via environment variables. So you need to set some environment varibles. So far you've seen how to pass values manually, and how to set them in your current shell, but you don't want to be doing this every time you're writing some code. There has to be a way to set environment variables once in a single place, and have them be available every time you open a new shell. And sure, there is, and you've done this already: your shell's rc file (`~/.bashrc`, `~/.zshrc`, etc.). But this feels... _wrong_... right? It feels weird having to go and edit a global file with project-specific configuration. And if you ever need to provide two projects with different values for the same variable, you're shit out of luck.

_There has to be a better way..._

## ...and make it double

So you learn about `.env` files. You find some convenient library for your either language of choice or JavaScript, add a couple of lines to your project, and that's it. It loads your `.env` files and the rest just works. Don't forget to add your `.env` to your project's `.gitignore` file, you don't want to be committing any secrets, now, do you?

Let's quickly recap what you just did: 1/ You externalized your application's configuration to environment variabkes. 2/ You've introduced a convenient way to load a configuration file into your environment variables. Do you think you'll be strong enough to restrain yourself from using `.env` files in prod? You won't. The alternative would most likely feel clunky in comparison. Why would you store your configuration somewhere else?

Even if _you_ don't use a `.env` file in production, you're going to want to be **sure** that there is no `.env` file there. Otherwise, you might end up in a situation where you're properly providing a value via environment variables, only to have this value overwriten by a `.env` file that should not be there. And by this point it should be quite clear that what you've done is reinvent configuration files, except you're restricting yourself to key-value pairs, and forcing your configuration through the "API" of environment variables for no good reason.

In the process, you've made your application no longer environment-agnostic. You've made it aware of the specific details of your development environment, and potentially carried that into other environments.

## Doing it the right way

I've already mentioned that there are some inherent issues with (ab)using environment variables to configure your applications, and will pick this up again once we're done here, but let's not question that for the moment, and assume that you're using environment variables correctly, and still want a way to conviniently configre your local environment on a per-project level. `.env` files can be great at that. You just gotta approach it correctly.

This is going to be an implementation detail of your environment. Whatever you do, your application should not have to know or care.

### Add `.env` to your global `~/.gitignore` file

You don't want to commit `.env` files, but you also don't want to configure this on a per-project basis. Ignore them globally and forget about them.

### Source `.env` files in your shell

You can load `.env` files by sourcing them in your shell (`source .env`). Even better, you can automate this process with the approrpiate tooling. I use [hyperupcall/autoenv](https://github.com/hyperupcall/autoenv) to automatically load `.env` files when changing directories.

Congratulations! You're now using environment variables correctly. You have a convenient way of configuring your local environment, that does not propagate to other environments. If you want to provide values on a different environment, you'll need to follow that environment's best practices.

## Please don't

While I have you here, a couple more things.

You do know that environment variables are global to your process, right? Say you're a node developer. There's nothing that keeps code in `node_modules/nonsuspicious-library/index.js` from peeking at `process.env.AWS_ACCESS_KEY_SECRET`. You don't need to grant it permission. You won't get a notification. It just can. I assume you've already considered this attack vector. Right?

Also, you do know there's a world out there besides key=value pairs, right? If you find yourself doing stuff like `GALACTUS_SERVICE_HOSTNAME`, `GALACTUS_SERVICE_PORT`, `GALACTUS_SERVICE_VERSION`, etc., you probably want to stop what you're doing and go define a configuration file.

And please, **please** don't do stuff like this. This is real code from a project that shall remain nameless:

```json
{
  "name": "@unfortunate/developer",
  "version": "4.2.0",
  "scripts": {
    "serve:dev": "ELEVENTY_ENV=development eleventy --serve",
    "serve:prod": "ELEVENTY_ENV=production eleventy --serve",
    "build": "ELEVENTY_ENV=production eleventy",
    "build:dev": "ELEVENTY_ENV=development eleventy"
  }
}
```

I know this stuff looks super convenient, helpful, intuitive, innocent, you name it. But trust me, when you're running `ELEVENTY_ENV=development npm run build` and you can't for the life of you figure out why `console.log(process.env.ELEVENTY_ENV)` prints `'production'`, you're going to want to have a word with whomever wrote those npm scripts.

## Foreword

Environment variables are fine, as long as they are the right tool for the job. But for anything even slightly more complex than just a few strings or numbers, you really want to be looking at configuration files. It's 2024, let's be honest: you're containerizing and deploying this onto Kubernetes. You do know that Kubernetes lets you inject configuration and secrets into your containers, not only as environment variables, but also as files, right? You have no excuses here.

Rant over.