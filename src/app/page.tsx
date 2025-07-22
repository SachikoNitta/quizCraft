'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/AppLayout'
import QuizForm from '@/components/QuizForm'
import QuizList from '@/components/QuizList'
import QuizTaker from '@/components/QuizTaker'
import QuizSessionComponent from '@/components/QuizSession'
import { Quiz, QuizConfig, QuizSession } from '@/types/quiz'
import { loadQuizzesFromStorage, saveQuizzesToStorage, loadSessionsFromStorage, saveSessionsToStorage } from '@/lib/storage'

export default function Home() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentConfig, setCurrentConfig] = useState<QuizConfig | null>(null)
  const [activeTab, setActiveTab] = useState<'generate' | 'browse' | 'test'>('generate')
  const [savedSessions, setSavedSessions] = useState<Map<string, QuizSession>>(new Map())

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedQuizzes = loadQuizzesFromStorage()
    const loadedSessions = loadSessionsFromStorage()
    
    setQuizzes(loadedQuizzes)
    setSavedSessions(loadedSessions)
  }, [])

  // Save quizzes to localStorage whenever they change (skip initial empty state)
  useEffect(() => {
    // Only save if we have loaded initial data and have changes
    const timer = setTimeout(() => {
      saveQuizzesToStorage(quizzes)
    }, 100) // Small delay to avoid saving on initial mount

    return () => clearTimeout(timer)
  }, [quizzes])

  // Save sessions to localStorage whenever they change (skip initial empty state)
  useEffect(() => {
    // Only save if we have loaded initial data and have changes
    const timer = setTimeout(() => {
      saveSessionsToStorage(savedSessions)
    }, 100) // Small delay to avoid saving on initial mount

    return () => clearTimeout(timer)
  }, [savedSessions])

  const handleStartQuiz = (config: QuizConfig) => {
    setCurrentConfig(config)
    setActiveTab('test')
  }

  const handleSaveProgress = (session: QuizSession) => {
    // Save the session for later browsing
    setSavedSessions(prev => new Map(prev).set(session.id, session))
    
    // If there are answered questions, convert them to a browseable quiz
    if (session.currentQuestions.length > 0) {
      const quiz: Quiz = {
        id: session.id,
        title: `${session.certificateName} Practice Quiz ${session.completed ? '(Complete)' : '(In Progress)'}`,
        certificateName: session.certificateName,
        language: session.language,
        questions: session.currentQuestions,
        createdAt: session.createdAt
      }
      
      setQuizzes(prev => {
        const existing = prev.find(q => q.id === session.id)
        if (existing) {
          // Update existing quiz
          return prev.map(q => q.id === session.id ? quiz : q)
        } else {
          // Add new quiz
          return [...prev, quiz]
        }
      })
    }
  }

  const handleSessionComplete = (session: QuizSession) => {
    // Mark session as completed and save
    const completedSession = { ...session, completed: true }
    handleSaveProgress(completedSession)
    setCurrentConfig(null)
    setActiveTab('browse')
  }

  const handleTakeQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz)
    setActiveTab('test')
  }

  const handleBackToBrowse = () => {
    setCurrentQuiz(null)
    setCurrentConfig(null)
    setActiveTab('browse')
  }

  const handleBackToGenerate = () => {
    setCurrentQuiz(null)
    setCurrentConfig(null)
    setActiveTab('generate')
  }

  const handleTabChange = (tab: 'generate' | 'browse' | 'test') => {
    if (tab !== 'test') {
      setCurrentQuiz(null)
      setCurrentConfig(null)
    }
    setActiveTab(tab)
  }

  return (
    <AppLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      quizCount={quizzes.length}
    >
      {activeTab === 'generate' && (
        <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
          <QuizForm onStartQuiz={handleStartQuiz} />
        </div>
      )}

      {activeTab === 'browse' && !currentQuiz && !currentConfig && (
        <div className="animate-in fade-in duration-500">
          <QuizList quizzes={quizzes} onTakeQuiz={handleTakeQuiz} />
        </div>
      )}

      {activeTab === 'test' && currentConfig && !currentQuiz && (
        <div className="animate-in fade-in duration-500">
          <QuizSessionComponent 
            config={currentConfig} 
            onComplete={handleSessionComplete}
            onSaveProgress={handleSaveProgress}
            onBack={handleBackToGenerate}
          />
        </div>
      )}

      {activeTab === 'test' && currentQuiz && !currentConfig && (
        <div className="animate-in fade-in duration-500">
          <QuizTaker quiz={currentQuiz} onBack={handleBackToBrowse} />
        </div>
      )}
    </AppLayout>
  )
}
