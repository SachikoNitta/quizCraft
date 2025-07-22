'use client'

import { useState, useEffect } from 'react'
import { QuizConfig, QuizSession, QuizResult } from '@/types/quiz'
import { Loader2, CheckCircle, XCircle, ArrowRight, Trophy, RotateCcw } from 'lucide-react'

interface QuizSessionProps {
  config: QuizConfig
  onComplete: (session: QuizSession) => void
  onSaveProgress: (session: QuizSession) => void
  onBack: () => void
}

export default function QuizSessionComponent({ config, onComplete, onSaveProgress, onBack }: QuizSessionProps) {
  const [session, setSession] = useState<QuizSession>({
    id: `session-${Date.now()}`,
    certificateName: config.certificateName,
    language: config.language,
    targetQuestions: config.numberOfQuizzes,
    currentQuestions: [],
    answers: [],
    score: 0,
    completed: false,
    createdAt: new Date(),
    config
  })
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate the first question on mount
  useEffect(() => {
    generateNextQuestion()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const generateNextQuestion = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config,
          questionNumber: session.currentQuestions.length + 1
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.question) {
        throw new Error('No question data received from server')
      }

      setSession(prev => ({
        ...prev,
        currentQuestions: [...prev.currentQuestions, data.question]
      }))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate question')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || hasAnswered) return

    const currentQuestion = session.currentQuestions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect
    }

    const newAnswers = [...session.answers, result]
    const newScore = newAnswers.filter(a => a.isCorrect).length

    const updatedSession = {
      ...session,
      answers: newAnswers,
      score: newScore
    }

    setSession(updatedSession)
    setHasAnswered(true)

    // Save progress after each answer
    onSaveProgress(updatedSession)
  }

  const handleExitQuiz = () => {
    // Save current progress before exiting
    if (session.currentQuestions.length > 0) {
      onSaveProgress(session)
    }
    onBack()
  }

  const handleNext = () => {
    if (currentQuestionIndex + 1 < session.targetQuestions) {
      // Move to next question or generate if needed
      if (currentQuestionIndex + 1 >= session.currentQuestions.length) {
        generateNextQuestion()
      }
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setHasAnswered(false)
    } else {
      // Quiz completed
      const completedSession = {
        ...session,
        completed: true
      }
      setSession(completedSession)
      onComplete(completedSession)
    }
  }

  const currentQuestion = session.currentQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / session.targetQuestions) * 100

  if (isGenerating && (session.currentQuestions.length === 0 || currentQuestionIndex >= session.currentQuestions.length)) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-button-primary flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-light text-slate-700 mb-4">
              {session.currentQuestions.length === 0 
                ? "Generating Your First Question"
                : `Generating Question ${currentQuestionIndex + 1}`
              }
            </h2>
            <p className="text-slate-500">
              Creating personalized {config.certificateName} questions...
            </p>
            {session.currentQuestions.length > 0 && (
              <div className="mt-4">
                <div className="w-full bg-white/40 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-button-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentQuestionIndex / session.targetQuestions) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">
                  {currentQuestionIndex} of {session.targetQuestions} questions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error && session.currentQuestions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-light text-slate-700 mb-4">Generation Failed</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={generateNextQuestion}
                className="px-6 py-3 bg-gradient-button-primary text-white rounded-2xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2 inline" />
                Try Again
              </button>
              <button
                onClick={handleExitQuiz}
                className="px-6 py-3 bg-white/60 text-slate-700 rounded-2xl font-medium hover:bg-white/80 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return null
  }

  if (session.completed) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="glass-card rounded-3xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-button-primary flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-light text-slate-700 mb-4">Quiz Completed!</h2>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {session.score}/{session.targetQuestions}
            </div>
            <p className="text-slate-500 mb-8">
              You scored {Math.round((session.score / session.targetQuestions) * 100)}% on your {config.certificateName} quiz
            </p>
            <button
              onClick={onBack}
              className="px-8 py-4 bg-gradient-button-primary text-white rounded-2xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Back to Quiz Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-600 font-medium">
            Question {currentQuestionIndex + 1} of {session.targetQuestions}
          </span>
          <span className="text-sm text-slate-600">
            Score: {session.score}/{session.answers.length}
          </span>
        </div>
        <div className="w-full bg-white/40 rounded-full h-2">
          <div
            className="bg-gradient-button-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card rounded-3xl p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-slate-700 mb-2">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={hasAnswered}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                hasAnswered
                  ? index === currentQuestion.correctAnswer
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-gray-100 border-gray-200 text-gray-600'
                  : selectedAnswer === index
                  ? 'bg-purple-100 border-purple-300 text-purple-800'
                  : 'bg-white/60 border-white/40 text-slate-700 hover:bg-white/80'
              }`}
            >
              <div className="flex items-center">
                {option}
                {hasAnswered && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
                )}
                {hasAnswered && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                  <XCircle className="w-5 h-5 ml-auto text-red-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {hasAnswered && (
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-6 mb-6">
            <h3 className="font-medium text-blue-700 mb-2">Explanation:</h3>
            <p className="text-blue-600 text-sm leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleExitQuiz}
            className="px-6 py-3 bg-white/60 text-slate-700 rounded-2xl font-medium hover:bg-white/80 transition-all"
          >
            Exit Quiz
          </button>

          {!hasAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="px-6 py-3 bg-gradient-button-primary text-white rounded-2xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-gradient-button-primary text-white rounded-2xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              {currentQuestionIndex + 1 < session.targetQuestions ? (
                <>
                  Next Question
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Complete Quiz
                  <Trophy className="w-4 h-4 ml-2" />
                </>
              )}
              {isGenerating && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}