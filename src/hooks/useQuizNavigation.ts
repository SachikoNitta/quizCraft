import { useState } from 'react'
import { QuizQuestion, QuizResult } from '@/types/quiz'

interface UseQuizNavigationProps {
  questions: QuizQuestion[]
  onComplete?: (results: QuizResult[]) => void
}

export function useQuizNavigation({ questions, onComplete }: UseQuizNavigationProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [answers, setAnswers] = useState<QuizResult[]>([])
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const score = answers.filter(answer => answer.isCorrect).length

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || hasAnswered || !currentQuestion) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect
    }

    const newAnswers = [...answers, result]
    setAnswers(newAnswers)
    setHasAnswered(true)

    return { result, newAnswers, score: newAnswers.filter(a => a.isCorrect).length }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setIsCompleted(true)
      onComplete?.(answers)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setHasAnswered(false)
    }
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setHasAnswered(false)
    setAnswers([])
    setIsCompleted(false)
  }

  const calculateScore = () => {
    const correctAnswers = answers.filter(answer => answer.isCorrect).length
    return Math.round((correctAnswers / answers.length) * 100)
  }

  return {
    // State
    currentQuestionIndex,
    selectedAnswer,
    hasAnswered,
    answers,
    isCompleted,
    currentQuestion,
    isLastQuestion,
    progress,
    score,
    
    // Actions
    handleAnswerSelect,
    handleSubmitAnswer,
    handleNext,
    handleRestart,
    calculateScore,
    
    // Setters for special cases
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setHasAnswered,
    setAnswers,
    setIsCompleted
  }
}