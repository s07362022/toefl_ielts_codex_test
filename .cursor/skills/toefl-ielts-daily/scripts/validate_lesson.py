#!/usr/bin/env python3
"""Validate daily TOEFL/IELTS lesson JSON against project rules."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def count_english_words(text: str) -> int:
    """Count whitespace-separated English tokens in reading text."""
    return len(re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", text))


def validate_lesson(data: dict) -> list[str]:
    """Return list of validation error messages (empty if valid)."""
    errors: list[str] = []

    vocab = data.get("vocabulary", [])
    if not isinstance(vocab, list) or not (15 <= len(vocab) <= 20):
        errors.append(f"vocabulary must have 15-20 items, got {len(vocab) if isinstance(vocab, list) else 'invalid'}")

    if isinstance(vocab, list):
        new_count = sum(1 for v in vocab if v.get("status") == "new")
        review_count = sum(1 for v in vocab if v.get("status") == "review")
        if not (12 <= new_count <= 15):
            errors.append(f"new vocabulary should be 12-15, got {new_count}")
        if not (3 <= review_count <= 5):
            errors.append(f"review vocabulary should be 3-5, got {review_count}")
        words = [v.get("word", "").lower() for v in vocab if v.get("status") == "new"]
        if len(words) != len(set(words)):
            errors.append("duplicate new words within vocabulary")

    listening = data.get("listening_speaking", [])
    if not isinstance(listening, list) or len(listening) != 3:
        errors.append(f"listening_speaking must have exactly 3 items, got {len(listening) if isinstance(listening, list) else 'invalid'}")

    quiz = data.get("daily_quiz", [])
    if not isinstance(quiz, list) or len(quiz) != 3:
        errors.append(f"daily_quiz must have exactly 3 items, got {len(quiz) if isinstance(quiz, list) else 'invalid'}")

    reading = data.get("reading", {})
    if isinstance(reading, dict):
        text = reading.get("text", "")
        wc = count_english_words(text)
        if not (150 <= wc <= 220):
            errors.append(f"reading.text word count should be 150-220, got {wc}")

    meta = data.get("metadata", {})
    if isinstance(meta, dict):
        minutes = meta.get("estimated_minutes")
        if minutes is None or not (10 <= int(minutes) <= 20):
            errors.append(f"metadata.estimated_minutes should be 10-20, got {minutes}")

    gmail = data.get("gmail_email", {})
    if not isinstance(gmail, dict):
        errors.append("gmail_email must be an object")
    else:
        if gmail.get("recipient") != "gish1040403@gmail.com":
            errors.append("gmail_email.recipient must be gish1040403@gmail.com")
        for key in ("subject", "html_body"):
            if not gmail.get(key):
                errors.append(f"gmail_email.{key} is required")

    history = data.get("history_update", {})
    if not isinstance(history, dict):
        errors.append("history_update must be an object")
    else:
        for key in ("new_words_today", "review_words_today", "grammar_today", "theme_today", "skill_type_today"):
            if key not in history:
                errors.append(f"history_update.{key} is required")

    return errors


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: validate_lesson.py <path-to-json>", file=sys.stderr)
        return 2

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"ERROR: file not found: {path}", file=sys.stderr)
        return 2

    raw = path.read_text(encoding="utf-8")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"ERROR: invalid JSON: {exc}", file=sys.stderr)
        return 1

    errors = validate_lesson(data)
    if errors:
        print("VALIDATION FAILED:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print("VALIDATION OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
