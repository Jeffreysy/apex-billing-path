"""
fcr_sync.py — Future Collections Report → Supabase live sync
Reads the active Excel workbook from OneDrive and inserts any rows newer than
the latest date already in collection_activities for each collector.

Run automatically via Windows Task Scheduler (every 2 hours).
Logs to: scripts/fcr_sync.log
"""

import shutil, os, sys, logging, time
import pandas as pd
import numpy as np
import requests
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────────────────

SOURCE_FILE = (
    r"C:\Users\JeffreySoto-Gil\OneDrive - elizabethrosariolaw.com"
    r"\Desktop\Transition file\Future Collections Report (1).xlsx"
)
TEMP_COPY   = r"C:\Users\JeffreySoto-Gil\AppData\Local\Temp\fcr_sync_copy.xlsx"
LOG_FILE    = os.path.join(os.path.dirname(__file__), "fcr_sync.log")

SUPABASE_URL = "https://qbrufeewsisljtoegops.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicnVmZWV3c2lzbGp0b2Vnb3BzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjY1MzAsImV4cCI6MjA4ODY0MjUzMH0"
    ".JI0cKKy_qDVzNBNsHlt4vDj0rZ2Kp7naNiCrvliNiD4"
)
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

# Sheet name → canonical collector name stored in Supabase
SHEETS = {
    "Patricio":       "Patricio D",
    "Maritza":        "Maritza V",
    "Alejandro":      "Alejandro A",
    "Roy Intake":     "Roy Ramos",
    "Lizbeth Intake": "Lizbeth Castrill\u00f3n",
}

CHUNK_SIZE  = 25
CHUNK_DELAY = 0.15  # seconds between chunks to avoid rate limits

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(open(sys.stdout.fileno(), mode="w", encoding="utf-8", closefd=False)),
    ],
)
log = logging.getLogger(__name__)

# ── Helpers ───────────────────────────────────────────────────────────────────

def normalize_type(v):
    if not v or str(v).strip() in ("0", "", "nan"):
        return "unknown"
    v = str(v).strip().lower()
    if v in ("outbound", "outbound call", "outbound_call"):   return "outbound_call"
    if v in ("inbound",  "inbound call",  "inbound_call"):    return "inbound_call"
    if "admin" in v or "report" in v:                         return "administrative"
    if "filter" in v:                                         return "filter_list"
    if "update" in v:                                         return "update_log"
    if "meeting" in v:                                        return "meeting"
    if "training" in v:                                       return "training"
    if "technical" in v:                                      return "technical_issues"
    if "send" in v and "info" in v:                           return "send_information"
    if "escalat" in v:                                        return "escalate"
    if "pending" in v:                                        return "pending_tasks_review"
    return v.replace(" ", "_")

def frac_to_time(f):
    try:
        s = float(f) * 86400
        return f"{int(s // 3600):02d}:{int((s % 3600) // 60):02d}:00"
    except Exception:
        return None

def frac_to_minutes(f):
    try:
        m = float(f) * 1440
        return round(m, 1) if m > 0 else None
    except Exception:
        return None

def safe_str(v):
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return None
    s = str(v).strip("\n").strip()
    return None if s in ("0", "", "nan", "NaT") else s

def safe_float(v):
    try:
        f = float(v)
        return f if f > 0 else None
    except Exception:
        return None

def parse_dates(series):
    """Handle both numeric (Excel serial) and string date columns."""
    if series.dtype in ("float64", "int64"):
        return pd.to_datetime(series, unit="D", origin="1899-12-30", errors="coerce")
    return pd.to_datetime(series, errors="coerce")

def get_latest_date(collector: str) -> str | None:
    """Fetch the most recent activity_date for this collector from Supabase."""
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/collection_activities",
        headers=HEADERS,
        params={
            "collector": f"eq.{collector}",
            "select": "activity_date",
            "order": "activity_date.desc",
            "limit": 1,
        },
    )
    if resp.status_code == 200 and resp.json():
        return resp.json()[0]["activity_date"]
    return None

def build_record(row, collector, has_lead=True):
    client_col = "LEAD" if has_lead else "Case"
    cn = safe_str(row.get(client_col))
    return {
        "activity_date":        row["DATE"].strftime("%Y-%m-%d"),
        "collector":            collector,
        "activity_type":        normalize_type(row.get("ACTIVITY")),
        "client_name":          cn or "Unknown",
        "outcome":              safe_str(row.get("OUTCOME")),
        "collected_amount":     safe_float(row.get("COLLECTED AMOUNT")),
        "commission":           safe_float(row.get("COMMISSION")),
        "start_time":           frac_to_time(row.get("Start Time")),
        "duration_minutes":     frac_to_minutes(row.get("Activity Duration")),
        "next_payment_expected": safe_str(row.get("NEXT PAYMENT")),
        "notes":                safe_str(row.get("NOTES") or row.get("CASE STATUS")),
    }

def insert_records(records: list) -> tuple[int, int]:
    ok = err = 0
    for i in range(0, len(records), CHUNK_SIZE):
        chunk = records[i : i + CHUNK_SIZE]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/collection_activities",
            headers=HEADERS,
            json=chunk,
        )
        if resp.status_code in (200, 201):
            ok += len(chunk)
        else:
            err += len(chunk)
            log.warning("Insert error (chunk %d): %s %s", i // CHUNK_SIZE + 1, resp.status_code, resp.text[:200])
        time.sleep(CHUNK_DELAY)
    return ok, err

# ── Main ─────────────────────────────────────────────────────────────────────

def sync():
    log.info("--- FCR sync started ---")

    # Copy the file so we can read it even if Excel has it open
    try:
        shutil.copy2(SOURCE_FILE, TEMP_COPY)
        log.info("Copied source file to temp")
    except Exception as e:
        log.error("Could not copy source file: %s", e)
        return

    try:
        xl = pd.ExcelFile(TEMP_COPY)
    except Exception as e:
        log.error("Could not open Excel file: %s", e)
        return

    total_inserted = total_skipped = total_errors = 0

    for sheet_name, collector in SHEETS.items():
        if sheet_name not in xl.sheet_names:
            log.info("Sheet '%s' not found — skipping", sheet_name)
            continue

        # Find cutoff: latest date already in Supabase for this collector
        cutoff_str = get_latest_date(collector)
        cutoff = pd.to_datetime(cutoff_str) if cutoff_str else pd.Timestamp("2025-01-01")
        log.info("%-20s  cutoff: %s", collector, cutoff.date())

        try:
            df = pd.read_excel(xl, sheet_name=sheet_name)
        except Exception as e:
            log.error("Could not read sheet '%s': %s", sheet_name, e)
            continue

        df["DATE"] = parse_dates(df["DATE"])
        has_lead = "LEAD" in df.columns

        # Keep only new rows with a real activity
        new = df[
            (df["DATE"] > cutoff) &
            df["DATE"].notna() &
            df["ACTIVITY"].apply(lambda x: str(x).strip() not in ("0", "", "nan"))
        ]

        if new.empty:
            log.info("%-20s  no new rows", collector)
            total_skipped += 1
            continue

        log.info("%-20s  %d new rows (up to %s)", collector, len(new), new["DATE"].max().date())
        records = [build_record(row, collector, has_lead) for _, row in new.iterrows()]
        ok, err = insert_records(records)
        log.info("%-20s  inserted=%d  errors=%d", collector, ok, err)
        total_inserted += ok
        total_errors   += err

    log.info("--- Done  inserted=%d  errors=%d ---\n", total_inserted, total_errors)

if __name__ == "__main__":
    sync()
