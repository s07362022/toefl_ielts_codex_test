---
name: toefl-ielts-daily-update
description: >-
  TOEFL/IELTS 每日英文學習手動更新：產生課程 JSON、驗證、寄 Gmail、同步網站、推送 GitHub Pages。
  觸發詞：每日英文學習、每日手動更新、更新今日課程、推送 GitHub、toefl-ielts daily update、
  cursor_test 網頁更新、英文學習寄信。
---

# 每日更新 Skill（專案內副本）

完整說明與手動教學請讀：

`F:\代碼\cursor_自己做的skill\toefl-ielts-daily-update\SKILL.md`

每日手動更新指令：

```powershell
cd "F:\代碼\英文學習"
$env:PYTHONIOENCODING = "utf-8"
python automation/run_daily_pipeline.py --push-github
```

線上網址：https://s07362022.github.io/toefl-ielts-cursor_test/
