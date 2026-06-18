#!/usr/bin/env python3
"""
Build a subscriber recovery audit from Resend sent-email history.

This script is read-only. It does not create, update, delete, or send anything.
It can read either Resend API history or a local Resend Emails CSV export, then
writes CSV files under resend-audit/ for review.
"""

import argparse
import csv
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API_BASE = "https://api.resend.com"
DEFAULT_OUTPUT_DIR = Path("resend-audit")
DEFAULT_WELCOME_SUBJECT = "Your Free Guide"
UNSUBSCRIBE_SUBJECT_PREFIX = "Unsubscribe request:"
BAD_EVENTS = {"bounced", "failed", "complained", "suppressed"}
DELIVERED_EVENTS = {"delivered", "opened", "clicked"}


def normalize_email(value):
    if not value:
        return ""
    value = str(value).strip().lower()
    match = re.search(r"([a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,})", value, re.I)
    return match.group(1).lower() if match else ""


def extract_emails(value):
    if not value:
        return []
    if isinstance(value, list):
        emails = []
        for item in value:
            emails.extend(extract_emails(item))
        return emails
    return [match.lower() for match in re.findall(r"[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}", str(value), re.I)]


def parse_time(value):
    return value or ""


def earlier(a, b):
    if not a:
        return b
    if not b:
        return a
    return min(a, b)


def later(a, b):
    if not a:
        return b
    if not b:
        return a
    return max(a, b)


def api_get(api_key, path, params=None, max_retries=3):
    url = API_BASE + path
    if params:
        url += "?" + urlencode(params)

    request = Request(
        url,
        headers={
            "Authorization": "Bearer " + api_key,
            "User-Agent": "folk-calm-subscriber-audit/1.0",
        },
    )

    for attempt in range(max_retries + 1):
        try:
            with urlopen(request, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            if exc.code == 429 and attempt < max_retries:
                retry_after = int(exc.headers.get("retry-after") or "2")
                time.sleep(retry_after)
                continue
            raise RuntimeError(f"Resend API error {exc.code} for {path}: {body}") from exc
        except URLError as exc:
            if attempt < max_retries:
                time.sleep(2)
                continue
            raise RuntimeError(f"Network error for {path}: {exc.reason}") from exc


def list_endpoint(api_key, path, limit=100, max_pages=100):
    after = None
    page = 0

    while True:
        page += 1
        params = {"limit": limit}
        if after:
            params["after"] = after

        payload = api_get(api_key, path, params)
        items = payload.get("data") or []

        for item in items:
            yield item

        if not payload.get("has_more") or not items or page >= max_pages:
            break

        after = items[-1].get("id")
        if not after:
            break

        time.sleep(0.25)


def empty_record(email):
    return {
        "email": email,
        "welcome_count": 0,
        "first_welcome_at": "",
        "last_welcome_at": "",
        "welcome_events": {},
        "bad_events": {},
        "unsubscribe_request_at": "",
        "existing_contact": "",
        "existing_unsubscribed": "",
        "existing_created_at": "",
    }


def get_record(records, email):
    if email not in records:
        records[email] = empty_record(email)
    return records[email]


def add_event(counter, value):
    value = value or "unknown"
    counter[value] = counter.get(value, 0) + 1


def analyze_sent_emails(api_key, welcome_subject, max_pages):
    records = {}
    welcome_subject = welcome_subject.lower()

    for message in list_endpoint(api_key, "/emails", max_pages=max_pages):
        analyze_message(records, message, welcome_subject)

    return records


def analyze_emails_csv(csv_path, welcome_subject):
    records = {}
    welcome_subject = welcome_subject.lower()

    with Path(csv_path).open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        required = {"subject", "to", "last_event"}
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise RuntimeError(f"Emails CSV is missing required columns: {', '.join(sorted(missing))}")

        for row in reader:
            analyze_message(records, row, welcome_subject)

    return records


def analyze_message(records, message, welcome_subject):
    subject = message.get("subject") or ""
    created_at = parse_time(message.get("created_at") or message.get("sent_at"))
    last_event = (message.get("last_event") or "unknown").lower()

    unsubscribe_match = re.search(
        re.escape(UNSUBSCRIBE_SUBJECT_PREFIX) + r"\s*([^\s<>]+@[^\s<>]+)",
        subject,
        re.I,
    )
    if unsubscribe_match:
        email = normalize_email(unsubscribe_match.group(1))
        if email:
            record = get_record(records, email)
            record["unsubscribe_request_at"] = later(record["unsubscribe_request_at"], created_at)
        return

    if welcome_subject not in subject.lower():
        return

    for email in extract_emails(message.get("to")):
        record = get_record(records, email)
        record["welcome_count"] += 1
        record["first_welcome_at"] = earlier(record["first_welcome_at"], created_at)
        record["last_welcome_at"] = later(record["last_welcome_at"], created_at)
        add_event(record["welcome_events"], last_event)
        if last_event in BAD_EVENTS:
            add_event(record["bad_events"], last_event)


def merge_existing_contacts(api_key, records, max_pages):
    for contact in list_endpoint(api_key, "/contacts", max_pages=max_pages):
        email = normalize_email(contact.get("email"))
        if not email:
            continue
        record = get_record(records, email)
        record["existing_contact"] = "yes"
        record["existing_unsubscribed"] = "true" if contact.get("unsubscribed") else "false"
        record["existing_created_at"] = parse_time(contact.get("created_at"))


def summarize_events(counter):
    return ";".join(f"{key}:{counter[key]}" for key in sorted(counter))


def classify(record):
    has_welcome = record["welcome_count"] > 0
    has_unsub = bool(record["unsubscribe_request_at"]) or record["existing_unsubscribed"] == "true"
    has_complaint = "complained" in record["bad_events"]
    has_bad = bool(record["bad_events"])
    has_delivered = any(event in DELIVERED_EVENTS for event in record["welcome_events"])

    if has_unsub:
        return "unsubscribed", "import_unsubscribed", "true"
    if has_complaint:
        return "complained", "import_unsubscribed", "true"
    if has_bad and not has_delivered:
        return "delivery_failed", "do_not_import", ""
    if has_bad and has_delivered:
        return "review_mixed_delivery", "review", ""
    if has_welcome:
        return "candidate_subscribed", "import_subscribed", "false"
    if record["existing_contact"] == "yes":
        return "existing_contact_only", "keep_existing", record["existing_unsubscribed"] or "false"
    return "unknown", "review", ""


def write_csvs(records, output_dir):
    output_dir.mkdir(parents=True, exist_ok=True)
    audit_path = output_dir / "subscriber-audit.csv"
    import_path = output_dir / "contacts-import-preview.csv"
    review_path = output_dir / "review-needed.csv"
    do_not_import_path = output_dir / "do-not-import.csv"
    summary_path = output_dir / "summary.csv"

    audit_fields = [
        "email",
        "status",
        "recommended_action",
        "import_unsubscribed_value",
        "welcome_count",
        "first_welcome_at",
        "last_welcome_at",
        "welcome_events",
        "bad_events",
        "unsubscribe_request_at",
        "existing_contact",
        "existing_unsubscribed",
        "existing_created_at",
    ]

    import_fields = ["email", "unsubscribed"]
    summary = {"total": 0, "import_subscribed": 0, "import_unsubscribed": 0, "review": 0, "do_not_import": 0}

    with audit_path.open("w", newline="", encoding="utf-8") as audit_file, import_path.open(
        "w", newline="", encoding="utf-8"
    ) as import_file, review_path.open("w", newline="", encoding="utf-8") as review_file, do_not_import_path.open(
        "w", newline="", encoding="utf-8"
    ) as do_not_import_file:
        audit_writer = csv.DictWriter(audit_file, fieldnames=audit_fields)
        import_writer = csv.DictWriter(import_file, fieldnames=import_fields)
        review_writer = csv.DictWriter(review_file, fieldnames=audit_fields)
        do_not_import_writer = csv.DictWriter(do_not_import_file, fieldnames=audit_fields)
        audit_writer.writeheader()
        import_writer.writeheader()
        review_writer.writeheader()
        do_not_import_writer.writeheader()

        for email in sorted(records):
            record = records[email]
            status, action, import_unsubscribed = classify(record)
            summary["total"] += 1
            summary[action] = summary.get(action, 0) + 1

            audit_row = {
                "email": email,
                "status": status,
                "recommended_action": action,
                "import_unsubscribed_value": import_unsubscribed,
                "welcome_count": record["welcome_count"],
                "first_welcome_at": record["first_welcome_at"],
                "last_welcome_at": record["last_welcome_at"],
                "welcome_events": summarize_events(record["welcome_events"]),
                "bad_events": summarize_events(record["bad_events"]),
                "unsubscribe_request_at": record["unsubscribe_request_at"],
                "existing_contact": record["existing_contact"],
                "existing_unsubscribed": record["existing_unsubscribed"],
                "existing_created_at": record["existing_created_at"],
            }
            audit_writer.writerow(audit_row)

            if action in {"import_subscribed", "import_unsubscribed"}:
                import_writer.writerow({"email": email, "unsubscribed": import_unsubscribed})
            elif action == "review":
                review_writer.writerow(audit_row)
            elif action == "do_not_import":
                do_not_import_writer.writerow(audit_row)

    with summary_path.open("w", newline="", encoding="utf-8") as summary_file:
        writer = csv.writer(summary_file)
        writer.writerow(["metric", "count"])
        for key in sorted(summary):
            writer.writerow([key, summary[key]])

    return audit_path, import_path, review_path, do_not_import_path, summary_path, summary


def parse_excluded_emails(values):
    excluded = set()
    for value in values or []:
        for part in str(value).split(","):
            email = normalize_email(part)
            if email:
                excluded.add(email)
    return excluded


def main():
    parser = argparse.ArgumentParser(description="Create a Resend subscriber recovery audit CSV.")
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT_DIR))
    parser.add_argument("--welcome-subject", default=DEFAULT_WELCOME_SUBJECT)
    parser.add_argument("--max-pages", type=int, default=100)
    parser.add_argument("--emails-csv", help="Read a local Resend Emails CSV export instead of the Resend API.")
    parser.add_argument("--exclude-email", action="append", default=[], help="Email address to exclude from output. Can be repeated or comma-separated.")
    args = parser.parse_args()

    if args.emails_csv:
        records = analyze_emails_csv(args.emails_csv, args.welcome_subject)
    else:
        api_key = os.environ.get("RESEND_API_KEY", "").strip()
        if not api_key:
            print("RESEND_API_KEY is not set. Set it in your local shell, then rerun this script.", file=sys.stderr)
            return 2
        records = analyze_sent_emails(api_key, args.welcome_subject, args.max_pages)
        merge_existing_contacts(api_key, records, args.max_pages)

    excluded = parse_excluded_emails(args.exclude_email)
    for email in excluded:
        records.pop(email, None)

    audit_path, import_path, review_path, do_not_import_path, summary_path, summary = write_csvs(records, Path(args.output_dir))

    print("Subscriber audit complete")
    print(f"Audit CSV: {audit_path}")
    print(f"Import preview CSV: {import_path}")
    print(f"Review-needed CSV: {review_path}")
    print(f"Do-not-import CSV: {do_not_import_path}")
    print(f"Summary CSV: {summary_path}")
    for key in sorted(summary):
        print(f"{key}: {summary[key]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
