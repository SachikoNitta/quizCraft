'use client'

import { useState, useEffect } from 'react'
import { QuizConfig, QuizSession, QuizQuestion } from '@/types/quiz'
import { loadCertificatesFromStorage } from '@/lib/storage'
import { Loader2, ArrowRight, Trophy } from 'lucide-react'
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
    currentQuestions: existingQuestions || [],
    userAnswers: [],
    score: 0,
    completed: false,
    createdAt: new Date(),
    config: existingQuestions ? {
      ...config,
      numberOfQuestions: existingQuestions.length
    } : config
  })

  // Get certificate name from ID
  const certificates = loadCertificatesFromStorage()
  const certificate = certificates.find(cert => cert.id === config.certificateId)
  const certificateName = certificate?.name || 'Unknown Certificate'

  const [isPreparingQuestions, setIsPreparingQuestions] = useState(false)

  const quizNavigation = useQuizNavigation({
    questions: session.currentQuestions,
    onComplete: (results) => {
      const completedSession = {
        ...session,
        userAnswers: results,
        score: results.filter(r => r.isCorrect).length,
        completed: true
      }
      setSession(completedSession)
      onComplete(completedSession)
    }
  })

  // Start background generation
  useEffect(() => {
    startBackgroundGeneration()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const startBackgroundGeneration = async () => {
    setIsPreparingQuestions(true)
    
    // Calculate how many more questions we need to generate
    const questionsNeeded = session.config.numberOfQuestions - session.currentQuestions.length
    
    // Generate only the required number of questions
    for (let i = 0; i < questionsNeeded; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // Stagger requests
        
        const response = await fetch('/api/generate-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config,
            questionNumber: session.currentQuestions.length + i + 1
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
        console.warn(`Failed to generate background question ${session.currentQuestions.length + i + 1}:`, err)
      }
    }
    
    setIsPreparingQuestions(false)
  }

  const handleSubmitAnswer = () => {
    const result = quizNavigation.handleSubmitAnswer()
    if (!result) return

    const updatedSession = {
      ...session,
      userAnswers: result.newAnswers,
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
    quizNavigation.handleNext()
  }

  const { currentQuestion } = quizNavigation

  // 一問目の生成中は特別なUIを表示
  if (session.currentQuestions.length === 0) {
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
              Creating personalized {certificateName} questions...
            </p>
            {session.currentQuestions.length > 0 && (
              <div className="mt-4">
                <div className="w-full bg-white/40 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-button-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(quizNavigation.currentQuestionIndex / session.config.numberOfQuestions) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">
                  {quizNavigation.currentQuestionIndex} of {session.config.numberOfQuestions} questions
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

  // Quiz is completed
  if (session.completed) {
    return (
      <QuizCompletion
        score={session.score}
        totalQuestions={session.config.numberOfQuestions}
        title={`${certificateName} quiz`}
        onBack={onBack}
        showRestartButton={false}
      />
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <QuizProgress
        currentQuestion={quizNavigation.currentQuestionIndex + 1}
        totalQuestions={session.config.numberOfQuestions}
        score={session.score}
        answeredQuestions={session.userAnswers.length}
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
              {quizNavigation.currentQuestionIndex + 1 < session.config.numberOfQuestions ? (
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
              {(quizNavigation.currentQuestionIndex + 1 >= session.currentQuestions.length && quizNavigation.currentQuestionIndex + 1 < session.config.numberOfQuestions) && (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}