# TOEFL / IELTS 每日英文學習網站

這是一個 React + TypeScript 製作的每日英文微課程介面，會讀取 `public/daily_lessons/day_001.json` 並顯示成可互動的學習工具。

## 功能

- 今日 Dashboard：Day、phase、level、estimated minutes、theme、TOEFL 技能類型
- Vocabulary Cards：new / review 篩選、單字卡、已記住標記
- Reading Panel：英文閱讀、繁中翻譯、embedded words 高亮
- Listening & Speaking：3 句跟讀練習，支援 Web Speech API 播放
- TOEFL Skill Drill：題目、回答框、sample answer、useful phrases
- Daily Quiz：3 題選擇題，作答後顯示答案與解析
- Progress：使用 localStorage 保存今日完成狀態、單字記憶、測驗與回答
- JSON 上傳 / 下載：可載入新的每日課程 JSON
- History：讀取 `public/daily_lessons/history_index.json`，左側可切換 Day 1、Day 2 等歷史課程
- 精華複習頁：每一天都有一頁式摘要，包含句型、核心單字、閱讀摘要、跟讀句與測驗答案

## 使用方式

```bash
npm install
npm run dev
```

開啟：

```text
http://127.0.0.1:5173
```

正式建置：

```bash
npm run build
```

## 每日資料

目前範例資料位於：

```text
public/daily_lessons/day_001.json
public/daily_lessons/current_day.json
public/daily_lessons/history_index.json
```

後續每日生成內容時，只要同步新的 `day_NNN.json` 並更新 `current_day.json` / `history_index.json`，網站就會保留歷史並顯示最新課程。
