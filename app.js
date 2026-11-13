(function () {
  const SNAPSHOT_DATE = "13 Nov 2026";
  const FROZEN_PRICE = 3.51;
  const FROZEN_SUPPLY = 1.312e9;
  const CAP_NOW = 0.025;
  const CAP_HSP = 0.016;
  const RECORD_VOL = 4.80e9;
  const Q4_ISSUANCE = FROZEN_SUPPLY * CAP_NOW * FROZEN_PRICE / 4;
  const Q4_NEEDED = 0.15 * Q4_ISSUANCE;
  const FEE_SWITCH = "2026-02-23";
  const CACHE_MS = 10 * 60 * 1000;

  const MONTHS_SNAP = [
    { m: "2025-09", vol: 0.48e9, fees: 0.71e6, rev: 0, hold: 0, capture: 0, take: 0 },
    { m: "2025-10", vol: 1.72e9, fees: 2.50e6, rev: 0, hold: 0, capture: 0, take: 0 },
    { m: "2025-11", vol: 3.66e9, fees: 7.76e6, rev: 0.768e6, hold: 0, capture: 0.099, take: 2.10 },
    { m: "2025-12", vol: 2.01e9, fees: 4.12e6, rev: 0.177e6, hold: 0, capture: 0.043, take: 0.88 },
    { m: "2026-01", vol: 2.72e9, fees: 4.41e6, rev: 0.359e6, hold: 0, capture: 0.081, take: 1.32 },
    { m: "2026-02", vol: 2.38e9, fees: 4.13e6, rev: 0.663e6, hold: 0.197e6, capture: 0.161, take: 2.79 },
    { m: "2026-03", vol: 2.08e9, fees: 3.59e6, rev: 0.563e6, hold: 0.563e6, capture: 0.157, take: 2.71 },
    { m: "2026-04", vol: 1.90e9, fees: 3.21e6, rev: 0.259e6, hold: 0.259e6, capture: 0.081, take: 1.36 },
    { m: "2026-05", vol: 2.00e9, fees: 3.00e6, rev: 0.620e6, hold: 0.620e6, capture: 0.207, take: 3.10 },
    { m: "2026-06", vol: 2.35e9, fees: 3.11e6, rev: 0.619e6, hold: 0.619e6, capture: 0.199, take: 2.63 },
    { m: "2026-07", vol: 2.21e9, fees: 3.27e6, rev: 0.505e6, hold: 0.505e6, capture: 0.154, take: 2.29 },
    { m: "2026-08", vol: 2.78e9, fees: 3.84e6, rev: 0.723e6, hold: 0.723e6, capture: 0.188, take: 2.60 },
    { m: "2026-09", vol: 4.80e9, fees: 7.33e6, rev: 1.840e6, hold: 1.840e6, capture: 0.251, take: 3.83 },
    { m: "2026-10", vol: 3.99e9, fees: 6.39e6, rev: 2.190e6, hold: 2.190e6, capture: 0.343, take: 5.49 },
    { m: "2026-11", vol: 1.60e9, fees: null, rev: null, hold: null, capture: null, take: null, partial: true, partialTo: "12 Nov 2026" }
  ];

  const SNAP = {
    price: 3.51,
    supply: FROZEN_SUPPLY,
    marketCap: 4.61e9,
    volAllTime: 37.61e9,
    vol30d: 3.774e9,
    vol7d: 0.953e9,
    fees30d: 6.05e6,
    feesAllTime: 60.75e6,
    rev30d: 1.84e6,
    revAllTime: 9.93e6,
    holdersAllTime: 7.58e6,
    holdersNote: "cumulative to 3 Nov 2026",
    explorerAllTime: 32.63e9,
    explorer30d: 2.54e9,
    clickShareAT: 0.87,
    clickShare30: 0.67,
    buybackWalletNear: 1.77e6,
    chainFeesDay: 24100,
    chainFeesNote: "one day, 12 Oct 2026. DefiLlama via OurCryptoTalk, secondary.",
    tvl: 188.5e6,
    tvlDate: "5 Nov 2026",
    stables: 128.5e6,
    tx30d: 685000,
    txYearAgo: 4.52e6,
    active: 61600,
    activeYearAgo: 269000,
    peerRev: {
      solana_q3_gross: 75.7e6,
      hyperliquid_q2_gross: 141.4e6,
      tron_q2_gross: 89.8e6,
      ethereum_q2_gross: 63.3e6
    },
    peerMcap: { near: 4.61e9, solana: 47.29e9, hyperliquid: 20.08e9, tron: 30.55e9, ethereum: 252.25e9 },
    context: {
      bitwiseInflows: "Bitwise NRR staking ETF listed 29 Sep 2026 with $58.89M first-week inflows (secondary).",
      svrn: "SVRN holds 55.5M NEAR (secondary).",
      brave: "Brave Leo moved to NEAR AI Cloud on 15 Oct 2026 (secondary).",
      aiCloud: "NEAR AI Cloud lists 51 models, 15 confidential (secondary).",
      aiStake: "750K+ NEAR staked for AI access (Nansen Q3, secondary).",
      aiPause: "NEAR AI paused inference after unauthorised access on 9 Nov 2026 (secondary).",
      confidential: "Confidential Intents held about $160M at end of Q3 (secondary).",
      incidents: "Incidents in 2026: Litecoin reorg (about $600K exposure, April), SWEAT drain (April), NEAR AI breach (November). These are listed for context. The fund-loss kill rule is limited to the Intents verifier or Chain Signatures and is not scored automatically."
    }
  };

  const VIEWS = [
    ["overview", "Overview"],
    ["bullpath", "Bull path"],
    ["volume", "Intents volume"],
    ["capture", "Value capture"],
    ["issuance", "Issuance vs buybacks"],
    ["breakeven", "Break-even"],
    ["valuation", "Valuation and peers"],
    ["kill", "Kill-rule monitor"],
    ["claims", "Claims ledger"],
    ["chain", "Base chain"],
    ["scenarios", "Scenarios"],
    ["sources", "Sources and method"]
  ];

  const ENDPOINTS = {
    vol: "https://api.llama.fi/summary/dexs/near-intents",
    fees: "https://api.llama.fi/summary/fees/near-intents?dataType=dailyFees",
    rev: "https://api.llama.fi/summary/fees/near-intents?dataType=dailyRevenue",
    hold: "https://api.llama.fi/summary/fees/near-intents?dataType=dailyHoldersRevenue",
    chainFees: "https://api.llama.fi/summary/fees/near?dataType=dailyFees",
    chains: "https://api.llama.fi/v2/chains",
    cgPrice: "https://api.coingecko.com/api/v3/simple/price?ids=near,solana,hyperliquid,tron,ethereum&vs_currencies=usd&include_market_cap=true",
    cgCoin: "https://api.coingecko.com/api/v3/coins/near?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false",
    explorer: "https://explorer.near-intents.org/api/v0/transactions",
    revenuePage: "https://revenue.near.org",
    rpc: "https://rpc.mainnet.near.org"
  };

  let cache = {};
  let statusRows = [];
  let jwt = null;
  let explorerData = null;
  let lastOk = null;
  let charts = {};
  let theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  let valMode = "both";
  let be = { price: 3.51, take: 4.88, cap: CAP_HSP };
  let scen = {
    bear: { vol: 3.9e9, take: 3 },
    base: { vol: 6e9, take: 5 },
    bull: { vol: 10e9, take: 7 }
  };

  if (theme === "dark") document.documentElement.classList.add("dark");

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function fmtB(n, d) {
    if (n == null || !isFinite(n)) return "n/a";
    d = d == null ? 2 : d;
    const a = Math.abs(n);
    if (a >= 1e9) return "$" + (n / 1e9).toFixed(d) + "B";
    if (a >= 1e6) return "$" + (n / 1e6).toFixed(d) + "M";
    if (a >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
    return "$" + n.toFixed(0);
  }
  function fmtPct(n, d) {
    if (n == null || !isFinite(n)) return "n/a";
    return (n * 100).toFixed(d == null ? 2 : d) + "%";
  }
  function fmtBp(n) {
    if (n == null || !isFinite(n)) return "n/a";
    return n.toFixed(2) + " bp";
  }
  function fmtPx(n) {
    if (n == null || !isFinite(n)) return "n/a";
    return "$" + n.toFixed(2);
  }
  function fmtN(n, d) {
    if (n == null || !isFinite(n)) return "n/a";
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(d == null ? 2 : d) + "B";
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(d == null ? 2 : d) + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toFixed(d == null ? 0 : d);
  }
  function isoTime(t) {
    if (!t) return "";
    const d = new Date(t);
    return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  }
  function monthKey(unixSec) {
    const d = new Date(unixSec * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return y + "-" + m;
  }
  function sumChart(chart) {
    const map = {};
    const daily = [];
    let last = null;
    (chart || []).forEach(([t, v]) => {
      const k = monthKey(t);
      map[k] = (map[k] || 0) + Number(v);
      daily.push({ t, v: Number(v), day: new Date(t * 1000).toISOString().slice(0, 10) });
      last = t;
    });
    return { months: map, daily, last };
  }
  function issuanceMonthly(supply, cap, price) { return supply * cap * price / 12; }
  function takeBp(rev, vol) { return vol ? (rev / vol) * 10000 : null; }
  function capture(rev, fees) { return fees ? rev / fees : null; }
  function coverage(rev, iss) { return iss ? rev / iss : null; }
  function yoctoToNear(s) {
    const str = String(s);
    if (!/^\d+$/.test(str)) return null;
    if (str.length <= 24) return Number(str) / 1e24;
    const whole = str.slice(0, str.length - 24);
    const frac = str.slice(str.length - 24, str.length - 18);
    return Number(whole + "." + frac);
  }
  function hatch(color, line) {
    const c = document.createElement("canvas");
    c.width = 8; c.height = 8;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 8, 8);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2, 10); ctx.lineTo(10, -2);
    ctx.stroke();
    return ctx.createPattern(c, "repeat");
  }
  function ink() { return getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#1a1a1a"; }
  function muted() { return getComputedStyle(document.documentElement).getPropertyValue("--muted").trim() || "#5a5a5a"; }
  function gridCol() { return getComputedStyle(document.documentElement).getPropertyValue("--line").trim() || "#e3e1db"; }
  function accent() { return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2563eb"; }
  function tag(kind, text) { return '<span class="tag ' + kind + '">' + esc(text) + "</span>"; }
  function tip(text) { return ' title="' + esc(text) + '"'; }

  function recordStatus(name, url, ok, detail, at, usedSnapshot, error) {
    const existing = statusRows.findIndex(r => r.name === name);
    const row = { name, url, ok, detail, at, usedSnapshot: !!usedSnapshot, error: error || null };
    if (existing >= 0) statusRows[existing] = row; else statusRows.push(row);
  }

  async function fetchJSON(name, url, opt) {
    const now = Date.now();
    const force = opt && opt.force;
    if (!force && cache[name] && now - cache[name].at < CACHE_MS) {
      recordStatus(name, url, true, cache[name].detail || "cached", cache[name].at, false, null);
      return cache[name].data;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), (opt && opt.timeout) || 20000);
    try {
      const headers = Object.assign({ "Accept": "application/json" }, (opt && opt.headers) || {});
      const res = await fetch(url, { method: (opt && opt.method) || "GET", headers, body: opt && opt.body, signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const detail = (opt && opt.summarize) ? opt.summarize(data) : "ok";
      cache[name] = { data, at: Date.now(), detail };
      recordStatus(name, url, true, detail, cache[name].at, false, null);
      return data;
    } catch (err) {
      recordStatus(name, url, false, "failed", Date.now(), true, String(err && err.message ? err.message : err));
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchRPC(name, method, params) {
    const url = ENDPOINTS.rpc;
    const now = Date.now();
    if (cache[name] && now - cache[name].at < CACHE_MS) {
      recordStatus(name, url + " " + method, true, cache[name].detail || "cached", cache[name].at, false, null);
      return cache[name].data;
    }
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: "dash", method: method, params: params })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || "RPC error");
      cache[name] = { data: data.result, at: Date.now(), detail: "ok" };
      recordStatus(name, url + " " + method, true, "ok", cache[name].at, false, null);
      return data.result;
    } catch (err) {
      recordStatus(name, url + " " + method, false, "failed", Date.now(), true, String(err && err.message ? err.message : err));
      return null;
    }
  }


  function snapshotBundle() {
    return {
      live: false,
      price: { v: SNAP.price, src: "snapshot, " + SNAPSHOT_DATE + ", CoinGecko", live: false },
      supply: { v: SNAP.supply, src: "snapshot, " + SNAPSHOT_DATE + ", CoinGecko circulating supply", live: false },
      marketCap: { v: SNAP.marketCap, src: "snapshot, " + SNAPSHOT_DATE + ", computed from price x supply", live: false },
      vol30d: { v: SNAP.vol30d, src: "snapshot, " + SNAPSHOT_DATE + ", DefiLlama", live: false },
      vol7d: { v: SNAP.vol7d, src: "snapshot, " + SNAPSHOT_DATE + ", DefiLlama", live: false },
      volAllTime: { v: SNAP.volAllTime, src: "snapshot, " + SNAPSHOT_DATE + ", DefiLlama", live: false },
      fees30d: { v: SNAP.fees30d, src: "snapshot, " + SNAPSHOT_DATE + ", DefiLlama", live: false },
      feesAllTime: { v: SNAP.feesAllTime, src: "snapshot, " + SNAPSHOT_DATE + ", DefiLlama", live: false },
      rev30d: { v: SNAP.rev30d, src: "snapshot, " + SNAPSHOT_DATE + ", DefiLlama", live: false },
      revAllTime: { v: SNAP.revAllTime, src: "snapshot, " + SNAPSHOT_DATE + ", DefiLlama", live: false },
      holdAllTime: { v: SNAP.holdersAllTime, src: "snapshot, " + SNAPSHOT_DATE + ", DefiLlama protocol page, " + SNAP.holdersNote, live: false },
      hold30d: { v: null, src: "not in snapshot as a 30-day total", live: false },
      months: MONTHS_SNAP.map(x => Object.assign({}, x, { live: false })),
      dailyVol: null,
      dailyRev: null,
      dailyFees: null,
      dailyHold: null,
      lastDay: "2026-11-12",
      chainFees24h: { v: SNAP.chainFeesDay, src: SNAP.chainFeesNote, live: false },
      tvl: { v: SNAP.tvl, src: "snapshot, " + SNAP.tvlDate + ", DefiLlama via CoinPaprika, secondary", live: false },
      stables: { v: SNAP.stables, src: "snapshot, " + SNAPSHOT_DATE + ", secondary", live: false },
      peerMcap: { v: Object.assign({}, SNAP.peerMcap), src: "snapshot, " + SNAPSHOT_DATE, live: false },
      explorerAllTime: { v: SNAP.explorerAllTime, src: "snapshot, " + SNAPSHOT_DATE + ", Intents Explorer page", live: false },
      explorer30d: { v: SNAP.explorer30d, src: "snapshot, " + SNAPSHOT_DATE + ", Intents Explorer page", live: false },
      buybackWallet: { v: SNAP.buybackWalletNear, src: "snapshot, " + SNAPSHOT_DATE + ", revenue.near.org (illustrative)", live: false },
      rpcSupply: { v: null, src: "NEAR RPC not fetched; using snapshot circulating supply", live: false },
      inflation: { v: CAP_NOW, src: "snapshot: 2.5% now, 1.6% end state under HSP-029 (The Block, approved 2 Nov 2026)", live: false }
    };
  }

  function mergeLive(raw) {
    const b = snapshotBundle();
    const vol = raw.vol, fees = raw.fees, rev = raw.rev, hold = raw.hold;
    if (vol && vol.total30d != null) {
      b.vol30d = { v: vol.total30d, src: "DefiLlama volume total30d", live: true, at: raw.times.vol };
      b.vol7d = { v: vol.total7d, src: "DefiLlama volume total7d", live: true, at: raw.times.vol };
      b.volAllTime = { v: vol.totalAllTime, src: "DefiLlama volume totalAllTime", live: true, at: raw.times.vol };
      const sc = sumChart(vol.totalDataChart);
      b.dailyVol = sc.daily;
      if (sc.last) b.lastDay = new Date(sc.last * 1000).toISOString().slice(0, 10);
    }
    if (fees && fees.total30d != null) {
      b.fees30d = { v: fees.total30d, src: "DefiLlama fees total30d", live: true, at: raw.times.fees };
      b.feesAllTime = { v: fees.totalAllTime, src: "DefiLlama fees totalAllTime", live: true, at: raw.times.fees };
      b.dailyFees = sumChart(fees.totalDataChart).daily;
    }
    if (rev && rev.total30d != null) {
      b.rev30d = { v: rev.total30d, src: "DefiLlama revenue total30d", live: true, at: raw.times.rev };
      b.revAllTime = { v: rev.totalAllTime, src: "DefiLlama revenue totalAllTime", live: true, at: raw.times.rev };
      b.dailyRev = sumChart(rev.totalDataChart).daily;
    }
    if (hold) {
      if (hold.totalAllTime != null) {
        b.holdAllTime = { v: hold.totalAllTime, src: "DefiLlama holders revenue totalAllTime", live: true, at: raw.times.hold };
      }
      if (hold.total30d != null) {
        b.hold30d = { v: hold.total30d, src: "DefiLlama holders revenue total30d", live: true, at: raw.times.hold };
      }
      b.dailyHold = sumChart(hold.totalDataChart).daily;
    }
    if (vol && vol.totalDataChart && fees && rev) {
      const mv = sumChart(vol.totalDataChart).months;
      const mf = sumChart(fees.totalDataChart).months;
      const mr = sumChart(rev.totalDataChart).months;
      const mh = hold ? sumChart(hold.totalDataChart).months : {};
      const keys = Object.keys(mv).filter(k => k >= "2025-09").sort();
      const lastKey = keys[keys.length - 1];
      b.months = keys.map(k => {
        const volM = mv[k], feesM = mf[k], revM = mr[k], holdM = mh[k];
        const row = {
          m: k, vol: volM, fees: feesM != null ? feesM : null, rev: revM != null ? revM : null,
          hold: holdM != null ? holdM : null,
          capture: (revM != null && feesM) ? revM / feesM : null,
          take: (revM != null && volM) ? takeBp(revM, volM) : null,
          live: true
        };
        if (k === lastKey && b.lastDay) {
          const day = Number(b.lastDay.slice(8));
          if (day > 0 && day < 28) {
            row.partial = true;
            row.partialTo = new Date(b.lastDay + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
          }
        }
        return row;
      });
    }
    if (raw.cgPrice && raw.cgPrice.near) {
      const n = raw.cgPrice.near;
      b.price = { v: n.usd, src: "CoinGecko simple/price", live: true, at: raw.times.cgPrice };
      if (n.usd_market_cap) b.marketCap = { v: n.usd_market_cap, src: "CoinGecko simple/price market cap", live: true, at: raw.times.cgPrice };
      b.peerMcap = {
        v: {
          near: n.usd_market_cap,
          solana: raw.cgPrice.solana && raw.cgPrice.solana.usd_market_cap,
          hyperliquid: raw.cgPrice.hyperliquid && raw.cgPrice.hyperliquid.usd_market_cap,
          tron: raw.cgPrice.tron && raw.cgPrice.tron.usd_market_cap,
          ethereum: raw.cgPrice.ethereum && raw.cgPrice.ethereum.usd_market_cap
        },
        src: "CoinGecko simple/price, live market caps. Peer revenue stays at the stated quarter (secondary, Blockworks).",
        live: true, at: raw.times.cgPrice
      };
    }
    if (raw.cgCoin && raw.cgCoin.market_data) {
      const md = raw.cgCoin.market_data;
      if (md.circulating_supply) b.supply = { v: md.circulating_supply, src: "CoinGecko coins/near circulating_supply", live: true, at: raw.times.cgCoin };
      if (md.market_cap && md.market_cap.usd) b.marketCap = { v: md.market_cap.usd, src: "CoinGecko coins/near market_cap", live: true, at: raw.times.cgCoin };
    }
    if (raw.chainFees && raw.chainFees.total24h != null) {
      b.chainFees24h = { v: raw.chainFees.total24h, src: "DefiLlama NEAR chain fees total24h", live: true, at: raw.times.chainFees };
      b.chainFees30d = { v: raw.chainFees.total30d, src: "DefiLlama NEAR chain fees total30d", live: true, at: raw.times.chainFees };
    }
    if (raw.chains) {
      const row = (raw.chains || []).find(x => (x.name === "Near" || x.gecko_id === "near"));
      if (row && row.tvl != null) b.tvl = { v: row.tvl, src: "DefiLlama v2/chains TVL for Near", live: true, at: raw.times.chains };
    }
    if (raw.block && raw.block.header && raw.block.header.total_supply) {
      const ts = yoctoToNear(raw.block.header.total_supply);
      if (ts) b.rpcSupply = { v: ts, src: "NEAR RPC block header total_supply, yoctoNEAR / 1e24", live: true, at: raw.times.block };
    }
    if (raw.proto && raw.proto.max_inflation_rate) {
      const r = raw.proto.max_inflation_rate;
      if (Array.isArray(r) && r[1]) {
        b.inflation = { v: r[0] / r[1], src: "NEAR RPC EXPERIMENTAL_protocol_config max_inflation_rate " + r[0] + "/" + r[1], live: true, at: raw.times.proto };
      }
    }
    b.live = !!(vol && rev && fees);
    return b;
  }

  function computed(b) {
    const take = takeBp(b.rev30d.v, b.vol30d.v);
    const cap = capture(b.rev30d.v, b.fees30d.v);
    const iss30 = b.supply.v * CAP_NOW * b.price.v * 30 / 365;
    const cov = coverage(b.rev30d.v, iss30);
    const iss30Frozen = FROZEN_SUPPLY * CAP_NOW * FROZEN_PRICE * 30 / 365;
    const takeSnap = takeBp(SNAP.rev30d, SNAP.vol30d);
    const capSnap = capture(SNAP.rev30d, SNAP.fees30d);
    const covSnap = coverage(SNAP.rev30d, iss30Frozen);
    let q4rev = 0, q4vol = 0, q4fees = 0, q4hold = 0, q4revKnown = true;
    b.months.forEach(row => {
      if (row.m >= "2026-10") {
        if (row.rev == null) q4revKnown = false;
        else q4rev += row.rev;
        q4vol += row.vol || 0;
        if (row.fees != null) q4fees += row.fees;
        if (row.hold != null) q4hold += row.hold;
      }
    });
    const q4cov = coverage(q4rev, Q4_ISSUANCE);
    const q4progress = q4rev / Q4_NEEDED;
    return { take, cap, cov, iss30, takeSnap, capSnap, covSnap, q4rev, q4vol, q4fees, q4hold, q4revKnown, q4cov, q4progress };
  }

  function delta(cur, base) {
    if (cur == null || base == null || !isFinite(cur) || !isFinite(base) || base === 0) return { t: "n/a vs 13 Nov", cls: "flat" };
    const p = (cur - base) / base * 100;
    if (Math.abs(p) < 0.05) return { t: "unchanged vs 13 Nov baseline", cls: "flat" };
    const sign = p > 0 ? "+" : "";
    return { t: sign + p.toFixed(2) + "% vs 13 Nov baseline", cls: p > 0 ? "up" : "down" };
  }

  function srcTag(item) {
    if (!item) return tag("", "snapshot, " + SNAPSHOT_DATE);
    if (item.live) return tag("live", "live");
    return tag("", "snapshot, " + SNAPSHOT_DATE);
  }

  let current = snapshotBundle();

  async function loadAll(force) {
    el("refreshBtn").disabled = true;
    el("statusPill").textContent = "loading";
    el("statusPill").className = "pill";
    const opt = { force: !!force };
    const tasks = {
      vol: fetchJSON("vol", ENDPOINTS.vol, Object.assign({ summarize: d => "30d " + fmtB(d.total30d) }, opt)),
      fees: fetchJSON("fees", ENDPOINTS.fees, Object.assign({ summarize: d => "30d " + fmtB(d.total30d) }, opt)),
      rev: fetchJSON("rev", ENDPOINTS.rev, Object.assign({ summarize: d => "30d " + fmtB(d.total30d) }, opt)),
      hold: fetchJSON("hold", ENDPOINTS.hold, Object.assign({ summarize: d => "all-time " + fmtB(d.totalAllTime) }, opt)),
      chainFees: fetchJSON("chainFees", ENDPOINTS.chainFees, Object.assign({ summarize: d => "24h " + fmtB(d.total24h) }, opt)),
      chains: fetchJSON("chains", ENDPOINTS.chains, Object.assign({ summarize: d => Array.isArray(d) ? d.length + " chains" : "ok" }, opt)),
      cgPrice: fetchJSON("cgPrice", ENDPOINTS.cgPrice, Object.assign({ summarize: d => d.near ? "NEAR " + fmtPx(d.near.usd) : "ok" }, opt)),
      cgCoin: fetchJSON("cgCoin", ENDPOINTS.cgCoin, Object.assign({ summarize: d => d.market_data ? "supply " + fmtN(d.market_data.circulating_supply) : "ok" }, opt)),
      block: fetchRPC("block", "block", { finality: "final" }),
      proto: fetchRPC("proto", "EXPERIMENTAL_protocol_config", { finality: "final" })
    };
    recordStatus("BigQuery", "bigquery-public-data.crypto_near_mainnet_us", false, "offline query, see repo", Date.now(), true, "Not callable from a browser.");
    recordStatus("revenue.near.org", ENDPOINTS.revenuePage, false, "page marks figures illustrative; no public JSON used", Date.now(), true, "Not fetched as a structured API. Buyback wallet uses the snapshot.");
    if (!jwt) {
      recordStatus("Explorer 1Click", ENDPOINTS.explorer, false, "no JWT; showing snapshot", Date.now(), true, "Key not entered.");
    }
    const keys = Object.keys(tasks);
    const vals = await Promise.all(keys.map(k => tasks[k]));
    const raw = { times: {} };
    keys.forEach((k, i) => {
      raw[k] = vals[i];
      raw.times[k] = cache[k] ? cache[k].at : null;
    });
    if (jwt) fetchExplorer();
    current = mergeLive(raw);
    lastOk = Date.now();
    const liveCount = statusRows.filter(r => r.ok && !r.usedSnapshot).length;
    const failCount = statusRows.filter(r => !r.ok).length;
    let pill = "all live", cls = "pill live";
    if (liveCount === 0) { pill = "offline, snapshot 13 Nov 2026"; cls = "pill offline"; }
    else if (failCount > 0) { pill = "partly snapshot"; cls = "pill partial"; }
    el("statusPill").textContent = pill;
    el("statusPill").className = cls;
    el("updatedPill").textContent = "last updated: " + isoTime(lastOk);
    el("refreshBtn").disabled = false;
    renderAll();
  }

  async function fetchExplorer() {
    if (!jwt) return;
    await fetchJSON("explorer", ENDPOINTS.explorer, {
      force: true,
      timeout: 15000,
      headers: { Authorization: "Bearer " + jwt },
      summarize: d => "ok"
    });
  }

  function kpiHTML(label, value, item, extra, base) {
    const d = base != null ? delta(item && item.v, base) : null;
    const tipText = (item && (item.src + (item.at ? " · " + isoTime(item.at) : ""))) || "";
    return '<article class="card kpi"' + tip(tipText) + '><p class="label">' + esc(label) + "</p>" +
      '<p class="value">' + esc(value) + "</p>" +
      '<div class="meta">' + srcTag(item) +
      (d ? '<span class="delta ' + d.cls + '">' + esc(d.t) + "</span>" : "") +
      (extra || "") + "</div></article>";
  }

  function chartDefaults() {
    Chart.defaults.font.family = "IBM Plex Sans, Segoe UI, sans-serif";
    Chart.defaults.color = muted();
    Chart.defaults.borderColor = gridCol();
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.tooltip.backgroundColor = "#1a1a1a";
    Chart.defaults.plugins.tooltip.titleColor = "#fff";
    Chart.defaults.plugins.tooltip.bodyColor = "#fff";
    Chart.defaults.plugins.tooltip.padding = 10;
    if (window.ChartDataLabels) Chart.defaults.plugins.datalabels = { display: false };
  }

  function killChart(id) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  }

  function makeChart(id, cfg) {
    killChart(id);
    const canvas = el(id);
    if (!canvas) return;
    charts[id] = new Chart(canvas, cfg);
    return charts[id];
  }



  const Q4_END_UTC = Date.UTC(2026, 11, 31, 23, 59, 0);
  const Q4_START_UTC = Date.UTC(2026, 9, 1, 0, 0, 0);
  const Q4_TOTAL_DAYS = 92;
  const BULL_TAKE_BP = 7;
  const BULL_MONTHLY_VOL = 10e9;
  let countdownTimer = null;

  function lastRevenueDay(b) {
    if (b.dailyRev && b.dailyRev.length) {
      const rows = b.dailyRev.filter(p => p.v != null && p.day >= "2026-10-01");
      if (rows.length) return rows[rows.length - 1].day;
    }
    const months = (b.months || []).filter(r => r.m >= "2026-10" && r.rev != null);
    if (!months.length) return null;
    const last = months[months.length - 1];
    if (last.partial && last.partialTo) {
      try {
        const d = new Date(last.partialTo);
        if (!isNaN(d)) return d.toISOString().slice(0, 10);
      } catch (e) {}
    }
    const [y, m] = last.m.split("-").map(Number);
    const lastDate = new Date(Date.UTC(y, m, 0));
    return lastDate.toISOString().slice(0, 10);
  }

  function daysInclusive(isoDay) {
    if (!isoDay) return null;
    const t = Date.parse(isoDay + "T00:00:00Z");
    if (!isFinite(t)) return null;
    return Math.floor((t - Q4_START_UTC) / 86400000) + 1;
  }

  function q4Pace(b, c) {
    const lastDay = lastRevenueDay(b);
    const days = daysInclusive(lastDay);
    const needed = Q4_NEEDED;
    const proration = days ? needed * (days / Q4_TOTAL_DAYS) : null;
    const onTrack = proration != null && c.q4rev != null && c.q4rev >= proration;
    const months = (b.months || []).filter(r => r.m >= "2026-10" && r.rev != null).map(r => r.m);
    return { lastDay, days, needed, proration, onTrack, months, known: lastDay != null && c.q4rev != null };
  }

  function formatCountdown(now) {
    const ms = Q4_END_UTC - now;
    if (ms <= 0) return "Q4 2026 has ended (31 Dec 2026, 11:59 PM UTC).";
    const sec = Math.floor(ms / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return d + "d " + h + "h " + m + "m left";
  }

  function startCountdown() {
    const tick = () => {
      document.querySelectorAll(".q4clock").forEach(node => { node.textContent = formatCountdown(Date.now()); });
    };
    tick();
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(tick, 30000);
  }

  function completeQuarters(b) {
    const defs = [
      { q: "Q1 2026", ms: ["2026-01", "2026-02", "2026-03"] },
      { q: "Q2 2026", ms: ["2026-04", "2026-05", "2026-06"] },
      { q: "Q3 2026", ms: ["2026-07", "2026-08", "2026-09"] }
    ];
    const by = {};
    (b.months || []).forEach(r => { by[r.m] = r; });
    return defs.map(d => {
      const rows = d.ms.map(m => by[m]).filter(Boolean);
      const vol = rows.reduce((s, r) => s + (r.vol || 0), 0);
      const fees = rows.every(r => r.fees != null) ? rows.reduce((s, r) => s + r.fees, 0) : null;
      const rev = rows.every(r => r.rev != null) ? rows.reduce((s, r) => s + r.rev, 0) : null;
      return {
        q: d.q,
        vol, fees, rev,
        capture: (rev != null && fees) ? rev / fees : null,
        take: (rev != null && vol) ? takeBp(rev, vol) : null,
        cov: (rev != null) ? coverage(rev, Q4_ISSUANCE) : null,
        complete: rows.length === 3 && rev != null
      };
    });
  }

  function q4HeadlineHTML(b, c) {
    const pace = q4Pace(b, c);
    const monthsText = pace.months.length
      ? ("Months counted: " + pace.months.join(", ") + (pace.lastDay ? ", through " + pace.lastDay : "") + ".")
      : "No Q4 revenue days are in the current series.";
    const method = "On track if Q4 protocol revenue to date is at or above a pro-rata share of the $4.32M needed for 15% coverage. The share is calendar days from 1 Oct 2026 to the last day with protocol revenue, divided by 92 days in Q4. Issuance is held at a frozen $3.51 and 1.312B supply. A later volume-only day is not used.";
    const badge = !pace.known
      ? '<span class="badge wait">Insufficient Q4 revenue days</span>'
      : (pace.onTrack ? '<span class="badge ok">On track</span>' : '<span class="badge no">Not on track</span>');
    const proLine = pace.proration != null
      ? ("Pro-rata needed by " + pace.lastDay + " (day " + pace.days + " of 92): " + fmtB(pace.proration) + ". Revenue so far: " + fmtB(c.q4rev) + ".")
      : "";
    return '<div class="q4-hero">' +
      '<div class="card hero-main"' + tip(method) + '>' +
        '<h3>Q4 2026 coverage test, at a frozen $3.51</h3>' +
        '<div class="q4-stat">' + fmtPct(c.q4cov) + " of issuance so far</div>" +
        '<div class="progress' + ((c.q4cov != null && c.q4cov < 0.15) ? " risk" : "") + '"><span style="width:' + Math.min(100, (c.q4progress || 0) * 100).toFixed(1) + '%"></span></div>' +
        '<p class="progress-label">' + fmtB(c.q4rev) + " of " + fmtB(Q4_NEEDED) + " needed to reach 15% coverage (" + ((c.q4progress || 0) * 100).toFixed(1) + "% of the way). " +
        esc(monthsText) + " " + esc(proLine) + " " + badge + "</p>" +
        '<p class="note">' + esc(method) + "</p>" +
      "</div>" +
      '<div class="card"><h3>Time left in Q4</h3>' +
        '<p class="sub">Deadline: 31 Dec 2026, 11:59 PM UTC, which is 1 Jan 2027, 5:29 AM IST.</p>' +
        '<div class="countdown q4clock">' + esc(formatCountdown(Date.now())) + "</div>" +
        '<p class="note">If Q4 coverage finishes below 15% at $3.51, the token case is dead under the frozen rules. Coverage gets no reset.</p>' +
      "</div></div>";
  }

  function catalysts(b, c) {
    const qs = completeQuarters(b);
    const maxVol = Math.max.apply(null, qs.map(q => q.vol || 0));
    const maxCap = Math.max.apply(null, qs.filter(q => q.capture != null).map(q => q.capture));
    const maxTakeQ = Math.max.apply(null, qs.filter(q => q.take != null).map(q => q.take));
    const months = (b.months || []).filter(r => r.take != null && !r.partial);
    const maxTakeM = months.length ? Math.max.apply(null, months.map(r => r.take)) : null;
    const maxCovQ = Math.max.apply(null, qs.filter(q => q.cov != null).map(q => q.cov));
    const volMet = qs.some(q => q.complete && q.vol >= 20e9);
    const capMet = qs.some(q => q.complete && q.capture != null && q.capture >= 0.40);
    const takeMet = (maxTakeM != null && maxTakeM >= 7) || qs.some(q => q.complete && q.take >= 7);
    const covMet = qs.some(q => q.complete && q.cov >= 0.50) || (c.cov != null && c.cov >= 0.50);
    return [
      ["HSP-029 adoption (cuts issuance by a third)", "pending, manual", "Approved 2 Nov 2026 (The Block, snapshot). The thesis notes a veto window, and that validators still have to adopt a cut that lowers their own income by about 36% (section 6). This dashboard does not scrape later votes."],
      ["Q4 2026 coverage result, 15% at $3.51", "in progress", "Single test at quarter end. So far " + fmtPct(c.q4cov) + " (" + fmtB(c.q4rev) + " of " + fmtB(Q4_NEEDED) + ")."],
      ["A quarter above $20B of Intents volume", volMet ? "met" : "not met", "Highest complete quarter in the series is " + fmtB(maxVol) + ". Confirm signal from the thesis, section 10."],
      ["Capture above 40% for a full quarter", capMet ? "met" : "not met", "Highest complete quarter is " + fmtPct(maxCap) + ". Q4 is not a complete quarter."],
      ["Take rate above 7 bp", takeMet ? "met" : "not met", "Highest complete month is " + (maxTakeM == null ? "n/a" : fmtBp(maxTakeM)) + "; highest complete quarter is " + fmtBp(maxTakeQ) + ". The 30-day take rate is " + fmtBp(c.take) + "."],
      ["Revenue above 50% of issuance", covMet ? "met" : "not met", "Highest complete quarter at $3.51 is " + fmtPct(maxCovQ) + ". The 30-day window is " + fmtPct(c.cov) + " at the live or snapshot price used on the Overview tile."],
      ["Published NEAR AI revenue", "pending, manual", "The thesis (section 5) says no revenue, token volume or customer count is public. We do not invent a figure."]
    ];
  }

  function renderOverview() {
    const b = current, c = computed(b);
    const root = el("view-overview");
    const qs = completeQuarters(b);
    root.innerHTML =
      '<p class="lead">NEAR Intents is a growing settlement product whose fees now buy back about 19% of new issuance on the best recent 30 days, up from 5-11% on full quarters in 2026. The token case is still unproven: all four kill rules fired in the first half of 2026, and Q4 must clear 15% coverage at a frozen $3.51 price.</p>' +
      q4HeadlineHTML(b, c) +
      '<div class="trend-grid">' +
        '<div class="card chart-card"><h3>Take rate by month, since the fee switch</h3>' +
        '<p class="sub">Protocol revenue / volume, in basis points. February 2026 was 2.79 bp in the snapshot table; October was 5.49 bp. A partial month is hatched. Two months are not a trend.</p>' +
        '<div class="chart-wrap short"><canvas id="cOvTake"></canvas></div></div>' +
        '<div class="card chart-card"><h3>Capture by quarter</h3>' +
        '<p class="sub">Protocol revenue / gross fees. Q1 2026 was 13.1% and Q3 was 21.2% in the snapshot quarterly table, recomputed here from the monthly series when live data is present.</p>' +
        '<div class="chart-wrap short"><canvas id="cOvCap"></canvas></div></div>' +
        '<div class="card chart-card"><h3>Coverage of issuance</h3>' +
        '<p class="sub">Complete quarters at a frozen $3.51 (Q1-Q3: 5.5%, 5.2%, 10.7% in the snapshot table). The last bar is the best recent 30 days at $3.51, so it is comparable to the thesis figure of about 19%. Full quarters were 5-11%.</p>' +
        '<div class="chart-wrap short"><canvas id="cOvCov"></canvas></div></div>' +
      "</div>" +
      '<div class="kpis">' +
        kpiHTML("Intents 30-day volume", fmtB(b.vol30d.v), b.vol30d, "", SNAP.vol30d) +
        kpiHTML("30-day protocol revenue", fmtB(b.rev30d.v), b.rev30d, "", SNAP.rev30d) +
        kpiHTML("Take rate, 30 days", fmtBp(c.take), { v: c.take, live: b.rev30d.live && b.vol30d.live, src: "protocol revenue / volume, in basis points", at: b.rev30d.at }, "", c.takeSnap) +
        kpiHTML("Capture, 30 days", fmtPct(c.cap), { v: c.cap, live: b.rev30d.live && b.fees30d.live, src: "protocol revenue / gross fees", at: b.rev30d.at }, "", c.capSnap) +
        kpiHTML("Coverage of issuance, 30 days", fmtPct(c.cov), { v: c.cov, live: b.rev30d.live && b.price.live, src: "30-day revenue / (supply x 2.5% x price x 30/365). Live price used here. The Q4 test and the coverage chart use $3.51.", at: b.rev30d.at }, "", c.covSnap) +
        kpiHTML("NEAR price and market cap", fmtPx(b.price.v) + " · " + fmtB(b.marketCap.v, 2), b.price, '<span' + tip(b.marketCap.src) + ">" + srcTag(b.marketCap) + "</span>", SNAP.price) +
      "</div>" +
      '<div class="fired-box"><h3>Four quantitative kill rules fired in the first half of 2026</h3><ul>' +
        "<li>Intents volume below $8B a quarter: $7.18B in Q1 and $6.25B in Q2. Q3 recovered to $9.79B. FIRED on Q1-Q2.</li>" +
        "<li>Capture below 20%: 13.1% in Q1 and 16.1% in Q2. Q3 reached 21.2%. FIRED on Q1-Q2.</li>" +
        "<li>Take rate below 3 bp: 2.21 bp in Q1 and 2.40 bp in Q2. Q3 reached 3.14 bp. FIRED on Q1-Q2.</li>" +
        "<li>Revenue / issuance below 15%: 5.5% in Q1, 5.2% in Q2, 10.7% in Q3. FIRED, and still below. This rule gets no reset. Q4 is the last test, at a frozen $3.51 price.</li>" +
      '</ul><p class="note">History figures are from the 13 Nov 2026 snapshot quarterly table. Volume, capture and take rate restart their count from Q4 2026 because all three recovered in Q3.</p></div>' +
      '<div class="grid-2" style="margin-bottom:16px">' +
        '<div class="card moat"><h3>Moat and evidence</h3><p class="sub">Only claims written in the thesis, each with the source named there.</p><ul>' +
          "<li>Brave, Ledger and the Zcash wallet already route through Intents. Thesis, section 8 (Competition). The same report, section 4, also says Brave, Ledger, SimpleSwap and the main NEAR wallets route through it, and that more than $2.6B of ZEC has settled through Intents, mostly from the Zashi wallet. The $2.6B line sits next to a Nansen figure for near.com but is not given its own source name.</li>" +
          "<li>Confidential Intents held about $160M at the end of Q3 2026. Thesis, section 8. The report does not name an underlying data source for this figure.</li>" +
          "<li>Intents uses a solver market instead of a bridge pool, so there is no wrapped asset or pool to drain. Thesis, section 8, the authors' description of the product.</li>" +
          "<li>Intents held up while chain transactions fell about 85% from Nov 2025 to Nov 2026. Thesis, section 2 (H1). The chain figures are 4.52M transactions a day in Nov 2025 versus 685K in the 30 days to 4 Nov 2026 (NearBlocks via CoinPaprika, secondary). October 2026 Intents volume ($3.99B) beat the November 2025 spike ($3.66B), DefiLlama.</li>" +
        "</ul></div>" +
        '<div class="card catalysts"><h3>Catalysts and confirm signals</h3><p class="sub">Confirm signals are from the thesis, section 10. Status is live where a number can be computed; otherwise pending, manual.</p>' +
        catalysts(b, c).map(r => {
          const kind = r[1] === "met" ? "ok" : (r[1] === "not met" || r[1] === "in progress" ? (r[1] === "not met" ? "no" : "wait") : "wait");
          return '<div class="cat-row"><div>' + esc(r[0]) + "</div><div>" + tag(kind === "ok" ? "ok" : (kind === "no" ? "fired" : "watch"), r[1]) + "</div><div class='note' style='margin:0'>" + esc(r[2]) + "</div></div>";
        }).join("") +
        "</div>" +
      "</div>";

    const takeRows = (b.months || []).filter(r => r.m >= "2026-02" && r.take != null);
    makeChart("cOvTake", {
      type: "line",
      data: { labels: takeRows.map(r => r.m), datasets: [{ data: takeRows.map(r => r.take), borderColor: accent(), pointBackgroundColor: takeRows.map(r => r.partial ? "#888" : accent()), pointRadius: 4, tension: 0.2 }] },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: "bp" } } },
        plugins: {
          datalabels: { display: true, align: "top", color: ink(), font: { size: 9, weight: "600" }, formatter: v => v.toFixed(1) },
          tooltip: { callbacks: { label: ctx => fmtBp(ctx.parsed.y) + " · " + (takeRows[ctx.dataIndex].live ? "live monthly sum" : "snapshot, " + SNAPSHOT_DATE) } }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels] : []
    });
    makeChart("cOvCap", {
      type: "bar",
      data: { labels: qs.map(q => q.q), datasets: [{ data: qs.map(q => q.capture == null ? null : q.capture * 100), backgroundColor: accent() }] },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: "%" }, suggestedMax: 40 } },
        plugins: {
          datalabels: { display: true, anchor: "end", align: "end", color: ink(), font: { size: 10, weight: "600" }, formatter: v => v == null ? "" : v.toFixed(1) + "%" },
          tooltip: { callbacks: { label: ctx => fmtPct(qs[ctx.dataIndex].capture) + " · complete quarter, revenue / fees" } }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels] : []
    });
    const cov30frozen = coverage(b.rev30d.v, FROZEN_SUPPLY * CAP_NOW * FROZEN_PRICE * 30 / 365);
    const covLabels = qs.map(q => q.q).concat(["30 days at $3.51"]);
    const covVals = qs.map(q => q.cov == null ? null : q.cov * 100).concat([cov30frozen == null ? null : cov30frozen * 100]);
    const covCol = qs.map(() => "#b8b8b8").concat([accent()]);
    makeChart("cOvCov", {
      type: "bar",
      data: { labels: covLabels, datasets: [{ data: covVals, backgroundColor: covCol }] },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: "%" }, suggestedMax: 25 } },
        plugins: {
          annotation: { annotations: { kill: { type: "line", yMin: 15, yMax: 15, borderColor: "#b91c1c", borderDash: [6, 4], borderWidth: 1.5, label: { display: true, content: "15% kill line", position: "end", color: "#b91c1c", backgroundColor: "transparent", font: { size: 9 } } } } },
          datalabels: { display: true, anchor: "end", align: "end", color: ink(), font: { size: 10, weight: "600" }, formatter: v => v == null ? "" : v.toFixed(1) + "%" },
          tooltip: { callbacks: { label: ctx => (ctx.parsed.y == null ? "n/a" : ctx.parsed.y.toFixed(2) + "%") + " · issuance at $3.51 and 1.312B, 2.5%" } }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels] : []
    });
    startCountdown();
  }


  function renderBullPath() {
    const b = current, c = computed(b);
    const root = el("view-bullpath");
    const issHsp = FROZEN_SUPPLY * CAP_HSP * FROZEN_PRICE;
    const takePct = c.take == null ? 0 : Math.min(100, (c.take / BULL_TAKE_BP) * 100);
    const volPct = b.vol30d.v == null ? 0 : Math.min(100, (b.vol30d.v / BULL_MONTHLY_VOL) * 100);
    const bullRev = BULL_MONTHLY_VOL * (BULL_TAKE_BP / 10000) * 12;
    const curAnnual = c.take != null ? b.vol30d.v * (c.take / 10000) * (365 / 30) : null;
    const latestFull = [...(b.months || [])].reverse().find(r => r.vol && !r.partial);
    root.innerHTML =
      '<p class="lead">The thesis asks how much Intents volume it takes for buybacks to match issuance. Even the base case in the scenario table still dilutes holders. Only the bull case flips it: about $10B a month at 7 bp, under HSP-029, or $84M a year against about $74M of issuance at $3.51 (114%). These are illustrative paths to end-2028, not forecasts or price targets (thesis, section 7).</p>' +
      q4HeadlineHTML(b, c) +
      '<div class="card" style="margin-bottom:12px"><h3>What must be true for buybacks to beat issuance</h3>' +
        '<p class="sub">Three conditions from the thesis. HSP-029 "cuts the target by a third." The bull row in the scenario table is $10B a month at 7 bp. Progress bars use today\'s live or snapshot figures, with the method on each row. HSP-029 adoption is not scored as a percentage because we cannot measure validator adoption from these APIs.</p>' +
        '<div class="bar-row"><div class="bar-head"><strong>1. HSP-029 adopted, cutting issuance by a third</strong><span>pending, manual</span></div>' +
        '<p class="note">Target yearly issuance under HSP-029 at $3.51 and 1.312B supply is ' + fmtB(issHsp) + " (about $74M), versus " + fmtB(FROZEN_SUPPLY * CAP_NOW * FROZEN_PRICE) + " at the current 2.5% cap. Approved 2 Nov 2026 (The Block, snapshot). The thesis (section 6) says a veto window remains, and validators still have to adopt a cut that lowers their own income by about 36%. No bar is filled, because filling one would invent a number we do not have.</p></div>" +
        '<div class="bar-row"' + tip("30-day take rate / 7 bp, the bull-case take rate in the thesis scenario table.") + '><div class="bar-head"><strong>2. Take rate about 7 bp</strong><span>' + fmtBp(c.take) + " of 7.00 bp (" + takePct.toFixed(0) + "% of the way)</span></div>" +
        '<div class="progress"><span style="width:' + takePct.toFixed(1) + '%"></span></div>' +
        '<p class="note">Bar = current 30-day take rate divided by 7 bp. The 30-day rate is protocol revenue / volume. October 2026, the last complete month in the snapshot table, was 5.49 bp. No complete month or quarter has cleared 7 bp.</p></div>' +
        '<div class="bar-row"' + tip("30-day Intents volume / $10B, the bull-case monthly volume in the thesis scenario table.") + '><div class="bar-head"><strong>3. Volume about $10B a month</strong><span>' + fmtB(b.vol30d.v) + " of $10.00B (" + volPct.toFixed(0) + "% of the way)</span></div>" +
        '<div class="progress"><span style="width:' + volPct.toFixed(1) + '%"></span></div>' +
        '<p class="note">Bar = 30-day Intents volume versus the $10B monthly bull case, used as a one-month pace. The record complete month is still $4.80B (Sep 2026)' +
        (latestFull ? (". Latest complete month, " + latestFull.m + ", is " + fmtB(latestFull.vol)) : "") +
        ". " + srcTag(b.vol30d) + "</p></div>" +
        '<p>Together, $10B a month at 7 bp is ' + fmtB(bullRev) + " a year, or " + fmtPct(bullRev / issHsp, 0) + " of HSP-029 issuance at $3.51. At the current 30-day pace, annualised revenue is " + (curAnnual == null ? "n/a" : fmtB(curAnnual)) + ", or " + (curAnnual == null ? "n/a" : fmtPct(curAnnual / issHsp, 0)) + " of that $74M issuance line. That annualisation is a run rate, not a forecast.</p>" +
      "</div>" +
      '<div class="card"><h3>Catalysts and confirm signals</h3><p class="sub">The same checklist as Overview, from thesis section 10.</p>' +
      catalysts(b, c).map(r => {
        const kind = r[1] === "met" ? "ok" : (r[1] === "not met" ? "fired" : "watch");
        return '<div class="cat-row"><div>' + esc(r[0]) + "</div><div>" + tag(kind, r[1]) + "</div><div class='note' style='margin:0'>" + esc(r[2]) + "</div></div>";
      }).join("") +
      "</div>";
    startCountdown();
  }

  function renderVolume() {
    const b = current;
    const root = el("view-volume");
    const last = b.months[b.months.length - 1];
    const rec = b.months.find(r => r.m === "2026-09");
    const title = rec ? ("Intents monthly volume peaked at " + fmtB(rec.vol) + " in Sep 2026, about 10x Sep 2025") : "Intents monthly volume";
    root.innerHTML =
      '<p class="lead">Volume grows in steps, not smoothly. A spike in November 2025 fell back in December. Volume then sat in a $1.9-2.8B band until the September 2026 record. The current month is partial and is hatched.</p>' +
      '<div class="card chart-card" style="margin-bottom:12px"><h3>' + esc(title) + "</h3>" +
      '<p class="sub">USD billions, calendar months, UTC. Source: DefiLlama daily volume, summed here, or the 13 Nov snapshot table.</p>' +
      '<div class="chart-wrap tall"><canvas id="cVolMonth"></canvas></div></div>' +
      '<div class="grid-2">' +
        '<div class="card chart-card"><h3>Daily Intents volume, with a 30-day average</h3>' +
        '<p class="sub">' + (b.dailyVol ? "DefiLlama daily series. The last point is " + esc(b.lastDay) + "." : "A daily series is not in the snapshot, so this chart is empty offline. The monthly bars above still render.") + "</p>" +
        '<div class="chart-wrap"><canvas id="cVolDaily"></canvas></div></div>' +
        '<div class="card chart-card"><h3>Cumulative Intents volume</h3>' +
        '<p class="sub">All-time ' + fmtB(b.volAllTime.v) + " " + srcTag(b.volAllTime) + ". Cumulative line starts at the first daily point when live data is present.</p>" +
        '<div class="chart-wrap"><canvas id="cVolCum"></canvas></div></div>' +
      "</div>" +
      '<p class="note">Annotations: Nov 2025 spike ' + (b.months.find(r => r.m==="2025-11") ? fmtB(b.months.find(r => r.m==="2025-11").vol) : "$3.66B") +
      "; Dec 2025 to Aug 2026 plateau; Sep 2026 record " + (rec ? fmtB(rec.vol) : "$4.80B") +
      ". " + (last && last.partial ? "Partial month " + last.m + " is hatched, cut off " + last.partialTo + "." : "") + "</p>";

    const labels = b.months.map(r => r.m);
    const vals = b.months.map(r => r.vol / 1e9);
    const colors = b.months.map(r => {
      if (r.m === "2026-09") return accent();
      if (r.partial) return hatch("#d4d4d4", "#666");
      return "#b8b8b8";
    });
    makeChart("cVolMonth", {
      type: "bar",
      data: { labels, datasets: [{ data: vals, backgroundColor: colors, borderWidth: 0 }] },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "USD billions" }, ticks: { callback: v => "$" + v } },
          x: { ticks: { maxRotation: 90, minRotation: 45, font: { size: 10 } } }
        },
        plugins: {
          datalabels: {
            display: true, color: ink(), anchor: "end", align: "end", font: { size: 10, weight: "600" },
            formatter: (v, ctx) => {
              const r = b.months[ctx.dataIndex];
              const s = "$" + v.toFixed(2);
              return r && r.partial ? s + " to " + (r.partialTo ? r.partialTo.replace(" 2026", "").replace(" 2025", "") : "") : s;
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const r = b.months[ctx.dataIndex];
                return fmtB(r.vol) + (r.partial ? " (partial, to " + r.partialTo + ")" : "") + " · " + (r.live ? "live DefiLlama monthly sum" : "snapshot, " + SNAPSHOT_DATE);
              }
            }
          }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels] : []
    });

    if (b.dailyVol && b.dailyVol.length) {
      const days = b.dailyVol;
      const ma = days.map((p, i) => {
        const slice = days.slice(Math.max(0, i - 29), i + 1);
        return slice.reduce((s, x) => s + x.v, 0) / slice.length;
      });
      makeChart("cVolDaily", {
        type: "line",
        data: {
          labels: days.map(p => p.day),
          datasets: [
            { data: days.map(p => p.v / 1e6), borderColor: "#b0b0b0", borderWidth: 1, pointRadius: 0, tension: 0.1 },
            { data: ma.map(v => v / 1e6), borderColor: accent(), borderWidth: 2, pointRadius: 0, tension: 0.1 }
          ]
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "USD millions" } },
            x: { ticks: { maxTicksLimit: 8, font: { size: 10 } } }
          },
          plugins: {
            tooltip: { callbacks: { label: ctx => (ctx.datasetIndex === 1 ? "30-day average " : "daily ") + "$" + ctx.parsed.y.toFixed(1) + "M · DefiLlama" } }
          }
        }
      });
      let run = 0;
      const cum = days.map(p => { run += p.v; return run / 1e9; });
      makeChart("cVolCum", {
        type: "line",
        data: { labels: days.map(p => p.day), datasets: [{ data: cum, borderColor: accent(), borderWidth: 2, pointRadius: 0, fill: false, tension: 0.1 }] },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "USD billions cumulative" } },
            x: { ticks: { maxTicksLimit: 8, font: { size: 10 } } }
          },
          plugins: { tooltip: { callbacks: { label: ctx => "$" + ctx.parsed.y.toFixed(2) + "B cumulative · DefiLlama daily sum" } } }
        }
      });
    }
  }

  function renderCapture() {
    const b = current;
    const root = el("view-capture");
    const rows = b.months.filter(r => r.m >= "2026-02" && r.capture != null);
    const lastFull = [...rows].reverse().find(r => !r.partial);
    const sep = rows.find(r => r.m === "2026-09");
    const title = lastFull
      ? ("Capture ran 15-21% for seven months, then " + (sep ? Math.round(sep.capture * 100) : 25) + "% and " + Math.round((lastFull.capture || 0) * 100) + "%")
      : "Monthly capture and take rate since the fee switch";
    root.innerHTML =
      '<p class="lead">Gross fees are protocol fees plus partner (affiliate) fees. Capture is the share the protocol keeps. Take rate is protocol revenue divided by volume, in basis points. The fee switch went live on 23 Feb 2026. Don\'t call the recent rise a settled trend. The likely cause is unconfirmed.</p>' +
      '<div class="card chart-card" style="margin-bottom:12px"><h3>' + esc(title) + "</h3>" +
      '<p class="sub">Top panel: capture %. Bottom panel: take rate in bp. Months with no revenue in the snapshot are omitted, not filled in.</p>' +
      '<div class="chart-wrap short"><canvas id="cCap"></canvas></div>' +
      '<div class="chart-wrap short"><canvas id="cTake"></canvas></div></div>' +
      '<div class="card chart-card"><h3>All-time gross fees, to protocol revenue, to buybacks</h3>' +
      '<p class="sub">Waterfall uses all-time totals. Holders revenue funds buybacks. ' +
      srcTag(b.feesAllTime) + " " + srcTag(b.revAllTime) + " " + srcTag(b.holdAllTime) +
      (b.holdAllTime.live ? "" : " Holders revenue in the snapshot is cumulative to 3 Nov, not to the same date as fees.") + "</p>" +
      '<div class="chart-wrap"><canvas id="cWater"></canvas></div></div>';

    const labels = rows.map(r => r.m);
    const cap = rows.map(r => r.capture * 100);
    const tk = rows.map(r => r.take);
    const capCol = rows.map(r => (r.m === "2026-09" || r.m === "2026-10") ? accent() : (r.partial ? hatch("#d4d4d4", "#666") : "#b8b8b8"));
    makeChart("cCap", {
      type: "bar",
      data: { labels, datasets: [{ data: cap, backgroundColor: capCol }] },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: "Revenue / fees, %" } } },
        plugins: {
          datalabels: { display: true, anchor: "end", align: "end", color: ink(), font: { size: 10, weight: "600" }, formatter: v => v.toFixed(0) + "%" },
          tooltip: { callbacks: { label: ctx => { const r = rows[ctx.dataIndex]; return fmtPct(r.capture) + " · " + (r.live ? "live monthly sum" : "snapshot, " + SNAPSHOT_DATE); } } }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels] : []
    });
    makeChart("cTake", {
      type: "line",
      data: { labels, datasets: [{ data: tk, borderColor: accent(), backgroundColor: accent(), pointRadius: 4, pointBackgroundColor: accent(), tension: 0.2 }] },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: "Revenue / volume, bp" } } },
        plugins: {
          datalabels: { display: true, align: "top", color: ink(), font: { size: 10, weight: "600" }, formatter: v => v.toFixed(1) },
          tooltip: { callbacks: { label: ctx => fmtBp(ctx.parsed.y) + " · revenue / volume" } }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels] : []
    });
    const f = b.feesAllTime.v, r = b.revAllTime.v, h = b.holdAllTime.v;
    const partners = Math.max(0, f - r);
    const gap = Math.max(0, r - h);
    makeChart("cWater", {
      type: "bar",
      data: { labels: ["Gross fees", "Protocol revenue", "Buybacks"], datasets: [{ data: [f / 1e6, r / 1e6, h / 1e6], backgroundColor: ["#b8b8b8", accent(), "#1e3a8a"] }] },
      options: {
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: "USD millions, all-time" } } },
        plugins: {
          datalabels: { display: true, color: ink(), anchor: "end", align: "end", font: { size: 11, weight: "600" }, formatter: v => "$" + v.toFixed(2) + "M" },
          tooltip: { callbacks: { label: ctx => fmtB(ctx.parsed.y * 1e6) + ". Remainder vs fees is partner / other (" + fmtB(partners) + "). Revenue minus holders series is " + fmtB(gap) + "." } }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels] : []
    });
  }

  function renderIssuance() {
    const b = current, c = computed(b);
    const root = el("view-issuance");
    const labels = b.months.map(r => r.m);
    const iss25 = b.months.map(() => issuanceMonthly(FROZEN_SUPPLY, CAP_NOW, FROZEN_PRICE) / 1e6);
    const iss16 = b.months.map(() => issuanceMonthly(FROZEN_SUPPLY, CAP_HSP, FROZEN_PRICE) / 1e6);
    const rev = b.months.map(r => r.rev == null ? null : r.rev / 1e6);
    const hold = b.months.map(r => r.hold == null ? null : r.hold / 1e6);
    const cov = b.months.map(r => r.rev == null ? null : coverage(r.rev, issuanceMonthly(FROZEN_SUPPLY, CAP_NOW, FROZEN_PRICE)) * 100);
    const progressPct = Math.min(100, c.q4progress * 100);
    const risk = c.q4cov != null && c.q4cov < 0.15;
    root.innerHTML =
      '<p class="lead">Issuance is modelled at the frozen $3.51 price and 1.312B circulating supply so a live price move cannot rewrite the history or the Q4 test. Monthly issuance is $9.59M at 2.5% and $6.14M at 1.6%. The Q4 2026 coverage test uses $3.51, not the live price. 15% of the $28.78M quarterly issuance is $4.32M of protocol revenue.</p>' +
      '<div class="card chart-card" style="margin-bottom:12px"><h3>Protocol revenue is still well below modelled issuance</h3>' +
      '<p class="sub">Bars: monthly issuance at 2.5% and 1.6%, monthly protocol revenue, and holders revenue. Line: coverage of 2.5% issuance, with a 15% kill line.</p>' +
      '<div class="chart-wrap tall"><canvas id="cIss"></canvas></div></div>' +
      '<div class="card"><h3>Q4 2026 progress toward the 15% coverage test</h3>' +
      '<p class="sub">Filled from October, November and December protocol revenue. Issuance and the 15% line stay at $3.51.</p>' +
      '<div class="progress' + (risk ? " risk" : "") + '"><span style="width:' + progressPct.toFixed(1) + '%"></span></div>' +
      '<p class="progress-label">' + fmtB(c.q4rev) + " of " + fmtB(Q4_NEEDED) + " needed (" + (c.q4progress * 100).toFixed(1) + "% of the way to 15%). Q4 coverage so far is " + fmtPct(c.q4cov) +
      (c.q4revKnown ? "" : ". November revenue is not in the snapshot, so this uses October only") +
      ". Last data day: " + esc(b.lastDay) + ".</p></div>";
    makeChart("cIss", {
      type: "bar",
      data: {
        labels,
        datasets: [
          { type: "bar", label: "Issuance 2.5%", data: iss25, backgroundColor: "#d9d4cc" },
          { type: "bar", label: "Issuance 1.6%", data: iss16, backgroundColor: "#b7c4de" },
          { type: "bar", label: "Protocol revenue", data: rev, backgroundColor: accent() },
          { type: "bar", label: "Holders revenue", data: hold, backgroundColor: "#1e3a8a" },
          { type: "line", label: "Coverage %", data: cov, yAxisID: "y2", borderColor: "#111", borderWidth: 2, pointRadius: 3, spanGaps: false }
        ]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "USD millions" }, stacked: false },
          y2: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "Coverage %" }, suggestedMax: 40 },
          x: { ticks: { maxRotation: 90, minRotation: 45, font: { size: 10 } } }
        },
        plugins: {
          legend: { display: true, position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
          annotation: { annotations: { kill: { type: "line", yMin: 15, yMax: 15, yScaleID: "y2", borderColor: "#b91c1c", borderDash: [6, 4], borderWidth: 1.5, label: { display: true, content: "15% kill line", position: "end", color: "#b91c1c", backgroundColor: "transparent", font: { size: 10 } } } } },
          tooltip: { callbacks: { label: ctx => ctx.dataset.label + ": " + (ctx.dataset.yAxisID === "y2" ? (ctx.parsed.y == null ? "n/a" : ctx.parsed.y.toFixed(2) + "%") : (ctx.parsed.y == null ? "n/a" : "$" + ctx.parsed.y.toFixed(2) + "M")) + " · issuance at $3.51 and 1.312B" } }
        }
      }
    });
  }


  function beValue(price, take, cap) {
    const iss = issuanceMonthly(FROZEN_SUPPLY, cap, price);
    const tr = take / 10000;
    const vol = tr ? iss / tr : null;
    return { iss, vol, x: vol ? vol / RECORD_VOL : null };
  }

  function heatColor(x) {
    const t = Math.max(0, Math.min(1, (x - 0.7) / 10));
    const light = theme === "dark";
    const l = light ? 18 + t * 28 : 88 - t * 48;
    return "hsl(214 70% " + l + "%)";
  }

  function renderBreakEven(keepFocus) {
    const root = el("view-breakeven");
    const out = beValue(be.price, be.take, be.cap);
    const prices = [10, 7.5, 5, 3.51, 2];
    const takes = [3, 4, 4.88, 6, 7, 10];
    let closest = { p: prices[0], t: takes[0], d: Infinity };
    prices.forEach(p => takes.forEach(t => {
      const d = Math.abs(p - be.price) / 10 + Math.abs(t - be.take) / 10;
      if (d < closest.d) closest = { p, t, d };
    }));
    let html = '<p class="lead">Break-even monthly volume is monthly issuance in dollars divided by the take rate. Issuance is in NEAR and buybacks are in dollars, so break-even rises one-for-one with price. The grid uses the frozen 1.312B supply. The published grid is under HSP-029 (1.6%). The $4.80B September 2026 record is the comparison point.</p>';
    html += '<div class="card" style="margin-bottom:12px"><div class="sliders">';
    html += '<div><label for="bePrice">NEAR price: <strong id="bePriceLbl">' + fmtPx(be.price) + '</strong></label><input id="bePrice" type="range" min="1" max="15" step="0.01" value="' + be.price + '" /></div>';
    html += '<div><label for="beTake">Take rate: <strong id="beTakeLbl">' + be.take.toFixed(2) + ' bp</strong></label><input id="beTake" type="range" min="1" max="15" step="0.01" value="' + be.take + '" /></div>';
    html += '<div><label for="beCap">Issuance cap</label><select id="beCap"><option value="0.016"' + (be.cap === CAP_HSP ? " selected" : "") + '>1.6% (HSP-029 end state)</option><option value="0.025"' + (be.cap === CAP_NOW ? " selected" : "") + '>2.5% (current)</option></select></div>';
    html += '</div><div class="be-out">';
    html += '<div><div class="label" style="color:var(--muted);font-size:12px">Break-even monthly volume</div><div class="big" id="beVol">' + fmtB(out.vol) + '</div></div>';
    html += '<div><div class="label" style="color:var(--muted);font-size:12px">Multiple of the $4.80B record</div><div class="big" id="beX">' + (out.x ? out.x.toFixed(2) + "x" : "n/a") + '</div></div>';
    html += '<div><div class="label" style="color:var(--muted);font-size:12px">Monthly issuance at these inputs</div><div class="big" id="beIss">' + fmtB(out.iss) + '</div></div>';
    html += '</div><p class="note">At 4.88 bp and $3.51: $19.65B a month at 2.5% (4.1x the record), $12.58B at 1.6% (2.6x). Slider values recompute with the same formula.</p></div>';
    html += '<div class="card heatmap"><h3>Break-even monthly Intents volume under the selected cap</h3><p class="sub">Each cell shows $B per month and the multiple of the $4.80B record. The highlighted cell is the grid point nearest the sliders.</p>';
    html += '<table><thead><tr><th>Price \\ take</th>' + takes.map(t => "<th class='num'>" + t.toFixed(2) + " bp</th>").join("") + "</tr></thead><tbody>";
    prices.forEach(p => {
      html += "<tr><th>" + fmtPx(p) + (Math.abs(p - 3.51) < 1e-9 ? " (frozen)" : "") + "</th>";
      takes.forEach(t => {
        const v = beValue(p, t, be.cap);
        const hl = (p === closest.p && t === closest.t) ? " hl" : "";
        html += '<td class="cell' + hl + '" style="background:' + heatColor(v.x) + '">$' + (v.vol / 1e9).toFixed(2) + "B<br>" + v.x.toFixed(2) + "x</td>";
      });
      html += "</tr>";
    });
    html += "</tbody></table></div>";
    root.innerHTML = html;
    const bind = () => {
      be.price = Number(el("bePrice").value);
      be.take = Number(el("beTake").value);
      be.cap = Number(el("beCap").value);
      renderBreakEven(true);
    };
    el("bePrice").addEventListener("input", bind);
    el("beTake").addEventListener("input", bind);
    el("beCap").addEventListener("change", bind);
    if (keepFocus) {
      const active = document.activeElement && document.activeElement.id;
      if (active && el(active)) el(active).focus();
    }
  }

  function renderValuation() {
    const b = current;
    const root = el("view-valuation");
    const mcap = b.peerMcap.v.near || b.marketCap.v;
    const q2rev = 0.259e6 + 0.620e6 + 0.619e6;
    const q3rev = 0.505e6 + 0.723e6 + 1.840e6;
    const q2fees = 3.21e6 + 3.00e6 + 3.11e6;
    const q3fees = 3.27e6 + 3.84e6 + 7.33e6;
    const nearNetQ2 = mcap / (q2rev * 4);
    const nearNetQ3 = mcap / (q3rev * 4);
    const nearGrossQ2 = mcap / (q2fees * 4);
    const nearGrossQ3 = mcap / (q3fees * 4);
    const nearNet30 = mcap / (b.rev30d.v * 365 / 30);
    const sol = (b.peerMcap.v.solana || SNAP.peerMcap.solana) / (SNAP.peerRev.solana_q3_gross * 4);
    const hl = (b.peerMcap.v.hyperliquid || SNAP.peerMcap.hyperliquid) / (SNAP.peerRev.hyperliquid_q2_gross * 4);
    const tron = (b.peerMcap.v.tron || SNAP.peerMcap.tron) / (SNAP.peerRev.tron_q2_gross * 4);
    const eth = (b.peerMcap.v.ethereum || SNAP.peerMcap.ethereum) / (SNAP.peerRev.ethereum_q2_gross * 4);
    const rows = [
      { name: "NEAR net, Q2 2026", x: nearNetQ2, basis: "net (protocol revenue)", note: "Q2 revenue from the snapshot monthly table ($1.50M). Multiple = live or snapshot market cap / (quarterly revenue x 4)." },
      { name: "NEAR net, Q3 2026", x: nearNetQ3, basis: "net (protocol revenue)", note: "Q3 revenue $3.07M from the snapshot monthly table." },
      { name: "NEAR net, best 30 days", x: nearNet30, basis: "net (30-day protocol revenue annualised)", note: "market cap / (30-day revenue x 365/30)." },
      { name: "NEAR gross, Q2 2026", x: nearGrossQ2, basis: "gross (Intents fees). Chain fees are a one-day figure and are not added here.", note: "Q2 Intents fees $9.32M from the snapshot table." },
      { name: "NEAR gross, Q3 2026", x: nearGrossQ3, basis: "gross (Intents fees)", note: "Q3 Intents fees $14.44M from the snapshot table." },
      { name: "Solana gross REV, Q3 2026", x: sol, basis: "gross REV (fees + tips), secondary", note: "Q3 REV $75.7M, Blockworks. Market cap live from CoinGecko when available." },
      { name: "Hyperliquid gross, Q2 2026", x: hl, basis: "gross, mostly to buybacks, secondary", note: "Q2 revenue $141.4M, Blockworks." },
      { name: "Tron gross fees, Q2 2026", x: tron, basis: "gross fees, secondary", note: "Q2 revenue $89.8M, Blockworks." },
      { name: "Ethereum gross fees, Q2 2026", x: eth, basis: "gross fees, secondary", note: "Q2 revenue $63.3M, Blockworks." }
    ];
    const shown = valMode === "net" ? rows.filter(r => /net/.test(r.basis) || !/NEAR/.test(r.name)) :
                  valMode === "gross" ? rows.filter(r => /gross/.test(r.basis)) : rows;
    root.innerHTML =
      '<p class="lead">No basis is fully like-for-like. NEAR is shown on both gross fees and protocol revenue (net). Don\'t compare NEAR\'s gross fees to peers without the net figure beside it. Peer revenue stays at the stated quarter and is secondary (Blockworks Research). Peer market caps refresh from CoinGecko when the call works. There is no price target on this page. Bitwise\'s $155.85 by 2030 may be shown only as published by the ETF issuer, not supported by our data, and is not used here.</p>' +
      '<div class="card" style="margin-bottom:12px"><button class="icon-btn" id="valBoth" type="button">Gross and net</button> <button class="icon-btn" id="valGross" type="button">Gross only</button> <button class="icon-btn" id="valNet" type="button">Net only</button>' +
      '<p class="note">NEAR market cap used: ' + fmtB(mcap) + " " + srcTag(b.peerMcap) + ". Snapshot published multiples at $4.61B were 769x Q2 net, 375x Q3 net, 205x best 30 days, 100x Q2 gross, 69x Q3 gross.</p>" +
      '<div class="chart-wrap tall"><canvas id="cVal"></canvas></div></div>' +
      '<div class="card"><table><thead><tr><th>Series</th><th>Basis</th><th class="num">Multiple</th></tr></thead><tbody>' +
      shown.map(r => "<tr><td>" + esc(r.name) + "</td><td>" + esc(r.basis) + ". " + esc(r.note) + "</td><td class='num'>" + (r.x ? r.x.toFixed(0) + "x" : "n/a") + "</td></tr>").join("") +
      "</tbody></table></div>";
    makeChart("cVal", {
      type: "bar",
      data: { labels: shown.map(r => r.name), datasets: [{ data: shown.map(r => r.x), backgroundColor: shown.map(r => /NEAR net/.test(r.name) ? accent() : (/NEAR gross/.test(r.name) ? "#93b4ff" : "#b8b8b8")) }] },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        scales: { x: { beginAtZero: true, title: { display: true, text: "Annualised market-cap / revenue multiple" } } },
        plugins: {
          datalabels: { display: true, anchor: "end", align: "end", color: ink(), font: { size: 10, weight: "600" }, formatter: v => v ? v.toFixed(0) + "x" : "" },
          tooltip: { callbacks: { label: ctx => ctx.parsed.x.toFixed(1) + "x · " + shown[ctx.dataIndex].note } }
        }
      },
      plugins: window.ChartDataLabels ? [ChartDataLabels] : []
    });
    el("valBoth").onclick = () => { valMode = "both"; renderValuation(); };
    el("valGross").onclick = () => { valMode = "gross"; renderValuation(); };
    el("valNet").onclick = () => { valMode = "net"; renderValuation(); };
  }

  function q4Metrics(b, c) {
    const cap = c.q4fees ? c.q4rev / c.q4fees : null;
    const take = c.q4vol ? takeBp(c.q4rev, c.q4vol) : null;
    return { vol: c.q4vol, cap, take, cov: c.q4cov, complete: false };
  }

  function renderKill() {
    const b = current, c = computed(b);
    const q4 = q4Metrics(b, c);
    const fwdVol = q4.vol >= 8e9 ? "OK" : "WATCH";
    const fwdCap = q4.cap == null ? "WATCH" : (q4.cap < 0.20 ? "WATCH" : "OK");
    const fwdTake = q4.take == null ? "WATCH" : (q4.take < 3 ? "WATCH" : "OK");
    const fwdCov = q4.cov == null ? "WATCH" : (q4.cov < 0.15 ? "WATCH" : "OK");
    const hist = [
      ["Intents volume per quarter below $8B", "< $8B", "$7.18B", "$6.25B", "$9.79B", q4.vol ? fmtB(q4.vol) + " to date" : "n/a", "FIRED", "FIRED on Q1-Q2. Recovered in Q3. Forward count restarts in Q4."],
      ["Capture (revenue / fees) below 20%", "< 20%", "13.1%", "16.1%", "21.2%", q4.cap == null ? "n/a" : fmtPct(q4.cap), "FIRED", "FIRED on Q1-Q2. Recovered in Q3. Forward count restarts in Q4."],
      ["Take rate below 3 bp", "< 3 bp", "2.21 bp", "2.40 bp", "3.14 bp", q4.take == null ? "n/a" : fmtBp(q4.take), "FIRED", "FIRED on Q1-Q2. Recovered in Q3. Forward count restarts in Q4."],
      ["Revenue / issuance below 15%", "< 15% at $3.51", "5.5%", "5.2%", "10.7%", q4.cov == null ? "n/a" : fmtPct(q4.cov), "FIRED", "FIRED, and still below. No reset. Q4 is a single test at a frozen $3.51 price."]
    ];
    const combinedFwd = (fwdVol === "OK" && fwdCap === "OK" && fwdTake === "OK") ? "OK" : "WATCH";
    const fwd = [
      ["Volume, capture or take rate fails two quarters in a row from Q4 2026", "two quarters", "n/a", "n/a", "n/a", "Q4 to date: vol " + (q4.vol ? fmtB(q4.vol) : "n/a") + ", capture " + (q4.cap == null ? "n/a" : fmtPct(q4.cap)) + ", take " + (q4.take == null ? "n/a" : fmtBp(q4.take)), combinedFwd, "Q4 is not a complete quarter, so this cannot be killed yet. WATCH means the quarter-to-date figure is still below the level or incomplete."],
      ["Q4 2026 coverage below 15% at $3.51", "single test, $3.51", "5.5%", "5.2%", "10.7%", q4.cov == null ? "n/a" : fmtPct(q4.cov) + " to date", fwdCov, "Uses frozen $3.51, not the live price. Status is WATCH until Q4 is complete if coverage is still below 15%."],
      ["A quarter with Intents volume up and protocol revenue down", "any complete quarter", "no", "no", "no", "Q4 incomplete", "OK", "Q1 to Q3 did not show volume up and revenue down on the snapshot table. Q4 is not complete."],
      ["HSP-029 vetoed or not adopted within six months", "governance", "n/a", "n/a", "n/a", "Approved 2 Nov 2026 (The Block, snapshot)", "OK", "Status rests on the snapshot fact that HSP-029 was approved on 2 Nov 2026. This dashboard does not scrape later governance votes."],
      ["Loss of user funds in the Intents verifier or Chain Signatures", "any such loss", "n/a", "n/a", "n/a", "not automatically measured", "UNMEASURED", SNAP.context.incidents],
      ["Ex-HOT daily signers below 40K", "provisional", "n/a", "n/a", "79.3K all signers (Q3, Nansen, secondary)", "offline query, see repo", "UNMEASURED", "Provisional until a BigQuery baseline exists. We had no Google Cloud account, so this claim stays unmeasured."]
    ];
    const root = el("view-kill");
    const rowHTML = (r) => {
      const st = r[6];
      const cls = st === "FIRED" || st === "KILLED" ? "fired" : "";
      const tclass = st === "FIRED" || st === "KILLED" ? "fired" : st.toLowerCase();
      return "<tr class='" + cls + "'><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td class='num'>" + esc(r[2]) + "</td><td class='num'>" + esc(r[3]) + "</td><td class='num'>" + esc(r[4]) + "</td><td class='num'>" + esc(r[5]) + "</td><td>" + tag(tclass, st) + "</td><td>" + esc(r[7]) + "</td></tr>";
    };
    root.innerHTML =
      '<p class="lead">Each of the first four rules fires after two complete quarters in a row past its level. Applied to 2026, all four fired before we wrote them down. If we had published this thesis in January, it would have been dead by July. We did not, so we cannot claim it survived. Forward rules were frozen on 14 Nov 2026 and count from Q4 2026, except coverage, which gets no reset.</p>' +
      '<div class="card" style="margin-bottom:12px"><h3>History: four FIRED rules</h3><div style="overflow:auto"><table><thead><tr><th>Rule</th><th>Level</th><th class="num">Q1</th><th class="num">Q2</th><th class="num">Q3</th><th class="num">Q4 to date</th><th>Status</th><th>Note</th></tr></thead><tbody>' +
      hist.map(rowHTML).join("") + "</tbody></table></div></div>" +
      '<div class="card"><h3>Forward rules, frozen 14 Nov 2026</h3><div style="overflow:auto"><table><thead><tr><th>Rule</th><th>Level</th><th class="num">Q1</th><th class="num">Q2</th><th class="num">Q3</th><th class="num">Q4 to date</th><th>Status</th><th>Note</th></tr></thead><tbody>' +
      fwd.map(rowHTML).join("") + "</tbody></table></div>" +
      '<p class="note">Confirm signals, not kills: a quarter above $20B, capture above 40% for a full quarter, a take rate above 7 bp, revenue above 50% of issuance, or published NEAR AI revenue. None of those are claimed here.</p></div>';
  }


  function renderClaims() {
    const b = current, c = computed(b);
    const rows = [
      ["Intents 30-day volume", fmtB(SNAP.vol30d), "not stated in the brief", "n/a", "n/a", fmtB(b.vol30d.v), "BASELINE", "Frozen from the 13 Nov pull. A claim cannot pass a test on the same data that set it. Live value is shown for comparison only."],
      ["Intents volume, all-time", fmtB(SNAP.volAllTime), "not stated", "n/a", "n/a", fmtB(b.volAllTime.v), "BASELINE", "DefiLlama."],
      ["Protocol revenue, 30 days", fmtB(SNAP.rev30d), "not stated", "n/a", "n/a", fmtB(b.rev30d.v), "BASELINE", "DefiLlama."],
      ["Take rate, 30 days", "4.88 bp", "not stated", "below 3 bp for two quarters", "above 7 bp", fmtBp(c.take), "BASELINE", "Formula: revenue / volume x 10,000."],
      ["Capture, 30 days", "30.5% published; 30.41% from $1.84M / $6.05M", "not stated", "below 20% for two quarters", "above 40% for a quarter", fmtPct(c.cap), "BASELINE", "Formula: revenue / gross fees."],
      ["Coverage of issuance, 30 days", "about 19%", "first draft said 25% and missed", "Q4 below 15% at $3.51", "above 50% of issuance", fmtPct(c.cov), "BASELINE", "Live window uses the live price. The formal Q4 test uses $3.51."],
      ["Q4 coverage to date at $3.51", "October delivered about half of the $4.32M needed", "n/a", "below 15% at quarter end", "n/a", fmtPct(c.q4cov) + " · " + fmtB(c.q4rev) + " of " + fmtB(Q4_NEEDED), "WATCH", "Single test at quarter end. The monitor marks this WATCH until Q4 closes if it is still below 15%."],
      ["Valuation, best 30 days", "first draft 161x; primary pull 205x at $4.61B", "28% off the draft", "reference only", "reference only", (b.marketCap.v / (b.rev30d.v * 365 / 30)).toFixed(0) + "x", "DRIFTED", "The first draft missed on valuation. Valuation rows are for reference and never block a check. The 205x figure is the 13 Nov measurement at $4.61B."],
      ["Coverage, first draft vs primary pull", "draft 25%; data 19%", "missed", "n/a", "n/a", "19% on the 13 Nov 30-day window", "DRIFTED", "One of two missed claims in the first draft. Six of eight testable claims held. The other six held claims were not itemised in the brief or the thesis PDF, so they are not invented here."],
      ["Measured issuance from chain data", "untested", "n/a", "n/a", "n/a", b.rpcSupply.v ? ("total supply " + fmtN(b.rpcSupply.v) + " NEAR from RPC; issuance per epoch not derived") : "unmeasured", "UNMEASURED", "The first draft's ninth claim, measured issuance, is still untested. RPC total supply is shown when the call works. We do not invent an issuance figure from it."],
      ["Ex-HOT daily signers", "unmeasured", "n/a", "below 40K", "n/a", "offline query, see repo", "UNMEASURED", "Needs BigQuery. No Google Cloud account was set up."],
      ["HOT Wallet share of transactions", "65% in Q2 2026 (Nansen, secondary)", "n/a", "n/a", "n/a", "unmeasured in this dashboard", "UNMEASURED", "Secondary in the snapshot. Needs BigQuery to refresh."],
      ["Explorer 1Click share of DefiLlama volume", "87% all-time, 67% 30-day", "n/a", "n/a", "n/a", fmtPct(SNAP.clickShareAT, 0) + " all-time, " + fmtPct(SNAP.clickShare30, 0) + " 30-day", "BASELINE", "Explorer API needs a partner JWT. Without it, the snapshot from the Explorer page is shown."],
      ["Buyback wallet balance", "1.77M NEAR", "n/a", "n/a", "n/a", fmtN(SNAP.buybackWalletNear) + " NEAR", "BASELINE", "revenue.near.org marks its figures illustrative. Used only as a snapshot cross-check."]
    ];
    const root = el("view-claims");
    root.innerHTML =
      '<p class="lead">Every claim below is taken from the thesis or the dashboard brief. Tolerances were not published in those documents, so they are not invented. Claims set from the 13 Nov pull read BASELINE. The first draft\'s record: 6 of 8 testable claims held; coverage and valuation missed. The ninth, measured issuance, is still untested.</p>' +
      '<div class="card" style="overflow:auto"><table><thead><tr><th>Claim</th><th>Frozen value</th><th>Tolerance</th><th>Kill</th><th>Confirm</th><th>Current</th><th>Status</th><th>Note</th></tr></thead><tbody>' +
      rows.map(r => {
        const st = r[6];
        return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td>" + esc(r[3]) + "</td><td>" + esc(r[4]) + "</td><td>" + esc(r[5]) + "</td><td>" + tag(st.toLowerCase(), st) + "</td><td>" + esc(r[7]) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function renderChain() {
    const b = current;
    const root = el("view-chain");
    root.innerHTML =
      '<p class="lead">The NEAR base chain lost most of its traffic in a year. Most of the drop came from one app, HOT Wallet. Chain fees are small, so the collapse in traffic cost little revenue. These activity figures are secondary sources except where a live DefiLlama call replaces the one-day fee figure.</p>' +
      '<div class="kpis">' +
        kpiHTML("Transactions per day, 30-day average", fmtN(SNAP.tx30d, 0), { live: false, src: "NearBlocks via CoinPaprika, to 4 Nov 2026, secondary" }, "<span>was " + fmtN(SNAP.txYearAgo, 2) + " in Nov 2025</span>") +
        kpiHTML("Active accounts per day, 30-day average", fmtN(SNAP.active, 1), { live: false, src: "NearBlocks via CoinPaprika, secondary" }, "<span>was " + fmtN(SNAP.activeYearAgo, 0) + "</span>") +
        kpiHTML("NEAR chain fees, latest 24h", fmtB(b.chainFees24h.v), b.chainFees24h, b.chainFees30d ? "<span>30-day total " + fmtB(b.chainFees30d.v) + ", average " + fmtB(b.chainFees30d.v / 30) + "</span>" : "") +
        kpiHTML("DeFi TVL on NEAR", fmtB(b.tvl.v), b.tvl, "<span>snapshot on 5 Nov was $188.5M; 12 Oct was $275M (secondary)</span>") +
        kpiHTML("Stablecoins on NEAR", fmtB(SNAP.stables), { live: false, src: "snapshot, " + SNAPSHOT_DATE + ", secondary" }, "") +
        kpiHTML("RPC total supply", b.rpcSupply.v ? fmtN(b.rpcSupply.v) + " NEAR" : "not fetched", b.rpcSupply.v ? b.rpcSupply : { live: false, src: "NEAR RPC block header" }, b.inflation.v ? "<span>on-chain max inflation " + fmtPct(b.inflation.v, 2) + " " + srcTag(b.inflation) + "</span>" : "") +
      "</div>" +
      '<div class="grid-2"><div class="card"><h3>Quarterly activity, secondary</h3><p class="sub">Nansen Q3 and Q2 2026. Different signer definitions across quarters, so treat the comparison with care.</p><table><tbody>' +
      "<tr><td>Daily transactions, quarterly average</td><td class='num'>739K in Q3</td><td class='num'>854K in Q2</td><td class='num'>4.2M in Q1</td></tr>" +
      "<tr><td>Distinct daily signers</td><td class='num'>79.3K in Q3</td><td class='num'>121K in Q2</td><td class='num'>n/a</td></tr>" +
      "<tr><td>HOT Wallet share of transactions</td><td class='num'>n/a in this pull</td><td class='num'>65% in Q2 (Nansen)</td><td class='num'>56% in Q3 2025</td></tr>" +
      "</tbody></table><p class='note'>HOT share and ex-HOT signers are unmeasured here. BigQuery is an offline query, see the repo and the sources view.</p></div>" +
      '<div class="card"><h3>Context, all secondary</h3><ul>' +
      Object.values(SNAP.context).map(s => "<li>" + esc(s) + "</li>").join("") +
      "</ul></div></div>";
  }

  function scenOut(s) {
    const annual = s.vol * (s.take / 10000) * 12;
    const iss = FROZEN_SUPPLY * CAP_HSP * FROZEN_PRICE;
    return { annual, iss, cov: annual / iss };
  }

  function renderScenarios() {
    const root = el("view-scenarios");
    const iss = FROZEN_SUPPLY * CAP_HSP * FROZEN_PRICE;
    const card = (key, title) => {
      const s = scen[key];
      const o = scenOut(s);
      return '<div class="card scen"><h3>' + title + "</h3>" +
        '<p class="sub">Editable monthly volume and take rate. Revenue is volume x take rate x 12. Coverage uses yearly issuance under HSP-029 at $3.51, which is ' + fmtB(iss) + " (about $74M).</p>" +
        '<label>Monthly volume, USD<input id="scen-' + key + '-vol" type="text" value="' + s.vol + '" /></label>' +
        '<label>Take rate, bp<input id="scen-' + key + '-take" type="text" value="' + s.take + '" /></label>' +
        '<p style="margin:12px 0 0"><strong>' + fmtB(o.annual) + " a year</strong>, " + fmtPct(o.cov, 0) + " of issuance.</p></div>";
    };
    root.innerHTML =
      '<p class="lead">These are run-rate scenarios to end-2028, not price targets. Defaults from the brief: bear $3.9B a month at 3 bp = $14M a year (19% of issuance); base $6B at 5 bp = $36M (49%); bull $10B at 7 bp = $84M (114%). Yearly issuance under HSP-029 at $3.51 is about $74M. Edit the inputs to test other combinations. Nothing here is a forecast we claim will happen.</p>' +
      '<div class="scen-grid">' + card("bear", "Bear") + card("base", "Base") + card("bull", "Bull") + "</div>" +
      '<p class="note">Issuance in this view is held at the frozen $3.51 price and the 1.6% end-state cap. A higher price would raise dollar issuance one-for-one and lower these coverage figures.</p>';
    ["bear", "base", "bull"].forEach(key => {
      const upd = () => {
        const v = Number(el("scen-" + key + "-vol").value);
        const t = Number(el("scen-" + key + "-take").value);
        if (isFinite(v) && v > 0) scen[key].vol = v;
        if (isFinite(t) && t > 0) scen[key].take = t;
        renderScenarios();
      };
      el("scen-" + key + "-vol").addEventListener("change", upd);
      el("scen-" + key + "-take").addEventListener("change", upd);
    });
  }

  function renderSources() {
    const root = el("view-sources");
    const rows = statusRows.map(r => {
      const tier = r.name === "BigQuery" ? "offline query, see repo" : (r.ok ? "live API" : "snapshot");
      return "<tr><td>" + esc(r.name) + "</td><td><a href='" + esc(r.url) + "'>" + esc(r.url) + "</a></td><td>" + (r.ok ? tag("live", "ok") : tag("fired", "failed or unused")) + " " + esc(r.detail) + "</td><td class='src-time'>" + esc(isoTime(r.at)) + "</td><td>" + esc(tier) + "</td><td>" + esc(r.error || "") + "</td></tr>";
    }).join("");
    root.innerHTML =
      '<p class="lead">Every number on this page comes from a live API call, from a formula in the brief applied to live data, or from the frozen snapshot of 13 Nov 2026. Failed calls fall back to that snapshot and are tagged. Nothing is invented, estimated or smoothed.</p>' +
      '<div class="card" style="margin-bottom:12px;overflow:auto"><h3>Data-status panel</h3><p class="sub">Each call, its result and its time. Cache lasts 10 minutes. Refresh clears the wait and fetches again. The Explorer call is never allowed to block the rest of the page.</p><table><thead><tr><th>Source</th><th>Endpoint</th><th>Result</th><th>Time</th><th>Tier</th><th>Error</th></tr></thead><tbody>' + rows + "</tbody></table></div>" +
      '<div class="card" style="margin-bottom:12px"><h3>What is not measured here</h3><ul>' +
      "<li>BigQuery signers, HOT share and measured issuance: offline query, see repo. The queries are listed below.</li>" +
      "<li>Explorer route split and an independent 1Click / buyback series, unless you enter a partner JWT in this tab.</li>" +
      "<li>Independent buyback series from the chain.</li>" +
      "<li>NEAR AI revenue. None has been published.</li>" +
      "</ul><p class='note'>A gap we cannot yet explain: a transcribed NearStats figure puts August 2026 volume at $3.20B, while DefiLlama says $2.78B. This dashboard uses DefiLlama throughout.</p></div>" +
      '<div class="card"><h3>BigQuery, offline</h3><p class="sub">Not callable from a browser. Requires a Google Cloud account. Shown here so a reviewer can run them later.</p>' +
      "<pre style='white-space:pre-wrap;font-family:var(--mono);font-size:11.5px;background:var(--bg-2);padding:12px;border-radius:8px;overflow:auto'>" +
      esc("-- Q0. Freshness check\nSELECT MAX(block_date) AS latest_block_date,\n       DATE_DIFF(CURRENT_DATE(), MAX(block_date), DAY) AS days_stale\nFROM `bigquery-public-data.crypto_near_mainnet_us.blocks`\nWHERE block_date >= '2026-01-01';\n\n-- Q2. Daily signers, all and excluding HOT Wallet\nSELECT block_date,\n    COUNT(DISTINCT signer_account_id) AS signers_all,\n    COUNT(DISTINCT IF(receiver_account_id NOT LIKE '%hot.tg%'\n                       AND receiver_account_id NOT LIKE '%herewallet.near%',\n                       signer_account_id, NULL)) AS signers_ex_hot\nFROM `bigquery-public-data.crypto_near_mainnet_us.transactions`\nWHERE block_date BETWEEN '2025-10-01' AND '2026-11-12'\nGROUP BY 1 ORDER BY 1;\n\n-- Q4. Everything arriving at the buyback wallet, by path\nSELECT block_date, receipt_predecessor_account_id AS sender, action_kind,\n    JSON_VALUE(args, '$.method_name') AS method, COUNT(*) AS n,\n    SUM(SAFE_CAST(JSON_VALUE(args, '$.deposit') AS BIGNUMERIC)) / 1e24 AS near_attached\nFROM `bigquery-public-data.crypto_near_mainnet_us.receipt_actions`\nWHERE receipt_receiver_account_id = 'buybacks.multisignature.near'\n  AND block_date >= '2026-02-01'\nGROUP BY 1, 2, 3, 4 ORDER BY 1, 5 DESC;") +
      "</pre></div>";
  }

  function renderAll() {
    chartDefaults();
    const v = document.querySelector(".view.active");
    const id = v ? v.id.replace("view-", "") : "overview";
    const map = {
      overview: renderOverview,
      bullpath: renderBullPath,
      volume: renderVolume,
      capture: renderCapture,
      issuance: renderIssuance,
      breakeven: renderBreakEven,
      valuation: renderValuation,
      kill: renderKill,
      claims: renderClaims,
      chain: renderChain,
      scenarios: renderScenarios,
      sources: renderSources
    };
    Object.keys(map).forEach(k => {
      try { map[k](); } catch (err) { console.error("render", k, err); el("view-" + k).innerHTML = "<p>This view failed to render. " + esc(String(err)) + "</p>"; }
    });
    showView(id);
  }

  function showView(id) {
    VIEWS.forEach(([k, title]) => {
      el("view-" + k).classList.toggle("active", k === id);
      const btn = document.querySelector('.nav-btn[data-view="' + k + '"]');
      if (btn) btn.classList.toggle("active", k === id);
      if (k === id) el("viewTitle").textContent = title;
    });
    el("sidebar").classList.remove("open");
    window.scrollTo(0, 0);
  }

  function buildNav() {
    el("nav").innerHTML = VIEWS.map(([k, title], i) =>
      '<button class="nav-btn' + (i === 0 ? " active" : "") + '" data-view="' + k + '" type="button"><span class="nav-num">' + (i + 1) + "</span> " + title + "</button>"
    ).join("");
    el("nav").addEventListener("click", e => {
      const btn = e.target.closest(".nav-btn");
      if (btn) showView(btn.getAttribute("data-view"));
    });
  }

  el("refreshBtn").onclick = () => loadAll(true);
  el("themeBtn").onclick = () => {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    renderAll();
  };
  el("settingsBtn").onclick = () => el("settingsModal").classList.add("show");
  el("jwtClose").onclick = () => el("settingsModal").classList.remove("show");
  el("jwtClear").onclick = () => { jwt = null; el("jwtInput").value = ""; el("settingsModal").classList.remove("show"); recordStatus("Explorer 1Click", ENDPOINTS.explorer, false, "no JWT; showing snapshot", Date.now(), true, "Key cleared."); renderSources(); };
  el("jwtSave").onclick = () => { jwt = el("jwtInput").value.trim() || null; el("settingsModal").classList.remove("show"); if (jwt) fetchExplorer().then(() => renderSources()); };
  el("settingsModal").addEventListener("click", e => { if (e.target === el("settingsModal")) el("settingsModal").classList.remove("show"); });
  el("ham").onclick = () => el("sidebar").classList.toggle("open");

  buildNav();
  renderAll();
  loadAll(false);
  setInterval(() => loadAll(false), CACHE_MS);
})();
