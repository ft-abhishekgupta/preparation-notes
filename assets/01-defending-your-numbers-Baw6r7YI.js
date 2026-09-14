const e=`---\r
title: Defending Your Numbers\r
description: Every metric on a résumé invites a follow-up question, so learn how each of your numbers was actually measured before someone asks\r
difficulty: Core\r
tags: [metrics, estimation, credibility, system-design]\r
---\r
\r
A number on a résumé is a claim, and senior interviewers are trained to test claims. "7M+ players", "5,000 requests per second", "99.99% availability", "87% reduction in gateway load" — each one invites the same two-word follow-up: *how measured?* If you cannot answer that in one breath, the number stops helping you and starts hurting you.\r
\r
## Why numbers get probed harder than anything else\r
\r
Prose is hard to fact-check in a 45-minute interview; a number is easy. "How did you measure that?", "what was the baseline?", and "how confident are you in that figure?" take seconds to ask and immediately reveal whether a candidate understood their own impact or copied a number from a dashboard someone else built. This is precisely why numbers deserve more preparation per word than any other part of your résumé.\r
\r
> [!KEY]\r
> Never state a number without being able to say, in the next sentence, what it was measured against and over what window. The number is not the answer — the number plus its measurement is the answer.\r
\r
## Your claim types, and what each one really invites\r
\r
Below is a working table for the claim types that show up across a typical senior backend résumé. Fill in the blank column with your own answer before the interview — the exercise of writing it down is where the real preparation happens.\r
\r
| Claim type | What it actually means | Likely follow-up | Your answer |\r
|---|---|---|---|\r
| User count (e.g. 7M+ players) | Reach or scale of the audience affected | "Monthly active, or total registered? Over what window?" | _[fill in]_ |\r
| Requests per second (e.g. ~5,000 RPS) | Sustained throughput the system handles | "Average or peak? Measured where — gateway or service?" | _[fill in]_ |\r
| Availability percentage (e.g. 99.99%) | An SLO tracked as an SLI over a rolling window | "What counts as an error? What's excluded?" | _[fill in]_ |\r
| Latency improvement (e.g. p99 600ms → 150ms) | A before/after comparison of a specific percentile | "Same traffic pattern both times? p50 too, or just p99?" | _[fill in]_ |\r
| Load reduction percentage (e.g. −87% gateway load) | A relative drop in request volume to a dependency | "87% of what baseline, measured how?" | _[fill in]_ |\r
| Revenue impact (e.g. $8M quarterly increase) | Business outcome associated with the engineering change | "Correlation or causation? What else changed that quarter?" | _[fill in]_ |\r
| Findings remediated (e.g. 11 CVEs closed) | Security or quality issues fixed in a period | "Which severities? How were they triaged?" | _[fill in]_ |\r
| Team / tooling counts (e.g. team of 4, 20+ tools) | Scope of ownership or adoption | "Direct reports, or people you coordinated with?" | _[fill in]_ |\r
| Throughput per day (e.g. 150+ publishes/day) | Volume processed by a pipeline in a fixed period | "Peak day or average day? Any manual fallback?" | _[fill in]_ |\r
\r
## Deriving one number from another, out loud\r
\r
A senior signal is deriving a number live instead of only reciting one you memorised. If your résumé says 7M+ players and roughly 5,000 requests per second, an interviewer may ask you to sanity-check that relationship yourself — and you should be able to, using rough daily-active-user math.\r
\r
**Worked example.** Assume a fraction of 7M total players are active on a given day — say conservatively 2M daily active users (DAU) engaging with a feed feature. If each active user generates on average 10 read requests across a session (opening the app, scrolling a feed, viewing a post), that's 20M requests per day. Spread unevenly across a 24-hour period with a typical peak-to-average ratio of roughly 3:1, average load is about 20,000,000 ÷ 86,400 ≈ 230 requests/second, and peak load is roughly 3x that, around 700/second for that one feature — well within, and consistent with, a platform-wide ~5,000 RPS figure that also carries games, sales, and other traffic.\r
\r
\`\`\`mermaid\r
flowchart TD\r
    Q["Interviewer asks<br/>how did you measure that?"] --> K["Do you know<br/>the exact source?"]\r
    K -->|yes| S["State it: dashboard,<br/>window, what counted as error"]\r
    K -->|no| B["Bound it live:<br/>derive from DAU, RPS, or scope"]\r
    S --> F["Offer the follow-up detail<br/>before it's asked"]\r
    B --> F\r
    F --> H["Never inflate to<br/>fill a gap in memory"]\r
\`\`\`\r
\r
> [!TIP]\r
> Practise this exact derivation — DAU times requests-per-session divided by seconds-per-day, times a peak factor — for your own headline number. Being able to reconstruct it from first principles is worth more than having memorised the original number.\r
\r
## Talking about availability precisely\r
\r
"99.99% availability" is a claim about a **service-level indicator** measured over a **rolling window**, not a permanent property of the system. A senior answer names all three parts: what counted as an error (5xx responses, timeouts past a defined threshold, or a specific class of degraded response), what window it was measured over (30 days is common), and which specific service or path the number describes.\r
\r
> [!WARNING]\r
> Different sub-systems on the same platform commonly carry different SLOs — a mature, core path might be held to 99.999% while a newer or less critical feature is held to 99.9% with graceful degradation built in. If asked "is that 99.99% for the whole platform?", the honest and precise answer is "for this specific read path" — conflating the two is the single most common way this number gets challenged and found soft.\r
\r
## Attribution for revenue and efficiency claims\r
\r
Revenue and efficiency numbers are the riskiest category because engineering is rarely the sole cause. A claim like "contributed to an $8M quarterly revenue increase" should always be framed as **enabling**, not **causing**: the engineering work reduced the friction or time required to do something, and that capability was associated with a measured business outcome, alongside product, marketing, and market factors you did not control.\r
\r
| Weak framing | Stronger framing |\r
|---|---|\r
| "My code generated $8M in revenue" | "The platform I built reduced campaign-authoring time from days to minutes, which enabled the broader campaign volume associated with an $8M quarterly increase" |\r
| "I personally saved the company $2M" | "The tool I built removed a manual 20-minute task performed dozens of times a day across the org; extrapolated over a year that's roughly $2M in engineering time, though I'd want finance's exact multiplier to state it as fact" |\r
\r
> [!TIP]\r
> The phrase "associated with" or "enabled" instead of "caused" or "generated" is not weaker — it is more accurate, and it signals you understand attribution, which is exactly what a senior interviewer is listening for.\r
\r
## What to do if you genuinely don't remember\r
\r
Nobody remembers every number from every project years later, and pretending otherwise is worse than admitting it. The correct move is to **bound it and explain the method**: "I don't remember the exact figure, but it was on the order of X, because Y" is a complete and credible answer. What is not acceptable is inventing precision you don't have — a suspiciously exact number delivered with hesitation reads worse than an honest approximate one delivered with confidence.\r
\r
\`\`\`\r
Template for an uncertain number:\r
"I don't have the exact figure memorised, but it was roughly [order of magnitude],\r
because [the scale of the input / the known constraint / a comparable system I recall].\r
The way I'd get the precise number is [dashboard / source you'd actually check]."\r
\`\`\`\r
\r
## The integrity rule\r
\r
Never inflate a number to make an answer sound stronger — senior interviewers at large product companies have heard hundreds of these claims and specifically probe for exactly this. A modestly stated, well-defended number beats an impressive-sounding one that collapses under one follow-up question. If you are not sure whether a number you're about to say is accurate, round it down and say so, or reframe it as an estimate; the cost of being caught inflating a number is far higher than the cost of a slightly smaller, fully defensible one.\r
\r
> [!DANGER]\r
> The most damaging failure mode in a numbers-heavy round isn't having a modest number — it's having an impressive one you can't explain. Once one number is shown to be soft, an experienced interviewer will quietly re-check every other number you've stated, and your credibility for the rest of the interview drops with it.\r
\r
## Cheat sheet\r
\r
- Never state a number without knowing what it was measured against and over what window.\r
- Know the claim types on your own résumé — user counts, RPS, availability, latency, load reduction, revenue, findings remediated, team/tooling counts, throughput — and have a defensible source for each.\r
- Practise deriving your headline RPS number from DAU and requests-per-session live, not just reciting it.\r
- Availability numbers need three parts stated: what counted as an error, the measurement window, and which specific service.\r
- Frame revenue and efficiency claims as "enabled" or "associated with," never "caused" or "generated" alone.\r
- If you don't remember exactly, bound it and explain the method — never invent precision.\r
- Never inflate. A defensible modest number beats an impressive number that collapses under one follow-up.\r
\r
## Common mistakes\r
\r
| Mistake | Fix |\r
|---|---|\r
| Stating a number with no idea of its source | Know the dashboard, window, and definition behind every headline number |\r
| Claiming 99.99% availability for the whole platform | Name the specific service and window the number describes |\r
| Saying "my code generated $X in revenue" | Reframe as "enabled" or "associated with," crediting the whole system |\r
| Inventing a precise number you don't actually remember | Bound it — "on the order of X, because Y" — and say so honestly |\r
| Treating a follow-up on a number as an attack | Treat it as the expected next step and answer it directly |\r
| Never having derived your own headline number from first principles | Practise the DAU → RPS derivation for your own numbers before the interview |\r
\r
## Summary\r
\r
Every number on your résumé is an invitation to ask "how do you know that?", and the strongest answer is one you can reconstruct from first principles, not just recite. Know what each of your claim types actually measures, be precise about SLO scope, frame revenue and efficiency claims as enabled rather than caused, and bound any number you genuinely don't remember instead of inventing false precision. The integrity rule matters most of all — inflated numbers get caught, and once one number is shown to be soft, every other number in the conversation gets re-examined.\r
\r
## Top Interview Questions\r
\r
### Q1. Your résumé says 5,000 requests per second. How was that measured?\r
\r
That's a platform-level average throughput figure, measured at the gateway layer across the read and write paths of the services I owned, over a representative traffic window rather than a single instantaneous spike. I'd distinguish it from peak load, which runs several times higher during known high-traffic periods, and I'd be explicit that it's an average across the whole platform rather than any single endpoint — a specific feed-read endpoint, for instance, carries a smaller slice of that total. If asked to sanity-check it, I can derive a comparable number from daily active users and requests per session, and it lands in the same order of magnitude.\r
\r
### Q2. Walk me through how you'd sanity-check a requests-per-second figure using daily active users.\r
\r
I'd start with an estimate of daily active users — say 2 million out of a larger total player base — then estimate requests per session, maybe 10 for a feed-style feature covering opens, scrolls, and detail views. Multiplying gives roughly 20 million requests per day; dividing by 86,400 seconds gives an average of around 230 requests per second for that one feature. Real traffic isn't flat across 24 hours, so I'd apply a peak-to-average ratio, commonly around 3x for consumer traffic, putting peak load for that feature at roughly 700 per second — which is consistent with, and a fraction of, a platform-wide 5,000 RPS figure that also includes other services.\r
\r
### Q3. What exactly counts as downtime in your 99.99% availability figure?\r
\r
I'd define it as the service-level indicator underlying that target: the ratio of successful to total requests over a rolling window, where "successful" excludes 5xx server errors, timeouts past a defined threshold, and any response that violates the product's correctness contract even if it technically returned 200. It does not typically include client-side errors like a malformed request, since those aren't the service's fault. I'd also clarify the window — commonly 30 days on a rolling basis — and which specific service the number describes, because a platform with many components usually has different SLOs for different paths rather than one number that applies everywhere.\r
\r
### Q4. How do you know your work caused the 87% reduction in gateway load, and not something else?\r
\r
I'd point to the before/after comparison during the migration window, where legacy and new paths ran side by side and load was measured on the same dependency for both, which controls for most confounding factors like seasonal traffic changes. The reduction tracked directly with the percentage of traffic shifted from the legacy dependency chain to the new cached path, moving in step with each rollout stage rather than jumping all at once — which is strong evidence the caching change itself was the driver, not an unrelated coincidence. I'd be honest that no production measurement is a perfectly controlled experiment, but a staged rollout with a comparable dual-run window is about as close as you reasonably get.\r
\r
### Q5. Your resume mentions a revenue increase associated with your work. How do you know your engineering contribution caused it?\r
\r
I'd be precise that I can defend enablement, not sole causation. My engineering work reduced the time and friction required to author and launch a campaign, which allowed the team running campaigns to execute more of them, more confidently, in the same period — and that increase in campaign volume and flexibility was associated with a measured revenue increase over a quarter. I would not claim the code directly produced the revenue, because pricing decisions, market conditions, and the business team's strategy all contributed too. I think that framing is actually a stronger answer than an inflated one, because it shows I understand how attribution actually works in a cross-functional outcome.\r
\r
### Q6. What would you do if I asked for a number you genuinely don't remember precisely?\r
\r
I would say so directly rather than guessing a specific-sounding figure, and then give a reasoned bound instead. For example: "I don't have the exact percentage memorised, but it was a significant majority of daily active titles — I'd estimate somewhere in the 70 to 85 percent range based on the scale of the rollout at the time, and I'd check the actual dashboard to confirm the precise number." That's a complete answer: it's honest about the limit of my memory, it still demonstrates I understand the rough scale, and it names exactly how I'd get the precise figure if it mattered.\r
\r
### Q7. How would you describe the difference between average and peak load, and why does it matter for capacity planning?\r
\r
Average load is throughput smoothed over a long window, like a day, while peak load is the highest sustained rate the system needs to handle during its busiest period, such as a launch event or a predictable daily peak hour. The gap between them — often a 2 to 4x ratio for consumer-facing systems — matters enormously for capacity planning, because provisioning only for the average guarantees failure at peak, while over-provisioning purely for peak wastes cost the rest of the time. This is exactly why autoscalers exist: they let the system run lean at average load and add capacity automatically as real traffic approaches the peak, rather than requiring a human to guess the right static size.\r
\r
### Q8. If your latency numbers were measured on different traffic patterns before and after the change, how would that affect your confidence in the result?\r
\r
It would lower my confidence significantly, because a genuine before/after comparison needs a comparable traffic mix and volume on both sides — otherwise you can't separate the effect of your change from the effect of the traffic being different. I'd want to know whether the "before" measurement was taken during a comparable period, ideally the same days of week and similar overall load, or during the dual-run window where both paths served real traffic side by side. If the comparison isn't clean, the honest answer is to say the improvement is directionally strong but the exact multiplier should be treated as approximate rather than precise, rather than quoting a number that implies more rigor than the measurement actually had.\r
\r
### Q9. How do you decide when a number is safe to round versus when it needs to be exact?\r
\r
Headline numbers used to establish scale — user counts, RPS, percentage improvements — are usually fine to round, and rounding actually signals honesty, since an exact-sounding figure for something like "7,342,911 players" would itself raise suspicion. Numbers tied to a specific claim someone might act on — a compliance figure, an SLA commitment, a security finding count — need to be exact or explicitly flagged as approximate, because rounding those changes their meaning rather than just their precision. My rule of thumb: round anything that's illustrating scale, and be precise or explicitly qualified about anything that's a commitment or an audit-style fact.\r
\r
### Q10. Tell me about a time a number you cited got challenged, and how you handled it.\r
\r
In a review, I once stated a load-reduction percentage from memory and was asked directly what the baseline period was. I didn't have it memorised precisely in that moment, so I said so, gave the order of magnitude I was confident in, and offered to confirm the exact baseline window from the dashboard afterward rather than defending an unverified specific number under pressure. I followed up with the precise figure once I'd checked it, which turned out to be close to what I'd estimated. The lesson was to build the habit of knowing the measurement window for every number I state before I ever say it out loud, not just the headline figure itself.\r
\r
### Q11. Why is "associated with" a better phrase than "caused" for business-impact metrics?\r
\r
Because "caused" claims a level of certainty that a single engineering change rarely has in a multi-team business outcome, and an interviewer who pushes on causation will usually win that argument if I've overclaimed it. "Associated with" is precise: it states there is a real, measured relationship — the metric moved alongside the change — without asserting that engineering was the only or even the dominant factor. It's also simply more defensible under a follow-up, because I can describe the mechanism (faster authoring, more campaigns, more flexible targeting) that plausibly explains the association, rather than having to prove sole causation I can't actually establish.\r
\r
### Q12. What's the biggest mistake candidates make when talking about their metrics, and how do you avoid it?\r
\r
The biggest mistake is treating the number itself as the whole answer, then having nothing to say when asked how it was measured — which is close to guaranteed to happen in a serious interview. I avoid it by preparing every headline number with its source, its window, and its definition of success or failure before the interview, the same way I'd prepare the architecture behind a project. I also practise deriving my own numbers from first principles, like RPS from daily active users, so that even if I'm asked to defend a figure in a way I hadn't specifically rehearsed, I can reconstruct something close to it live instead of freezing.\r
`;export{e as default};
