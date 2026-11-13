# NEAR Intents investment thesis dashboard

A live, single-page dashboard for an institutional investment thesis on NEAR Protocol. It asks whether revenue from NEAR Intents, a cross-chain swap and settlement network, can grow to match or exceed new token issuance.

built at NEAR HACKATHON, Investment Thesis track.

**Live dashboard:** https://near-intents-thesis-coral.vercel.app

This is research, not investment advice.

## The thesis, in plain words

NEAR is now a bet on one product, Intents. Since 23 Feb 2026 a fee switch sends protocol revenue into buying NEAR on the open market. On the best recent 30 days that revenue covers about 19% of new issuance. Full quarters in 2026 covered 5-11%. All four of our quantitative kill rules fired in the first half of 2026. We restated the thesis as a fresh call from Q4 2026, with rules frozen on 14 Nov 2026. Coverage gets no reset: if Q4 2026 coverage is below 15% at a frozen $3.51 price, the token case is dead.

The dashboard makes three things obvious:

1. Is Intents volume growing, and in steps or smoothly?
2. How much of each fee dollar does the protocol keep, and is that share rising?
3. How far is protocol revenue from covering issuance, and what volume and take rate close the gap?

## How to run

Open `index.html` in a browser, or from this folder:

```
npx serve
```

Then open the URL it prints (usually http://localhost:3000). Serving it this way avoids some `file://` CORS limits on the public APIs.

The page is one self-contained HTML file. Chart.js is loaded from a CDN. No build step.

## How to add the Explorer key

The NEAR Intents Explorer API needs a partner JWT. Click **Explorer key** in the top bar, paste the token, and choose **Use key**. The token is kept only in this tab's memory and is sent only to `explorer.near-intents.org`. It is never written to disk or to this repo.

Without a key, 1Click volume figures stay on the frozen 13 Nov 2026 snapshot and are tagged as such. The rest of the dashboard does not wait on this API.

## What refreshes, and what is live vs snapshot

The dashboard fetches on load, every 10 minutes, and when you click **Refresh**. Responses are cached for 10 minutes.

Live sources (no key):

- DefiLlama: Intents volume, gross fees, protocol revenue, holders revenue, and NEAR chain fees
- CoinGecko: NEAR price, market cap, circulating supply, and peer market caps
- NEAR RPC: total supply and the on-chain max inflation rate

Snapshot, 13 Nov 2026, if a call fails or cannot run in the browser:

- The frozen baseline figures and monthly / quarterly tables in the dashboard brief
- 1Click Explorer totals, unless you enter a JWT
- Buyback wallet balance from revenue.near.org (the page marks those figures illustrative)
- Base-chain activity from Nansen and NearBlocks via CoinPaprika (secondary)

BigQuery is shown as "offline query, see repo". It is not callable from a browser. The SQL for freshness, ex-HOT signers, and buyback-wallet inflows is in the Sources view.

Every number comes from a live API call, from a stated formula applied to live data, or from that snapshot, tagged with its date. Failed calls show the snapshot value, a visible "snapshot, 13 Nov 2026" tag, and the error. Nothing is invented, estimated or smoothed.

The Q4 2026 coverage test always uses the frozen $3.51 price, not the live price.

## Try it (for a judge or an AI)

1. Open the live dashboard. Within a few seconds the Overview should show six KPI tiles, each with a live or snapshot tag, a last-updated time in the top bar, and a data-status pill.
2. Do: read the red box on Overview. See: four quantitative kill rules that fired in the first half of 2026, and a one-line thesis status that says how far Q4 coverage is toward 15%, at $3.51.
3. Do: open Intents volume. See: monthly bars from Sep 2025, the September 2026 record highlighted, and the current partial month hatched with its cut-off date. If the network is on, also see a daily line with a 30-day average and a cumulative line.
4. Do: open Value capture. See: monthly capture and take rate since the Feb 2026 fee switch, and a waterfall from all-time gross fees to protocol revenue to buybacks.
5. Do: open Issuance vs buybacks. See: monthly issuance at 2.5% and 1.6% against revenue, a 15% kill line, and a Q4 progress bar toward $4.32M of revenue (15% of $28.78M).
6. Do: open Break-even. Move the price and take-rate sliders. See: the break-even monthly volume, its multiple of the $4.80B record, and the highlighted heatmap cell move together.
7. Do: open Kill-rule monitor. See: four history rows marked FIRED, and forward rules marked OK, WATCH or UNMEASURED. The Q4 coverage row uses $3.51.
8. Do: turn the network off and reload, or block the APIs. See: every view still renders from the 13 Nov 2026 snapshot, with snapshot tags, and the status pill reading offline.
9. Do: open Sources and method. See: a data-status panel listing each call, its result and its time, plus what is not measured (BigQuery signers, Explorer route split, independent buybacks, NEAR AI revenue).

## Files

- `index.html` - the dashboard
- `near-intents-thesis.pdf` - the thesis report
- `dashboard-brief.pdf` - the build brief and acceptance checklist
- `LICENSE` - MIT, copyright Scala Field 2026
- `screenshots/` - 1440x900 captures of Overview, Break-even, and the kill-rule monitor
- `CHECKLIST.md` - Section 11 acceptance results

Repository: https://github.com/hialdu88/near-intents-thesis
