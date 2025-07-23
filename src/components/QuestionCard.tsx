'use client'

import { QuizQuestion } from '@/types/quiz'
import { CheckCircle, XCircle } from 'lucide-react'

interface QuestionCardProps {
  question: QuizQuestion
  selectedAnswer: number | null
  hasAnswered: boolean
  onAnswerSelect: (index: number) => void
  showExplanation?: boolean
}

export default function QuestionCard({ 
  question, 
  selectedAnswer, 
  hasAnswered, 
  onAnswerSelect,
  showExplanation = true 
}: QuestionCardProps) {
  return (
    <div className="glass-card rounded-3xl p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-slate-700 mb-2">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={hasAnswered}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              hasAnswered
                ? index === question.correctAnswer
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : index === selectedAnswer && selectedAnswer !== question.correctAnswer
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'bg-gray-100 border-gray-200 text-gray-600'
                : selectedAnswer === index
                ? 'bg-purple-100 border-purple-300 text-purple-800'
                : 'bg-white/60 border-white/40 text-slate-700 hover:bg-white/80'
            }`}
          >
            <div className="flex items-center">
              {option}
              {hasAnswered && index === question.correctAnswer && (
                <CheckCircle className="w-5 h-5 ml-auto text-green-600" />
              )}
              {hasAnswered && index === selectedAnswer && selectedAnswer !== question.correctAnswer && (
                <XCircle className="w-5 h-5 ml-auto text-red-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      {hasAnswered && showExplanation && (
        <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-6 mb-6">
          <h3 className="font-medium text-blue-700 mb-2">Explanation:</h3>
          <p className="text-blue-600 text-sm leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  )
}