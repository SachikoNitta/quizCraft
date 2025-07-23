'use client'

import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import QuizForm from '@/components/QuizForm'
import { QuizConfig } from '@/types/quiz'

export default function CreateQuizPage() {
  const router = useRouter()

  const handleStartQuiz = (config: QuizConfig) => {
    // Store the config in sessionStorage to pass to the session page
    sessionStorage.setItem('quizConfig', JSON.stringify(config))
    router.push('/session')
  }

  return (
    <AppLayout activeTab="generate" onTabChange={() => {}}>
      <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
        <QuizForm onStartQuiz={handleStartQuiz} />
      </div>
    </AppLayout>
  )
}