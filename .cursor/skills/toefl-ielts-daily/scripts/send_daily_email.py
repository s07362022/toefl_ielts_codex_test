#!/usr/bin/env python3
"""Send daily lesson email from a lesson JSON file via gmail-sender."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

GMAIL_SENDER_SCRIPT = Path.home() / ".cursor" / "skills" / "gmail-sender" / "scripts"


def main() -> int:
    parser = argparse.ArgumentParser(description="Send TOEFL/IELTS daily lesson email")
    parser.add_argument("lesson_json", help="Path to day_NNN.json")
    parser.add_argument("--dry-run", action="store_true", help="Print subject only, do not send")
    args = parser.parse_args()

    path = Path(args.lesson_json)
    data = json.loads(path.read_text(encoding="utf-8"))
    gmail = data["gmail_email"]

    if args.dry_run:
        print(f"DRY RUN subject: {gmail['subject']}")
        print(f"DRY RUN to: {gmail['recipient']}")
        return 0

    sys.path.insert(0, str(GMAIL_SENDER_SCRIPT))
    from send_email import send_email  # type: ignore[import-untyped]

    ok = send_email(
        to=gmail["recipient"],
        subject=gmail["subject"],
        html=gmail["html_body"],
    )
    try:
        print("Email sent." if ok else "Email send returned False.")
    except UnicodeEncodeError:
        print("Email sent.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
