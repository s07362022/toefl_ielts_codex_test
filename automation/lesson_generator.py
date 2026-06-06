#!/usr/bin/env python3
"""Generate daily TOEFL/IELTS lesson JSON from vocab bank and curriculum rules."""

from __future__ import annotations

import json
import random
from datetime import datetime
from pathlib import Path

from email_builder import build_email_html

PROJECT_ROOT = Path(__file__).resolve().parents[1]
VOCAB_BANK_PATH = Path(__file__).resolve().parent / "vocab_full_bank.json"
RECIPIENT = "gish1040403@gmail.com"

WEEKDAY_PLANS = [
    "Reading - vocabulary in context / inference / main idea",
    "Listening - note-taking / signal words / attitude",
    "Speaking - independent speaking",
    "Writing - academic discussion response",
    "Integrated basics - reading + listening + speaking/writing",
    "Mixed TOEFL mini practice",
    "Review quiz + weakness diagnosis",
]

SKILL_ROTATION = [
    "reading_inference",
    "listening_note_taking",
    "independent_speaking",
    "academic_discussion_writing",
    "integrated_speaking_basic",
    "mixed_review",
    "mixed_review",
]

GRAMMAR_ITEMS = [
    {
        "title": "Using 'One reason is that...' to Extend an Answer",
        "function": "延展 TOEFL independent speaking 理由。",
        "explanation_tw": "表達意見後用 One reason is that... 加上具體原因，避免回答太短。",
        "pattern": "In my opinion, S + V. One reason is that S + V.",
        "example_basic": "In my opinion, online learning is useful. One reason is that it is flexible.",
        "example_advanced": "In my opinion, online learning is highly practical. One reason is that it allows busy adults to review lessons at their own pace.",
    },
    {
        "title": "Using 'For example,...' to Support a Claim",
        "function": "為理由提供具體例證。",
        "explanation_tw": "在說明理由後加上 For example，讓回答更具說服力。",
        "pattern": "I believe S + V. For example, S + V.",
        "example_basic": "I believe practice helps. For example, I review ten words daily.",
        "example_advanced": "I believe short daily practice is effective. For example, I spend fifteen minutes shadowing sentences every morning.",
    },
    {
        "title": "Using 'As a result,...' to Show Outcome",
        "function": "說明行動帶來的結果。",
        "explanation_tw": "在舉例後用 As a result 連接最終成效，完成 O-R-E-R 結構。",
        "pattern": "S + V. As a result, S + V.",
        "example_basic": "I practice daily. As a result, I feel more confident.",
        "example_advanced": "I record my answers every evening. As a result, I can track my progress and fix recurring mistakes.",
    },
    {
        "title": "Using 'Although..., S + V' for Contrast",
        "function": "表達讓步與對比。",
        "explanation_tw": "用 Although 引導相反事實，主句放重點，適合學術討論。",
        "pattern": "Although S + V, S + V.",
        "example_basic": "Although I am busy, I study English every day.",
        "example_advanced": "Although the schedule is demanding, I can still allocate twenty minutes to focused review.",
    },
    {
        "title": "Using 'Compared to..., ...' for Comparison",
        "function": "比較兩種做法或觀點。",
        "explanation_tw": "寫作與口說中比較選項時，可用 Compared to 引出對照。",
        "pattern": "Compared to A, B is more + adj.",
        "example_basic": "Compared to passive reading, active recall is more effective.",
        "example_advanced": "Compared to cramming before the test, daily micro-practice is more sustainable for adult learners.",
    },
    {
        "title": "Using 'The main reason is that...'",
        "function": "強調最主要原因。",
        "explanation_tw": "當有多個理由時，用 The main reason is that 聚焦核心論點。",
        "pattern": "The main reason is that S + V.",
        "example_basic": "The main reason is that I need feedback on pronunciation.",
        "example_advanced": "The main reason is that structured review helps me retain academic vocabulary longer.",
    },
    {
        "title": "Using 'From my perspective,...'",
        "function": "表達個人觀點（學術討論）。",
        "explanation_tw": "學術討論寫作常用，比 I think 更正式。",
        "pattern": "From my perspective, S + V.",
        "example_basic": "From my perspective, consistency matters more than intensity.",
        "example_advanced": "From my perspective, learners should prioritize high-frequency academic words before rare terminology.",
    },
]

THEMES = [
    "Workplace Introductions and Study Planning",
    "Daily Routines and Time Management",
    "Travel and Cultural Exchange",
    "Technology in Modern Life",
    "Health and Work-Life Balance",
    "Social Communication Skills",
    "Education and Lifelong Learning",
    "Career Development and Networking",
    "Environmental Awareness",
    "Media Literacy and Information",
    "Urban Living and Transportation",
    "Psychology of Learning",
    "Cross-Cultural Communication",
    "Innovation and Digital Tools",
    "Archaeology and Human History",
    "Astronomy and Space Exploration",
    "Ecology and Conservation",
    "Economic Trends and Markets",
    "Social Science Research Methods",
    "Artificial Intelligence in Society",
]

READING_TEMPLATES = [
    {
        "title": "Building Effective Study Habits",
        "text": "Many adult learners face a common challenge when preparing for international exams: limited time. To address this, they need a practical system that fits a busy schedule and supports steady review. Today's vocabulary includes terms such as {w1}, {w2}, {w3}, and {w4}, which can help learners talk about study habits more precisely. One effective method is to combine short reading passages with daily speaking practice. This routine does not require hours of study, but it does require consistency and clear priorities. Learners who review new material regularly often retain information better than those who cram once a week. Teachers frequently point out that active practice is more valuable than passive review. With useful phrases like {w5}, {w6}, and {w7}, students can make stronger connections across reading, listening, speaking, and writing. In addition, learners should record short answers to build fluency and receive feedback from teachers or language partners. A well-designed routine makes it easier to maintain motivation when work and family responsibilities compete for attention. Over several weeks, small actions can produce noticeable improvement in confidence and accuracy on both TOEFL and IELTS tasks.",
        "translation_tw": "許多成年學習者在準備國際考試時面臨共同挑戰：時間有限。為此，他們需要一個適合忙碌行程的實用方法。一種有效方法是結合短篇閱讀與每日口說練習。這個過程不需要長時間學習，但需要持續性。經常複習新材料的學習者往往比每週死背一次的人更能保留資訊。教師常強調主動練習比被動複習更有價值。有了清楚策略與務實目標，學生能在四項技能上穩定進步。幾週下來，小行動能帶來自信與準確度的顯著提升。",
    },
    {
        "title": "Academic Skills for Test Success",
        "text": "Success on TOEFL and IELTS depends on more than memorizing word lists. Students must learn to understand passages, identify key ideas in context, and draw reasonable conclusions from incomplete information. Today's lesson highlights language such as {w1}, {w2}, {w3}, and {w4}, because these terms often appear in academic reading, lectures, or discussion prompts. In listening tasks, recognizing signal words helps learners interpret the speaker's attitude and purpose. When writing academic responses, it is important to present a clear position and support it with evidence. Many instructors recommend combining input and output activities because the two reinforce each other. A structured review plan ensures that difficult topics receive enough attention before exam day. From phrases like {w5}, {w6}, and {w7}, learners can extract patterns they can reuse in speaking and writing. Candidates who practice under timed conditions become more comfortable with the pace of real exams. They also learn to prioritize high-value tasks such as summarizing main ideas and organizing supporting details. This balanced approach helps candidates move toward their target score without unnecessary stress or last-minute cramming.",
        "translation_tw": "TOEFL 與 IELTS 的成功不只靠背單字。學生必須學會分析文章、在上下文中辨識關鍵概念，並從不完整資訊中做出合理推論。聽力任務中，辨識訊號詞有助於詮釋說話者態度。學術寫作回應時，清楚表明立場並以證據支持很重要。許多教師提倡結合輸入與輸出活動，因兩者相輔相成。全面的複習計畫確保困難主題在考試前獲得足夠關注。從每個觀點中，學習者應萃取可重複用於口說與寫作的實用片語。這種平衡策略幫助考生達成目標分數而不必過度焦慮。",
    },
    {
        "title": "Communication in Professional Settings",
        "text": "In today's global workplace, professionals must communicate clearly across cultures and time zones. Team members often collaborate on projects while managing demanding schedules, so precise language matters. Today's vocabulary introduces expressions such as {w1}, {w2}, {w3}, and {w4}; each one can help learners explain work, travel, or cultural situations with more confidence. When presenting ideas, speakers should connect their message to relevant examples. It is also crucial to remain calm during discussions and respond to feedback constructively. Managers may negotiate deadlines or resources, so employees need flexible communication skills. A clear meeting agenda helps groups allocate time and stay focused on relevant priorities. Although challenges are inherent in international teams, shared goals can improve collaboration across departments. Expressions like {w5}, {w6}, and {w7} are useful because they allow professionals to summarize decisions, ask follow-up questions, and reduce misunderstandings before a project moves forward. Companies that invest in language training frequently report smoother negotiations and stronger relationships with overseas partners. As a result, communication training is no longer optional for ambitious professionals in competitive industries.",
        "translation_tw": "在今日全球職場中，專業人士必須跨文化與跨時區清楚溝通。團隊成員常在管理繁忙行程的同時合作專案。報告想法時，說話者應以相關例子傳達訊息。討論中保持自信並建設性回應回饋也至關重要。主管可能協商截止日期或資源，因此員工需要有效的溝通技巧。清楚的會議議程有助團隊分配時間並保持專注。雖然國際團隊挑戰固有，共同目標能促進合作。因此，投資語言培訓的公司常見團隊合作與客戶關係的顯著改善。",
    },
]


def load_vocab_bank() -> dict[str, dict]:
    data = json.loads(VOCAB_BANK_PATH.read_text(encoding="utf-8"))
    return data["words"]


def get_phase(day: int) -> tuple[str, str]:
    if day <= 20:
        return "Foundation", "B1+"
    if day <= 40:
        return "Development", "B2"
    return "Sprint", "B2+"


def pick_vocabulary(
    day: int,
    learned: list[str],
    bank: dict[str, dict],
    rng: random.Random,
) -> list[dict]:
    available = [w for w in bank if w.lower() not in {x.lower() for x in learned}]
    if len(available) < 12:
        raise RuntimeError(
            f"Not enough new words in bank for day {day}. "
            f"Need 12+, have {len(available)}. Expand vocab_full_bank.json."
        )

    new_count = min(15, len(available))
    review_count = 5

    new_words = rng.sample(available, new_count)
    review_pool = [w for w in learned if w in bank]
    if len(review_pool) < review_count:
        review_pool = rng.sample(list(bank.keys()), review_count)
    review_words = rng.sample(review_pool, min(review_count, len(review_pool)))

    items: list[dict] = []
    vid = 1
    for word in new_words:
        meta = bank[word]
        items.append(
            {
                "id": vid,
                "word": word,
                "type": meta["type"],
                "phonetic_us": meta["phonetic_us"],
                "category": meta["category"],
                "status": "new",
                "definition_tw": meta["definition_tw"],
                "example": meta["example"],
                "collocation": meta["collocation"],
                "usage_note_tw": meta["usage_note_tw"],
            }
        )
        vid += 1

    for word in review_words:
        meta = bank[word]
        items.append(
            {
                "id": vid,
                "word": word,
                "type": meta["type"],
                "phonetic_us": meta["phonetic_us"],
                "category": meta["category"],
                "status": "review",
                "definition_tw": meta["definition_tw"],
                "example": meta["example"],
                "collocation": meta["collocation"],
                "usage_note_tw": meta["usage_note_tw"],
            }
        )
        vid += 1

    return items


def build_reading(vocab: list[dict], theme: str, day: int, rng: random.Random) -> dict:
    new_words = [v["word"] for v in vocab if v["status"] == "new"]
    template = READING_TEMPLATES[(day - 1) % len(READING_TEMPLATES)]
    embedded = list(dict.fromkeys(new_words[:8]))
    terms = ", ".join(embedded[:5])
    extra_sentence = ""
    slots = [f"w{i}" for i in range(1, 13)]
    mapping = {slot: f"'{new_words[i % len(new_words)]}'" for i, slot in enumerate(slots)}
    text = template["text"].format(**mapping) + extra_sentence
    embedded = list(dict.fromkeys(new_words[:6]))

    return {
        "title": template["title"] if day % 2 == 0 else theme.split(" and ")[0],
        "text": text,
        "embedded_words": embedded,
        "translation_tw": template["translation_tw"],
    }


def split_sentences(text: str) -> list[str]:
    import re

    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p.strip() for p in parts if len(p.strip()) > 30]


def build_listening(reading_text: str) -> list[dict]:
    sentences = split_sentences(reading_text)
    picks = sentences[:3] if len(sentences) >= 3 else (sentences * 3)[:3]
    focuses = ["linking", "reduction", "intonation"]
    tips = [
        "注意功能詞的連音與重音位置，先慢速再加速。",
        "留意 and、to、of 等虛詞的弱化發音。",
        "句尾語調略下降，表示陳述句結束。",
    ]
    steps = [
        "先聽一次，再逐句跟讀，最後不看文字朗讀。",
        "先慢速跟讀兩遍，再加速至正常語速。",
        "分段練習後，最後整句連貫朗讀一次。",
    ]
    return [
        {
            "id": i + 1,
            "sentence": sent,
            "pronunciation_tips_tw": tips[i],
            "shadowing_steps_tw": steps[i],
            "focus": focuses[i],
        }
        for i, sent in enumerate(picks)
    ]


def build_drill(skill_type: str, theme: str, vocab: list[dict]) -> dict:
    sample_word = vocab[0]["word"]
    prompts = {
        "reading_inference": "What can be inferred about effective exam preparation from the passage?",
        "listening_note_taking": "What are two key points you would write in your notes about today's topic?",
        "independent_speaking": "Do you prefer studying alone or in a group? Why?",
        "academic_discussion_writing": "Do you agree that daily short practice is better than weekly long sessions?",
        "integrated_speaking_basic": "Summarize the main idea of today's reading and add your opinion.",
        "mixed_review": f"How would you use '{sample_word}' in a TOEFL speaking answer about {theme}?",
    }
    prompt = prompts.get(skill_type, prompts["independent_speaking"])
    return {
        "skill_type": skill_type,
        "instruction_tw": "請依今日所學完成一題 TOEFL 導向練習，口說 45 秒或寫 3–4 句。",
        "prompt": prompt,
        "response_framework": "I believe ___. One reason is that ___. For example, ___. As a result, ___.",
        "sample_answer": (
            f"I believe daily practice is essential. One reason is that it builds {sample_word} "
            "over time. For example, I review vocabulary every morning before work. "
            "As a result, I feel more prepared for academic tasks."
        ),
        "useful_phrases": [v["word"] for v in vocab[:3]],
    }


def build_quiz(vocab: list[dict], reading: dict) -> list[dict]:
    target = next(v for v in vocab if v["status"] == "new")
    correct = target["definition_tw"].split("；")[0].split("，")[0]
    distractors = [
        v["definition_tw"].split("；")[0]
        for v in vocab
        if v["word"] != target["word"]
    ][:3]
    while len(distractors) < 3:
        distractors.append("不相關的詞義")
    options = [f"A. {correct}"] + [
        f"{chr(66 + i)}. {distractors[i]}" for i in range(3)
    ]
    return [
        {
            "question_id": 1,
            "question": f"Which definition best matches '{target['word']}'?",
            "options": options,
            "answer": "A",
            "explanation_tw": f"今日單字 {target['word']} 的解釋為「{target['definition_tw']}」。",
        },
        {
            "question_id": 2,
            "question": "What is the main idea of today's reading?",
            "options": [
                "A. Effective learning requires consistent, structured practice.",
                "B. Cramming once a week is the best method.",
                "C. Vocabulary lists alone guarantee a high score.",
                "D. Test preparation should avoid speaking practice.",
            ],
            "answer": "A",
            "explanation_tw": "文章強調有限時間下，持續且結構化的練習才能帶來進步。",
        },
        {
            "question_id": 3,
            "question": "Which sentence uses today's grammar pattern correctly?",
            "options": [
                "A. I like English. Because it is useful.",
                "B. In my opinion, practice helps. One reason is that it builds fluency.",
                "C. Practice good and fun.",
                "D. English hard but I try.",
            ],
            "answer": "B",
            "explanation_tw": "選項 B 正確運用 In my opinion... One reason is that... 句型。",
        },
    ]


def generate_lesson(day: int, history: dict, seed: int | None = None) -> dict:
    rng = random.Random(seed if seed is not None else day * 9973)
    bank = load_vocab_bank()
    learned = history.get("new_words", [])
    phase, level = get_phase(day)

    theme = THEMES[(day - 1) % len(THEMES)]
    grammar_hist = history.get("grammar_history", [])
    grammar = GRAMMAR_ITEMS[(day - 1) % len(GRAMMAR_ITEMS)]
    if grammar_hist and grammar["title"] == grammar_hist[-1]:
        grammar = GRAMMAR_ITEMS[day % len(GRAMMAR_ITEMS)]

    weekday_plan = WEEKDAY_PLANS[(day - 1) % 7]
    skill_type = SKILL_ROTATION[(day - 1) % len(SKILL_ROTATION)]
    skill_hist = history.get("skill_type_history", [])
    if skill_hist and skill_type == skill_hist[-1]:
        skill_type = SKILL_ROTATION[day % len(SKILL_ROTATION)]

    vocab = pick_vocabulary(day, learned, bank, rng)
    reading = build_reading(vocab, theme, day, rng)
    listening = build_listening(reading["text"])
    drill = build_drill(skill_type, theme, vocab)
    quiz = build_quiz(vocab, reading)

    now = datetime.now()
    date_label = f"{now.month}/{now.day}"

    lesson: dict = {
        "metadata": {
            "day": day,
            "date_label": date_label,
            "phase": phase,
            "level": level,
            "estimated_minutes": 15 + (day % 6),
            "exam_focus": ["TOEFL", "IELTS", "Daily Speaking"],
            "theme": theme,
            "weekday_plan": weekday_plan,
        },
        "vocabulary": vocab,
        "grammar_focus": grammar,
        "reading": reading,
        "listening_speaking": listening,
        "toefl_skill_drill": drill,
        "daily_quiz": quiz,
        "history_update": {
            "new_words_today": [v["word"] for v in vocab if v["status"] == "new"],
            "review_words_today": [v["word"] for v in vocab if v["status"] == "review"],
            "grammar_today": grammar["title"],
            "theme_today": theme,
            "skill_type_today": skill_type,
        },
    }

    lesson["gmail_email"] = {
        "recipient": RECIPIENT,
        "subject": f"Day {day} 英文學習｜{theme}",
        "html_body": build_email_html(lesson),
    }
    return lesson


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Generate a daily lesson JSON")
    parser.add_argument("--day", type=int, required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--history", default=str(PROJECT_ROOT / "learned_history.json"))
    args = parser.parse_args()

    history = json.loads(Path(args.history).read_text(encoding="utf-8"))
    lesson = generate_lesson(args.day, history)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
