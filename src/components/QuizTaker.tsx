'use client'

import { useState } from 'react'
import { Quiz, QuizResult } from '@/types/quiz'
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

interface QuizTakerProps {
  quiz: Quiz
  onBack: () => void
}

export default function QuizTaker({ quiz, onBack }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizResult[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect
    }

    setAnswers(prev => [...prev, result])
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setQuizCompleted(true)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowExplanation(false)
    setQuizCompleted(false)
  }

  const calculateScore = () => {
    const correctAnswers = answers.filter(answer => answer.isCorrect).length
    return Math.round((correctAnswers / answers.length) * 100)
  }

  if (quizCompleted) {
    const score = calculateScore()
    const correctCount = answers.filter(answer => answer.isCorrect).length

    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="glass-card rounded-3xl p-8 text-center mb-8">
          <div className="mb-8">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              score >= 70 ? 'bg-gradient-to-br from-emerald-200 to-emerald-300' : 'bg-gradient-to-br from-rose-200 to-rose-300'
            }`}>
              {score >= 70 ? (
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              ) : (
                <XCircle className="w-12 h-12 text-rose-600" />
              )}
            </div>
          </div>

          <h2 className="text-4xl font-light text-slate-700 mb-3">Quiz Complete!</h2>
          <p className="text-xl text-slate-500 mb-8">
            You scored <span className="font-medium text-slate-700">{score}%</span> ({correctCount}/{answers.length} correct)
          </p>

          <div className="mb-8">
            <div className={`text-lg font-light px-6 py-3 rounded-2xl ${
              score >= 70 
                ? 'bg-emerald-100/60 text-emerald-700' 
                : 'bg-rose-100/60 text-rose-700'
            }`}>
              {score >= 70 ? '✨ Excellent work!' : '📖 Keep practicing!'}
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={handleRestartQuiz}
              className="bg-gradient-button-primary text-white font-medium px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={onBack}
              className="bg-white/60 text-slate-600 font-medium px-6 py-3 rounded-2xl hover:bg-white/80 transition-all duration-300 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Collection
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-light text-slate-700 mb-6 text-center">Review Your Answers</h3>
          {quiz.questions.map((question, index) => {
            const answer = answers[index]
            const isCorrect = answer?.isCorrect

            return (
              <div key={question.id} className="glass-card rounded-2xl p-6 text-left">
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                    isCorrect 
                      ? 'bg-emerald-100/60' 
                      : 'bg-rose-100/60'
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-700 mb-3">
                      {index + 1}. {question.question}
                    </p>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Your answer:</span> {question.options[answer?.selectedAnswer || 0]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-emerald-600">
                          <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-50/50 rounded-xl p-4">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="glass-card rounded-3xl p-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-slate-500 hover:text-slate-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collection
          </button>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light text-slate-700">{quiz.title}</h2>
            <div className="bg-white/60 px-4 py-2 rounded-full">
              <span className="text-sm text-slate-600">
                {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>
          </div>

          <div className="w-full bg-white/40 rounded-full h-3 mb-8">
            <div
              className="bg-gradient-button-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-pastel-secondary rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-medium text-slate-700 leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-6 glass-card rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                  selectedAnswer === index
                    ? 'ring-2 ring-purple-300 bg-white/60'
                    : 'hover:bg-white/50'
                } ${showExplanation ? 'cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => !showExplanation && handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors ${
                  selectedAnswer === index
                    ? 'border-purple-400 bg-purple-400'
                    : 'border-slate-300 bg-white/60'
                }`}>
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-slate-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {showExplanation && (
          <div className={`mb-8 glass-card rounded-2xl p-6 ${
            selectedAnswer === currentQuestion.correctAnswer
              ? 'border-l-4 border-emerald-400'
              : 'border-l-4 border-rose-400'
          }`}>
            <div className="flex items-start">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-emerald-100/60'
                  : 'bg-rose-100/60'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600" />
                )}
              </div>
              <div>
                <p className={`font-medium mb-3 text-lg ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? '✨ Correct!' : '💡 Not quite right'}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-white/50">
          <div className="bg-white/60 px-4 py-2 rounded-full">
            <span className="text-sm text-slate-600">
              Progress: {answers.length}/{quiz.questions.length} answered
            </span>
          </div>

          {!showExplanation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="bg-gradient-button-primary text-white font-medium px-8 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-gradient-button-primary text-white font-medium px-8 py-3 rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {isLastQuestion ? '🎯 Finish Quiz' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}