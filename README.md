# NEAR Intents investment thesis dashboard

**Live dashboard:** https://near-intents-thesis-coral.vercel.app

![Overview of the live dashboard, including the 30-second judge summary and the Q4 coverage test](screenshots/01-overview.png)

**Bull case in one line:** Buybacks beat issuance only if HSP-029 is adopted (cutting the target by a third), the take rate is about 7 bp, and volume is about $10B a month, or $84M a year against about $74M of issuance at $3.51 (thesis, section 7).

**Shareable scenario example:** [$10B a month at 7 bp, 1.6% cap, $3.51, zero growth](https://near-intents-thesis-coral.vercel.app/#scenarios&vol=10000000000&take=7&price=3.51&cap=0.016&growth=0) (114% coverage at the current run rate).

built at NEAR HACKATHON, Investment Thesis track.

This is research, not investment advice.

## The thesis, in plain words

NEAR is now a bet on one product, Intents. Since 23 Feb 2026 a fee switch sends protocol revenue into buying NEAR on the open market. On the best recent 30 days that revenue covers about 19% of new issuance. Full quarters in 2026 covered 5-11%. All four of our quantitative kill rules fired in the first half of 2026. We restated the thesis as a fresh call from Q4 2026, with rules frozen on 14 Nov 2026. Coverage gets no reset: if Q4 2026 coverage is below 15% at a frozen $3.51 price, the token case is dead.

The dashboard makes three things obvious:

1. Is Intents volume growing, and in steps or smoothly?
2. How much of each fee dollar does the protocol keep, and is that share rising?
3. How far is protocol revenue from covering issuance, and what volume and take rate close the gap?

Above the fold on Overview is a 30-second summary: the bull case in one line, what must be true (HSP-029, about 7 bp, about $10B a month, with live progress), the four kill rules, and today's live status.

## Kill rules

Each of the first three fires after two complete quarters in a row past its level, counting from Q4 2026. Coverage gets no reset.

- Intents volume below $8B a quarter. FIRED on Q1-Q2 2026 ($7.18B, $6.25B). Q3 recovered to $9.79B.
- Capture below 20%. FIRED on Q1-Q2 (13.1%, 16.1%). Q3 reached 21.2%.
- Take rate below 3 bp. FIRED on Q1-Q2 (2.21 bp, 2.40 bp). Q3 reached 3.14 bp.
- Revenue / issuance below 15% at a frozen $3.51. FIRED, and still below (5.5%, 5.2%, 10.7% in Q1-Q3). Q4 is the last test.

Forward rules also kill on a quarter with volume up and revenue down, if HSP-029 is vetoed or not adopted within six months, on a loss of user funds in the Intents verifier or Chain Signatures, or if ex-HOT daily signers fall below 40K (provisional, unmeasured here).

## Claims ledger

`scripts/check_claims.py` re-pulls DefiLlama (and the buyback wallet via NEAR RPC) and grades each frozen claim from the thesis or brief. Results are written to `data/claims_results.json`. A daily GitHub Action runs this job and commits the JSON.

Tolerance (a dashboard rule, not published in the thesis): green if the absolute relative difference is at most 5%, amber if it is more than 5% and at most 15%, red if it is more than 15%. Unmeasured claims are not graded. Holders revenue is summed through 3 Nov 2026. 30-day coverage is retested at $3.51 and 1.312B supply.

The Claims ledger view reads that JSON if present, otherwise it computes the same grades in the browser and says so. The first run (13 Nov 2026, 20:08 UTC) was 15 green, 0 amber, 1 red (the buyback wallet: 1.77M NEAR illustrative vs 2.28M on-chain), 3 unmeasured (BigQuery, skipped by request), and 2 historical record rows.

## On-chain buyback check

The Issuance view calls NEAR RPC `view_account` for `buybacks.multisignature.near` and, when the browser can reach it, the latest page of the NearBlocks public API. At the 13 Nov 2026 20:13 UTC check the on-chain balance was 2.28M NEAR, against an illustrative 13 Nov snapshot of 1.77M NEAR from revenue.near.org.

This is **not reconciled**. DefiLlama holders revenue is a USD series. The wallet balance is a current NEAR amount. Without a purchase-price series for each buy, a "revenue in vs NEAR bought, gap X%" figure cannot be computed honestly. The thesis also notes that bought tokens sit in a permanent capital vehicle, so this wallet may be a pass-through and its current balance is not total NEAR bought. A mark-to-market of the current balance at the live price is shown only as a reference, not as cost or as total bought.

## Lead / lag (volume vs NEAR price)

A new check, not the thesis H1 test (which asked whether Intents volume leads or lags chain activity). This view correlates monthly Intents volume with the average NEAR price k months later, for k = 0 to 3. Monthly prices are averages of daily UTC-month prices from the DefiLlama coins chart (`coingecko:near`, period=1d). Incomplete months (fewer than 28 daily price points) are excluded.

On the 13 Nov 2026 20:13 UTC pull, 14 complete overlapping months (Sep 2025 to Oct 2026) gave:

- lag 0: r = 0.48, n = 14
- lag 1: r = 0.48, n = 13
- lag 2: r = 0.07, n = 12
- lag 3: r = -0.05, n = 11

November 2026 was excluded (13 price days). In plain language, there is a moderate same-month relationship and a similar correlation at lag 1; later lags are near zero. This is not strong evidence that volume leads price. A sample this small can flip sign with one more month.

## Scenario model

The Scenario model view has sliders for monthly volume, take rate, price, annual volume growth (default 0, because the thesis does not publish a growth rate), and the issuance cap (2.5% or 1.6%). It reports coverage at the current run rate and the year buybacks would pass issuance, with price, take rate and the cap held fixed. Settings are stored in the URL hash. **Copy share link** copies the full URL.

Example: https://near-intents-thesis-coral.vercel.app/#scenarios&vol=10000000000&take=7&price=3.51&cap=0.016&growth=0

## How to run

```
npm start
```

That runs `npx serve .`. Or open the folder with any static server (for example `python3 -m http.server`). Serving it this way avoids some `file://` CORS limits on the public APIs.

The dashboard is static: `index.html` plus `app.js`. Chart.js is loaded from a CDN. No build step. Do not commit `node_modules/`.

## How to add the Explorer key

The NEAR Intents Explorer API needs a partner JWT. Click **Explorer key** in the top bar, paste the token, and choose **Use key**. The token is kept only in this tab's memory and is sent only to `explorer.near-intents.org`. It is never written to disk or to this repo.

Without a key, 1Click volume figures stay on the frozen 13 Nov 2026 snapshot and are tagged as such. The rest of the dashboard does not wait on this API.

## What refreshes, and what is live vs snapshot

The dashboard fetches on load, every 10 minutes, and when you click **Refresh**. Responses are cached for 10 minutes.

Live sources (no key):

- DefiLlama: Intents volume, gross fees, protocol revenue, holders revenue, and NEAR chain fees
- DefiLlama coins chart: daily NEAR prices for the lead/lag test
- CoinGecko: NEAR price, market cap, circulating supply, and peer market caps (`simple/price` and `coins/near`). The dashboard does not call CoinGecko `market_chart`, which was returning HTTP 401.
- NEAR RPC: total supply, on-chain max inflation rate, and `view_account` for `buybacks.multisignature.near`
- NearBlocks public API (keyless): latest page of buyback-wallet transfers, when the browser can reach it

Snapshot, 13 Nov 2026, if a call fails or cannot run in the browser:

- The frozen baseline figures and monthly / quarterly tables in the dashboard brief
- 1Click Explorer totals, unless you enter a JWT
- Base-chain activity from Nansen and NearBlocks via CoinPaprika (secondary)

BigQuery was skipped by request. Ex-HOT signers, HOT Wallet share and measured issuance stay clearly marked unmeasured. The SQL is still in the Sources view if a reviewer wants to run it later.

A GitHub Action (`.github/workflows/snapshot.yml`) runs daily at 06:00 UTC, fetches the DefiLlama endpoints from the brief, grades frozen claims, and commits `data/snapshots/YYYY-MM-DD.json` plus `data/claims_results.json`. You can also run `python scripts/fetch_snapshot.py` and `python scripts/check_claims.py` yourself.

Every number comes from a live API call, from a stated formula applied to live data, or from that snapshot, tagged with its date. Failed calls show the snapshot value, a visible "snapshot, 13 Nov 2026" tag, and the error. Nothing is invented, estimated or smoothed.

The Q4 2026 coverage test always uses the frozen $3.51 price, not the live price. An "on track" / "not on track" label compares Q4 revenue to a pro-rata share of the $4.32M needed, using calendar days to the last day with protocol revenue.

## Try it (for a judge or an AI)

1. Open the live dashboard. Within a few seconds the Overview should show a 30-second summary above the fold, a Q4 coverage headline, three trend charts, six KPI tiles, and a last-updated time in the top bar.
2. Do: read the summary in 30 seconds. See: the bull case, HSP-029 / 7 bp / $10B progress, the four kill rules, and today's coverage, take rate and Q4 pace.
3. Do: read the Q4 headline. See: progress toward 15% at $3.51, which months are counted, a countdown to 31 Dec 2026 11:59 PM UTC shown against 1 Jan 2027, 5:29 AM IST, and an on-track or not-on-track label with the pro-rata method stated.
4. Do: open Claims ledger. See: each frozen claim with a green, amber, red, unmeasured or record badge, and the last run time from `data/claims_results.json`.
5. Do: open Issuance vs buybacks. See: the on-chain wallet balance, recent transfers if available, and a clear "not reconciled" label.
6. Do: open Scenario model. Move the sliders, then use **Copy share link**. See: coverage and the year buybacks would pass issuance, with the settings reflected in the URL hash. Growth defaults to 0.
7. Do: open Lead / lag. See: Pearson r at lags 0-3, n for each lag, a plain-language result, and the small-sample caveat.
8. Do: open Bull path. See: live progress bars for the 7 bp take-rate test and the $10B monthly volume test, a manual row for HSP-029, and the confirm-signal checklist.
9. Do: open Break-even. Move the price and take-rate sliders. See: the break-even monthly volume, its multiple of the $4.80B record, and the highlighted heatmap cell move together.
10. Do: open Kill-rule monitor. See: four history rows marked FIRED, and forward rules marked OK, WATCH or UNMEASURED. The Q4 coverage row uses $3.51.
11. Do: use the browser back button after changing views, or open a deep link such as `#claims`. See: the matching view. On a narrow screen, use Menu to open the view list.
12. Do: turn the network off and reload, or block the APIs. See: every view still renders from the 13 Nov 2026 snapshot, with snapshot tags, and the status pill reading offline.
13. Do: open Sources and method. See: a data-status panel listing each call, its result and its time, and no CoinGecko `market_chart` 401.

## Files

- `index.html` and `app.js` - the dashboard
- `data/claims_results.json` - latest self-graded claims
- `scripts/check_claims.py` and `scripts/fetch_snapshot.py` - daily claims check and DefiLlama snapshot
- `.github/workflows/snapshot.yml` - daily Action
- `favicon.svg` and `og.png` - favicon and Open Graph image
- `near-intents-thesis.pdf` - the thesis report
- `dashboard-brief.pdf` - the build brief and acceptance checklist
- `LICENSE` - MIT, copyright Scala Field 2026
- `screenshots/` - Overview, the scenario model, the claims ledger, and a mobile shot
- `CHECKLIST.md` - Section 11 acceptance results

Repository: https://github.com/hialdu88/near-intents-thesis
