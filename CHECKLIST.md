# Section 11 acceptance checklist

Tested 14 Nov 2026, about 1:15 AM IST (13 Nov 2026 19:45 UTC), on the box with Playwright Chromium at 1440x900 against a local `python3 -m http.server` and against the live Vercel URL.

## Results

### Opens with no errors and shows data within a few seconds. PASS

Playwright loaded `index.html` with no `pageerror` and no application `console.error` lines. After the fetches finished (a few seconds), the Overview showed six KPI tiles, a thesis status line, and the four-rule FIRED box. Live URL `https://near-intents-thesis-coral.vercel.app` returned HTTP 200, `text/html`, 88786 bytes, starting with `<!DOCTYPE html>`, not a Vercel login page. Deployment protection (SSO) is off.

### Every KPI matches the APIs when checked by hand. PASS

The same browser session fetched the APIs and compared them to the Overview tiles:

- DefiLlama volume `total30d` 3774153452, shown as $3.77B
- DefiLlama revenue `total30d` 1842648, shown as $1.84M
- DefiLlama fees `total30d` 6048207
- CoinGecko NEAR price $3.55 and market cap about $4.65B at the time of the check, shown as $3.55 · $4.65B
- Circulating supply 1,311,599,740 from CoinGecko `coins/near`

### The 30-day take rate, capture and coverage match the formulas to two decimals. PASS

From the API totals above:

- Take rate = 1842648 / 3774153452 x 10,000 = 4.88 bp
- Capture = 1842648 / 6048207 = 30.47%
- Coverage = 1842648 / (1,311,599,740 x 2.5% x $3.55 x 30/365) = 19.26%

The Overview tiles showed 4.88 bp, 30.47%, and 19.26%. In offline snapshot mode the same formulas on the frozen inputs ($1.84M, $6.05M, $3.774B, 1.312B supply, $3.51) showed 4.88 bp, 30.41%, and 19.45%. The brief's published capture of 30.5% is the rounded 13 Nov figure; the dashboard shows the formula result.

### With the network off, every view still renders from the snapshot, tagged as such. PASS

With DefiLlama, CoinGecko, NEAR RPC and related hosts aborted, the status pill read "offline, snapshot 13 Nov 2026". Overview KPIs were $3.77B, $1.84M, 4.88 bp, 30.41%, 19.45%, $3.51 · $4.61B, each tagged "snapshot, 13 Nov 2026". All 11 views still rendered. The daily volume charts stayed empty (no daily series in the snapshot) and said so; monthly bars still rendered. November revenue, which is not in the snapshot table, was not invented: the Q4 bar used October only ($2.19M of $4.32M). The only console messages were failed network requests.

### The Q4 coverage test uses $3.51, not the live price. PASS

The thesis status line, live, was: "Q4 coverage test: 65.5% of the way to 15% ($2.83M of $4.32M needed, at a frozen $3.51 price)." $4.32M is 15% of $28.78M, which is 1.312B x 2.5% x $3.51 / 4. The live NEAR price at the time was $3.55 and was not used for this test.

### The kill-rule monitor shows four FIRED history rows. PASS

The history table had four `tr.fired` rows, each tagged FIRED: quarterly volume below $8B, capture below 20%, take rate below 3 bp, and revenue / issuance below 15%. The same four rules are also listed in the red box on Overview.

### Sliders move the break-even and the highlighted heatmap cell together. PASS

Default sliders ($3.51, 4.88 bp, 1.6% cap) showed $12.58B and 2.62x, matching the brief, and highlighted that cell. After moving the price slider to $10.00, the output became $35.85B and 7.47x, and the highlighted cell moved to the $10.00 / 4.88 bp cell with the same figures.

### No em dashes, no hype, no unlabelled numbers. PASS

A scan of `index.html` found 0 em dashes (U+2014) and 0 en dashes (U+2013). Copy is plain and avoids hype words. KPI tiles, charts and tables carry a source, a live/snapshot tag, or a hover title with the source and time. Secondary figures are labelled secondary. The footer says this is research, not investment advice.

## Items that stay on the snapshot, or are not measured

These are expected, not test failures:

- NEAR Intents Explorer 1Click totals: no partner JWT was entered, so the 13 Nov snapshot is shown ($32.63B all-time, $2.54B 30-day). Paste a key in the top bar to try a live pull. The page does not wait on this API.
- Buyback wallet balance: 1.77M NEAR from revenue.near.org, tagged snapshot and illustrative. That site is not used as a structured API.
- BigQuery: shown as "offline query, see repo". Needs a Google Cloud account. Ex-HOT signers, HOT Wallet share, and measured issuance stay UNMEASURED.
- Base-chain transactions and active accounts: Nansen / NearBlocks via CoinPaprika, secondary, snapshot.
- Stablecoins on NEAR: $128.5M snapshot, secondary.
- CoinGecko `market_chart?days=400` is rejected (HTTP 401). The dashboard tries `days=365` and ignores it if it fails. Price, market cap and supply come from `simple/price` and `coins/near`, which worked.
- Peer revenue stays at the stated Blockworks quarter (secondary). Peer market caps refresh from CoinGecko when that call works.
- HSP-029 approval (2 Nov 2026, The Block) is a snapshot fact. The dashboard does not scrape later votes.
- The status pill reads "partly snapshot" even when the main Intents and price APIs are live, because Explorer, BigQuery and revenue.near.org are unused or failed by design.

## Live URL check

- https://near-intents-thesis-coral.vercel.app HTTP 200, public HTML, no Vercel Authentication
- https://near-intents-thesis-coral.vercel.app/near-intents-thesis.pdf HTTP 200, application/pdf
- https://near-intents-thesis-coral.vercel.app/dashboard-brief.pdf HTTP 200, application/pdf
- Alias: https://near-intents-thesis-rajdhruv732-2237.vercel.app also 200

Vercel project `near-intents-thesis`, production deployment `dpl_3HQJNzw2uDwtpJFberiwuvZLHpPm`. SSO protection disabled.
