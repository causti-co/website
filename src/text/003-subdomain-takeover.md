---
date: 2024-04-07
title: |-
  I was hacked!
keywords: [dns, github, subdomain takeover, psa]
---
Today I woke up with an email from the "Google Search Console Team" informing me that a new owner had been added for `http://ftp.causti.co/`. **Not cool.**

## WTF!?

First things first: I recognize the subdomain. It was provided by default, configured as a `CNAME` record pointing to `causti.co`, and I never gave it a second thought. **This will turn out to be my first mistake.** I immediately assume the worse and go check my DNS access rights and configuration. Everything looks good. No problems with my credentials, and the configuration looks good. I take the hint and enable 2FA, then keep digging.

Next I check with the Google Search Console, and after adding this specific URL as a property (which I can do since I own the TLD), I find the user entry created by the attacker. I can also see how they managed to verify ownership of their domain without having access to my DNS: Google lets you perform domain ownership verification by adding a `<meta name="google-site-verification" content="..." />` tag with a unique value.

With that clue, I check `http://ftp.causti.co/` with `wget` (maybe I should've done this in the first place...) and indeed, the attacker is hosting some scam website from that subdomain, so of course they are able to inject any HTML they want. I can delete their user from the Google Search Console, but they can just keep adding themselves until I fix the issue.

## How!?

So the attacker is serving content from one of my subdomains, but they did not compromise my DNS. Let's dig deeper. This website is hosted in GitHub Pages using an [apex domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain). This means `causti.co` resolves to an `A` record pointing to GitHub IPs. And if `ftp.causti.co` resolves to a `CNAME` pointing to `causti.co`, then it will also resolve to the same GitHub IPs. Indeed, I check the headers of the content coming from `http://ftp.causti.co/`, and it's being served by GitHub.

Now at least I understand what is going on. I immediately remove the DNS record for `ftp.causti.co`, and confirm there are no other similar unused subdomains that could be taken over in a similar way.

Searching for "github pages subdomain takeover" quickly lands me on the [can-i-cakeover-xyz](https://github.com/EdOverflow/can-i-take-over-xyz/issues/68) repository, discussing this exact kind of takeover. Here's what caught me off-guard: It seems that there are (at least) two separate domain ownership verification processes for GitHub, and I was foolish enough to assume they were related. They are not.

When I first created this website, I created a [GitHub Organization](https://github.com/causti-co), and while setting it up I had to [verify ownership](https://docs.github.com/en/organizations/managing-organization-settings/verifying-or-approving-a-domain-for-your-organization) of the `causti.co` domain. What I completely missed was the [second domain verification process exclusive to GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages#verifying-a-domain-for-your-organization-site).

**If you don't do this, anyone GitHub user can configure their repository to use one of your subdomains as a custom domain for their GitHub Pages, and GitHub will not perform any domain ownership verification.**

It was the combination of both mistakes that made the takeover possible.

## Welp

In retrospect, I'd say I got lucky. The attacker was greedy and wanted to get Google Search insights, which triggered the email that warned me something was off. If they hadn't, then I probably would not have noticed for Lord knows how long.

The overall lesson is clear: _It's always DNS_. I **knew** about that unused subdomain, I just falsely assumed it to be innocuous. I'll not be making that mistake in the future again.

As for GitHub, I'm still honestly surprised there's domain ownership verification by default when setting up a custom domain for GitHub Pages. That would be the definitive way to keep this from ever happening again. But until they take any actions, it's on ourselves to keep our stuff in order.