# TOEFL / IELTS 每日英文學習系統

60 天微課程：每日 JSON（React 前端）+ Gmail HTML 信 + 去重複習。

## 快速開始

1. 規格：`TOEFL_IELTS每日學習系統指令.md`
2. Skill：`.cursor/skills/toefl-ielts-daily/SKILL.md`
3. 在 Cursor 中說：「產生 Day 1 英文學習 JSON 並驗證」

## 已安裝 Skills

| Skill | 位置 |
|-------|------|
| toefl-ielts-daily | `.cursor/skills/toefl-ielts-daily/` |
| playwright-cli | `.agents/skills/playwright-cli/` |
| gmail-sender | `%USERPROFILE%\.cursor\skills\gmail-sender` |

## 腳本

```bash
# 驗證 JSON
python .cursor/skills/toefl-ielts-daily/scripts/validate_lesson.py daily_lessons/day_001.json

# 寄信（驗證通過後）
python .cursor/skills/toefl-ielts-daily/scripts/send_daily_email.py daily_lessons/day_001.json

# 更新學習紀錄
python .cursor/skills/toefl-ielts-daily/scripts/update_history.py daily_lessons/day_001.json
```

## 每日自動化（產生 + 複製網頁 + Gmail）

```bash
# 手動執行今日管線（產生/驗證/複製/寄信/更新紀錄）
run_daily_pipeline.bat

# 僅測試不寄信
python automation/run_daily_pipeline.py --dry-run

# 註冊 Windows 每日 09:00 排程（需系統管理員）
.\register_daily_task.ps1
```

網頁版：`F:\代碼\英文學習\cursor製作`（自動複製 JSON 至 `public/data/`）

## 待建

- 擴充 `automation/vocab_full_bank.json`（支援 60 天去重）
