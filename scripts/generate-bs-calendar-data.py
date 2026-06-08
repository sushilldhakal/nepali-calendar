#!/usr/bin/env python3
"""Generate offline BS calendar tables for @sushill/bikram-sambat (2080–2200).

Uses the nepali-holiday-api engine (aligned with Project Parva):
- 2080–2099: official month-length lookup
- 2100–2114: calibrated 3-year cycle extrapolation
- 2115–2200: sankranti-based estimation

Run from repo root:
  python3 scripts/generate-bs-calendar-data.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
API_ROOT = REPO_ROOT.parent / "nepali-holiday-api"
OUT_PATH = REPO_ROOT / "packages" / "bikram-sambat" / "src" / "bs-calendar-data.json"

START_YEAR = 2080
END_YEAR = 2200


def main() -> None:
    sys.path.insert(0, str(API_ROOT))
    from panchanga.bikram_sambat import get_bs_month_length, get_bs_month_start

    month_lengths: dict[str, list[int]] = {}
    baisakh_1_ad: dict[str, str] = {}

    for year in range(START_YEAR, END_YEAR + 1):
        month_lengths[str(year)] = [get_bs_month_length(year, m) for m in range(1, 13)]
        baisakh_1_ad[str(year)] = get_bs_month_start(year, 1).isoformat()

    baisakh_1_ad[str(END_YEAR + 1)] = get_bs_month_start(END_YEAR + 1, 1).isoformat()

    payload = {
        "start_year": START_YEAR,
        "end_year": END_YEAR,
        "source": "nepali-holiday-api/panchanga (Project Parva compatible)",
        "notes": "2099 and earlier: official lookup; 2100+ extrapolated",
        "month_lengths": month_lengths,
        "baisakh_1_ad": baisakh_1_ad,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({END_YEAR - START_YEAR + 1} BS years)")


if __name__ == "__main__":
    main()
