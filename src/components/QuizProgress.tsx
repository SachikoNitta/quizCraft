'use client'

interface QuizProgressProps {
  currentQuestion: number
  totalQuestions: number
  score?: number
  answeredQuestions?: number
  showScore?: boolean
}

export default function QuizProgress({ 
  currentQuestion, 
  totalQuestions, 
  score = 0, 
  answeredQuestions = 0,
  showScore = false 
}: QuizProgressProps) {
  const progress = (currentQuestion / totalQuestions) * 100

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-600 font-medium">
          Question {currentQuestion} of {totalQuestions}
        </span>
        {showScore && (
          <span className="text-sm text-slate-600">
            Score: {score}/{answeredQuestions}
          </span>
        )}
      </div>
      <div className="w-full bg-white/40 rounded-full h-2">
        <div
          className="bg-gradient-button-primary h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}