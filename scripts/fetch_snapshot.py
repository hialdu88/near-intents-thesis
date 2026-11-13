#!/usr/bin/env python3
"""Fetch the DefiLlama endpoints listed in the dashboard brief, Section 2, and
write data/snapshots/YYYY-MM-DD.json (UTC date).

The protocol page payload is large (multi-megabyte TVL history). This script
stores a compact extract (latest TVL and currentChainTvls), not the full body,
and says so in the file. Other endpoints are stored in full.
"""
from __future__ import annotations

import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data" / "snapshots"

ENDPOINTS = {
    "volume": "https://api.llama.fi/summary/dexs/near-intents",
    "fees": "https://api.llama.fi/summary/fees/near-intents?dataType=dailyFees",
    "revenue": "https://api.llama.fi/summary/fees/near-intents?dataType=dailyRevenue",
    "holdersRevenue": "https://api.llama.fi/summary/fees/near-intents?dataType=dailyHoldersRevenue",
    "chainFees": "https://api.llama.fi/summary/fees/near?dataType=dailyFees",
    "protocol": "https://api.llama.fi/protocol/near-intents",
}


def fetch(url: str) -> tuple[object | None, str | None]:
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "near-intents-thesis-snapshot"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8")), None
    except Exception as exc:  # noqa: BLE001
        return None, str(exc)


def compact_protocol(body: object) -> object:
    if not isinstance(body, dict):
        return body
    tvl = body.get("tvl")
    latest = tvl[-1] if isinstance(tvl, list) and tvl else None
    return {
        "trimmed": True,
        "reason": "Full protocol payload includes a long TVL history. Only the latest TVL point and currentChainTvls are stored.",
        "name": body.get("name"),
        "id": body.get("id"),
        "tvl_latest": latest,
        "currentChainTvls": body.get("currentChainTvls"),
    }


def main() -> None:
    now = datetime.now(timezone.utc)
    day = now.date().isoformat()
    record = {
        "date": day,
        "fetchedAt": now.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "sources": {},
    }
    for name, url in ENDPOINTS.items():
        data, err = fetch(url)
        entry = {"url": url, "ok": err is None, "error": err}
        if data is not None:
            entry["body"] = compact_protocol(data) if name == "protocol" else data
        record["sources"][name] = entry

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{day}.json"
    out.write_text(json.dumps(record, indent=2) + "\n")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
