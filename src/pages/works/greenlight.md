---
layout: ../../layouts/ProjectLayout.astro
title: 'GreenLight: Engagement Tracker'
subtitle: Turning relationship work into a system
tag: Client project · 180 Degrees
villager: foxy
facts:
  - { label: Role, value: Co-lead }
  - { label: Team, value: 6 · 180 Degrees Consulting }
  - { label: Timeline, value: Feb – Apr 2026 }
  - { label: Delivered, value: 2 playbooks + web app }
description: Playbooks, a survey strategy and an engagement tracker web app that turn GreenLight Fund Detroit's relationship work into a system a small team can run.
color: '#b9c99a'
tags: [React, Supabase, Tailwind CSS, Figma, Project management]
---

## Overview

GreenLight Fund Detroit invests in nonprofits that tackle local social challenges. Its relationships with investors, residents, philanthropic partners and government lived mostly in people's heads. I co-led a 6-person 180 Degrees Consulting team to turn that work into a system, and to build the tools to run it.

<figure class="flow" aria-label="What we delivered">
<ul class="tiles">
<li style="--c: var(--c-input)"><span class="tile-num">01</span><span class="flow-kicker">Playbook</span><span class="flow-name">Community Engagement</span><span class="flow-note">Current practice vs. trust-based philanthropy and collective impact, with Detroit case studies</span></li>
<li style="--c: var(--c-filter)"><span class="tile-num">02</span><span class="flow-kicker">Playbook</span><span class="flow-name">Investor Stewardship</span><span class="flow-note">An investor lifecycle from prospecting to stewardship, benchmarked on the Veritus Group model</span></li>
<li style="--c: var(--c-result)"><span class="tile-num">03</span><span class="flow-kicker">Plan</span><span class="flow-name">Community survey</span><span class="flow-note">Resident-led, 3-minute mobile surveys, a $50 raffle, and a 30-day “You Spoke, We Listened” report</span></li>
<li style="--c: var(--c-sort)"><span class="tile-num">04</span><span class="flow-kicker">Web app</span><span class="flow-name">Engagement Tracker</span><span class="flow-note">Log investor, community, philanthropic and government interactions, track follow-ups, and run reports</span></li>
</ul>
<ol class="track">
<li style="--c: #d4b3d1"><b>Figma</b>prototype</li>
<li style="--c: #a9c4d6"><b>React 18</b>Tailwind, Recharts</li>
<li style="--c: #b9c99a"><b>Supabase</b>login and data</li>
<li style="--c: #e6cf8f"><b>Vercel</b>hosting</li>
<li style="--c: #e9b49a"><b>Handoff</b>guide and repo</li>
</ol>
<figcaption>What we delivered, and how the tracker went from prototype to handoff.</figcaption>
</figure>

## What I tried that didn't work

- **Testing charts with clean sample data.** Tidy test data made every chart look right. We wrote data designed to break them instead: empty periods, missing fields and edge-case values. That found problems ordinary data hid.

## A tradeoff I made, and why

**Managed services over custom infrastructure.** Supabase and Vercel limit how far the tracker can be customized. But GreenLight is a small team without engineers, and they had to keep it running after we left. Login, the database and hosting are handled for them.

**Short surveys over complete ones.** A 3-minute survey collects less than a long one, but a survey residents never finish collects nothing. So we kept it short, made the surveyors residents, and promised a report back within 30 days.

## What I learned

- **As a project manager, scope is the job.** Two playbooks, a survey strategy and a working app in about ten weeks only fit because the plan was broken down week by week from the start.
- **Build for whoever runs it next.** What the client can maintain mattered more than what was most interesting to build.
- **Prototype before you code.** Agreeing on the Figma prototype first meant the build was about doing, not debating.
- **Test data should try to break things.** Data written to find edge cases is worth more than data that makes the demo look good.
