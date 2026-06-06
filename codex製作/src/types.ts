export type VocabularyStatus = "new" | "review";

export type VocabularyItem = {
  id: number;
  word: string;
  type: string;
  phonetic_us: string;
  category: "Daily" | "Business" | "TOEFL" | "IELTS" | "Academic";
  status: VocabularyStatus;
  definition_tw: string;
  example: string;
  collocation: string;
  usage_note_tw: string;
};

export type LessonMetadata = {
  day: number;
  date_label: string;
  phase: string;
  level: string;
  estimated_minutes: number;
  exam_focus: string[];
  theme: string;
  weekday_plan: string;
};

export type GrammarFocus = {
  title: string;
  function: string;
  explanation_tw: string;
  pattern: string;
  example_basic: string;
  example_advanced: string;
};

export type Reading = {
  title: string;
  text: string;
  embedded_words: string[];
  translation_tw: string;
};

export type ListeningSpeakingItem = {
  id: number;
  sentence: string;
  pronunciation_tips_tw: string;
  shadowing_steps_tw: string;
  focus: "linking" | "reduction" | "stress" | "intonation" | "flap t";
};

export type ToeflSkillDrill = {
  skill_type: string;
  instruction_tw: string;
  prompt: string;
  response_framework: string;
  sample_answer: string;
  useful_phrases: string[];
};

export type QuizItem = {
  question_id: number;
  question: string;
  options: string[];
  answer: string;
  explanation_tw: string;
};

export type GmailEmail = {
  recipient: string;
  subject: string;
  html_body: string;
};

export type HistoryUpdate = {
  new_words_today: string[];
  review_words_today: string[];
  grammar_today: string;
  theme_today: string;
  skill_type_today: string;
};

export type LessonData = {
  metadata: LessonMetadata;
  vocabulary: VocabularyItem[];
  grammar_focus: GrammarFocus;
  reading: Reading;
  listening_speaking: ListeningSpeakingItem[];
  toefl_skill_drill: ToeflSkillDrill;
  daily_quiz: QuizItem[];
  gmail_email: GmailEmail;
  history_update: HistoryUpdate;
};

export type LessonIndexItem = {
  day: number;
  file: string;
  date_label: string;
  theme: string;
  phase: string;
  level: string;
  skill_type: string;
  vocabulary_count: number;
  new_count: number;
  review_count: number;
};

export type CompletionState = {
  summary: boolean;
  dashboard: boolean;
  vocabulary: boolean;
  reading: boolean;
  speaking: boolean;
  drill: boolean;
  quiz: boolean;
};
