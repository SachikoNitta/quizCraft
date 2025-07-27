'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import QuizSessionComponent from '@/components/QuizSession'
import { QuizStorage, QuizConfig, QuizSession } from '@/types/quiz'
import { loadQuizzesFromStorage, saveQuizzesToStorage, loadSessionsFromStorage, saveSessionsToStorage, loadCertificatesFromStorage, loadSettingsFromStorage } from '@/lib/storage'

export default function QuizSessionPage() {
  const [currentConfig, setCurrentConfig] = useState<QuizConfig | null>(null)
  const [currentQuiz, setCurrentQuiz] = useState<QuizStorage | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Load data from sessionStorage
    const configData = sessionStorage.getItem('quizConfig')
    const quizData = sessionStorage.getItem('currentQuiz')
    
    if (configData) {
      setCurrentConfig(JSON.parse(configData))
    } else if (quizData) {
      setCurrentQuiz(JSON.parse(quizData))
    } else {
      // No data found, redirect to home
      router.push('/')
      return
    }
  }, [router])

  const handleSaveProgress = (session: QuizSession) => {
    if (session.completed) {
      // Save completed quiz
      const certificates = loadCertificatesFromStorage()
      const certificate = certificates.find(cert => cert.id === session.config.certificateId)
      const certificateName = certificate?.name || 'Unknown Certificate'
      
      const quiz: QuizStorage = {
        id: session.id,
        title: `${certificateName} Practice Quiz (Complete)`,
        certificateId: session.config.certificateId,
        language: session.config.language,
        questions: session.currentQuestions,
        createdAt: session.createdAt
      }
      
      const existingQuizzes = loadQuizzesFromStorage()
      const existing = existingQuizzes.find(q => q.id === session.id)
      let updatedQuizzes
      if (existing) {
        // Update existing quiz
        updatedQuizzes = existingQuizzes.map(q => q.id === session.id ? quiz : q)
      } else {
        // Add new quiz
        updatedQuizzes = [...existingQuizzes, quiz]
      }
      saveQuizzesToStorage(updatedQuizzes)
    }

    // Save session progress
    const sessions = loadSessionsFromStorage()
    sessions.set(session.id, session)
    saveSessionsToStorage(sessions)
  }

  const handleSessionComplete = (session: QuizSession) => {
    if (currentConfig) {
      // This is a new quiz session from QuizStorageForm - save it
      const completedSession = { ...session, completed: true }
      handleSaveProgress(completedSession)
    } else if (currentQuiz) {
      // This is an existing quiz from browsing - update its completion status
      const loadedQuizzes = loadQuizzesFromStorage()
      const updatedQuizzes = loadedQuizzes.map(quiz => {
        if (quiz.id === currentQuiz.id) {
          return {
            ...quiz,
            title: quiz.title.replace(' (In Progress)', '').replace(' (Complete)', '') + ' (Complete)'
          }
        }
        return quiz
      })
      saveQuizzesToStorage(updatedQuizzes)
    }
    
    // Clear sessionStorage and redirect
    sessionStorage.removeItem('quizConfig')
    sessionStorage.removeItem('currentQuiz')
    router.push('/certificates')
  }

  const handleBack = () => {
    // Clear sessionStorage and redirect
    sessionStorage.removeItem('quizConfig')
    sessionStorage.removeItem('currentQuiz')
    
    router.push('/certificates')
  }

  if (!currentConfig && !currentQuiz) {
    return (
      <AppLayout activeTab="certificates" onTabChange={() => {}}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <h2 className="text-xl text-slate-600 mb-4">Loading quiz session...</h2>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout activeTab="certificates" onTabChange={() => {}}>
      <div className="animate-in fade-in duration-500">
        <QuizSessionComponent 
          config={currentConfig || {
            apiKey: loadSettingsFromStorage().apiKey,
            certificateId: currentQuiz!.certificateId,
            certificateName: loadCertificatesFromStorage().find(cert => cert.id === currentQuiz!.certificateId)?.name || 'Unknown',
            language: currentQuiz!.language,
            numberOfQuestions: currentQuiz!.questions.length
          }}
          existingQuestions={currentQuiz?.questions}
          onComplete={handleSessionComplete}
          onSaveProgress={currentConfig ? handleSaveProgress : () => {}} // Don't save progress for existing quiz attempts
          onBack={handleBack}
        />
      </div>
    </AppLayout>
  )
}