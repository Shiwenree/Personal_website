---
layout: ../../layouts/ProjectLayout.astro
title: 'Atlas Digital: Email Generator'
subtitle: Finds recruiters and drafts the email
tag: Club tool · Atlas Digital
villager: fish
facts:
  - { label: Role, value: Front-end developer }
  - { label: Team, value: 7 · Atlas Digital }
  - { label: Timeline, value: Jan – Apr 2025 }
  - { label: Impact, value: 100+ members · +40% follow-ups }
description: An email tool in Atlas Digital's member portal that finds recruiters for a company and drafts personalized outreach emails.
color: '#9fd0cf'
tags: [React, Tailwind CSS, Firebase, OpenAI API, Apollo API]
---

## Overview

Atlas Digital is a student tech consulting club at the University of Michigan, and recruiting is a big part of what its members do. Reaching out meant finding the right recruiter for each company, then writing a fresh email every time. A 7-person team built an email tool into the club's member portal; I was one of five software analysts and built the front end in React and Tailwind CSS. It now serves 100+ members and raised recruiter follow-up rates by 40%.

<figure class="shots" aria-label="The email generator in use">
<div class="shots-row">
<div class="shot-step"><span><b>1</b>Answer a few questions</span><video src="/works/email/form.mp4" poster="/works/email/form.webp" width="1280" height="636" autoplay muted loop playsinline preload="metadata" aria-label="A member types a company and role, then picks an email template"></video></div>
<div class="shot-step"><span><b>2</b>Pick a recruiter</span><video src="/works/email/recruiters.mp4" poster="/works/email/recruiters.webp" width="1280" height="636" autoplay muted loop playsinline preload="metadata" aria-label="The dashboard, then a table of recruiters at the company with keywords like alumni and role"></video></div>
<div class="shot-step"><span><b>3</b>Review the email before it sends</span><video src="/works/email/email.mp4" poster="/works/email/email.webp" width="1280" height="636" autoplay muted loop playsinline preload="metadata" aria-label="Clicking a recruiter opens a generated email to review and edit"></video></div>
</div>
<figcaption>The front end I built, shown with placeholder recruiters.</figcaption>
</figure>

Behind the screens, the backend checks Firestore for recruiters already saved for that company and only calls the Apollo.io API when there are none. The OpenAI API fills one of our researched templates (cold outreach, follow-up and more) with the member's answers, and Resend sends the email once the member has reviewed it.

## What I tried that didn't work

- **Copying code from other pages.** I started by reusing components and styling from existing portal pages. It piled up CSS I didn't understand, so I deleted it and rebuilt each component from scratch. The front end got cleaner and easier for the backend team to connect to.
- **Calling Apollo every time.** Apollo charges per search, so every lookup cost money. We switched to checking our own database first and calling Apollo only for companies we hadn't seen.

## A tradeoff I made, and why

**Our own database over always-fresh data.** Stored contacts go stale as recruiters change jobs, but Apollo cost about $60 a month. Every company searched adds recruiters to the database, so over time the tool needs Apollo less and less.

**Review before sending.** The tool could send AI-written emails straight away. We put every email on a review page first: an email with a wrong name going to a recruiter is worse than an extra minute.

## What I learned

- **Understand code before you reuse it.** Rebuilding from scratch was slower at first, but I understood every piece, and so did my teammates.
- **Cost is a design constraint.** Paying per API call shaped the whole architecture.
- **Keep secrets on the server.** A small Express proxy keeps API keys out of members' browsers.
- **Leave a human in the loop for AI writing.** Generated emails are a fast first draft, not the final version.
