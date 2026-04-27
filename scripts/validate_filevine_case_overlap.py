"""
Validate Filevine project data against the local case list workbooks.

This script is intentionally read-only. It produces a JSON report with:
- overall counts
- strong matches by case number / normalized client name
- Filevine projects not found in the case lists
- case-list cases not found in Filevine
- likely mismatches where names line up but case numbers do not

Required environment variables:
- FILEVINE_API_TOKEN
- FILEVINE_CLIENT_ID
- FILEVINE_CLIENT_SECRET
- FILEVINE_ORG_ID
- FILEVINE_USER_ID

Optional:
- FILEVINE_PROJECTS_URL (defaults to the verified projects endpoint)
- FILEVINE_MAX_PAGES (defaults to 200)
- FILEVINE_PAGE_LIMIT (defaults to 50)
"""

from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from collections import Counter
from datetime import datetime, timezone
from urllib.parse import urlencode, urljoin

import pandas as pd
import requests


ROOT = Path(__file__).resolve().parent
ONEDRIVE_DOWNLOADS = Path(os.path.expanduser("~")) / "OneDrive - elizabethrosariolaw.com" / "Downloads"
DOWNLOADS = Path(os.path.expanduser("~/Downloads"))
OUTPUT = ROOT / "filevine_case_overlap_report.json"

CASE_LIST_FILES = {
    2022: ONEDRIVE_DOWNLOADS / "2022 CASE LIST.xlsx",
    2023: ONEDRIVE_DOWNLOADS / "2023 CASE LIST - Copy.xlsx",
    2024: ONEDRIVE_DOWNLOADS / "2024 CASE LIST - Copy.xlsx",
    2025: ONEDRIVE_DOWNLOADS / "2025 Case List (1).xlsx",
    2026: ONEDRIVE_DOWNLOADS / "2026 Case List (2).xlsx",
}

MONTH_NAMES = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
]


def normalize_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_name(value: str | None) -> str:
    if not value:
        return ""
    cleaned = value.upper().strip()
    cleaned = re.sub(r"\([^)]*\)", "", cleaned)
    cleaned = cleaned.replace(",", " ")
    cleaned = re.sub(r"[^A-Z0-9 ]", " ", cleaned)
    cleaned = normalize_spaces(cleaned)
    return cleaned


def canonical_person_name(value: str | None) -> str:
    """
    Turns both:
    - 'LASTNAME, Firstname Middlename'
    - 'Firstname Middlename Lastname'
    into a stable token sequence for comparison.
    """
    normalized = normalize_name(value)
    if not normalized:
        return ""
    if "," in (value or ""):
        raw = re.sub(r"\([^)]*\)", "", (value or "").upper())
        parts = [normalize_spaces(part) for part in raw.split(",") if normalize_spaces(part)]
        if len(parts) >= 2:
            return normalize_spaces(" ".join(parts[1:] + [parts[0]]))
    return normalized


def normalize_case_number(value: str | None) -> str:
    if not value:
        return ""
    cleaned = str(value).upper().strip()
    cleaned = cleaned.replace("E", "E")  # keep explicit E-prefix values intact
    cleaned = re.sub(r"[^A-Z0-9]", "", cleaned)
    return cleaned


def case_number_variants(value: str | None) -> set[str]:
    normalized = normalize_case_number(value)
    variants = {normalized} if normalized else set()
    if not normalized:
        return variants
    if normalized.startswith("E") and len(normalized) > 1:
        variants.add(normalized[1:])
    elif re.match(r"^\d", normalized):
        variants.add(f"E{normalized}")
    return {v for v in variants if v}


def parse_iso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    raw = str(value).strip()
    if not raw:
        return None
    try:
        if raw.endswith("Z"):
            return datetime.fromisoformat(raw.replace("Z", "+00:00"))
        dt = datetime.fromisoformat(raw)
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def extract_case_number_from_project(record: dict) -> str:
    number = str(record.get("number") or "").strip()
    if number:
        return number
    project_name = str(record.get("projectName") or record.get("projectOrClientName") or "")
    match = re.search(r"(\d{2}-\d{3,5}|E\d{2}-\d{3,5})", project_name.upper())
    return match.group(1) if match else ""


def extract_case_year(value: str | None) -> str:
    normalized = normalize_case_number(value)
    if not normalized:
        return "unknown"
    match = re.match(r"^E?(\d{2})", normalized)
    if not match:
        return "unknown"
    year = int(match.group(1))
    return f"20{year:02d}"


@dataclass
class CaseListRecord:
    year: int
    source_file: str
    sheet: str
    case_number: str
    client_name: str
    client_key: str
    raw_case_number: str
    intake_date: str | None


def load_case_list_records() -> list[CaseListRecord]:
    records: list[CaseListRecord] = []
    allowed_years = {
        int(item.strip())
        for item in os.environ.get("CASE_LIST_YEARS", "").split(",")
        if item.strip().isdigit()
    }
    case_list_start = os.environ.get("CASE_LIST_START_DATE", "").strip()
    case_list_start_dt = parse_iso_datetime(f"{case_list_start}T00:00:00+00:00") if case_list_start else None

    for year, path in CASE_LIST_FILES.items():
        if allowed_years and year not in allowed_years:
            continue
        if not path.exists():
            continue
        workbook = pd.read_excel(path, sheet_name=None)
        sheet_lookup = {name.upper().strip(): name for name in workbook.keys()}

        for month in MONTH_NAMES:
            actual_sheet = sheet_lookup.get(month)
            if not actual_sheet:
                continue

            df = workbook[actual_sheet]
            df.columns = [normalize_spaces(str(col)).upper() for col in df.columns]
            if "CLIENT" not in df.columns or "CASE #" not in df.columns:
                continue

            for _, row in df.iterrows():
                client_name = str(row.get("CLIENT") or "").strip()
                raw_case_number = str(row.get("CASE #") or "").strip()
                raw_date = row.get("DATE")
                if not client_name or not raw_case_number or raw_case_number.lower() == "nan":
                    continue

                intake_dt = None
                if pd.notna(raw_date):
                    try:
                        intake_dt = pd.to_datetime(raw_date, errors="coerce")
                    except Exception:
                        intake_dt = None
                if case_list_start_dt is not None:
                    if intake_dt is None or pd.isna(intake_dt):
                        continue
                    intake_check = intake_dt.to_pydatetime()
                    if intake_check.tzinfo is None:
                        intake_check = intake_check.replace(tzinfo=timezone.utc)
                    if intake_check < case_list_start_dt:
                        continue

                records.append(
                    CaseListRecord(
                        year=year,
                        source_file=path.name,
                        sheet=actual_sheet,
                        case_number=normalize_case_number(raw_case_number),
                        client_name=client_name,
                        client_key=canonical_person_name(client_name),
                        raw_case_number=raw_case_number,
                        intake_date=None if intake_dt is None or pd.isna(intake_dt) else intake_dt.strftime("%Y-%m-%d"),
                    )
                )

    return records


def build_token(client_id: str, client_secret: str, pat: str) -> str:
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "personal_access_token",
        "scope": "fv.api.gateway.access tenant filevine.v2.api.* openid email fv.auth.tenant.read",
        "token": pat,
    }
    response = requests.post(
        "https://identity.filevine.com/connect/token",
        data=urlencode(data),
        headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def fetch_all_projects() -> list[dict]:
    token = build_token(
        os.environ["FILEVINE_CLIENT_ID"],
        os.environ["FILEVINE_CLIENT_SECRET"],
        os.environ["FILEVINE_API_TOKEN"],
    )
    endpoint = os.environ.get("FILEVINE_PROJECTS_URL", "https://api.filevineapp.com/fv-app/v2/projects")
    max_pages = int(os.environ.get("FILEVINE_MAX_PAGES", "200"))
    limit = int(os.environ.get("FILEVINE_PAGE_LIMIT", "50"))
    created_since = os.environ.get("FILEVINE_CREATED_SINCE", "").strip()

    headers = {
        "Authorization": f"Bearer {token}",
        "x-fv-orgid": os.environ["FILEVINE_ORG_ID"],
        "x-fv-userid": os.environ["FILEVINE_USER_ID"],
        "Accept": "application/json",
    }

    projects: list[dict] = []
    base_params = {
        "offset": 0,
        "limit": limit,
        "requestedFields": "*",
    }
    if created_since:
        base_params["createdSince"] = created_since

    next_url = f"{endpoint}?{urlencode(base_params)}"

    for _ in range(max_pages):
        response = requests.get(next_url, headers=headers, timeout=120)
        response.raise_for_status()
        payload = response.json()
        projects.extend(payload.get("items") or [])

        next_link = ((payload.get("links") or {}).get("next"))
        if not next_link:
            break
        if next_link.startswith("http"):
            next_url = next_link
        else:
            next_url = urljoin("https://api.filevineapp.com/fv-app/v2/", next_link.lstrip("/"))

    return projects


def compare_records(case_records: list[CaseListRecord], filevine_projects: list[dict]) -> dict:
    cases_by_number: dict[str, list[CaseListRecord]] = {}
    cases_by_name: dict[str, list[CaseListRecord]] = {}

    for record in case_records:
        cases_by_number.setdefault(record.case_number, []).append(record)
        cases_by_name.setdefault(record.client_key, []).append(record)

    matched_case_numbers: set[str] = set()
    matched_filevine_ids: set[str] = set()
    exact_matches = []
    name_only_matches = []
    number_only_matches = []
    mismatches = []
    unmatched_filevine = []

    for project in filevine_projects:
        project_id = str((project.get("projectId") or {}).get("native") or project.get("projectId") or "").strip()
        project_name = str(project.get("projectName") or project.get("projectOrClientName") or "").strip()
        client_name = str(project.get("clientName") or "").strip()
        case_number = extract_case_number_from_project(project)
        fv_name_key = canonical_person_name(client_name or project_name)

        number_matches: list[CaseListRecord] = []
        for variant in case_number_variants(case_number):
            number_matches.extend(cases_by_number.get(variant, []))

        name_matches = cases_by_name.get(fv_name_key, [])

        if number_matches and name_matches:
            shared = [record for record in number_matches if record in name_matches]
            if shared:
                best = shared[0]
                exact_matches.append({
                    "filevine_project_id": project_id,
                    "filevine_project_name": project_name,
                    "filevine_client_name": client_name,
                    "filevine_case_number": case_number,
                    "case_list_case_number": best.raw_case_number,
                    "case_list_client_name": best.client_name,
                    "case_list_year": best.year,
                    "sheet": best.sheet,
                })
                matched_case_numbers.add(best.case_number)
                matched_filevine_ids.add(project_id)
                continue

        if number_matches:
            best = number_matches[0]
            number_only_matches.append({
                "filevine_project_id": project_id,
                "filevine_project_name": project_name,
                "filevine_client_name": client_name,
                "filevine_case_number": case_number,
                "case_list_case_number": best.raw_case_number,
                "case_list_client_name": best.client_name,
                "case_list_year": best.year,
                "sheet": best.sheet,
            })
            matched_case_numbers.add(best.case_number)
            matched_filevine_ids.add(project_id)
            continue

        if len(name_matches) == 1:
            best = name_matches[0]
            name_only_matches.append({
                "filevine_project_id": project_id,
                "filevine_project_name": project_name,
                "filevine_client_name": client_name,
                "filevine_case_number": case_number,
                "case_list_case_number": best.raw_case_number,
                "case_list_client_name": best.client_name,
                "case_list_year": best.year,
                "sheet": best.sheet,
            })
            matched_case_numbers.add(best.case_number)
            matched_filevine_ids.add(project_id)
            continue

        if len(name_matches) > 1:
            mismatches.append({
                "filevine_project_id": project_id,
                "filevine_project_name": project_name,
                "filevine_client_name": client_name,
                "filevine_case_number": case_number,
                "reason": "multiple_case_list_name_matches",
                "case_list_matches": [
                    {
                        "case_number": match.raw_case_number,
                        "client_name": match.client_name,
                        "year": match.year,
                        "sheet": match.sheet,
                    }
                    for match in name_matches[:10]
                ],
            })
            continue

        unmatched_filevine.append({
            "filevine_project_id": project_id,
            "filevine_project_name": project_name,
            "filevine_client_name": client_name,
            "filevine_case_number": case_number,
            "project_type": project.get("projectTypeCode"),
            "phase_name": project.get("phaseName"),
            "created_date": project.get("createdDate"),
            "is_archived": project.get("isArchived"),
        })

    unmatched_case_list = [
        {
            "case_number": record.raw_case_number,
            "client_name": record.client_name,
            "year": record.year,
            "sheet": record.sheet,
            "source_file": record.source_file,
        }
        for record in case_records
        if record.case_number not in matched_case_numbers
    ]

    case_list_years = Counter(record.year for record in case_records)
    filevine_years = Counter(extract_case_year(extract_case_number_from_project(project)) for project in filevine_projects)
    unmatched_filevine_years = Counter(extract_case_year(item["filevine_case_number"]) for item in unmatched_filevine)
    unmatched_case_list_years = Counter(str(item["year"]) for item in unmatched_case_list)
    unmatched_filevine_types = Counter((item["project_type"] or "unknown") for item in unmatched_filevine)
    unmatched_filevine_phases = Counter((item["phase_name"] or "unknown") for item in unmatched_filevine)

    return {
        "summary": {
            "case_list_records": len(case_records),
            "filevine_projects": len(filevine_projects),
            "exact_matches": len(exact_matches),
            "number_only_matches": len(number_only_matches),
            "name_only_matches": len(name_only_matches),
            "mismatches_for_review": len(mismatches),
            "unmatched_filevine_projects": len(unmatched_filevine),
            "unmatched_case_list_records": len(unmatched_case_list),
        },
        "filters": {
            "case_list_years": sorted({record.year for record in case_records}),
            "case_list_start_date": os.environ.get("CASE_LIST_START_DATE") or None,
            "filevine_created_since": os.environ.get("FILEVINE_CREATED_SINCE") or None,
        },
        "distributions": {
            "case_list_by_year": dict(sorted(case_list_years.items())),
            "filevine_by_year": dict(sorted(filevine_years.items())),
            "unmatched_filevine_by_year": dict(sorted(unmatched_filevine_years.items())),
            "unmatched_case_list_by_year": dict(sorted(unmatched_case_list_years.items())),
            "unmatched_filevine_by_project_type_top20": dict(unmatched_filevine_types.most_common(20)),
            "unmatched_filevine_by_phase_top20": dict(unmatched_filevine_phases.most_common(20)),
        },
        "exact_matches_sample": exact_matches[:50],
        "number_only_matches_sample": number_only_matches[:50],
        "name_only_matches_sample": name_only_matches[:50],
        "mismatches_sample": mismatches[:50],
        "unmatched_filevine_sample": unmatched_filevine[:100],
        "unmatched_case_list_sample": unmatched_case_list[:100],
    }


def main() -> int:
    missing = [
        key for key in [
            "FILEVINE_API_TOKEN",
            "FILEVINE_CLIENT_ID",
            "FILEVINE_CLIENT_SECRET",
            "FILEVINE_ORG_ID",
            "FILEVINE_USER_ID",
        ]
        if not os.environ.get(key)
    ]
    if missing:
        print(json.dumps({"error": "Missing required environment variables", "missing": missing}, indent=2))
        return 1

    case_records = load_case_list_records()
    filevine_projects = fetch_all_projects()
    report = compare_records(case_records, filevine_projects)

    OUTPUT.write_text(json.dumps(report, indent=2))
    print(json.dumps(report["summary"], indent=2))
    print(f"\nSaved report to: {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
