import { QuizStorage, QuizSession } from '@/types/quiz'

const STORAGE_KEYS = {
  QUIZZES: 'quizcraft_quizzes',
  SESSIONS: 'quizcraft_sessions'
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

// Clear all stored data (useful for debugging or user preference)
export function clearAllStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEYS.QUIZZES)
    localStorage.removeItem(STORAGE_KEYS.SESSIONS)
  } catch (error) {
    console.warn('Failed to clear localStorage:', error)
  }
}

// Get storage usage info
export function getStorageInfo(): { quizCount: number; sessionCount: number; estimatedSize: string } {
  if (typeof window === 'undefined') return { quizCount: 0, sessionCount: 0, estimatedSize: '0 KB' }
  
  const quizzes = loadQuizzesFromStorage()
  const sessions = loadSessionsFromStorage()
  
  const quizData = localStorage.getItem(STORAGE_KEYS.QUIZZES) || ''
  const sessionData = localStorage.getItem(STORAGE_KEYS.SESSIONS) || ''
  const totalSize = new Blob([quizData + sessionData]).size
  
  return {
    quizCount: quizzes.length,
    sessionCount: sessions.size,
    estimatedSize: totalSize > 1024 ? `${Math.round(totalSize / 1024)} KB` : `${totalSize} B`
  }
}