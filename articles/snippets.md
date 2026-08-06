---
title: Snippets
date: 2026-06-29
tag: work
description: Professional snippets collected from recent professional experience and personal projects.
---

Professional work and personal prototypes.

## Vibecheck

*Vibecheck* is an inbox analysis tool for analyzing feedback sentiment. I protoyped this in ~2024 as an architectual exercise and to review AI engineering techniques: batching, parallelization, chunking, and token management. After Google Gemini release Gmail integration, I shelved it.

<video src="/img/vibecheck-demo.webm" controls playsinline preload="metadata"></video>

![Inbox sentiment chart](/img/inbox-sentiment-chart.avif)

![Inbox feedback analysis](/img/inbox-feedback-analysis.avif)

### Analysis pipeline
```mermaid
flowchart TB
    subgraph row1 [ ]
        direction LR
        A["<b>(1) Fetch</b><br>Gmail query<br>(default newer_than:30d),<br>up to 500 messages,<br>20 in parallel"]
        B["<b>(2) Sanitize</b><br>strip HTML, mask<br>emails / phones / URLs"]
        A --> B
    end
    subgraph row2 [ ]
        direction LR
        C["<b>(3) Classify sentiment</b><br>text-embedding-3-small<br>(batches of 20),<br>cosine similarity vs<br>pos/neg anchor vectors"]
        D["<b>(4) Extract insights</b><br>GPT-4o mini,<br>chunks of 25:<br>insight + exact quote<br>+ category"]
        E["<b>(5) Summarize</b><br>one GPT-4o mini call:<br>summary + top<br>praise / pain / feature"]
        C --> D --> E
    end
    B --> C
    style row1 fill:none,stroke:none
    style row2 fill:none,stroke:none
```

### Request flow

```mermaid
flowchart LR
    A["browser"] -->|"POST /api/gmail<br/>session cookie"| B["Next.js API route"]
    B -->|"OAuth token<br/>from session"| C["Gmail API"]
    C -->|"emails"| B
    B -->|"embeddings +<br/>chat completions"| D["OpenAI API"]
    D -->|"sentiments +<br/>insights"| B
    B -->|"analysis JSON"| A
```

## Sprigbase

*Sprigbase* was a prototype RAG Slack bot for saving and retrieving conversation thread context. Chat commands let you (1) save threads and (2) question the bot, retrieving the answer from a flat file using keyword matching to prefilter chunks before semantic similarity search. Weekend curiosity, not tracked on GitHub.

![Sprigbase example](/img/sprigbase-example.avif)

## Nukes D3 viz

Simple D3.js data viz using a public nuclear-inventory-by-country dataset. I cleaned and manually inspected the data for validation by comparing it to known nuclear inventory estimates.

![Nukes D3 graph](/img/nukes-d3-graph.avif)

## Windows reboot policy

Custom Windows Reboot detection and remediation policy. Created PowerShell script and deployed via Intune. The script created UI from scratch and was changed later to simply use existing Windows toast notifications.

![Reboot policy](/img/reboot-policy.avif)