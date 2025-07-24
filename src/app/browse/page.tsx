'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import QuizList from '@/components/QuizList'
import { QuizStorage } from '@/types/quiz'
import { loadQuizzesFromStorage, saveQuizzesToStorage } from '@/lib/storage'

export default function BrowseQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizStorage[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadedQuizzes = loadQuizzesFromStorage()
    setQuizzes(loadedQuizzes)
  }, [])

  const handleTakeQuiz = (quiz: QuizStorage) => {
    // Mark quiz as in progress when starting (unless already complete)
    if (!quiz.title.includes('(Complete)') && !quiz.title.includes('(In Progress)')) {
      setQuizzes(prev => {
        const updatedQuizzes = prev.map(q => {
          if (q.id === quiz.id) {
            return {
              ...q,
              title: q.title + ' (In Progress)'
            }
          }
          return q
        })
        saveQuizzesToStorage(updatedQuizzes)
        return updatedQuizzes
      })
    }
    
    // Store the quiz in sessionStorage to pass to the session page
    const quizToStore = quiz.title.includes('(In Progress)') ? quiz : { ...quiz, title: quiz.title + ' (In Progress)' }
    sessionStorage.setItem('currentQuiz', JSON.stringify(quizToStore))
    router.push('/session')
  }

  const handleDeleteQuiz = (quizToDelete: QuizStorage) => {
    setQuizzes(prev => {
      const updatedQuizzes = prev.filter(quiz => quiz.id !== quizToDelete.id)
      saveQuizzesToStorage(updatedQuizzes)
      return updatedQuizzes
    })
  }

  return (
    <AppLayout activeTab="browse" onTabChange={() => {}} quizCount={quizzes.length}>
      <div className="animate-in fade-in duration-500">
        <QuizList 
          quizzes={quizzes} 
          onTakeQuiz={handleTakeQuiz}
          onDeleteQuiz={handleDeleteQuiz}
        />
      </div>
    </AppLayout>
  )
}