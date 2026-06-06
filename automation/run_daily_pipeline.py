#!/usr/bin/env python3
"""
Daily TOEFL/IELTS pipeline:
  1. Determine next day
  2. Generate lesson JSON (if missing)
  3. Validate
  4. Copy to daily_lessons + web public/data
  5. Send Gmail
  6. Update learned_history.json
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DAILY_LESSONS = PROJECT_ROOT / "daily_lessons"
WEB_ROOT = PROJECT_ROOT / "cursor製作"
WEB_DATA = WEB_ROOT / "public" / "data"
GITHUB_REMOTE = "https://github.com/s07362022/toefl-ielts-cursor_test.git"
HISTORY_PATH = PROJECT_ROOT / "learned_history.json"
SKILL_SCRIPTS = PROJECT_ROOT / ".cursor" / "skills" / "toefl-ielts-daily" / "scripts"
AUTOMATION_DIR = Path(__file__).resolve().parent


def load_history() -> dict:
    if HISTORY_PATH.exists():
        return json.loads(HISTORY_PATH.read_text(encoding="utf-8"))
    return {
        "version": 1,
        "new_words": [],
        "review_log": [],
        "grammar_history": [],
        "theme_history": [],
        "skill_type_history": [],
        "days_completed": [],
    }


def next_day(history: dict) -> int:
    completed = set(history.get("days_completed", []))
    for day in range(1, 61):
        if day not in completed:
            return day
    return 60


def lesson_path(day: int) -> Path:
    return DAILY_LESSONS / f"day_{day:03d}.json"


def run_cmd(cmd: list[str], cwd: Path | None = None) -> None:
    print(f">>> {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd or PROJECT_ROOT, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed ({result.returncode}): {' '.join(cmd)}")


def rebuild_days_index(current_day: int) -> None:
    """Rebuild days_index.json from all day_XXX.json in web data folder."""
    entries: list[dict] = []
    if WEB_DATA.exists():
        for path in sorted(WEB_DATA.glob("day_*.json")):
            day_num = int(path.stem.split("_")[1])
            try:
                lesson = json.loads(path.read_text(encoding="utf-8"))
                meta = lesson.get("metadata", {})
                entries.append(
                    {
                        "day": day_num,
                        "theme": meta.get("theme", f"Day {day_num}"),
                        "date_label": meta.get("date_label", ""),
                        "phase": meta.get("phase", "Foundation"),
                        "level": meta.get("level", "B1+"),
                        "estimated_minutes": meta.get("estimated_minutes", 15),
                        "file": path.name,
                    }
                )
            except (json.JSONDecodeError, ValueError, IndexError):
                entries.append(
                    {
                        "day": day_num,
                        "theme": f"Day {day_num}",
                        "date_label": "",
                        "phase": "Foundation",
                        "level": "B1+",
                        "estimated_minutes": 15,
                        "file": path.name,
                    }
                )

    entries.sort(key=lambda x: x["day"])
    index = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "current_day": current_day,
        "days": entries,
    }
    index_path = WEB_DATA / "days_index.json"
    index_path.write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated history index: {index_path} ({len(entries)} days)")


def copy_lesson(day: int, src: Path) -> None:
    """Copy lesson JSON to web public/data."""
    DAILY_LESSONS.mkdir(parents=True, exist_ok=True)
    WEB_DATA.mkdir(parents=True, exist_ok=True)

    dest_lesson = lesson_path(day)
    if src.resolve() != dest_lesson.resolve():
        shutil.copy2(src, dest_lesson)

    web_dest = WEB_DATA / f"day_{day:03d}.json"
    shutil.copy2(dest_lesson, web_dest)

    current = WEB_DATA / "current_day.json"
    current.write_text(
        json.dumps({"day": day, "file": f"day_{day:03d}.json"}, ensure_ascii=False)
        + "\n",
        encoding="utf-8",
    )
    rebuild_days_index(day)
    print(f"Copied to {dest_lesson}")
    print(f"Copied to {web_dest}")


def push_github(day: int) -> None:
    """Push via push_github_pages.py（對齊 stock push_dashboard.py）。"""
    push_script = WEB_ROOT / "scripts" / "push_github_pages.py"
    msg = f"update: Day {day} lesson {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
    run_cmd([sys.executable, str(push_script), "--message", msg])


def ensure_lesson(day: int, history: dict, force: bool) -> Path:
    path = lesson_path(day)
    if path.exists() and not force:
        print(f"Using existing lesson: {path}")
        return path

    print(f"Generating lesson for day {day}...")
    run_cmd(
        [
            sys.executable,
            str(AUTOMATION_DIR / "lesson_generator.py"),
            "--day",
            str(day),
            "--output",
            str(path),
            "--history",
            str(HISTORY_PATH),
        ]
    )
    return path


def main() -> int:
    parser = argparse.ArgumentParser(description="Run daily TOEFL/IELTS pipeline")
    parser.add_argument("--day", type=int, help="Force specific day (default: next uncompleted)")
    parser.add_argument("--force-generate", action="store_true", help="Regenerate JSON even if file exists")
    parser.add_argument("--dry-run", action="store_true", help="Validate and copy only, no email/history")
    parser.add_argument("--no-email", action="store_true", help="Skip Gmail send")
    parser.add_argument(
        "--push-github",
        action="store_true",
        help="After copy, git commit & push cursor製作 to GitHub Pages repo",
    )
    args = parser.parse_args()

    history = load_history()
    day = args.day if args.day else next_day(history)
    if day > 60:
        print("All 60 days completed.")
        return 0

    print(f"=== Day {day} pipeline ===")

    try:
        lesson_file = ensure_lesson(day, history, args.force_generate)
        run_cmd([sys.executable, str(SKILL_SCRIPTS / "validate_lesson.py"), str(lesson_file)])
        copy_lesson(day, lesson_file)

        if args.dry_run:
            print("DRY RUN: skip email and history update.")
            return 0

        if not args.no_email:
            run_cmd(
                [sys.executable, str(SKILL_SCRIPTS / "send_daily_email.py"), str(lesson_file)]
            )

        run_cmd(
            [sys.executable, str(SKILL_SCRIPTS / "update_history.py"), str(lesson_file)]
        )

        if args.push_github:
            push_github(day)

        print(f"=== Day {day} pipeline OK ===")
        return 0
    except Exception as exc:
        print(f"PIPELINE FAILED: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
