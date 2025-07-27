import { QuizStorage, QuizSession, Certificate, QuestionSet, QuizQuestion, AppSettings } from '@/types/quiz'

const STORAGE_KEYS = {
  QUIZZES: 'quizcraft_quizzes',
  SESSIONS: 'quizcraft_sessions',
  CERTIFICATES: 'quizcraft_certificates',
  QUESTION_SETS: 'quizcraft_question_sets',
  SETTINGS: 'quizcraft_settings'
}

// Helper to safely parse JSON from localStorage
function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback
  
  try {
    const parsed = JSON.parse(jsonString)
    return parsed || fallback
  } catch (error) {
    console.warn('Failed to parse localStorage data:', error)
    return fallback
  }
}

// Helper to safely stringify and store in localStorage
function safeJsonStore(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

// QuizStorage storage functions
export function loadQuizzesFromStorage(): QuizStorage[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEYS.QUIZZES)
  const quizzes = safeJsonParse(stored, [])
  
  // Convert date strings back to Date objects
  return quizzes.map((quiz: QuizStorage & { createdAt: string }) => ({
    ...quiz,
    createdAt: new Date(quiz.createdAt)
  }))
}

export function saveQuizzesToStorage(quizzes: QuizStorage[]): void {
  if (typeof window === 'undefined') return
  safeJsonStore(STORAGE_KEYS.QUIZZES, quizzes)
}

// Session storage functions
export function loadSessionsFromStorage(): Map<string, QuizSession> {
  if (typeof window === 'undefined') return new Map()
  
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS)
  const sessionsArray = safeJsonParse(stored, [])
  
  const sessionsMap = new Map<string, QuizSession>()
  
  sessionsArray.forEach(([id, session]: [string, QuizSession & { createdAt: string }]) => {
    const parsedSession = {
      ...session,
      createdAt: new Date(session.createdAt)
    }
    sessionsMap.set(id, parsedSession)
  })
  
  return sessionsMap
}

export function saveSessionsToStorage(sessions: Map<string, QuizSession>): void {
  if (typeof window === 'undefined') return
  
  const sessionsArray = Array.from(sessions.entries())
  safeJsonStore(STORAGE_KEYS.SESSIONS, sessionsArray)
}

// Settings storage functions
export function loadSettingsFromStorage(): AppSettings {
  if (typeof window === 'undefined') return { apiKey: '', language: 'en' }
  
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  const settings = safeJsonParse(stored, { apiKey: '', language: 'en' })
  
  return settings
}

export function saveSettingsToStorage(settings: AppSettings): void {
  if (typeof window === 'undefined') return
  safeJsonStore(STORAGE_KEYS.SETTINGS, settings)
}


// Certificate storage functions
export function loadCertificatesFromStorage(): Certificate[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEYS.CERTIFICATES)
  const certificates = safeJsonParse(stored, [])
  
  return certificates.map((cert: Certificate & { createdAt: string }) => ({
    ...cert,
    createdAt: new Date(cert.createdAt)
  }))
}

export function saveCertificatesToStorage(certificates: Certificate[]): void {
  if (typeof window === 'undefined') return
  safeJsonStore(STORAGE_KEYS.CERTIFICATES, certificates)
}

export function createCertificate(name: string, description?: string): Certificate {
  const certificate: Certificate = {
    id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    name,
    description,
    createdAt: new Date()
  }
  
  const certificates = loadCertificatesFromStorage()
  const existingCert = certificates.find(cert => cert.name.toLowerCase() === name.toLowerCase())
  
  if (existingCert) {
    throw new Error(`Certificate "${name}" already exists`)
  }
  
  certificates.push(certificate)
  saveCertificatesToStorage(certificates)
  
  return certificate
}


// Question Set storage functions
export function loadQuestionSetsFromStorage(): QuestionSet[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEYS.QUESTION_SETS)
  const questionSets = safeJsonParse(stored, [])
  
  return questionSets.map((set: QuestionSet & { createdAt: string; updatedAt: string }) => ({
    ...set,
    createdAt: new Date(set.createdAt),
    updatedAt: new Date(set.updatedAt)
  }))
}

export function saveQuestionSetsToStorage(questionSets: QuestionSet[]): void {
  if (typeof window === 'undefined') return
  safeJsonStore(STORAGE_KEYS.QUESTION_SETS, questionSets)
}

export function getQuestionSetByCertificateId(certificateId: string): QuestionSet | undefined {
  const questionSets = loadQuestionSetsFromStorage()
  return questionSets.find(set => set.certificateId === certificateId)
}

export function createOrUpdateQuestionSet(certificateId: string, questions: QuizQuestion[]): QuestionSet {
  const questionSets = loadQuestionSetsFromStorage()
  const existingSet = questionSets.find(set => set.certificateId === certificateId)
  
  if (existingSet) {
    existingSet.questions = [...existingSet.questions, ...questions]
    existingSet.updatedAt = new Date()
  } else {
    const newSet: QuestionSet = {
      id: `qset_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      certificateId,
      questions,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    questionSets.push(newSet)
  }
  
  saveQuestionSetsToStorage(questionSets)
  return existingSet || questionSets[questionSets.length - 1]
}

// Get storage usage info
export function getStorageInfo(): { quizCount: number; sessionCount: number; certificateCount: number; questionSetCount: number; estimatedSize: string } {
  if (typeof window === 'undefined') return { quizCount: 0, sessionCount: 0, certificateCount: 0, questionSetCount: 0, estimatedSize: '0 KB' }
  
  const quizzes = loadQuizzesFromStorage()
  const sessions = loadSessionsFromStorage()
  const certificates = loadCertificatesFromStorage()
  const questionSets = loadQuestionSetsFromStorage()
  
  const quizData = localStorage.getItem(STORAGE_KEYS.QUIZZES) || ''
  const sessionData = localStorage.getItem(STORAGE_KEYS.SESSIONS) || ''
  const certData = localStorage.getItem(STORAGE_KEYS.CERTIFICATES) || ''
  const questionSetData = localStorage.getItem(STORAGE_KEYS.QUESTION_SETS) || ''
  const totalSize = new Blob([quizData + sessionData + certData + questionSetData]).size
  
  return {
    quizCount: quizzes.length,
    sessionCount: sessions.size,
    certificateCount: certificates.length,
    questionSetCount: questionSets.length,
    estimatedSize: totalSize > 1024 ? `${Math.round(totalSize / 1024)} KB` : `${totalSize} B`
  }
}