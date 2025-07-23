'use client'

import { Quiz } from '@/types/quiz'
import { getStorageInfo } from '@/lib/storage'
import { FileText, HardDrive } from 'lucide-react'
import QuizCard from './QuizCard'

interface QuizListProps {
  quizzes: Quiz[]
  onTakeQuiz: (quiz: Quiz) => void
  onDeleteQuiz: (quiz: Quiz) => void
}

export default function QuizList({ quizzes, onTakeQuiz, onDeleteQuiz }: QuizListProps) {
  const storageInfo = getStorageInfo()

  if (quizzes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-pastel-accent mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-light text-slate-600 mb-2">No quizzes yet</h3>
          <p className="text-slate-500">
            Create your first quiz to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-slate-700 mb-2">Your Quiz Collection</h2>
        <p className="text-slate-500 mb-3">{quizzes.length} quiz{quizzes.length !== 1 ? 'es' : ''} ready for practice</p>
        <div className="flex items-center justify-center text-xs text-slate-400 bg-white/30 rounded-full px-3 py-1 w-fit mx-auto">
          <HardDrive className="w-3 h-3 mr-1" />
          Stored locally • {storageInfo.estimatedSize}
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 grid-cols-6 grid-cols-8">
        {quizzes.map((quiz, index) => (
          <QuizCard 
            key={quiz.id}
            quiz={quiz}
            index={index}
            onTakeQuiz={onTakeQuiz}
            onDeleteQuiz={onDeleteQuiz}
            showExportButtons={true}
          />
        ))}
      </div>
    </div>
  )
}