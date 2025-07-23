'use client'

import { CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react'

interface QuizCompletionProps {
  score: number
  totalQuestions: number
  title?: string
  onRestart?: () => void
  onBack: () => void
  showRestartButton?: boolean
}

export default function QuizCompletion({
  score,
  totalQuestions,
  title,
  onRestart,
  onBack,
  showRestartButton = false
}: QuizCompletionProps) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const isPassingGrade = percentage >= 70

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="glass-card rounded-3xl p-8 text-center mb-8">
        <div className="mb-8">
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
            isPassingGrade 
              ? 'bg-gradient-to-br from-emerald-200 to-emerald-300' 
              : 'bg-gradient-to-br from-rose-200 to-rose-300'
          }`}>
            {isPassingGrade ? (
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-600" />
            )}
          </div>
        </div>

        <h2 className="text-4xl font-light text-slate-700 mb-3">Quiz Complete!</h2>
        <p className="text-xl text-slate-500 mb-8">
          You scored <span className="font-medium text-slate-700">{percentage}%</span> ({score}/{totalQuestions} correct)
          {title && <span className="block text-base mt-2">on your {title}</span>}
        </p>

        <div className="mb-8">
          <div className={`text-lg font-light px-6 py-3 rounded-2xl ${
            isPassingGrade 
              ? 'bg-emerald-100/60 text-emerald-700' 
              : 'bg-rose-100/60 text-rose-700'
          }`}>
            {isPassingGrade ? '✨ Excellent work!' : '📖 Keep practicing!'}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          {showRestartButton && onRestart && (
            <button
              onClick={onRestart}
              className="bg-gradient-button-primary text-white font-medium px-6 py-3 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          )}
          <button
            onClick={onBack}
            className="bg-white/60 text-slate-600 font-medium px-6 py-3 rounded-2xl hover:bg-white/80 transition-all duration-300 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {showRestartButton ? 'Back to Collection' : 'Back to Quiz Menu'}
          </button>
        </div>
      </div>
    </div>
  )
}