import fs from "node:fs";
import path from "node:path";

const root = "F:/代碼/英文學習";
const bankPath = path.join(root, "automation", "vocab_full_bank.json");
const rootLessons = path.join(root, "daily_lessons");
const publicLessons = path.join(root, "codex製作", "public", "daily_lessons");
const defaultLessonPath = path.join(root, "codex製作", "src", "data", "defaultLesson.ts");

const bank = JSON.parse(fs.readFileSync(bankPath, "utf8")).words;
const entries = Object.entries(bank).map(([word, data], index) => ({
  index,
  word,
  ...data,
}));

function item(index, status, id) {
  const source = entries[index];
  if (!source) throw new Error(`Missing vocabulary index ${index}`);
  return {
    id,
    word: source.word,
    type: source.type,
    phonetic_us: source.phonetic_us,
    category: source.category,
    status,
    definition_tw: source.definition_tw,
    example: source.example,
    collocation: source.collocation,
    usage_note_tw: source.usage_note_tw,
  };
}

function vocabulary(newIndexes, reviewIndexes = []) {
  let id = 1;
  return [
    ...newIndexes.map((index) => item(index, "new", id++)),
    ...reviewIndexes.map((index) => item(index, "review", id++)),
  ];
}

function lesson(spec) {
  const vocab = vocabulary(spec.newIndexes, spec.reviewIndexes);
  const newWords = vocab.filter((entry) => entry.status === "new").map((entry) => entry.word);
  const reviewWords = vocab.filter((entry) => entry.status === "review").map((entry) => entry.word);
  return {
    metadata: {
      day: spec.day,
      date_label: "6/7",
      phase: "Foundation",
      level: "B1+",
      estimated_minutes: 24,
      exam_focus: ["TOEFL", "IELTS", "Daily Speaking"],
      theme: spec.theme,
      weekday_plan: spec.weekdayPlan,
    },
    vocabulary: vocab,
    grammar_focus: spec.grammar,
    reading: spec.reading,
    listening_speaking: spec.listening,
    toefl_skill_drill: spec.drill,
    daily_quiz: spec.quiz,
    gmail_email: {
      recipient: "learner@example.com",
      subject: `Day ${spec.day} TOEFL/IELTS Daily Lesson - ${spec.theme}`,
      html_body: `<h1>Day ${spec.day}: ${spec.theme}</h1><p>Review the website summary, vocabulary cards, reading, speaking drill, and quiz.</p>`,
    },
    history_update: {
      new_words_today: newWords,
      review_words_today: reviewWords,
      grammar_today: spec.grammar.title,
      theme_today: spec.theme,
      skill_type_today: spec.drill.skill_type,
    },
  };
}

const specs = [
  {
    day: 1,
    theme: "Workplace Introductions and Study Planning",
    weekdayPlan: "Speaking - independent speaking",
    newIndexes: Array.from({ length: 20 }, (_, i) => i),
    reviewIndexes: [],
    grammar: {
      title: "Using 'One reason is that...' to Extend an Answer",
      function: "用於 TOEFL independent speaking 與 IELTS Part 2/3，讓回答從一句意見延伸成有理由的段落。",
      explanation_tw:
        "先說出立場，再用 One reason is that... 補上原因。這個句型可以避免只回答 yes/no，也能讓口說聽起來更有結構。",
      pattern: "In my opinion, S + V. One reason is that S + V.",
      example_basic:
        "In my opinion, online learning is useful. One reason is that it is flexible.",
      example_advanced:
        "In my opinion, a short daily routine is more realistic for busy adults. One reason is that it creates consistent progress without requiring a perfect schedule.",
    },
    reading: {
      title: "A Practical Approach to English Learning",
      text:
        "Many adult English learners want to prepare for TOEFL or IELTS, but their study time is often limited. A practical approach is to set one clear goal each day instead of trying to master everything at once. For example, a learner can introduce a topic, review five useful words, and practice shadowing with three short sentences. This method builds pronunciation, fluency, and confidence at the same time. It also gives the learner immediate feedback because unclear sounds and weak examples become noticeable quickly. After each lesson, the learner should analyze one sentence and write a short note about the main concept. These notes help the learner understand context and demonstrate progress over several weeks. The process does not have to be perfect, but it should be consistent. If learners establish a flexible schedule and follow it efficiently, they can make steady progress in academic and workplace communication.",
      embedded_words: [
        "approach",
        "limited",
        "goal",
        "introduce",
        "review",
        "practice",
        "shadowing",
        "pronunciation",
        "fluency",
        "feedback",
        "analyze",
        "concept",
        "context",
        "demonstrate",
        "establish",
      ],
      translation_tw:
        "許多成人英文學習者想準備 TOEFL 或 IELTS，但讀書時間通常有限。實用的方法是每天設定一個清楚目標，而不是一次想把所有事情都學會。例如，學習者可以介紹一個主題、複習五個實用單字，並用三個短句做跟讀。這個方法能同時建立發音、流暢度與自信，也能立刻得到回饋，因為不清楚的發音和薄弱的例子很快就會被看見。每次課程後，學習者應分析一個句子，並寫下主要概念的短筆記。這些筆記能幫助理解上下文，也能在幾週後證明自己的進步。整個過程不必完美，但應該持續。如果學習者建立有彈性的時程並有效率地執行，就能在學術與職場溝通中穩定進步。",
    },
    listening: [
      {
        id: 1,
        sentence:
          "A practical approach is to set one clear goal each day instead of trying to master everything at once.",
        pronunciation_tips_tw:
          "注意 practical approach 的重音，instead of 可連成 /ɪnˈsted əv/，不要逐字念得太硬。",
        shadowing_steps_tw:
          "先聽一次抓停頓，再分成 A practical approach / is to set one clear goal / each day 三段跟讀。",
        focus: "stress",
      },
      {
        id: 2,
        sentence:
          "This method builds pronunciation, fluency, and confidence at the same time.",
        pronunciation_tips_tw:
          "pronunciation 與 fluency 是關鍵名詞，念時放慢並加重，and confidence 可自然連讀。",
        shadowing_steps_tw:
          "第二次跟讀時刻意把三個名詞列舉出節奏，最後 at the same time 降調收尾。",
        focus: "intonation",
      },
      {
        id: 3,
        sentence:
          "If learners establish a flexible schedule, they can make steady progress.",
        pronunciation_tips_tw:
          "establish a 會連音，flexible schedule 的 /sk/ 音要清楚，progress 作名詞重音在前。",
        shadowing_steps_tw:
          "先念 if 子句，再接 they can make steady progress，練習條件句的自然停頓。",
        focus: "linking",
      },
    ],
    drill: {
      skill_type: "independent_speaking",
      instruction_tw:
        "用 45-60 秒回答。先給立場，再用 One reason is that... 補理由，最後用一個生活例子收束。",
      prompt:
        "Do you prefer studying English with a fixed schedule or a flexible schedule?",
      response_framework:
        "I prefer a flexible schedule. One reason is that it helps me stay consistent even when I am busy. For example, I can review vocabulary during a short break and practice speaking at night.",
      sample_answer:
        "I prefer studying English with a flexible schedule. One reason is that it is easier to maintain when my work becomes busy. For example, if I cannot study for one full hour, I can still review vocabulary for ten minutes and do shadowing with three sentences. As a result, I do not lose momentum, and my practice becomes more consistent over time.",
      useful_phrases: [
        "One reason is that...",
        "For example...",
        "As a result...",
        "stay consistent",
        "lose momentum",
      ],
    },
    quiz: [
      {
        question_id: 1,
        question: "Which word best means '持續的；一致的'?",
        options: ["A. consistent", "B. limited", "C. flexible", "D. efficient"],
        answer: "A",
        explanation_tw: "consistent 表示持續穩定或一致，適合描述學習習慣。",
      },
      {
        question_id: 2,
        question: "In the reading, why is a clear daily goal useful?",
        options: [
          "A. It replaces all grammar study.",
          "B. It prevents learners from trying to master everything at once.",
          "C. It removes the need for pronunciation practice.",
          "D. It makes TOEFL shorter.",
        ],
        answer: "B",
        explanation_tw: "文章指出每天一個清楚目標能讓學習更實際，不必一次學所有內容。",
      },
      {
        question_id: 3,
        question: "Which sentence correctly uses the grammar pattern?",
        options: [
          "A. One reason is that because I study.",
          "B. I prefer short lessons. One reason is that they are realistic.",
          "C. I one reason is study every day.",
          "D. Flexible because schedule.",
        ],
        answer: "B",
        explanation_tw: "B 先給立場，再用 One reason is that + 完整子句。",
      },
    ],
  },
  {
    day: 2,
    theme: "Daily Routines and Time Management",
    weekdayPlan: "Listening - note taking and detail tracking",
    newIndexes: Array.from({ length: 15 }, (_, i) => i + 45),
    reviewIndexes: [0, 2, 3, 9, 14],
    grammar: {
      title: "Using 'Instead of V-ing...' to Compare Choices",
      function: "用於比較兩種學習或工作選擇，適合 IELTS Part 3 與 TOEFL opinion 題。",
      explanation_tw:
        "Instead of V-ing... 可以把不採用的方法放在前面，再說出你選擇的做法。這能讓回答更有比較感。",
      pattern: "Instead of V-ing, S + V.",
      example_basic:
        "Instead of studying late at night, I review vocabulary in the morning.",
      example_advanced:
        "Instead of waiting for a long free evening, I maintain a short routine that helps me retain information more reliably.",
    },
    reading: {
      title: "Making a Routine That Actually Works",
      text:
        "A routine is useful only when it matches a learner's real schedule. Many students create ambitious plans, but they do not retain much information because the plan is too difficult to maintain. A better strategy is to prioritize two or three small actions that can be repeated every day. For instance, a learner can summarize one short passage, contrast two examples, and record a thirty-second answer. This routine gives clear evidence of progress and helps the learner notice the distinction between passive review and active practice. When learners encounter a busy week, they should not abandon the routine completely. Instead, they can reduce the task and still maintain contact with English. This approach is relevant for test preparation because listening, reading, and speaking improve through repeated exposure. Over time, the habit can enhance confidence and make the learner feel prepared for more challenging academic tasks.",
      embedded_words: [
        "routine",
        "retain",
        "strategy",
        "prioritize",
        "summarize",
        "contrast",
        "evidence",
        "progress",
        "distinction",
        "encounter",
        "maintain",
        "relevant",
        "enhance",
        "confident",
      ],
      translation_tw:
        "例行練習只有在符合學習者真實行程時才有用。許多學生會制定很有企圖心的計畫，但因為計畫太難維持，所以記住的資訊不多。更好的策略是優先處理兩到三個每天能重複的小動作。例如，學習者可以總結一篇短文、對比兩個例子，並錄一段三十秒回答。這種例行練習能提供清楚的進步證據，也能幫助學習者分辨被動複習與主動練習之間的差異。遇到忙碌的一週時，學習者不應完全放棄例行練習，而是可以縮小任務，仍然保持與英文的接觸。這個方法與考試準備很相關，因為聽力、閱讀和口說都會透過反覆接觸而進步。長期下來，這個習慣能提升自信，讓學習者更準備好面對有挑戰性的學術任務。",
    },
    listening: [
      {
        id: 1,
        sentence:
          "A routine is useful only when it matches a learner's real schedule.",
        pronunciation_tips_tw:
        "routine 的重音在後，matches a 可連音，real schedule 要念清楚避免吞音。",
        shadowing_steps_tw:
          "先標出 only when 的條件語氣，再跟讀整句，最後練一次自然速度。",
        focus: "stress",
      },
      {
        id: 2,
        sentence:
          "Instead of waiting for a long free evening, I maintain a short routine.",
        pronunciation_tips_tw:
          "Instead of 可弱讀，waiting for 連音，maintain 要重音在第二音節。",
        shadowing_steps_tw:
          "把句子分成 Instead of... / I maintain... 兩段，練比較句的停頓。",
        focus: "reduction",
      },
      {
        id: 3,
        sentence:
          "This habit can enhance confidence and prepare learners for challenging tasks.",
        pronunciation_tips_tw:
          "enhance confidence 兩個重音要清楚，prepare learners for 可自然連讀。",
        shadowing_steps_tw:
          "先慢速跟讀，再把 enhance confidence 當成重點片語重複三次。",
        focus: "linking",
      },
    ],
    drill: {
      skill_type: "listening_note_taking",
      instruction_tw:
        "聽或讀段落時，用三欄筆記：Problem / Method / Result。練習抓原因與結果，不要逐字抄。",
      prompt:
        "What is one routine that can help students improve English when they are busy?",
      response_framework:
        "The routine is... Instead of..., students can... This is useful because...",
      sample_answer:
        "One useful routine is a short daily review. Instead of waiting for a long free evening, students can summarize one paragraph, review five words, and record a short answer. This is useful because it keeps English active in their schedule and helps them retain information even during a busy week.",
      useful_phrases: [
        "Instead of...",
        "This is useful because...",
        "retain information",
        "active practice",
        "during a busy week",
      ],
    },
    quiz: [
      {
        question_id: 1,
        question: "Which word means '保留；記住'?",
        options: ["A. retain", "B. contrast", "C. encounter", "D. enhance"],
        answer: "A",
        explanation_tw: "retain 可表示保留資訊或記住內容，是學習主題常見字。",
      },
      {
        question_id: 2,
        question: "What does the reading recommend during a busy week?",
        options: [
          "A. Stop learning completely.",
          "B. Reduce the task but keep contact with English.",
          "C. Study only grammar rules.",
          "D. Avoid active practice.",
        ],
        answer: "B",
        explanation_tw: "文章建議縮小任務，但不要完全中斷例行練習。",
      },
      {
        question_id: 3,
        question: "Which sentence uses 'Instead of V-ing' correctly?",
        options: [
          "A. Instead of wait, I study.",
          "B. Instead of waiting, I review my notes.",
          "C. Instead waiting, I review.",
          "D. Instead of I waited, review.",
        ],
        answer: "B",
        explanation_tw: "Instead of 後面接 V-ing，B 的 waiting 用法正確。",
      },
    ],
  },
  {
    day: 3,
    theme: "Travel and Cultural Exchange",
    weekdayPlan: "Speaking - compare choices and explain benefits",
    newIndexes: Array.from({ length: 15 }, (_, i) => i + 75),
    reviewIndexes: [20, 21, 30, 32, 47],
    grammar: {
      title: "Using 'As a result,...' to Show Outcome",
      function: "用於說明行動帶來的結果，適合 TOEFL 口說、IELTS Part 3 與學術寫作。",
      explanation_tw:
        "As a result,... 可以把前一句的原因或行動接成結果。使用時前後句要有因果關係，避免只把兩個無關句子硬接在一起。",
      pattern: "S + V. As a result, S + V.",
      example_basic:
        "I practiced speaking every day. As a result, I became more confident.",
      example_advanced:
        "Travelers adapt to unfamiliar situations during cultural exchange. As a result, they develop a more flexible attitude toward communication.",
    },
    reading: {
      title: "Travel as Cultural Exchange",
      text:
        "Travel is not only a break from routine; it can also become a meaningful form of cultural exchange. When people visit another country, they must adapt to new customs, adjust their expectations, and communicate with a diverse audience. This process can reduce anxiety because travelers learn that small mistakes are a normal part of communication. It also gives them access to different perspectives that may challenge their original assumptions. For example, a visitor might discover that an appropriate greeting in one culture feels too formal in another. This experience has a clear benefit: it helps people develop a more open attitude. In academic discussions, students can use travel examples to support an argument about education, identity, or social development. However, the assessment of travel should be balanced. Travel is not automatically valuable; it becomes valuable when people reflect on what they observe and connect it to a wider cultural context.",
      embedded_words: [
        "adapt",
        "adjust",
        "diverse",
        "audience",
        "anxiety",
        "access",
        "perspective",
        "challenge",
        "assumption",
        "appropriate",
        "benefit",
        "attitude",
        "argument",
        "identity",
        "assessment",
      ],
      translation_tw:
        "旅行不只是從日常中休息，它也可以成為有意義的文化交流。當人們到另一個國家時，必須適應新的習俗、調整期待，並和多樣的對象溝通。這個過程能降低焦慮，因為旅人會學到小錯誤是溝通中正常的一部分。它也讓人接觸不同觀點，進而挑戰原本的假設。例如，旅人可能發現某個文化中合適的打招呼方式，在另一個文化中會顯得太正式。這種經驗有明確好處：它能幫助人們形成更開放的態度。在學術討論中，學生可以用旅行例子支持關於教育、身分認同或社會發展的論點。不過，對旅行的評估應該保持平衡。旅行不會自動變得有價值；當人們反思觀察到的事，並把它連結到更廣的文化脈絡時，它才真正有價值。",
    },
    listening: [
      {
        id: 1,
        sentence:
          "Travel can become a meaningful form of cultural exchange.",
        pronunciation_tips_tw:
          "meaningful form of 連讀時 form of 可弱化，cultural exchange 是重點片語。",
        shadowing_steps_tw:
          "先慢讀 cultural exchange，再把整句分成 Travel can become / a meaningful form / of cultural exchange。",
        focus: "linking",
      },
      {
        id: 2,
        sentence:
          "Travelers must adapt to new customs and adjust their expectations.",
        pronunciation_tips_tw:
          "adapt to 的 /t/ 接 to 可輕讀，adjust their 要注意 /dʒ/ 音。",
        shadowing_steps_tw:
          "把 adapt to new customs 和 adjust their expectations 當成兩個並列動作練節奏。",
        focus: "flap t",
      },
      {
        id: 3,
        sentence:
          "As a result, they develop a more flexible attitude toward communication.",
        pronunciation_tips_tw:
          "As a result 後面停頓，develop 與 attitude 是句子重點，toward 可弱讀。",
        shadowing_steps_tw:
          "先練 As a result 的轉折語氣，再接後半句，收尾時降調。",
        focus: "intonation",
      },
    ],
    drill: {
      skill_type: "independent_speaking",
      instruction_tw:
        "用旅行或文化交流當例子。先給立場，再用 As a result 連出結果，最後補一句平衡觀點。",
      prompt:
        "Do you think traveling is one of the best ways to learn about other cultures?",
      response_framework:
        "I think traveling is helpful because... As a result,... However, it is most useful when...",
      sample_answer:
        "I think traveling is one of the best ways to learn about other cultures because it forces people to communicate in real situations. Travelers must adapt to new customs and adjust their expectations. As a result, they often develop a more open attitude toward communication. However, travel is most useful when people reflect on what they experience instead of only taking photos or visiting famous places.",
      useful_phrases: [
        "cultural exchange",
        "adapt to new customs",
        "As a result...",
        "a more open attitude",
        "reflect on what they experience",
      ],
    },
    quiz: [
      {
        question_id: 1,
        question: "Which word means '適應；調整'?",
        options: ["A. adapt", "B. benefit", "C. authority", "D. audience"],
        answer: "A",
        explanation_tw: "adapt 表示適應新情況或調整做法，文章用於適應新習俗。",
      },
      {
        question_id: 2,
        question: "According to the reading, when does travel become valuable?",
        options: [
          "A. When people avoid all mistakes.",
          "B. When people reflect on observations and connect them to cultural context.",
          "C. When people visit only famous places.",
          "D. When people never change their assumptions.",
        ],
        answer: "B",
        explanation_tw: "文章最後明確說明，旅行的價值來自反思與文化脈絡連結。",
      },
      {
        question_id: 3,
        question: "Which sentence correctly uses 'As a result'?",
        options: [
          "A. I practiced daily. As a result, my fluency improved.",
          "B. As a result because I practiced.",
          "C. I traveled. As a result customs.",
          "D. As a result, but I study.",
        ],
        answer: "A",
        explanation_tw: "A 前後有清楚因果：每天練習帶來流暢度進步。",
      },
    ],
  },
];

fs.mkdirSync(rootLessons, { recursive: true });
fs.mkdirSync(publicLessons, { recursive: true });

const lessons = specs.map(lesson);
for (const data of lessons) {
  const filename = `day_${String(data.metadata.day).padStart(3, "0")}.json`;
  const body = `${JSON.stringify(data, null, 2)}\n`;
  fs.writeFileSync(path.join(rootLessons, filename), body, "utf8");
  fs.writeFileSync(path.join(publicLessons, filename), body, "utf8");
}

const current = { day: 3, file: "day_003.json" };
fs.writeFileSync(
  path.join(publicLessons, "current_day.json"),
  `${JSON.stringify(current, null, 2)}\n`,
  "utf8"
);

const index = {
  lessons: lessons.map((data) => ({
    day: data.metadata.day,
    file: `day_${String(data.metadata.day).padStart(3, "0")}.json`,
    date_label: data.metadata.date_label,
    theme: data.metadata.theme,
    phase: data.metadata.phase,
    level: data.metadata.level,
    skill_type: data.toefl_skill_drill.skill_type,
    vocabulary_count: data.vocabulary.length,
    new_count: data.vocabulary.filter((item) => item.status === "new").length,
    review_count: data.vocabulary.filter((item) => item.status === "review").length,
  })),
};
fs.writeFileSync(
  path.join(publicLessons, "history_index.json"),
  `${JSON.stringify(index, null, 2)}\n`,
  "utf8"
);

fs.writeFileSync(
  defaultLessonPath,
  `import type { LessonData } from "../types";\n\nexport const defaultLesson: LessonData = ${JSON.stringify(lessons[0], null, 2)};\n`,
  "utf8"
);

console.log(`Refreshed ${lessons.length} Codex seed lessons.`);
