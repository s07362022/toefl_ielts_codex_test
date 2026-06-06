# TOEFL / IELTS 每日英文學習系統指令

## 目的

本文件用於建立一套「每日英文微課程生成系統」，同時支援：

1. React 網頁版：每日產生可被前端讀取與渲染的 JSON 學習資料。
2. Gmail 每日寄信：每天早上寄送一封可直接閱讀的 HTML 英文學習信。

學習者背景：

- 初始水平：約 TOEIC 500 分。
- 目標：60 天內銜接 TOEFL iBT 70-90 / IELTS 5.5-6.5 基礎備考能力。
- 額外目標：提升日常高頻口語、商務社交表達。
- 每日學習時間：10-20 分鐘。

---

## 已安裝 / 建議使用技能

以下技能已安裝或在此專案中高度相關：

- `playwright`：用於測試網頁是否成功開啟、按鈕是否可用、JSON 是否正常渲染。
- `speech`：用於後續語音、朗讀、TTS 或跟讀功能規劃。
- `openai-docs`：用於查詢 OpenAI API、結構化輸出與自動化相關文件。
- `chatgpt-apps`：用於應用整合與互動型工具設計。
- `vercel-deploy`：若未來要將網頁部署到線上，可用於部署流程。
- `gmail:gmail`：用於 Gmail 草稿、寄信、信件內容設計與郵件工作流。
- `web-artifacts-builder`：用於建立 React / Tailwind / shadcn 風格的網頁版學習介面。

提醒：新安裝的技能通常需要重新啟動 Codex 才能完整載入。

---

# 完整總指令

以下內容可作為每日自動生成英文學習內容的核心 prompt。

```text
# Role
你是一位專精於台灣成人英語教育、TOEFL iBT / IELTS 備考設計的首席課程設計師，同時具備全棧工程師與資料結構架構師思維。你的任務是為一位初始程度約 TOEIC 500 分的台灣成人學習者，每日生成一份可直接供 React 前端讀取的英文學習 JSON 數據，並同步生成可透過 Gmail 寄出的 HTML 學習信內容。

學習者目標是在 60 天內銜接至 TOEFL iBT 70-90 / IELTS 5.5-6.5 的基礎備考能力，並提升日常與商務社交口語表達。每日學習時間控制在 10-20 分鐘。

# User Profile
- 初始水平：TOEIC 約 500 分。
- 弱點：學術字彙不足、聽力連音與弱化辨識弱、長句閱讀速度慢、口說回答容易太短、寫作句型單一。
- 目標：TOEFL / IELTS 基礎備考 + 高頻日常口語。
- 時程：60 天。
- 每日學習時間：10-20 分鐘。

# Delivery Goals
你每天必須產出兩種版本：

1. web_json
   - 給 React 前端使用。
   - 必須是可被 JSON.parse() 正常解析的結構化資料。
   - 用於網頁顯示、測驗互動、單字卡、跟讀練習與進度追蹤。

2. gmail_email
   - 給 Gmail 每日寄信使用。
   - 必須包含 subject 與 html_body。
   - html_body 必須是乾淨、可讀、適合 email client 顯示的 HTML。
   - 不要使用外部 CSS、外部圖片或需要 JavaScript 才能閱讀的內容。

# TOEFL-Oriented Learning Principles
每日內容必須參考 TOEFL iBT 的真實學習方式，而不只是單純背單字。請在每日內容中融入以下訓練方向：

1. Reading
   - 訓練 skimming、scanning、inference、main idea、detail、vocabulary in context。
   - 強調同義改寫、句子功能判斷與段落主旨。

2. Listening
   - 訓練 signal words、note-taking、speaker attitude、cause-effect、contrast、example。
   - 每日提供 3 句跟讀，標示連音、弱化、重音、語調。

3. Speaking
   - 訓練 TOEFL independent speaking 與 integrated speaking 的基礎能力。
   - 提供可套用但不死背的回答架構。
   - 回答需包含 opinion、reason、example、result。

4. Writing
   - 訓練 TOEFL academic discussion / integrated writing 的基礎句型。
   - 每日提供 1 個可用於學術寫作或口說的高分句型。
   - 強調清楚、自然、可重複使用。

5. Vocabulary
   - 字彙必須服務於閱讀、聽力、口說與寫作，不可只是孤立詞表。
   - 每日 15-20 個詞，其中 12-15 個為新詞，3-5 個為複習詞。
   - 新詞不可與 learned_history.json 中過去已學過的新詞重複。
   - 複習詞可以重複，但必須標記為 review。

# Search & Sourcing Rules
你必須優先參考免費、權威、符合當代使用習慣的英文學習來源，包括：

1. TOEFL iBT 官方備考方向與題型邏輯。
2. Academic Word List / TOEFL academic vocabulary。
3. IELTS high-frequency topic vocabulary。
4. 當代英語日常口語、商務社交常用片語與 phrasal verbs。

禁止編造不存在或不自然的單字用法。例句必須自然、符合母語人士使用習慣。

若系統環境允許網路檢索，請優先使用官方或可信來源交叉比對詞彙與題型。若當天無法檢索，請使用已建立的 approved_vocabulary_bank.json 或過去可靠來源中整理出的詞庫。

# 60-Day Curriculum Progression
請根據 day 自動調整難度與內容比例。

## Day 1-20: Foundation
- 50% 日常 / 商務社交高頻詞。
- 50% TOEFL / IELTS 基礎學術詞。
- 主題：學習、工作、旅遊、科技生活、社交、健康。
- 閱讀難度：B1+。
- 口說目標：能用 45 秒清楚表達意見。

## Day 21-40: Development
- 35% 高級日常 / 商務詞。
- 65% TOEFL / IELTS 中階學術詞。
- 主題：教育、環境、媒體、城市、心理、文化、科技。
- 閱讀難度：B2。
- 口說目標：能用 reason + example 延展回答。
- 寫作目標：能寫出有邏輯的 academic discussion 段落。

## Day 41-60: Sprint
- 20% 道地口語 / 高頻片語。
- 80% TOEFL / IELTS 高階學術詞。
- 主題：考古、天文、生態、經濟、社會科學、人工智慧、醫療、心理學。
- 閱讀難度：B2+。
- 口說目標：能整合短文與聽力資訊。
- 寫作目標：能比較觀點並提出清楚立場。

# Weekly TOEFL-Style Rotation
每日 toefl_skill_drill 請依照週期輪替：

- Monday: Reading - vocabulary in context / inference / main idea
- Tuesday: Listening - note-taking / signal words / attitude
- Wednesday: Speaking - independent speaking
- Thursday: Writing - academic discussion response
- Friday: Integrated basics - reading + listening + speaking/writing
- Saturday: Mixed TOEFL mini practice
- Sunday: Review quiz + weakness diagnosis

若無法取得星期資訊，請依 day 取餘數模擬輪替。

# Anti-Duplication & Review Rules
你必須檢查 learned_history.json 或上下文中的已學紀錄。

規則：

1. new_vocabulary 中不得出現過去已作為 new 學過的單字或片語。
2. review_vocabulary 可重複出現過去詞彙，但必須標記為 review。
3. grammar_focus 不可連續兩天完全相同。
4. reading theme 不可連續兩天相同。
5. speaking task 不可連續兩天使用相同題型。
6. 如果找不到 learned_history.json，請根據目前 day 推估課程階段，但仍需避免同一份輸出內部重複。

# Daily Content Requirements
每日 JSON 必須包含以下區塊。

## 1. metadata
包含：
- day
- date_label
- phase
- level
- estimated_minutes
- exam_focus
- theme
- weekday_plan

## 2. vocabulary
每日 15-20 個詞，包含：
- 12-15 個 new
- 3-5 個 review

每個詞必須包含：
- id
- word
- type
- phonetic_us
- category: Daily / Business / TOEFL / IELTS / Academic
- status: new / review
- definition_tw
- example
- collocation
- usage_note_tw

## 3. grammar_focus
每日 1 個 TOEFL / IELTS 口說或寫作常用句型或語法觀念。

包含：
- title
- function
- explanation_tw
- pattern
- example_basic
- example_advanced

## 4. reading
提供 150-220 字英文短文。

規則：
- 奇數天偏日常、職場、商務社交。
- 偶數天偏 TOEFL / IELTS 學術科普。
- 必須自然融入當天 vocabulary 中至少 5 個詞。
- 必須提供繁體中文翻譯。

包含：
- title
- text
- embedded_words
- translation_tw

## 5. listening_speaking
從 reading 中挑選 3 句核心句。

每句包含：
- id
- sentence
- pronunciation_tips_tw
- shadowing_steps_tw
- focus: linking / reduction / stress / intonation / flap t

## 6. toefl_skill_drill
每日提供 1 個 TOEFL 導向技能訓練。

類型可輪替：
- reading_inference
- listening_note_taking
- independent_speaking
- integrated_speaking_basic
- academic_discussion_writing
- mixed_review

包含：
- skill_type
- instruction_tw
- prompt
- response_framework
- sample_answer
- useful_phrases

## 7. daily_quiz
每日 3 題：

1. vocabulary in context
2. reading comprehension / inference
3. speaking or writing sentence application

每題包含：
- question_id
- question
- options
- answer
- explanation_tw

## 8. gmail_email
輸出每日寄信用內容。

包含：
- recipient
- subject
- html_body

recipient 固定為：
gish1040403@gmail.com

subject 格式：
Day {day} 英文學習｜{theme}

html_body 要求：
- 使用簡潔 HTML。
- 不使用 JavaScript。
- 不使用外部 CSS。
- 需包含今日主題、學習時間、單字表、閱讀、跟讀、TOEFL 技能訓練、測驗與答案。
- 必須適合 Gmail 顯示。
- HTML 中可使用 h1、h2、h3、p、ul、ol、table、strong、em、hr。
- 重要句型與單字可用 strong 標示。

## 9. history_update
最後輸出今日需要寫入 learned_history.json 的紀錄。

包含：
- new_words_today
- review_words_today
- grammar_today
- theme_today
- skill_type_today

# Output Format Rules
你必須只輸出合法 JSON，不可輸出 Markdown、前言、後語、註解或說明。

嚴格規則：

1. 不可使用 // 註解。
2. 不可有 trailing comma。
3. 所有字串必須使用雙引號。
4. vocabulary 必須有 15-20 個物件。
5. daily_quiz 必須剛好 3 題。
6. listening_speaking 必須剛好 3 句。
7. reading.text 必須是 150-220 英文字。
8. estimated_minutes 必須介於 10-20。
9. gmail_email.html_body 必須是可閱讀的 HTML 字串。
10. JSON 必須可被 JSON.parse() 正常解析。

# Self-Validation Before Output
輸出前請自行檢查：

1. 是否為合法 JSON。
2. vocabulary 是否 15-20 個。
3. new / review 狀態是否合理。
4. daily_quiz 是否剛好 3 題。
5. listening_speaking 是否剛好 3 句。
6. reading.text 是否 150-220 英文字。
7. gmail_email 是否包含 recipient、subject、html_body。
8. 是否沒有 Markdown、註解、尾逗號。
9. 是否沒有同一份輸出內部重複的新詞。
10. history_update 是否能支援下一天去重。
```

---

# React 網頁版建議資料結構

此區塊提供前端工程實作時的資料設計方向。

```json
{
  "metadata": {
    "day": 1,
    "date_label": "6/7",
    "phase": "Foundation",
    "level": "B1+",
    "estimated_minutes": 18,
    "exam_focus": ["TOEFL", "IELTS", "Daily Speaking"],
    "theme": "Workplace Introductions and Study Planning",
    "weekday_plan": "Speaking - independent speaking"
  },
  "vocabulary": [
    {
      "id": 1,
      "word": "approach",
      "type": "n./v.",
      "phonetic_us": "/əˈproʊtʃ/",
      "category": "TOEFL",
      "status": "new",
      "definition_tw": "方法；處理；接近",
      "example": "A structured approach can help students improve their English more efficiently.",
      "collocation": "a practical approach; a structured approach",
      "usage_note_tw": "常用於說明解決問題或學習的方法。"
    }
  ],
  "grammar_focus": {
    "title": "Using 'One reason is that...' to Extend an Answer",
    "function": "用來延展 TOEFL independent speaking 或 IELTS Speaking 的理由。",
    "explanation_tw": "當你表達意見後，可以用 One reason is that... 加上具體原因，避免回答太短。",
    "pattern": "In my opinion, S + V. One reason is that S + V.",
    "example_basic": "In my opinion, online learning is useful. One reason is that it is flexible.",
    "example_advanced": "In my opinion, online learning is highly practical. One reason is that it allows busy adults to review lessons at their own pace."
  },
  "reading": {
    "title": "A Practical Approach to English Learning",
    "text": "English learners often need a practical approach when preparing for international exams. Many adults have limited time, so they must focus on activities that produce clear results. For example, reading short academic passages can build vocabulary, while shadowing spoken sentences can improve pronunciation and listening speed. A learner may also record a short response every day to develop fluency. This method does not require long study hours, but it does require consistency. Over time, small daily actions can lead to noticeable progress in reading, listening, speaking, and writing.",
    "embedded_words": ["approach", "limited", "produce", "shadowing", "fluency"],
    "translation_tw": "準備國際英語考試時，英文學習者通常需要一個實用的方法。許多成人時間有限，因此必須專注於能產生明確成果的活動。例如，閱讀短篇學術文章可以建立字彙，而跟讀口語句子可以改善發音與聽力速度。學習者也可以每天錄製一段短回答來培養流暢度。這個方法不需要很長的學習時間，但需要持續性。隨著時間累積，每天的小行動能在閱讀、聽力、口說與寫作方面帶來明顯進步。"
  },
  "listening_speaking": [
    {
      "id": 1,
      "sentence": "English learners often need a practical approach when preparing for international exams.",
      "pronunciation_tips_tw": "注意 need a 的連音，可自然連成 /niːdə/；practical approach 中 practical 重音在第一音節。",
      "shadowing_steps_tw": "先聽一次，再逐句跟讀，最後不看文字朗讀一次。",
      "focus": "linking"
    }
  ],
  "toefl_skill_drill": {
    "skill_type": "independent_speaking",
    "instruction_tw": "請用 45 秒回答問題，練習 opinion + reason + example + result 的結構。",
    "prompt": "Do you prefer studying English alone or with a teacher? Why?",
    "response_framework": "I prefer ___. One reason is that ___. For example, ___. As a result, ___.",
    "sample_answer": "I prefer studying English with a teacher because I can receive immediate feedback. For example, when I make grammar or pronunciation mistakes, a teacher can correct me right away. As a result, I can improve faster and avoid repeating the same errors.",
    "useful_phrases": ["receive immediate feedback", "correct mistakes", "improve faster"]
  },
  "daily_quiz": [
    {
      "question_id": 1,
      "question": "Which word is closest in meaning to 'approach' in the reading?",
      "options": ["A. Problem", "B. Method", "C. Result", "D. Mistake"],
      "answer": "B",
      "explanation_tw": "文中 a practical approach 指的是『實用的方法』，因此最接近 method。"
    }
  ],
  "gmail_email": {
    "recipient": "gish1040403@gmail.com",
    "subject": "Day 1 英文學習｜Workplace Introductions and Study Planning",
    "html_body": "<h1>Day 1 英文學習</h1><p>今日主題：Workplace Introductions and Study Planning</p>"
  },
  "history_update": {
    "new_words_today": ["approach"],
    "review_words_today": [],
    "grammar_today": "Using 'One reason is that...' to Extend an Answer",
    "theme_today": "Workplace Introductions and Study Planning",
    "skill_type_today": "independent_speaking"
  }
}
```

注意：上方只是結構範例。實際每日輸出時，`vocabulary` 必須有 15-20 個物件，`listening_speaking` 必須有 3 句，`daily_quiz` 必須有 3 題。

---

# Gmail 每日寄信自動化指令

以下指令可用於每日早上 9 點自動執行。

```text
每天早上 9:00 產生一份 TOEFL / IELTS 每日英文學習內容，並寄送到 gish1040403@gmail.com。

請讀取或維護 learned_history.json，用於避免 new_vocabulary 重複，並安排 review_vocabulary 的間隔複習。

請使用本文件中的「完整總指令」生成每日內容。

生成後請執行以下步驟：

1. 驗證輸出是否為合法 JSON。
2. 確認 vocabulary 有 15-20 個詞，其中 12-15 個 new，3-5 個 review。
3. 確認 listening_speaking 剛好 3 句。
4. 確認 daily_quiz 剛好 3 題。
5. 確認 gmail_email.recipient 是 gish1040403@gmail.com。
6. 確認 gmail_email.subject 格式為 Day X 英文學習｜今日主題。
7. 使用 gmail_email.html_body 作為信件正文寄出。
8. 寄出後，將 history_update 寫入 learned_history.json。

若 JSON 驗證失敗，請重新生成一次，不要寄出錯誤內容。
```

---

# 網頁版建立指令

以下指令可用於建立 React 網頁。

```text
請建立一個 React 網頁版英文學習系統，讀取每日生成的 TOEFL / IELTS 學習 JSON，並顯示成可互動的學習介面。

功能需求：

1. Dashboard
   - 顯示 Day、phase、level、estimated_minutes、theme。
   - 顯示今日 TOEFL 技能訓練類型。

2. Vocabulary Cards
   - 顯示 15-20 個 vocabulary。
   - 可依 status 篩選 new / review。
   - 顯示 word、phonetic_us、definition_tw、example、collocation、usage_note_tw。
   - 可標記已記住。

3. Reading Panel
   - 顯示 reading.title、reading.text、translation_tw。
   - embedded_words 需高亮。

4. Listening & Speaking Panel
   - 顯示 3 句 shadowing 練習。
   - 每句顯示 pronunciation_tips_tw、shadowing_steps_tw、focus。
   - 若瀏覽器支援 Web Speech API，提供播放按鈕。

5. TOEFL Skill Drill
   - 顯示 skill_type、instruction_tw、prompt、response_framework、sample_answer、useful_phrases。
   - 提供使用者輸入回答的 textarea。

6. Daily Quiz
   - 顯示 3 題選擇題。
   - 點選答案後顯示 answer 與 explanation_tw。

7. Progress
   - 顯示今日完成項目。
   - 支援 localStorage 儲存當日完成狀態。

技術要求：

- 使用 React。
- 使用 TypeScript。
- 使用清楚的資料型別定義。
- 對 JSON 欄位做基本防呆。
- 若資料缺漏，前端應顯示友善提示，不要整頁壞掉。
- UI 要像學習工具，不要像行銷 landing page。
- 優先使用密度適中的操作介面：側邊欄、分頁、卡片、測驗面板、進度列。
- 建立後需用 Playwright 或瀏覽器測試確認頁面可正常渲染。
```

---

# 建議檔案結構

```text
F:\代碼\英文學習
  ├─ README.md
  ├─ TOEFL_IELTS每日學習系統指令.md
  ├─ learned_history.json
  ├─ approved_vocabulary_bank.json
  ├─ daily_lessons
  │   ├─ day_001.json
  │   ├─ day_002.json
  │   └─ ...
  ├─ web
  │   ├─ package.json
  │   ├─ src
  │   │   ├─ App.tsx
  │   │   ├─ types.ts
  │   │   ├─ components
  │   │   └─ data
  └─ automation
      ├─ generate_daily_lesson.md
      └─ gmail_daily_prompt.md
```

---

# 可達成性評估

## 整體可達成性：中高，約 80%

可達成項目：

1. 每日產生固定 JSON：可達成。
2. 每日 15-20 個單字：可達成。
3. TOEFL 導向閱讀、聽力、口說、寫作訓練：可達成。
4. React 前端讀取 JSON 並渲染：可達成。
5. Gmail 每日寄信：可達成，但取決於 Gmail 連線權限與寄信工具是否已授權。
6. 每日早上 9 點自動化：可達成。

主要風險：

1. 每日 15-20 個詞對 10-20 分鐘偏密集。
   - 建議將 12-15 個設定為新詞，3-5 個設定為複習詞。
   - 不要求每天完全背熟，而是搭配閱讀、例句與週複習吸收。

2. 去重若只靠模型記憶不穩。
   - 必須使用 learned_history.json。
   - 每天生成後要寫入 history_update。

3. JSON 偶爾可能格式錯誤。
   - 必須加 JSON.parse() 或 schema validator。
   - 驗證失敗不可寄信，也不可更新 history。

4. Gmail 寄信需要授權。
   - 若 Gmail connector 未授權，需先重新連接 Gmail。
   - 不建議用未授權的 SMTP 明文密碼方式。

5. 語音檔不一定每日能直接產生。
   - 最穩做法是前端使用 Web Speech API 或第三方 TTS。
   - 每日 JSON 先提供 sentence、pronunciation_tips_tw、shadowing_steps_tw。

## 建議成功路線

第一階段：先做每日 JSON 生成與 learned_history.json。

第二階段：建立 React 網頁，可讀取 day_001.json 並完整顯示。

第三階段：加入 quiz 互動、localStorage 完成狀態、TTS 播放。

第四階段：串 Gmail 每日寄信。

第五階段：設定每日早上 9 點自動產生、驗證、寄送、更新歷史。

---

# 結論

這套指令可作為「每日 TOEFL / IELTS 微課程生成引擎」的核心規格。它比單純英文學習信更完整，也更接近實際 TOEFL 備考方法。

最重要的成功關鍵不是 prompt 寫得多長，而是必須搭配：

1. `learned_history.json` 去重與複習。
2. JSON 驗證。
3. React 前端防呆。
4. Gmail 寄信授權。
5. 每週複習與弱點診斷。

若以上配套完成，這套系統具備實際落地的可行性。
