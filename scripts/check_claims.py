#!/usr/bin/env python3
"""Re-pull DefiLlama (and a few supporting public APIs) and grade frozen claims
from the 13 Nov 2026 thesis / dashboard brief.

Tolerance rule (dashboard rule, not published in the thesis or brief):
  green  if |live - frozen| / |frozen| <= 5%
  amber  if 5% < relative difference <= 15%
  red    if relative difference > 15%
  unmeasured  if the figure cannot be checked from these APIs
  record      historical first-draft results, not retested against today's APIs

The holders-revenue claim is summed from the daily series through 3 Nov 2026,
the same cutoff as the frozen figure. 30-day coverage is retested at the frozen
$3.51 price and 1.312B supply so a live price move does not decide it.
"""
from __future__ import annotations

import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "claims_results.json"

FROZEN_PRICE = 3.51
FROZEN_SUPPLY = 1.312e9
CAP_NOW = 0.025
SNAPSHOT_DATE = "13 Nov 2026"

ENDPOINTS = {
    "volume": "https://api.llama.fi/summary/dexs/near-intents",
    "fees": "https://api.llama.fi/summary/fees/near-intents?dataType=dailyFees",
    "revenue": "https://api.llama.fi/summary/fees/near-intents?dataType=dailyRevenue",
    "holdersRevenue": "https://api.llama.fi/summary/fees/near-intents?dataType=dailyHoldersRevenue",
}

TOLERANCE_RULE = (
    "Dashboard rule, not a tolerance published in the thesis or brief. "
    "Green if the absolute relative difference |live-frozen|/|frozen| is at most 5%. "
    "Amber if it is more than 5% and at most 15%. "
    "Red if it is more than 15%. "
    "Unmeasured claims are not graded. "
    "Holders revenue is summed through 3 Nov 2026. "
    "30-day coverage is retested at $3.51 and 1.312B supply."
)


def fetch_json(url: str, data: bytes | None = None) -> tuple[object | None, str | None]:
    headers = {"Accept": "application/json", "User-Agent": "near-intents-thesis-claims"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return json.loads(resp.read().decode("utf-8")), None
    except Exception as exc:  # noqa: BLE001
        return None, str(exc)


def month_key(unix_sec: int) -> str:
    return datetime.fromtimestamp(unix_sec, tz=timezone.utc).strftime("%Y-%m")


def sum_through(chart: list, end_day: str) -> float:
    total = 0.0
    for t, v in chart or []:
        day = datetime.fromtimestamp(int(t), tz=timezone.utc).date().isoformat()
        if day <= end_day:
            total += float(v)
    return total


def months_from_chart(chart: list) -> dict[str, float]:
    out: dict[str, float] = {}
    for t, v in chart or []:
        k = month_key(int(t))
        out[k] = out.get(k, 0.0) + float(v)
    return out


def rel_diff(live: float | None, frozen: float | None) -> float | None:
    if live is None or frozen is None or frozen == 0:
        return None
    return abs(live - frozen) / abs(frozen)


def grade(live, frozen) -> str:
    d = rel_diff(live, frozen)
    if d is None:
        return "unmeasured"
    if d <= 0.05:
        return "green"
    if d <= 0.15:
        return "amber"
    return "red"


def yocto_to_near(s: str) -> float | None:
    if not s or not str(s).isdigit():
        return None
    n = int(s)
    return n / 1e24


def claim(cid, name, frozen, live, unit, source, note="", status=None):
    return {
        "id": cid,
        "claim": name,
        "frozen_value": frozen,
        "live_value": live,
        "unit": unit,
        "status": status or grade(live, frozen),
        "relative_difference": rel_diff(live, frozen),
        "source": source,
        "note": note,
    }


def main() -> None:
    now = datetime.now(timezone.utc).replace(microsecond=0)
    pulled = {}
    errors = {}
    for name, url in ENDPOINTS.items():
        body, err = fetch_json(url)
        pulled[name] = body
        if err:
            errors[name] = err

    vol = pulled.get("volume") or {}
    fees = pulled.get("fees") or {}
    rev = pulled.get("revenue") or {}
    hold = pulled.get("holdersRevenue") or {}

    mv, mf, mr, mh = (
        months_from_chart(vol.get("totalDataChart")),
        months_from_chart(fees.get("totalDataChart")),
        months_from_chart(rev.get("totalDataChart")),
        months_from_chart(hold.get("totalDataChart")),
    )
    holders_to_3nov = sum_through(hold.get("totalDataChart"), "2026-11-03") if hold else None

    take_live = (rev.get("total30d") / vol.get("total30d") * 10000) if vol.get("total30d") and rev.get("total30d") is not None else None
    cap_live = (rev.get("total30d") / fees.get("total30d")) if fees.get("total30d") and rev.get("total30d") is not None else None
    frozen_iss_30 = FROZEN_SUPPLY * CAP_NOW * FROZEN_PRICE * 30 / 365
    cov_live_frozen_px = (rev.get("total30d") / frozen_iss_30) if rev.get("total30d") is not None else None
    take_frozen = 1.84e6 / 3.774e9 * 10000
    cap_frozen = 1.84e6 / 6.05e6
    cov_frozen = 1.84e6 / frozen_iss_30

    def qsum(keys, src):
        if not all(k in src for k in keys):
            return None
        return sum(src[k] for k in keys)

    q3_keys = ["2026-07", "2026-08", "2026-09"]
    q3_vol, q3_fees, q3_rev = qsum(q3_keys, mv), qsum(q3_keys, mf), qsum(q3_keys, mr)
    q3_cap = (q3_rev / q3_fees) if q3_rev is not None and q3_fees else None
    q3_take = (q3_rev / q3_vol * 10000) if q3_rev is not None and q3_vol else None
    q3_cov = (q3_rev / (FROZEN_SUPPLY * CAP_NOW * FROZEN_PRICE / 4)) if q3_rev is not None else None

    # Optional: buyback wallet via NEAR RPC
    rpc_body, rpc_err = fetch_json(
        "https://rpc.mainnet.near.org",
        data=json.dumps({
            "jsonrpc": "2.0",
            "id": "claims",
            "method": "query",
            "params": {"request_type": "view_account", "finality": "final", "account_id": "buybacks.multisignature.near"},
        }).encode(),
    )
    rpc_near = None
    if rpc_body and isinstance(rpc_body, dict) and rpc_body.get("result"):
        rpc_near = yocto_to_near(str(rpc_body["result"].get("amount", "")))
    if rpc_err:
        errors["near_rpc"] = rpc_err

    claims = [
        claim("vol_30d", "Intents volume, 30 days", 3.774e9, vol.get("total30d"), "USD", "DefiLlama volume total30d"),
        claim("vol_all", "Intents volume, all-time", 37.61e9, vol.get("totalAllTime"), "USD", "DefiLlama volume totalAllTime"),
        claim("fees_30d", "Gross fees, 30 days", 6.05e6, fees.get("total30d"), "USD", "DefiLlama fees total30d"),
        claim("fees_all", "Gross fees, all-time", 60.75e6, fees.get("totalAllTime"), "USD", "DefiLlama fees totalAllTime"),
        claim("rev_30d", "Protocol revenue, 30 days", 1.84e6, rev.get("total30d"), "USD", "DefiLlama revenue total30d"),
        claim("rev_all", "Protocol revenue, all-time", 9.93e6, rev.get("totalAllTime"), "USD", "DefiLlama revenue totalAllTime"),
        claim(
            "holders_to_3nov",
            "Holders revenue (buybacks), cumulative to 3 Nov 2026",
            7.58e6,
            holders_to_3nov,
            "USD",
            "DefiLlama holders revenue daily series, summed through 2026-11-03",
            note="Frozen figure is cumulative to 3 Nov, not all-time. Live is the same cutoff.",
        ),
        claim("take_30d", "Take rate, 30 days", take_frozen, take_live, "bp", "revenue / volume x 10,000", note="Frozen value is $1.84M / $3.774B, in basis points."),
        claim("capture_30d", "Capture, 30 days", cap_frozen, cap_live, "ratio", "revenue / gross fees", note="Frozen value is $1.84M / $6.05M, not the published 30.5% rounding."),
        claim(
            "coverage_30d_at_351",
            "Coverage of issuance, 30 days, at frozen $3.51",
            cov_frozen,
            cov_live_frozen_px,
            "ratio",
            "30-day revenue / (1.312B x 2.5% x $3.51 x 30/365)",
            note="Retested at $3.51 so a live price move does not decide it.",
        ),
        claim("vol_2026_09", "September 2026 Intents volume (record month)", 4.80e9, mv.get("2026-09"), "USD", "DefiLlama daily volume, summed for 2026-09"),
        claim("q3_vol", "Q3 2026 Intents volume", 9.79e9, q3_vol, "USD", "DefiLlama daily volume, summed Jul-Sep 2026"),
        claim("q3_capture", "Q3 2026 capture", 0.212, q3_cap, "ratio", "Q3 revenue / Q3 fees"),
        claim("q3_take", "Q3 2026 take rate", 3.14, q3_take, "bp", "Q3 revenue / Q3 volume, in basis points"),
        claim("q3_coverage", "Q3 2026 coverage at $3.51", 0.107, q3_cov, "ratio", "Q3 revenue / quarterly issuance at 2.5% and $3.51"),
        claim(
            "buyback_wallet",
            "Buyback wallet balance",
            1.77e6,
            rpc_near,
            "NEAR",
            "NEAR RPC view_account buybacks.multisignature.near",
            note="Frozen 1.77M NEAR is from revenue.near.org, which marks its figures illustrative. Live is the on-chain amount field.",
        ),
        {
            "id": "ex_hot_signers",
            "claim": "Ex-HOT daily signers",
            "frozen_value": None,
            "live_value": None,
            "unit": None,
            "status": "unmeasured",
            "relative_difference": None,
            "source": "BigQuery, skipped",
            "note": "Scala skipped BigQuery. This claim stays unmeasured.",
        },
        {
            "id": "hot_share",
            "claim": "HOT Wallet share of transactions",
            "frozen_value": 0.65,
            "live_value": None,
            "unit": "ratio",
            "status": "unmeasured",
            "relative_difference": None,
            "source": "Nansen Q2 2026, secondary; refresh would need BigQuery",
            "note": "Scala skipped BigQuery. Frozen 65% in Q2 2026 is secondary and is not retested.",
        },
        {
            "id": "measured_issuance",
            "claim": "Measured issuance from chain data",
            "frozen_value": None,
            "live_value": None,
            "unit": None,
            "status": "unmeasured",
            "relative_difference": None,
            "source": "BigQuery, skipped",
            "note": "Scala skipped BigQuery. This claim stays unmeasured.",
        },
        {
            "id": "first_draft_coverage",
            "claim": "First draft coverage (historical record)",
            "frozen_value": 0.25,
            "live_value": 0.19,
            "unit": "ratio",
            "status": "record",
            "relative_difference": abs(0.19 - 0.25) / 0.25,
            "source": "Thesis, section 10",
            "note": "The draft said 25% and the primary pull said 19%. This is a historical miss, not a live retest.",
        },
        {
            "id": "first_draft_valuation",
            "claim": "First draft valuation, best 30 days (historical record)",
            "frozen_value": 161,
            "live_value": 205,
            "unit": "multiple",
            "status": "record",
            "relative_difference": abs(205 - 161) / 161,
            "source": "Thesis, section 10",
            "note": "The draft said 161x and the primary pull said 205x, 28% off. Historical miss, not a live retest.",
        },
    ]

    out = {
        "run_time": now.isoformat().replace("+00:00", "Z"),
        "tolerance_rule": TOLERANCE_RULE,
        "frozen_as_of": SNAPSHOT_DATE,
        "errors": errors,
        "claims": claims,
        "onchain_buyback": {
            "account": "buybacks.multisignature.near",
            "rpc_amount_near": rpc_near,
            "rpc_error": rpc_err,
            "note": "On-chain amount from view_account. This is not a cost basis for holders revenue.",
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=2) + "\n")
    print(f"Wrote {OUT} at {out['run_time']}")
    for c in claims:
        print(f"  {c['status']:10} {c['id']:24} frozen={c['frozen_value']} live={c['live_value']}")


if __name__ == "__main__":
    main()
