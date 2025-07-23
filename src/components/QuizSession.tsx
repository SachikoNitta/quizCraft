'use client'

import { useState, useEffect } from 'react'
import { QuizConfig, QuizSession, QuizQuestion } from '@/types/quiz'
import { Loader2, ArrowRight, Trophy, RotateCcw, XCircle } from 'lucide-react'
import QuestionCard from './QuestionCard'
import QuizProgress from './QuizProgress'
import QuizCompletion from './QuizCompletion'
import { useQuizNavigation } from '@/hooks/useQuizNavigation'

interface QuizSessionProps {
  config: QuizConfig
  existingQuestions?: QuizQuestion[]
  onComplete: (session: QuizSession) => void
  onSaveProgress: (session: QuizSession) => void
  onBack: () => void
}

export default function QuizSessionComponent({ config, existingQuestions, onComplete, onSaveProgress, onBack }: QuizSessionProps) {
  const [session, setSession] = useState<QuizSession>({
    id: `session-${Date.now()}`,
    certificateName: config.certificateName,
    language: config.language,
    targetQuestions: existingQuestions ? existingQuestions.length : config.numberOfQuizzes,
    currentQuestions: existingQuestions || [],
    answers: [],
    score: 0,
    completed: false,
    createdAt: new Date(),
    config
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPreparingQuestions, setIsPreparingQuestions] = useState(false)

  const quizNavigation = useQuizNavigation({
    questions: session.currentQuestions,
    onComplete: (results) => {
      const completedSession = {
        ...session,
        answers: results,
        score: results.filter(r => r.isCorrect).length,
        completed: true
      }
      setSession(completedSession)
      onComplete(completedSession)
    }
  })

  // Generate the first question on mount and start background generation only if no existing questions
  useEffect(() => {
    if (!existingQuestions || existingQuestions.length === 0) {
      generateNextQuestion()
      startBackgroundGeneration()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startBackgroundGeneration = async () => {
    setIsPreparingQuestions(true)
    
    // Generate questions in the background after the first one
    for (let i = 1; i < config.numberOfQuizzes; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // Stagger requests
        
        const response = await fetch('/api/generate-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config,
            questionNumber: i + 1
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.question) {
            setSession(prev => ({
              ...prev,
              currentQuestions: [...prev.currentQuestions, data.question]
            }))
          }
        }
      } catch (err) {
        console.warn(`Failed to generate background question ${i + 1}:`, err)
      }
    }
    
    setIsPreparingQuestions(false)
  }

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

  const handleSubmitAnswer = () => {
    const result = quizNavigation.handleSubmitAnswer()
    if (!result) return

    const updatedSession = {
      ...session,
      answers: result.newAnswers,
      score: result.score
    }

    setSession(updatedSession)
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
    if (quizNavigation.currentQuestionIndex + 1 < session.targetQuestions) {
      // Move to next question or generate if needed
      if (quizNavigation.currentQuestionIndex + 1 >= session.currentQuestions.length) {
        // Only generate if background generation hasn't provided the question yet
        generateNextQuestion()
      }
      quizNavigation.handleNext()
    } else {
      // Quiz completed - let the navigation hook handle completion
      quizNavigation.handleNext()
    }
  }

  const { currentQuestion } = quizNavigation

  if (isGenerating && (session.currentQuestions.length === 0 || quizNavigation.currentQuestionIndex >= session.currentQuestions.length)) {
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
                : `Generating Question ${quizNavigation.currentQuestionIndex + 1}`
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
                    style={{ width: `${(quizNavigation.currentQuestionIndex / session.targetQuestions) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">
                  {quizNavigation.currentQuestionIndex} of {session.targetQuestions} questions
                </p>
              </div>
            )}
            {isPreparingQuestions && (
              <div className="mt-4 text-xs text-slate-400">
                Preparing remaining questions in background...
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

  if (quizNavigation.isCompleted) {
    return (
      <QuizCompletion
        score={session.score}
        totalQuestions={session.targetQuestions}
        title={`${config.certificateName} quiz`}
        onBack={onBack}
        showRestartButton={false}
      />
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <QuizProgress
        currentQuestion={quizNavigation.currentQuestionIndex + 1}
        totalQuestions={session.targetQuestions}
        score={session.score}
        answeredQuestions={session.answers.length}
        showScore={true}
      />

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion}
        selectedAnswer={quizNavigation.selectedAnswer}
        hasAnswered={quizNavigation.hasAnswered}
        onAnswerSelect={quizNavigation.handleAnswerSelect}
        showExplanation={true}
      />

      <div className="glass-card rounded-3xl p-8">
        <div className="flex justify-between">
          <button
            onClick={handleExitQuiz}
            className="px-6 py-3 bg-white/60 text-slate-700 rounded-2xl font-medium hover:bg-white/80 transition-all"
          >
            Exit Quiz
          </button>

          {!quizNavigation.hasAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={quizNavigation.selectedAnswer === null}
              className="px-6 py-3 bg-gradient-button-primary text-white rounded-2xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-3 bg-gradient-button-primary text-white rounded-2xl font-medium hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              {quizNavigation.currentQuestionIndex + 1 < session.targetQuestions ? (
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
              {(isGenerating || (quizNavigation.currentQuestionIndex + 1 >= session.currentQuestions.length && quizNavigation.currentQuestionIndex + 1 < session.targetQuestions)) && (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}