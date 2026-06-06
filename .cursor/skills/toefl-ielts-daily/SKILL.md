---
name: toefl-ielts-daily
description: >-
  每日 TOEFL / IELTS 微課程：自動產生 JSON、複製至網頁、寄 Gmail、更新 learned_history。
  觸發詞：每日英文學習、更新今日課程、TOEFL 每日、IELTS 每日、寄英文學習信、
  run daily pipeline、今日 Day、generate daily lesson、toefl-ielts daily。
---

# TOEFL / IELTS 每日學習系統

專案根目錄：`F:\代碼\英文學習`

## 使用者怎麼「每日更新」— 三種方式

### 方式 A：全自動（推薦，免開 Cursor）

每天早上 09:00 由 Windows 工作排程執行，**不需手動請 AI**。

```powershell
# 只需設定一次（系統管理員 PowerShell）
cd "F:\代碼\英文學習"
.\register_daily_task.ps1
```

之後每天自動：產生課程 → 驗證 → 複製網頁 → 寄 Gmail → 更新紀錄。

---

### 方式 B：一鍵手動（不開 Cursor 也行）

雙擊或在終端機執行：

```bash
F:\代碼\英文學習\run_daily_pipeline.bat
```

等同方式 A 跑一次，適合「今天想立刻更新」。

---

### 方式 C：每日手動請 Cursor 助理（本 Skill）

在 Cursor **開啟 `F:\代碼\英文學習` 工作區**（或任一含本 skill 的 workspace），對助理說：

> **「每日英文學習」**  
> 或 **「執行今日 TOEFL 每日管線」**  
> 或 **「更新今日課程並寄信」**

助理**必須**依下列 checklist 執行，不可跳步：

## 助理每日 Checklist（方式 C）

1. 讀 `learned_history.json`，確認下一個 Day 編號。
2. 在專案根目錄執行完整管線（**含 GitHub 推送**，對齊股票 `push_dashboard.py`）：

```bash
cd "F:\代碼\英文學習"
set PYTHONIOENCODING=utf-8
python automation/run_daily_pipeline.py --push-github
```

或只推送網站（不改課程）：

```bash
python "F:\代碼\英文學習\cursor製作\scripts\push_github_pages.py"
```

3. 確認終端機輸出含 `VALIDATION OK` 與 `pipeline OK`。
4. 回報使用者：
   - 今日 Day 幾、主題 theme
   - 已複製至 `cursor製作/public/data/`
   - Gmail 是否寄出（收件者 `gish1040403@gmail.com`）
5. 若驗證失敗：**不可寄信、不可更新 history**；修正後重跑。

### 選用參數

| 指令 | 用途 |
|------|------|
| `python automation/run_daily_pipeline.py --dry-run` | 只產生/驗證/複製，不寄信 |
| `python automation/run_daily_pipeline.py --day 3` | 強制指定 Day |
| `python automation/run_daily_pipeline.py --no-email` | 更新但不寄信 |
| `python automation/run_daily_pipeline.py --force-generate` | 覆寫已存在的 JSON |

---

## 管線步驟（與腳本一致）

```
learned_history.json → 決定 Day
    ↓
lesson_generator.py（若該天 JSON 不存在）
    ↓
validate_lesson.py（失敗則停止）
    ↓
複製到 daily_lessons/ + cursor製作/public/data/ + current_day.json
    ↓
send_daily_email.py → gish1040403@gmail.com
    ↓
update_history.py
```

## 必讀規格

- `TOEFL_IELTS每日學習系統指令.md`（JSON schema、60 天課程、Gmail 格式）

## 檔案位置

```text
F:\代碼\英文學習
├── learned_history.json          # 已學紀錄（去重）
├── automation/
│   ├── run_daily_pipeline.py     # 主管線 ⭐
│   ├── lesson_generator.py
│   ├── vocab_full_bank.json      # 單字庫（需持續擴充）
│   └── email_builder.py
├── daily_lessons/day_NNN.json
├── cursor製作/public/data/        # 網頁讀取
├── run_daily_pipeline.bat        # 一鍵執行
└── register_daily_task.ps1       # 09:00 排程
```

## 網頁（GitHub Pages，不跑本機）

- 路徑：`F:\代碼\英文學習\cursor製作`
- Repo 名稱：**`toefl-ielts-cursor_test`**（須含 cursor_test）
- 線上：https://s07362022.github.io/toefl-ielts-cursor_test/
- 每日管線加 `--push-github` 可自動 git push 並由 Actions 部署
- 本機開發（選用）：`npm run dev`

## 去重規則（強制）

- `new` 詞不得重複出現在 `learned_history.new_words`
- `review` 可重複，須標 `status: "review"`
- 連續兩天文法標題、閱讀主題、skill_type 不可相同

## 免責

產出為學習輔助內容，非官方 ETS / British Council 教材。
