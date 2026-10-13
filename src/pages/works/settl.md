---
layout: ../../layouts/ProjectLayout.astro
title: 'Settl: Pricing a Bed in Seconds'
subtitle: Profit-safe price options for sales agents
tag: Client project · 180 Degrees
villager: python
facts:
  - { label: Role, value: Analyst }
  - { label: Team, value: 180 Degrees Consulting }
  - { label: Timeline, value: Feb – Apr 2025 }
  - { label: Impact, value: 50% less manual work · 30+ agents }
description: A full-stack pricing calculator that gives Settl's co-living sales agents tiered, profit-safe price options instead of manual math.
color: '#e6cf8f'
tags: [Python, Flask, SQL, JavaScript, Figma]
---

## Overview

Settl is an Indian co-living company with more than 3,400 apartments. Its sales agents priced each bed by hand, so prices varied from one property to the next, and agents had trouble balancing a competitive rate against profit targets. As an analyst on a 180 Degrees Consulting team, I helped build a full-stack calculator that gives agents ready-made price options. It cut manual calculation time by 50% for more than 30 agents.

An agent picks a property or micromarket, filters rooms, and enters a move-in date and tenure. The Flask backend looks up the property's gross margin, room category and tenure from cost data in SQL, and returns 2 or 3 price options tied to profit levels: 15% and 10% for properties under a 40% gross margin, plus a 5% option above it. Preferred rooms (balcony, attached washroom, high floor) add 2 points to every tier.

<figure class="flow" aria-label="Profit tiers by property margin">
<div class="tiers">
<div><span class="tier-title">Property margin under 40%</span><div class="tier-bars"><span class="tier-bar" style="--p: 15; --b: #b9d39a">15%</span><span class="tier-bar" style="--p: 10; --b: #f1df9f">10%</span><span class="tier-bar is-off">none</span></div><div class="tier-labels"><span>Option 1</span><span>Option 2</span><span>Option 3</span></div></div>
<div><span class="tier-title">Property margin over 40%</span><div class="tier-bars"><span class="tier-bar" style="--p: 15; --b: #b9d39a">15%</span><span class="tier-bar" style="--p: 10; --b: #f1df9f">10%</span><span class="tier-bar" style="--p: 5; --b: #f1c9b6">5%</span></div><div class="tier-labels"><span>Option 1</span><span>Option 2</span><span>Option 3</span></div></div>
</div>
<p class="flow-aside">Preferred room? <b>+2 points</b> on every tier.</p>
<figcaption>The profit level behind each price option. Thin-margin properties never get the 5% option.</figcaption>
</figure>

<figure class="shots">
<div class="shots-row">
<img src="/works/settl/mockup-search.webp" alt="Figma mockup of the Property Database screen: search by property name or micromarket, with filters for shared, preferred and layout" width="904" height="436" loading="lazy">
<img src="/works/settl/mockup-results.webp" alt="Figma mockup of search results: room cards with floor, balcony, washroom and occupancy details, and pricing options at 17% and 12% profit" width="908" height="436" loading="lazy">
</div>
<figcaption>Figma mockups: the search screen, and results with price options for each room. We checked them against Nielsen’s 10 usability heuristics before building.</figcaption>
</figure>

## A tradeoff I made, and why

**Fixed tiers instead of one "optimal" price.** The tool could have calculated a single best price per bed. Instead it returns 2 or 3 options tied to set profit levels. That gives up some precision, but agents keep room to negotiate, and even the lowest option is still profitable. Under a 40% margin, the 5% option disappears, so a thin-margin property can't be discounted below its floor.

**Rules a sales lead can read.** Every price comes from a short rule: margin band, room type, tenure, plus 2 points for a preferred room. An agent or manager can check a number by hand, which matters more for adoption than a cleverer model nobody trusts.

## What I learned

- **Usability checks before code save rework.** Reviewing the Figma screens against Nielsen's heuristics caught problems while they were still cheap to fix.
- **A simple rule people trust beats a smart one they don't.** Sales agents adopt a tool they can explain to a customer.
