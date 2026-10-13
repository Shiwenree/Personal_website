---
layout: ../../layouts/ProjectLayout.astro
title: Circular Action Alliance
subtitle: LLM checks on self-reported packaging data
tag: Client project · Atlas Digital
villager: duck
facts:
  - { label: Role, value: Lead Analyst }
  - { label: Team, value: 7 · Atlas Digital }
  - { label: Timeline, value: Feb – Apr 2026 }
  - { label: Ran on, value: 89 producers }
description: An LLM pipeline that rebuilds each producer's packaging from public sources so Circular Action Alliance can check what producers self-report.
color: '#a9c4d6'
tags: [LLM pipelines, OpenAI API, Structured outputs, Data validation]
---

## Overview

Under Extended Producer Responsibility (EPR) laws, companies report the packaging they sell into a state so they can pay for its recycling. Circular Action Alliance (CAA) collects that data, but producers report it themselves. As Lead Analyst on a 7-person Atlas Digital team, I helped build a pipeline that rebuilds each producer's packaging from public sources so CAA can compare it with what was reported.

<figure class="flow" aria-label="Pipeline diagram">
<ol class="flow-steps">
<li class="flow-pair"><div class="flow-step" style="--c: var(--c-input)"><span class="flow-kicker">Input</span><span class="flow-name">Producer list</span><span class="flow-note">89 producers in our run; CAA works with 2,000+</span></div><div class="flow-step" style="--c: var(--c-filter)"><span class="flow-kicker">Step 1</span><span class="flow-name">Discover products</span><span class="flow-note">LLM + search find private labels (Costco → Kirkland Signature), then product pages</span></div></li>
<li class="flow-step" style="--c: var(--c-sort)"><span class="flow-kicker">Step 2 · my part</span><span class="flow-name">Infer packaging</span>
<ul class="flow-branch">
<li><b>Classify:</b> GPT-5 mini with a strict JSON schema, at most 3 packaging types per product</li>
<li><b>Baseline:</b> fuzzy-matched against ~6,500 rows producers had already reported, so every answer can be checked</li>
</ul></li>
<li class="flow-step" style="--c: var(--c-sort)"><span class="flow-kicker">Step 3 · my part</span><span class="flow-name">Build a bill of materials</span><span class="flow-note">Each packaging type becomes components and materials:</span>
<ol class="flow-ladder">
<li class="is-wide"><span><b>PET bottle</b></span><span class="flow-buckets"><span class="bucket testing">PET body</span><span class="bucket wip">PP cap</span><span class="bucket docs">BOPP film label</span></span></li>
</ol></li>
<li class="flow-pair"><div class="flow-step" style="--c: var(--c-score)"><span class="flow-kicker">Step 4</span><span class="flow-name">Map to CAA categories</span><span class="flow-note">A crosswalk lines components up with reporting in California, Oregon and Colorado</span></div><div class="flow-step is-check" style="--c: var(--c-result)"><span class="flow-kicker">Output</span><span class="flow-name">Compare with reports</span><span class="flow-note">CAA sees where a producer's report and the public evidence disagree</span></div></li>
</ol>
<figcaption>How the pipeline rebuilds a producer’s packaging. I built steps 2 and 3.</figcaption>
</figure>

## What I tried that didn't work

- **Scraping Google results.** Our midpoint version (SerpAPI, Selenium, BeautifulSoup) hit rate limits, didn't scale, and couldn't show where the LLM's answers came from. Switching to Tavily search made every answer traceable to a source.
- **Letting the LLM name packaging freely.** Labels came back vague ("recyclable plastic") or described the wrong thing, like a pump. Good and bad examples in the prompt gave consistent packaging types.
- **One discovery strategy for everyone.** Discovery assumed every producer was a retailer with a private label. That fit only 25 of the 89; the rest were brand owners, B2B manufacturers and distributors.

## A tradeoff I made, and why

**A library that grows itself, at the cost of some control.** When a packaging type has no match, the LLM writes a standard name, aliases and a generic bill of materials under a strict schema, and the entry is saved for reuse. Each new type costs one LLM call. The library reached 12 types this way, like "steelbook" → tinplate steel shell, steel hinge, plastic disc tray.

The risk is that a wrong entry gets reused everywhere. When the team merged the final pipeline, they kept my format names and alias matching but swapped the LLM fallback for a fixed 30-type vocabulary with human review. For compliance data, that was the right call: a reviewed list is easier to defend to a regulator.

## What I learned

- **An LLM's answer is only useful if you can trace it.** The switch to traceable search mattered more than any prompt change.
- **Structured outputs beat clever prompts.** A strict schema and a cap of 3 types removed a whole class of messy answers.
- **Check your assumptions against the whole dataset early.** Our discovery design fit only 25 of 89 producers, and we found out late.
- **Compliance work raises the bar for automation.** In regulated data, being explainable matters as much as being fast.
