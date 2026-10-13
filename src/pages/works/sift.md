---
layout: ../../layouts/ProjectLayout.astro
title: 'SIFT: Scoring PRs by Real Work'
subtitle: An explainable score for every pull request
tag: Personal build
villager: sammy
facts:
  - { label: Role, value: Solo project }
  - { label: Timeline, value: Jul – Oct 2026 }
  - { label: Tested on, value: 34 PRs · 59 commits }
description: SIFT scores each pull request by the meaningful work in it, instead of counting merged PRs.
color: '#e9b49a'
tags: [Python, GitHub API, Claude API, Metric design]
links:
  - { label: View on GitHub, href: 'https://github.com/Shiwenree/PR-Project' }
---

## Overview

Many companies judge engineers partly by how many pull requests they merge. With AI, pushing lots of PRs is easier than ever, so the raw count says less every year. I built a pipeline that replaces the count with one score per PR, based on how much meaningful work actually went into it.

<figure class="flow" aria-label="SIFT pipeline diagram">
<ol class="flow-steps">
<li class="flow-pair"><div class="flow-step" style="--c: var(--c-input)"><span class="flow-kicker">Start</span><span class="flow-name">Incoming request</span><span class="flow-note">Teams of GitHub users, last 90 days by default</span></div>
<div class="flow-step" style="--c: var(--c-input)"><span class="flow-kicker">GitHub API</span><span class="flow-name">Fetch merged PRs</span><span class="flow-note">Commits and diffs, comments, reviews, timeline</span></div></li>
<li class="flow-step" style="--c: var(--c-filter)"><span class="flow-kicker">Skip what shouldn’t count</span><span class="flow-name">Pre-filter</span>
<ul class="flow-branch">
<li><b>Simple:</b> drop merge, empty, lockfile, bot and other-author commits (co-authors kept)</li>
<li><b>Revert pairs:</b> a diff that is a 90% inverse of an earlier one nets both to 0, so revert/recommit chains count once</li>
</ul></li>
<li class="flow-step" style="--c: var(--c-sort)"><span class="flow-kicker">Runs for every commit</span><span class="flow-name">Meaningful Commit Organizer</span><span class="flow-note">Checks run in order; a commit stops at the first one that assigns a bucket.</span>
<ol class="flow-ladder">
<li><span><b>1. Size &amp; config</b> · config-only files, ≤2 lines, whitespace; docs-only files</span><span class="flow-buckets"><span class="bucket lint">Lint/Config</span><span class="bucket docs">Docs</span></span></li>
<li><span><b>2. WIP flag</b> · WIP keywords, placeholder lines</span><span class="flow-buckets"><span class="bucket none">flags only</span></span></li>
<li><span><b>3. Test check</b> · ≥80% of lines in test files, &lt;20 other lines</span><span class="flow-buckets"><span class="bucket testing">Testing</span></span></li>
<li><span><b>3.5 Conversation</b> · reviewer asked for changes, then approved (by commit position)</span><span class="flow-buckets"><span class="bucket addressed">Addressed</span></span></li>
<li><span><b>4. Lint by content</b> · comment/format-only; placeholders or &lt;50% of lines reach the final PR</span><span class="flow-buckets"><span class="bucket lint">Lint/Config</span><span class="bucket wip">WIP</span></span></li>
<li class="is-wide"><span><b>AI · Claude Haiku</b> · judges the rest; diff trimmed to 1,500 lines; ignores instructions in diffs; fails closed</span><span class="flow-buckets"><span class="bucket meaningful">Meaningful</span><span class="bucket lint">Lint</span><span class="bucket wip">WIP</span><span class="bucket testing">Testing</span><span class="bucket none">Unclassified</span></span></li>
</ol></li>
<li class="flow-step" style="--c: var(--c-score)"><span class="flow-kicker">Score each PR</span><span class="flow-name">Calculation</span><code class="flow-formula">3·log2(1 + meaningful)
+ log2(1 + addressed)
+ log2(1 + testing)
+ log2(1 + docs)
+ log2(1 + min(lines, 2000))</code><span class="flow-note">Lines are code only, additions weigh 1.5×; docs, config and moved lines are left out</span></li>
<li class="flow-pair"><div class="flow-step" style="--c: var(--c-result)"><span class="flow-kicker">Output</span><span class="flow-name">Results</span><span class="flow-note">Bucket and reason per commit; each person vs. team and org average</span></div>
<div class="flow-step is-check" style="--c: var(--c-check)"><span class="flow-kicker">Validation</span><span class="flow-name">Check against hand labels</span><span class="flow-note">evaluate.py reports agreement per bucket and per check</span></div></li>
</ol>
<figcaption>How SIFT turns a team’s merged PRs into scores. Redrawn from my FigJam design board.</figcaption>
</figure>

Every commit records which check decided its bucket, and the AI's one-sentence reason when it was involved, so any score can be explained or disputed. I tested it on a well-known open-source maintainer's public work: 34 merged PRs and 59 commits over 90 days.

## What I tried that didn't work

Most of what didn't work only showed up once I ran the pipeline on real repositories.

- **Trusting commit messages.** Anyone can type "refactor". Keywords now only raise a flag; the diff and GitHub's review data decide the bucket.
- **Ordering reviews by timestamp.** 13 of the 34 PRs (38%) had been force-pushed, and a rebase rewrites commit dates. I switched to each commit's position in the PR, which survives a rebase.
- **Counting commits linearly.** Splitting the same 500 lines into ten commits scored 10× more than one commit. A log scale cuts that gap to 1.6×.
- **Counting raw lines.** One commit counted 4,662 added lines, nearly all copied documentation. Size now counts code only, and moved lines cancel out. That commit now counts 20 lines.

## A tradeoff I made, and why

**Rules first, AI last.** Sending every commit to a model would be simpler and might catch more edge cases. But a rule's decision is free, instant and explainable: "this commit only touched config files" takes an engineer five seconds to check. The AI only sees what the rules can't settle.

**Failing closed.** When the AI errors out, the commit scores zero and is listed for a rerun instead of getting a best guess. That's unfair in the short term, but a silent guess is worse: nobody could tell which parts of a score were judged and which were made up.

## What I learned

- **Real data beats unit tests at finding the real problems.** My tests passed, yet one run on real repositories surfaced copied docs counted as code, test data in a `testdata/` folder the rules didn't recognize, and refactors misfiled as lint. Every threshold in the pipeline is still a starting guess until it's checked against real commits.
- **Any metric people are judged by will be gamed.** Designing against that shaped almost every decision: damped counts, a size cap, keywords that only flag, and an AI told to ignore instructions hidden in the code it reads.
- **AI isn't ground truth either.** The AI misfiled real refactors as lint and a regenerated data file as meaningful until I fixed its prompt. Its answers need checking against human judgement just like the rules do, which is why I built a tool to compare both against my own hand labels.
- **Small samples prove less than they look.** 19 of 20 agreeing only shows the true rate is at least 76%; 98 of 100 shows at least 93%. I built that confidence bound into the tooling so I couldn't fool myself.
- **Explainability is a feature, not a nice-to-have.** A score is only fair if the person being scored can see why. Recording the deciding check for every commit, plus the AI's one-sentence reason, made the pipeline easier to debug too.
