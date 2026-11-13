# Section 11 acceptance checklist

Retested 14 Nov 2026, about 1:56 AM IST (13 Nov 2026 20:26 UTC), on the box with Playwright Chromium against a local `python3 -m http.server`, after Round 2. Live URL checked after the production redeploy. Lighthouse was run locally with headless Chromium (`npx lighthouse`, mobile default and desktop preset).

## Results

### Opens with no errors and shows data within a few seconds. PASS

Playwright loaded the dashboard with no `pageerror` and no application `console.error` lines. No request to CoinGecko `market_chart` was made. After the fetches finished, Overview showed the 30-second judge summary, the Q4 coverage headline, three trend charts, six KPI tiles, four FIRED kill rules, a moat panel and a confirm-signal checklist. The data-status pill read "all live" and a last-updated time appeared in the top bar. Hash routes (`#claims`, `#scenarios&vol=...`, `#leadlag`) opened the matching views. Browser back/forward was not separately timed but uses `pushState` / `hashchange` / `popstate`.

### Every KPI matches the APIs when checked by hand. PASS

At the time of the check, Overview showed $3.77B 30-day volume, $1.84M 30-day protocol revenue, 4.88 bp take rate, 30.47% capture, 19.31% 30-day coverage at the live price, and 19.47% at the frozen $3.51 price. These match the DefiLlama `total30d` totals and the Section 4 formulas. The live CoinGecko price around this window was about $3.55; the 30-day coverage figure at the live price is computed from that live price, not invented.

### The 30-day take rate, capture and coverage match the formulas to two decimals. PASS

Live: take rate 4.88 bp, capture 30.47%, coverage 19.31% at the live price and 19.47% at $3.51. Offline snapshot mode, using $1.84M / $6.05M / $3.774B and 1.312B supply at $3.51: 4.88 bp, 30.41%, 19.45%. The coverage trend chart also plots the 30-day window at the frozen $3.51 price so it is comparable to the thesis figure of about 19%.

### With the network off, every view still renders from the snapshot, tagged as such. PASS

With DefiLlama, CoinGecko, NEAR RPC, NearBlocks, jsDelivr and related hosts aborted, the status pill read "offline, snapshot 13 Nov 2026". Overview today-row showed 19.45% coverage at $3.51, 4.88 bp take rate, and Q4 on track at $2.19M of $4.32M, tagged snapshot. Claims, issuance, scenarios, lead/lag, bull path and the kill-rule monitor all still rendered. No page errors. The Q4 test used October only when live November revenue was unavailable, through 2026-10-31 (day 31 of 92), $2.19M versus a $1.45M pro-rata line, and was labelled on track.

### The Q4 coverage test uses $3.51, not the live price. PASS

The headline, live, was 9.83% of issuance so far, $2.83M of $4.32M needed (65.5% of the way), months counted 2026-10 and 2026-11 through 2026-11-12, at a frozen $3.51. $4.32M is 15% of $28.78M (1.312B x 2.5% x $3.51 / 4). The live price was not used for this test. The on-track label is pro-rata: $2.83M versus $2.02M needed by day 43 of 92. A countdown shows time to 31 Dec 2026, 11:59 PM UTC, labelled as 1 Jan 2027, 5:29 AM IST.

### The kill-rule monitor shows four FIRED history rows. PASS

Four history rows tagged FIRED, and the same four rules in the red box and in the 30-second summary on Overview.

### Sliders move the break-even and the highlighted heatmap cell together. PASS

Default ($3.51, 4.88 bp, 1.6% cap): $12.58B and 2.62x, matching the brief (reconfirmed in the prior pass; the break-even view was not rewritten in Round 2). The new Scenario model, opened at `#scenarios&vol=10000000000&take=7&price=3.51&cap=0.016&growth=0`, showed 114% coverage and "already covers issuance at the current run rate", with Copy share link present.

### No em dashes, no hype, no unlabelled numbers. PASS

A scan of `index.html`, `app.js`, `README.md`, `CHECKLIST.md`, `x-post-draft.txt`, the Python scripts and the workflow file found 0 em dashes and 0 en dashes. Copy is plain. Two good months are not called a trend. The lead/lag view states the sample size and a small-sample caveat. The buyback panel is labelled not reconciled. Secondary figures are labelled secondary. The footer says this is research, not investment advice.

## Lighthouse (local, headless Chromium)

Mobile (default): performance 99, accessibility 100, best practices 100, SEO 100. FCP 0.8s, LCP 0.8s, TBT 110ms, CLS 0.006.

Desktop preset: performance 93, accessibility 100, best practices 100, SEO 100. FCP 0.2s, LCP 0.4s, TBT 0ms, CLS 0.165.

## Live URL check (after redeploy)

- https://near-intents-thesis-coral.vercel.app HTTP 200, public HTML, no Vercel login
- https://near-intents-thesis-coral.vercel.app/data/claims_results.json HTTP 200
- https://near-intents-thesis-coral.vercel.app/favicon.svg HTTP 200
- https://near-intents-thesis-coral.vercel.app/og.png HTTP 200 (after the final Round 2 deploy)
- https://near-intents-thesis-coral.vercel.app/near-intents-thesis.pdf HTTP 200, application/pdf
- https://near-intents-thesis-coral.vercel.app/dashboard-brief.pdf HTTP 200, application/pdf

Vercel project `near-intents-thesis`. SSO protection remains off. The first Round 2 production deployment was `dpl_HZZziKY5cUSUb85VZT7QzRHUArYp`; the final alias deploy is recorded in the turn report.

## Items that stay on the snapshot, or are not measured

These are expected, not test failures:

- NEAR Intents Explorer 1Click totals: no partner JWT, so the 13 Nov snapshot is shown
- BigQuery: skipped by request. Ex-HOT signers, HOT share and measured issuance stay UNMEASURED
- Base-chain transactions and active accounts: secondary snapshot
- Stablecoins on NEAR: $128.5M snapshot, secondary
- CoinGecko `market_chart` is no longer called (it was returning HTTP 401). Price, market cap and supply come from `simple/price` and `coins/near`. Daily prices for lead/lag come from the DefiLlama coins chart
- Peer revenue stays at the stated Blockworks quarter
- HSP-029 adoption after the 2 Nov 2026 approval is pending, manual
- Published NEAR AI revenue is pending, manual
- Confidential Intents "about $160M at the end of Q3" is quoted from the thesis, section 8, which does not name an underlying data source
- The $2.6B ZEC routing figure is quoted from the thesis, section 4, which does not give that line its own source name
- The buyback wallet is checked live via NEAR RPC. The 1.77M NEAR figure remains an illustrative snapshot only. Cost vs holders revenue is not reconciled
