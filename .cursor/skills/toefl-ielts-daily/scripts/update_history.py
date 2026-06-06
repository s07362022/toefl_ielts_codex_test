#!/usr/bin/env python3
"""Merge history_update from a lesson JSON into learned_history.json."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_HISTORY = PROJECT_ROOT / "learned_history.json"


def load_history(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {
        "version": 1,
        "new_words": [],
        "review_log": [],
        "grammar_history": [],
        "theme_history": [],
        "skill_type_history": [],
        "days_completed": [],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("lesson_json", help="Path to validated day_NNN.json")
    parser.add_argument("--history", default=str(DEFAULT_HISTORY), help="learned_history.json path")
    args = parser.parse_args()

    lesson = json.loads(Path(args.lesson_json).read_text(encoding="utf-8"))
    history = load_history(Path(args.history))
    update = lesson["history_update"]
    meta = lesson.get("metadata", {})
    day = meta.get("day")

    for word in update.get("new_words_today", []):
        if word not in history["new_words"]:
            history["new_words"].append(word)

    history["grammar_history"].append(update.get("grammar_today"))
    history["theme_history"].append(update.get("theme_today"))
    history["skill_type_history"].append(update.get("skill_type_today"))

    if day is not None and day not in history["days_completed"]:
        history["days_completed"].append(day)

    history["review_log"].append(
        {
            "day": day,
            "date": datetime.now(timezone.utc).isoformat(),
            "review_words": update.get("review_words_today", []),
            "new_words": update.get("new_words_today", []),
        }
    )

    Path(args.history).write_text(
        json.dumps(history, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {args.history}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
