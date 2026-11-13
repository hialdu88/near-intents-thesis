# Section 11 acceptance checklist

Retested 14 Nov 2026, about 1:30 AM IST (13 Nov 2026 20:00 UTC), on the box with Playwright Chromium at 1440x900 against a local `python3 -m http.server`, after the judging fixes. Live URL checked after redeploy.

## Results

### Opens with no errors and shows data within a few seconds. PASS

Playwright loaded `index.html` with no `pageerror` and no application `console.error` lines. No request to CoinGecko `market_chart` was made, and no HTTP 401 was observed. After the fetches finished, Overview showed the Q4 coverage headline, three trend charts, six KPI tiles, four FIRED kill rules, a moat panel and a confirm-signal checklist. The data-status pill and last-updated time appeared in the top bar.

### Every KPI matches the APIs when checked by hand. PASS

At the time of the check, Overview showed $3.77B 30-day volume, $1.84M 30-day protocol revenue, 4.88 bp take rate, 30.47% capture, 19.31% 30-day coverage at the live $3.54 price, and $3.54 · $4.64B. These match the DefiLlama `total30d` totals and CoinGecko `simple/price` / `coins/near` figures, using the Section 4 formulas.

### The 30-day take rate, capture and coverage match the formulas to two decimals. PASS

Live: take rate 4.88 bp, capture 30.47%, coverage 19.31% at the live price. Offline snapshot mode, using $1.84M / $6.05M / $3.774B and 1.312B supply at $3.51: 4.88 bp, 30.41%, 19.45%. The coverage trend chart also plots the 30-day window at the frozen $3.51 price so it is comparable to the thesis figure of about 19%.

### With the network off, every view still renders from the snapshot, tagged as such. PASS

With DefiLlama, CoinGecko, NEAR RPC and related hosts aborted, the status pill read "offline, snapshot 13 Nov 2026". Overview KPIs were $3.77B, $1.84M, 4.88 bp, 30.41%, 19.45%, $3.51 · $4.61B, tagged snapshot. All 12 views still rendered, including Bull path. No page errors. The Q4 test used October only (November revenue is not in the snapshot), through 2026-10-31 (day 31 of 92), $2.19M versus a $1.45M pro-rata line, and was labelled on track. Daily volume charts stayed empty and said so.

### The Q4 coverage test uses $3.51, not the live price. PASS

The headline, live, was 9.83% of issuance so far, $2.83M of $4.32M needed (65.5% of the way), months counted 2026-10 and 2026-11 through 2026-11-12, at a frozen $3.51. $4.32M is 15% of $28.78M (1.312B x 2.5% x $3.51 / 4). The live price was $3.54 and was not used for this test. The on-track label is pro-rata: $2.83M versus $2.02M needed by day 43 of 92. A countdown shows time to 31 Dec 2026, 11:59 PM UTC, labelled as 1 Jan 2027, 5:29 AM IST.

### The kill-rule monitor shows four FIRED history rows. PASS

Four `tr.fired` rows, each tagged FIRED, and the same four rules in the red box on Overview.

### Sliders move the break-even and the highlighted heatmap cell together. PASS

Default ($3.51, 4.88 bp, 1.6% cap): $12.58B and 2.62x, matching the brief. After moving the price slider to $10.00: $35.85B and 7.47x, and the highlighted cell moved with it.

### No em dashes, no hype, no unlabelled numbers. PASS

A scan of `index.html`, `README.md`, `CHECKLIST.md` and `x-post-draft.txt` found 0 em dashes and 0 en dashes. Copy is plain. Two good months are not called a trend (the take-rate chart says so). Secondary figures are labelled secondary. The footer says this is research, not investment advice.

## Live URL check (after redeploy)

- https://near-intents-thesis-coral.vercel.app HTTP 200, public HTML (106,622 bytes), contains the Bull path view and the Q4 coverage headline, no `market_chart` call, no Vercel login
- https://near-intents-thesis-coral.vercel.app/near-intents-thesis.pdf HTTP 200, application/pdf
- https://near-intents-thesis-coral.vercel.app/dashboard-brief.pdf HTTP 200, application/pdf

Vercel project `near-intents-thesis`, production deployment `dpl_GC4R9nd7ZAP4DaAn599GsaF7QSZP`. SSO protection remains off.

## Items that stay on the snapshot, or are not measured

These are expected, not test failures:

- NEAR Intents Explorer 1Click totals: no partner JWT, so the 13 Nov snapshot is shown
- Buyback wallet balance: 1.77M NEAR from revenue.near.org, tagged snapshot and illustrative
- BigQuery: offline query, see repo. Ex-HOT signers, HOT share and measured issuance stay UNMEASURED
- Base-chain transactions and active accounts: secondary snapshot
- Stablecoins on NEAR: $128.5M snapshot, secondary
- CoinGecko `market_chart` is no longer called (it was returning HTTP 401). Price, market cap and supply come from `simple/price` and `coins/near`
- Peer revenue stays at the stated Blockworks quarter
- HSP-029 adoption after the 2 Nov 2026 approval is pending, manual
- Published NEAR AI revenue is pending, manual
- Confidential Intents "about $160M at the end of Q3" is quoted from the thesis, section 8, which does not name an underlying data source
- The $2.6B ZEC routing figure is quoted from the thesis, section 4, which does not give that line its own source name
- The status pill reads "partly snapshot" when the main Intents and price APIs are live, because Explorer, BigQuery and revenue.near.org are unused or failed by design
