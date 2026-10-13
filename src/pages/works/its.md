---
layout: ../../layouts/ProjectLayout.astro
title: 'U-M ITS: Systems Analyst Intern'
subtitle: Legacy-system RFPs and PM template fixes
tag: Internship · U-M ITS
villager: owl
facts:
  - { label: Role, value: Business Systems Analyst Intern }
  - { label: Team, value: ITS Infrastructure }
  - { label: Timeline, value: May – Aug 2025 }
  - { label: Led, value: 7-person intern cohort }
description: Requirements and RFPs to replace a legacy billing system at University of Michigan ITS, plus a cohort project making project management templates accessible and AI-readable.
color: '#d4b3d1'
tags: [Requirements gathering, RFPs, Accessibility (WCAG), Process mapping, Stakeholder interviews]
---

## Overview

I spent Summer 2025 as a Business Systems Analyst intern on the Infrastructure team at University of Michigan Information and Technology Services (ITS), working on two projects.

### 1. Replacing Pinnacle

ITS uses Pinnacle for billing and work orders. It is past the end of its service life and raises security concerns. With another intern, I drafted the two Requests for Proposals (RFPs) that vendors will bid on to replace it: one for billing, one for work order management.

I spent about two months on the current state: interviewing Pinnacle's users, reading its process docs, and testing it hands-on in the dev environment. We then turned those findings into requirements with procurement and project management, and revised the drafts with stakeholders. Along the way I made flowcharts, SWOT analyses and current-state tables the team can reuse to evaluate vendors.

### 2. Making PM templates accessible and AI-readable

I led a 7-person intern cohort with the ITS Project Management Office (PMO), as the team's project manager and liaison. We scored the PMO's templates for accessibility with Grackle (built on WCAG and PDF/UA), scored how well the PMO's Maizey chatbot could read them, and interviewed the PMO and EAS staff who use them. Results on the three most-used templates:

<figure class="flow" aria-label="Improvement on the three most-used templates">
<ul class="chart-legend"><li style="--b: #c4dbe8">Accessibility (Grackle)</li><li style="--b: #e2cde0">AI usability (Maizey)</li></ul>
<ul class="bars">
<li><span class="bar-name">Charge Document</span><span class="bar-pair"><span class="bar" style="--v: 10; --b: #c4dbe8">+10%</span><span class="bar" style="--v: 52; --b: #e2cde0">+52%</span></span></li>
<li><span class="bar-name">Project Closing</span><span class="bar-pair"><span class="bar" style="--v: 15; --b: #c4dbe8">+15%</span><span class="bar" style="--v: 33; --b: #e2cde0">+33%</span></span></li>
<li><span class="bar-name">Lessons Learned</span><span class="bar-pair"><span class="bar" style="--v: 15; --b: #c4dbe8">+15%</span><span class="bar" style="--v: 21; --b: #e2cde0">+21%</span></span></li>
</ul>
<figcaption>Improvement on the PMO’s three most-used templates after our changes.</figcaption>
</figure>

## What I tried that didn't work

- **Learning Pinnacle from documentation.** It only made sense once I tested it directly: duplicated pages, empty reports, unused filters, and records missing receipt numbers. Next time I'd start hands-on testing much earlier.
- **Treating the PMO's website as the source of truth.** Interviews showed most long-time staff had copied the templates into their own Drives years ago. Fixing a template doesn't help if nobody opens the new version, so findability became part of the project.
- **Assuming people would find an AI helper.** The PMO already had a Maizey PM Coach chatbot, but even the PMO team didn't know it existed. Instead of building something new, we proposed three ways to place it where people would see it.

## A tradeoff I made, and why

**Interviews before edits.** The fastest path was to fix whatever Grackle and Maizey flagged. But a score can't tell you whether a change makes a template harder to use. Interviewing staff first cost time on a ten-week schedule, and it's why we focused on the three templates people use most instead of spreading thin.

**Recommendations over a finished redesign.** For the Maizey Coach we gave the PMO three placement options, each trading visibility against keeping the page as it is. The PMO knows its users better than a summer team, so we laid out the tradeoffs and let them choose.

## What I learned

- **Talk to users before you fix anything.** Our biggest finding, that people use their own copies of templates, came from interviews, not a scoring tool.
- **Being discoverable is part of the product.** A good tool nobody can find does nothing.
- **Legacy systems teach you through testing.** The docs said what Pinnacle should do; testing showed what it actually did, which is what an RFP has to replace.
- **Leading peers is about structure.** Running a cohort of seven meant breaking accessibility and AI into tasks people could own, with clear milestones.
- **Writing is an engineering skill.** RFPs decide which system a university runs for the next decade, so clarity matters as much as accuracy.
