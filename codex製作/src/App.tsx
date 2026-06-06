import {
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  History,
  FileText,
  Gauge,
  Headphones,
  LayoutDashboard,
  Mail,
  Mic2,
  Play,
  Sparkles,
  Upload,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { defaultLesson } from "./data/defaultLesson";
import type {
  CompletionState,
  LessonData,
  LessonIndexItem,
  QuizItem,
  VocabularyItem,
  VocabularyStatus,
} from "./types";

type TabId = "summary" | "dashboard" | "vocabulary" | "reading" | "speaking" | "drill" | "quiz";

const tabs: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard }> = [
  { id: "summary", label: "精華", icon: FileText },
  { id: "dashboard", label: "總覽", icon: LayoutDashboard },
  { id: "vocabulary", label: "單字卡", icon: Brain },
  { id: "reading", label: "閱讀", icon: BookOpen },
  { id: "speaking", label: "跟讀", icon: Headphones },
  { id: "drill", label: "TOEFL", icon: Mic2 },
  { id: "quiz", label: "測驗", icon: ClipboardCheck },
];

const defaultCompletion: CompletionState = {
  summary: false,
  dashboard: false,
  vocabulary: false,
  reading: false,
  speaking: false,
  drill: false,
  quiz: false,
};

const skillLabels: Record<string, string> = {
  independent_speaking: "Independent Speaking",
  reading_inference: "Reading Inference",
  listening_note_taking: "Listening Note-taking",
  integrated_speaking_basic: "Integrated Speaking",
  academic_discussion_writing: "Academic Discussion",
  mixed_review: "Mixed Review",
};

const assetBase = import.meta.env.BASE_URL;

function dailyLessonUrl(file: string) {
  return `${assetBase}daily_lessons/${file}`.replace(/\/{2,}/g, "/");
}

function isLessonData(value: unknown): value is LessonData {
  const lesson = value as LessonData;
  return Boolean(
    lesson &&
      lesson.metadata &&
      Array.isArray(lesson.vocabulary) &&
      lesson.reading &&
      Array.isArray(lesson.listening_speaking) &&
      lesson.toefl_skill_drill &&
      Array.isArray(lesson.daily_quiz)
  );
}

function mergeLesson(value: unknown): { lesson: LessonData; warnings: string[] } {
  if (!isLessonData(value)) {
    return {
      lesson: defaultLesson,
      warnings: ["資料欄位不足，已先載入內建 Day 1 範例。"],
    };
  }

  const warnings: string[] = [];
  if (value.vocabulary.length < 15 || value.vocabulary.length > 20) {
    warnings.push("vocabulary 應為 15-20 個項目。");
  }
  if (value.listening_speaking.length !== 3) {
    warnings.push("listening_speaking 應剛好 3 句。");
  }
  if (value.daily_quiz.length !== 3) {
    warnings.push("daily_quiz 應剛好 3 題。");
  }
  if (!value.gmail_email?.recipient || !value.gmail_email?.subject) {
    warnings.push("gmail_email 欄位不完整。");
  }

  return {
    lesson: {
      ...defaultLesson,
      ...value,
      metadata: { ...defaultLesson.metadata, ...value.metadata },
      grammar_focus: { ...defaultLesson.grammar_focus, ...value.grammar_focus },
      reading: { ...defaultLesson.reading, ...value.reading },
      toefl_skill_drill: {
        ...defaultLesson.toefl_skill_drill,
        ...value.toefl_skill_drill,
      },
      gmail_email: { ...defaultLesson.gmail_email, ...value.gmail_email },
      history_update: { ...defaultLesson.history_update, ...value.history_update },
    },
    warnings,
  };
}

function storageKey(day: number, type: string) {
  return `daily-english:${type}:day-${day}`;
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
}

function normalizeAnswer(answer: string) {
  return answer.trim().toUpperCase().replace(/\.$/, "");
}

function downloadJson(lesson: LessonData) {
  const blob = new Blob([JSON.stringify(lesson, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `day_${String(lesson.metadata.day).padStart(3, "0")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function highlightText(text: string, words: string[]) {
  const usableWords = words.filter(Boolean).sort((a, b) => b.length - a.length);
  if (usableWords.length === 0) return text;

  const escapedWords = usableWords.map((word) =>
    word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi");
  const highlightSet = new Set(usableWords.map((word) => word.toLowerCase()));

  return text.split(pattern).map((part, index) => {
    if (highlightSet.has(part.toLowerCase())) {
      return (
        <mark key={`${part}-${index}`} className="reading-highlight">
          {part}
        </mark>
      );
    }
    return part;
  });
}

function speak(sentence: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(sentence);
  utterance.lang = "en-US";
  utterance.rate = 0.86;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function readingPreview(text: string, limit = 520) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trim()}...`;
}

function splitIntoSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function findVocabularyItem(vocabulary: VocabularyItem[], word: string) {
  return vocabulary.find(
    (item) => item.word.toLowerCase() === word.toLowerCase()
  );
}

function App() {
  const [lesson, setLesson] = useState<LessonData>(defaultLesson);
  const [historyLessons, setHistoryLessons] = useState<LessonIndexItem[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [statusFilter, setStatusFilter] = useState<"all" | VocabularyStatus>("all");
  const [rememberedWords, setRememberedWords] = useState<string[]>([]);
  const [completion, setCompletion] = useState<CompletionState>(defaultCompletion);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [learnerResponse, setLearnerResponse] = useState("");

  const day = lesson.metadata.day || 1;

  async function loadLessonFile(file: string, nextTab: TabId = "summary") {
    const response = await fetch(dailyLessonUrl(file));
    if (!response.ok) throw new Error(`Unable to load ${file}`);
    const data = await response.json();
    const result = mergeLesson(data);
    setLesson(result.lesson);
    setWarnings(result.warnings);
    setActiveTab(nextTab);
  }

  useEffect(() => {
    fetch(dailyLessonUrl("history_index.json"))
      .then((response) => (response.ok ? response.json() : Promise.resolve({ lessons: [] })))
      .then((index) => {
        const lessons = Array.isArray(index?.lessons) ? index.lessons : [];
        setHistoryLessons(lessons);
      })
      .catch(() => setHistoryLessons([]));

    fetch(dailyLessonUrl("current_day.json"))
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.resolve({ day: 1, file: "day_001.json" })
      )
      .then((current) => {
        const file =
          typeof current?.file === "string" ? current.file : "day_001.json";
        return loadLessonFile(file, "summary");
      })
      .catch(() => {
        const result = mergeLesson(defaultLesson);
        setLesson(result.lesson);
        setWarnings(result.warnings);
      });
  }, []);

  useEffect(() => {
    setCompletion(readStored(storageKey(day, "completion"), defaultCompletion));
    setRememberedWords(readStored(storageKey(day, "remembered"), []));
    setQuizAnswers(readStored(storageKey(day, "quiz"), {}));
    setLearnerResponse(readStored(storageKey(day, "response"), ""));
  }, [day]);

  const progressPercent = useMemo(() => {
    const values = Object.values(completion);
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  }, [completion]);

  const filteredVocabulary = useMemo(() => {
    if (statusFilter === "all") return lesson.vocabulary;
    return lesson.vocabulary.filter((item) => item.status === statusFilter);
  }, [lesson.vocabulary, statusFilter]);

  const rememberedCount = rememberedWords.length;
  const quizScore = lesson.daily_quiz.reduce((score, item) => {
    const selected = quizAnswers[item.question_id];
    return selected && normalizeAnswer(selected) === normalizeAnswer(item.answer)
      ? score + 1
      : score;
  }, 0);

  function updateCompletion(key: keyof CompletionState, value?: boolean) {
    setCompletion((current) => {
      const next = { ...current, [key]: value ?? !current[key] };
      writeStored(storageKey(day, "completion"), next);
      return next;
    });
  }

  function toggleRemembered(word: string) {
    setRememberedWords((current) => {
      const next = current.includes(word)
        ? current.filter((item) => item !== word)
        : [...current, word];
      writeStored(storageKey(day, "remembered"), next);
      return next;
    });
  }

  function handleQuizAnswer(questionId: number, answer: string) {
    setQuizAnswers((current) => {
      const next = { ...current, [questionId]: answer };
      writeStored(storageKey(day, "quiz"), next);
      return next;
    });
  }

  function handleLearnerResponse(value: string) {
    setLearnerResponse(value);
    writeStored(storageKey(day, "response"), value);
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file) return;
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      const result = mergeLesson(parsed);
      setLesson(result.lesson);
      setWarnings(result.warnings);
      setActiveTab("dashboard");
    } catch {
      setWarnings(["JSON 無法解析，請確認檔案格式後再上傳。"]);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-icon" aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="eyebrow">Daily English Lab</p>
            <h1>TOEFL / IELTS</h1>
          </div>
        </div>

        <nav className="tab-list" aria-label="學習分頁">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                title={tab.label}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                <ChevronRight size={16} className="tab-arrow" />
              </button>
            );
          })}
        </nav>

        <section className="history-panel" aria-label="歷史課程">
          <div className="history-title">
            <History size={16} />
            <span>History</span>
          </div>
          <div className="history-list">
            {historyLessons.length === 0 ? (
              <p>尚未建立歷史索引</p>
            ) : (
              historyLessons.map((item) => (
                <button
                  key={`${item.day}-${item.file}`}
                  className={`history-item ${item.day === day ? "active" : ""}`}
                  type="button"
                  onClick={() => loadLessonFile(item.file, "summary")}
                  title={`Day ${item.day} ${item.theme}`}
                >
                  <strong>Day {item.day}</strong>
                  <span>{item.theme}</span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="progress-panel" aria-label="今日進度">
          <div className="progress-head">
            <span>今日完成</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="check-list">
            {tabs.map((tab) => (
              <label key={tab.id} className="check-row">
                <input
                  type="checkbox"
                  checked={completion[tab.id]}
                  onChange={() => updateCompletion(tab.id)}
                />
                <span>{tab.label}</span>
              </label>
            ))}
          </div>
        </section>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Day {lesson.metadata.day}</p>
            <h2>{lesson.metadata.theme || "每日英文學習"}</h2>
          </div>
          <div className="topbar-actions">
            <label className="icon-command" title="上傳每日 JSON">
              <Upload size={17} />
              <span>上傳 JSON</span>
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => handleFileUpload(event.target.files?.[0])}
              />
            </label>
            <button
              className="icon-command"
              type="button"
              onClick={() => downloadJson(lesson)}
              title="下載目前課程 JSON"
            >
              <Download size={17} />
              <span>下載</span>
            </button>
          </div>
        </header>

        {warnings.length > 0 && (
          <div className="notice" role="status">
            <strong>資料提醒</strong>
            <span>{warnings.join(" ")}</span>
          </div>
        )}

        {activeTab === "summary" && (
          <SummaryPanel
            lesson={lesson}
            historyLessons={historyLessons}
            onComplete={() => updateCompletion("summary", true)}
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardPanel
            lesson={lesson}
            progressPercent={progressPercent}
            rememberedCount={rememberedCount}
            quizScore={quizScore}
            onComplete={() => updateCompletion("dashboard", true)}
          />
        )}

        {activeTab === "vocabulary" && (
          <VocabularyPanel
            vocabulary={filteredVocabulary}
            allVocabulary={lesson.vocabulary}
            rememberedWords={rememberedWords}
            statusFilter={statusFilter}
            onFilter={setStatusFilter}
            onToggle={toggleRemembered}
            onComplete={() => updateCompletion("vocabulary", true)}
          />
        )}

        {activeTab === "reading" && (
          <ReadingPanel
            lesson={lesson}
            onComplete={() => updateCompletion("reading", true)}
          />
        )}

        {activeTab === "speaking" && (
          <SpeakingPanel
            lesson={lesson}
            onComplete={() => updateCompletion("speaking", true)}
          />
        )}

        {activeTab === "drill" && (
          <DrillPanel
            lesson={lesson}
            response={learnerResponse}
            onResponse={handleLearnerResponse}
            onComplete={() => updateCompletion("drill", true)}
          />
        )}

        {activeTab === "quiz" && (
          <QuizPanel
            quiz={lesson.daily_quiz}
            answers={quizAnswers}
            onAnswer={handleQuizAnswer}
            onComplete={() => updateCompletion("quiz", true)}
          />
        )}
      </main>
    </div>
  );
}

function SummaryPanel({
  lesson,
  historyLessons,
  onComplete,
}: {
  lesson: LessonData;
  historyLessons: LessonIndexItem[];
  onComplete: () => void;
}) {
  const skillName =
    skillLabels[lesson.toefl_skill_drill.skill_type] ||
    lesson.toefl_skill_drill.skill_type;
  const newWords = lesson.vocabulary.filter((item) => item.status === "new");
  const reviewWords = lesson.vocabulary.filter((item) => item.status === "review");
  const readingSentences = splitIntoSentences(lesson.reading.text);
  const selectedIndex = historyLessons.findIndex(
    (item) => item.day === lesson.metadata.day
  );
  const previous = selectedIndex > 0 ? historyLessons[selectedIndex - 1] : undefined;
  const next =
    selectedIndex >= 0 && selectedIndex < historyLessons.length - 1
      ? historyLessons[selectedIndex + 1]
      : undefined;

  return (
    <section className="summary-page">
      <div className="summary-hero">
        <div>
          <p className="eyebrow">Review Sheet</p>
          <h3>Day {lesson.metadata.day} · {lesson.metadata.theme}</h3>
          <p className="lesson-meta">
            {lesson.metadata.phase} / {lesson.metadata.level} / {skillName} /{" "}
            {lesson.metadata.estimated_minutes} 分鐘
          </p>
          <div className="summary-stats" aria-label="今日課程統計">
            <span>{newWords.length} new</span>
            <span>{reviewWords.length} review</span>
            <span>{lesson.reading.embedded_words.length} reading words</span>
          </div>
        </div>
        <button className="primary-action" type="button" onClick={onComplete}>
          <Check size={18} />
          <span>精華已讀</span>
        </button>
      </div>

      <div className="summary-grid">
        <article className="summary-card main-focus">
          <span>Grammar Pattern</span>
          <h3>{lesson.grammar_focus.title}</h3>
          <p className="big-sentence">{lesson.grammar_focus.pattern}</p>
          <p>{lesson.grammar_focus.explanation_tw}</p>
          <div className="example-pair">
            <p><strong>Basic:</strong> {lesson.grammar_focus.example_basic}</p>
            <p><strong>Advanced:</strong> {lesson.grammar_focus.example_advanced}</p>
          </div>
        </article>

        <article className="summary-card study-brief">
          <span>Today's Goal</span>
          <h3>今天要帶走的能力</h3>
          <ul className="analysis-list">
            <li>用今日句型說出「原因、結果或比較」的完整回答。</li>
            <li>把新單字放回閱讀段落中理解，不只背中文意思。</li>
            <li>跟讀 3 句核心句，練重音、連音與自然停頓。</li>
          </ul>
        </article>

        <article className="summary-card vocabulary-detail">
          <span>Vocabulary</span>
          <h3>{lesson.vocabulary.length} words and phrases</h3>
          <div className="detail-word-grid">
            {newWords.slice(0, 8).map((item) => (
              <div className="detail-word" key={item.word}>
                <strong>{item.word}</strong>
                <span>{item.definition_tw}</span>
                <small>{item.collocation}</small>
              </div>
            ))}
          </div>
          <p>Review: {reviewWords.map((item) => item.word).join(", ") || "今日無複習詞"}</p>
        </article>

        <article className="summary-card reading-brief">
          <span>Reading Brief</span>
          <h3>{lesson.reading.title}</h3>
          <p>{readingPreview(lesson.reading.text)}</p>
          <div className="analysis-list compact">
            {readingSentences.slice(0, 3).map((sentence) => (
              <p key={sentence}>{sentence}</p>
            ))}
          </div>
        </article>

        <article className="summary-card">
          <span>Reading Tasks</span>
          <h3>複習時回答 3 件事</h3>
          <ol className="summary-list">
            <li>主旨：這篇文章主要在解釋什麼問題或建議？</li>
            <li>證據：作者用了哪一句話支持主旨？</li>
            <li>應用：挑 2 個字彙，改寫成自己的生活例句。</li>
          </ol>
        </article>

        <article className="summary-card">
          <span>Speaking Prompt</span>
          <h3>{lesson.toefl_skill_drill.prompt}</h3>
          <p>{lesson.toefl_skill_drill.response_framework}</p>
          <div className="phrase-cloud">
            {lesson.toefl_skill_drill.useful_phrases.map((phrase) => (
              <span key={phrase}>{phrase}</span>
            ))}
          </div>
        </article>

        <article className="summary-card">
          <span>Shadowing</span>
          <h3>3 core sentences</h3>
          <ol className="summary-list">
            {lesson.listening_speaking.map((item) => (
              <li key={item.id}>
                <strong>{item.focus}:</strong> {item.sentence}
              </li>
            ))}
          </ol>
        </article>

        <article className="summary-card">
          <span>Quiz Key</span>
          <h3>Answers and Why</h3>
          <ol className="summary-list">
            {lesson.daily_quiz.map((item) => (
              <li key={item.question_id}>
                Q{item.question_id}: {item.answer} · {item.explanation_tw}
              </li>
            ))}
          </ol>
        </article>
      </div>

      <div className="summary-footer">
        <span>{previous ? `Previous: Day ${previous.day}` : "First saved lesson"}</span>
        <span>{next ? `Next: Day ${next.day}` : "Latest saved lesson"}</span>
      </div>
    </section>
  );
}

function DashboardPanel({
  lesson,
  progressPercent,
  rememberedCount,
  quizScore,
  onComplete,
}: {
  lesson: LessonData;
  progressPercent: number;
  rememberedCount: number;
  quizScore: number;
  onComplete: () => void;
}) {
  const skillName =
    skillLabels[lesson.toefl_skill_drill.skill_type] ||
    lesson.toefl_skill_drill.skill_type;

  return (
    <section className="screen-grid dashboard-grid">
      <div className="hero-strip">
        <div>
          <p className="eyebrow">{lesson.metadata.phase}</p>
          <h3>{lesson.metadata.weekday_plan}</h3>
          <p>{lesson.toefl_skill_drill.instruction_tw}</p>
        </div>
        <button className="primary-action" type="button" onClick={onComplete}>
          <Check size={18} />
          <span>標記完成</span>
        </button>
      </div>

      <Metric icon={Gauge} label="程度" value={lesson.metadata.level} />
      <Metric icon={FileText} label="時間" value={`${lesson.metadata.estimated_minutes} 分鐘`} />
      <Metric icon={Mic2} label="技能" value={skillName} />
      <Metric icon={Check} label="進度" value={`${progressPercent}%`} />

      <div className="panel wide">
        <div className="panel-title">
          <h3>今日學習地圖</h3>
          <span>{lesson.metadata.exam_focus.join(" / ")}</span>
        </div>
        <div className="route-row">
          <RouteStep number="01" title="單字" text={`${lesson.vocabulary.length} 個詞，已記住 ${rememberedCount} 個`} />
          <RouteStep number="02" title="閱讀" text={lesson.reading.title} />
          <RouteStep number="03" title="跟讀" text={`${lesson.listening_speaking.length} 句核心句`} />
          <RouteStep number="04" title="測驗" text={`目前 ${quizScore}/${lesson.daily_quiz.length} 題正確`} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>句型焦點</h3>
          <span>Speaking / Writing</span>
        </div>
        <p className="big-sentence">{lesson.grammar_focus.pattern}</p>
        <p>{lesson.grammar_focus.explanation_tw}</p>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>寄信內容</h3>
          <Mail size={18} />
        </div>
        <p><strong>收件人：</strong>{lesson.gmail_email.recipient}</p>
        <p><strong>主旨：</strong>{lesson.gmail_email.subject}</p>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RouteStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="route-step">
      <span>{number}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function VocabularyPanel({
  vocabulary,
  allVocabulary,
  rememberedWords,
  statusFilter,
  onFilter,
  onToggle,
  onComplete,
}: {
  vocabulary: VocabularyItem[];
  allVocabulary: VocabularyItem[];
  rememberedWords: string[];
  statusFilter: "all" | VocabularyStatus;
  onFilter: (status: "all" | VocabularyStatus) => void;
  onToggle: (word: string) => void;
  onComplete: () => void;
}) {
  const newCount = allVocabulary.filter((item) => item.status === "new").length;
  const reviewCount = allVocabulary.filter((item) => item.status === "review").length;

  return (
    <section className="screen-grid">
      <div className="panel wide">
        <div className="panel-title">
          <div>
            <h3>Vocabulary Cards</h3>
            <span>New {newCount} / Review {reviewCount}</span>
          </div>
          <button className="primary-action compact" type="button" onClick={onComplete}>
            <Check size={17} />
            <span>完成</span>
          </button>
        </div>
        <div className="segmented" role="group" aria-label="單字狀態篩選">
          {(["all", "new", "review"] as const).map((status) => (
            <button
              key={status}
              className={statusFilter === status ? "selected" : ""}
              type="button"
              onClick={() => onFilter(status)}
            >
              {status === "all" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      <div className="vocab-grid wide">
        {vocabulary.map((item) => {
          const remembered = rememberedWords.includes(item.word);
          return (
            <article className={`vocab-card ${remembered ? "remembered" : ""}`} key={item.id}>
              <div className="vocab-head">
                <div>
                  <span className={`status-chip ${item.status}`}>{item.status}</span>
                  <h3>{item.word}</h3>
                  <p>{item.type} · {item.phonetic_us}</p>
                </div>
                <button
                  className="memory-button"
                  type="button"
                  onClick={() => onToggle(item.word)}
                  title="標記已記住"
                  aria-pressed={remembered}
                >
                  <Check size={18} />
                </button>
              </div>
              <p className="definition">{item.definition_tw}</p>
              <p className="example">{item.example}</p>
              <div className="vocab-meta">
                <span>分類：{item.category}</span>
                <span>搭配：{item.collocation}</span>
              </div>
              <div className="usage-note">
                <strong>備考用法</strong>
                <p>{item.usage_note_tw}</p>
              </div>
              <div className="mini-task">
                <strong>30 秒任務</strong>
                <span>用「{item.word}」造一句跟自己學習、工作或旅行有關的句子。</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReadingPanel({
  lesson,
  onComplete,
}: {
  lesson: LessonData;
  onComplete: () => void;
}) {
  const embeddedVocabulary = lesson.reading.embedded_words
    .map((word) => findVocabularyItem(lesson.vocabulary, word))
    .filter((item): item is VocabularyItem => Boolean(item));
  const readingSentences = splitIntoSentences(lesson.reading.text);

  return (
    <section className="screen-grid reading-layout">
      <div className="panel reading-panel">
        <div className="panel-title">
          <div>
            <h3>{lesson.reading.title}</h3>
            <span>{lesson.reading.embedded_words.length} highlighted words</span>
          </div>
          <button className="primary-action compact" type="button" onClick={onComplete}>
            <Check size={17} />
            <span>完成</span>
          </button>
        </div>
        <p className="reading-text">
          {highlightText(lesson.reading.text, lesson.reading.embedded_words)}
        </p>
      </div>

      <div className="panel translation-panel">
        <div className="panel-title">
          <h3>繁中翻譯</h3>
          <BookOpen size={18} />
        </div>
        <p>{lesson.reading.translation_tw}</p>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>閱讀拆解</h3>
          <span>Main idea / Detail / Inference</span>
        </div>
        <ol className="summary-list reading-questions">
          <li>主旨句：{readingSentences[0] || "請先找出文章第一個核心主張。"}</li>
          <li>細節題：哪一個例子說明作者的建議可行？</li>
          <li>推論題：作者對這個方法的態度比較接近 practical 還是 doubtful？</li>
        </ol>
      </div>

      <div className="panel wide">
        <div className="panel-title">
          <h3>字彙定位</h3>
          <span>Embedded Words</span>
        </div>
        <div className="reading-helper-grid">
          {embeddedVocabulary.map((item) => (
            <div className="reading-word" key={item.word}>
              <strong>{item.word}</strong>
              <span>{item.definition_tw}</span>
              <small>{item.example}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpeakingPanel({
  lesson,
  onComplete,
}: {
  lesson: LessonData;
  onComplete: () => void;
}) {
  const speechReady = "speechSynthesis" in window;

  return (
    <section className="screen-grid">
      <div className="panel wide">
        <div className="panel-title">
          <div>
            <h3>Listening & Speaking</h3>
            <span>{speechReady ? "Web Speech ready" : "瀏覽器不支援朗讀"}</span>
          </div>
          <button className="primary-action compact" type="button" onClick={onComplete}>
            <Check size={17} />
            <span>完成</span>
          </button>
        </div>
      </div>

      <div className="sentence-stack wide">
        {lesson.listening_speaking.map((item) => (
          <article className="sentence-card" key={item.id}>
            <div className="sentence-number">{String(item.id).padStart(2, "0")}</div>
            <div className="sentence-body">
              <p className="practice-sentence">{item.sentence}</p>
              <div className="focus-row">
                <span>{item.focus}</span>
                <span>{item.pronunciation_tips_tw}</span>
              </div>
              <p>{item.shadowing_steps_tw}</p>
            </div>
            <button
              className="play-button"
              type="button"
              disabled={!speechReady}
              onClick={() => speak(item.sentence)}
              title="播放英文句子"
            >
              <Volume2 size={20} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function DrillPanel({
  lesson,
  response,
  onResponse,
  onComplete,
}: {
  lesson: LessonData;
  response: string;
  onResponse: (value: string) => void;
  onComplete: () => void;
}) {
  return (
    <section className="screen-grid drill-layout">
      <div className="panel">
        <div className="panel-title">
          <h3>{skillLabels[lesson.toefl_skill_drill.skill_type] || lesson.toefl_skill_drill.skill_type}</h3>
          <Mic2 size={18} />
        </div>
        <p>{lesson.toefl_skill_drill.instruction_tw}</p>
        <p className="prompt-box">{lesson.toefl_skill_drill.prompt}</p>
        <p className="framework">{lesson.toefl_skill_drill.response_framework}</p>
        <ol className="summary-list speaking-steps">
          <li>15 秒：決定立場，寫下 1 個主理由。</li>
          <li>30 秒：用今天的句型補原因、結果或例子。</li>
          <li>15 秒：收尾時重講立場，不要新增新理由。</li>
        </ol>
        <div className="phrase-cloud">
          {lesson.toefl_skill_drill.useful_phrases.map((phrase) => (
            <span key={phrase}>{phrase}</span>
          ))}
        </div>
      </div>

      <div className="panel response-panel">
        <div className="panel-title">
          <h3>我的回答</h3>
          <button className="primary-action compact" type="button" onClick={onComplete}>
            <Check size={17} />
            <span>完成</span>
          </button>
        </div>
        <textarea
          value={response}
          onChange={(event) => onResponse(event.target.value)}
          placeholder="State your opinion. One reason is that... For example... As a result..."
          aria-label="輸入口說或寫作回答"
        />
      </div>

      <div className="panel wide sample-answer">
        <div className="panel-title">
          <h3>Sample Answer</h3>
          <Play size={18} />
        </div>
        <p>{lesson.toefl_skill_drill.sample_answer}</p>
      </div>
    </section>
  );
}

function QuizPanel({
  quiz,
  answers,
  onAnswer,
  onComplete,
}: {
  quiz: QuizItem[];
  answers: Record<number, string>;
  onAnswer: (questionId: number, answer: string) => void;
  onComplete: () => void;
}) {
  const score = quiz.reduce((total, item) => {
    const selected = answers[item.question_id];
    return selected && normalizeAnswer(selected) === normalizeAnswer(item.answer)
      ? total + 1
      : total;
  }, 0);

  return (
    <section className="screen-grid">
      <div className="panel wide">
        <div className="panel-title">
          <div>
            <h3>Daily Quiz</h3>
            <span>{score}/{quiz.length} correct</span>
          </div>
          <button className="primary-action compact" type="button" onClick={onComplete}>
            <Check size={17} />
            <span>完成</span>
          </button>
        </div>
      </div>

      <div className="quiz-stack wide">
        {quiz.map((item) => {
          const selected = answers[item.question_id];
          const answered = Boolean(selected);
          const correct =
            answered && normalizeAnswer(selected) === normalizeAnswer(item.answer);

          return (
            <article className="quiz-card" key={item.question_id}>
              <div className="quiz-head">
                <span>Q{item.question_id}</span>
                {answered && (
                  <strong className={correct ? "correct" : "incorrect"}>
                    {correct ? "Correct" : "Review"}
                  </strong>
                )}
              </div>
              <h3>{item.question}</h3>
              <div className="option-list">
                {item.options.map((option) => {
                  const optionKey = normalizeAnswer(option.slice(0, 1));
                  const isSelected = normalizeAnswer(selected || "") === optionKey;
                  return (
                    <button
                      key={option}
                      type="button"
                      className={isSelected ? "selected" : ""}
                      onClick={() => onAnswer(item.question_id, optionKey)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className="answer-box">
                  <strong>Answer: {item.answer}</strong>
                  <p>{item.explanation_tw}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default App;
