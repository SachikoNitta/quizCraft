export interface AppSettings {
  apiKey: string
  language: string
}

export interface Certificate {
  id: string
  name: string
  description?: string
  createdAt: Date
  questionSetId?: string
}

export interface QuizConfig {
  apiKey: string
  certificateId: string
  certificateName: string
  numberOfQuestions: number
  language: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface QuizResult {
  questionId: string
  selectedAnswer: number
  isCorrect: boolean
}

export interface QuizSession {
  id: string
  currentQuestions: QuizQuestion[]
  userAnswers: QuizResult[]
  score: number
  completed: boolean
  createdAt: Date
  config: QuizConfig
}

export interface QuestionSet {
  id: string
  certificateId: string
  questions: QuizQuestion[]
  createdAt: Date
  updatedAt: Date
}

export interface QuizStorage {
  id: string
  title: string
  certificateId: string
  language: string
  questions: QuizQuestion[]
  createdAt: Date
}

export interface ActiveQuizSession {
  session: QuizSession
  currentQuestionIndex: number
  isGeneratingNext: boolean
}

export interface QuizGenerationProgress {
  completed: number
  total: number
  currentBatch: number
  totalBatches: number
  status: string
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' }
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']