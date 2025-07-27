'use client'

import { QuizStorage, SUPPORTED_LANGUAGES } from '@/types/quiz'
import { exportQuizAsJSON } from '@/lib/gemini'
import { loadCertificatesFromStorage } from '@/lib/storage'
import { Calendar, FileText, Trash2, Play, Globe, Clock, CheckCircle } from 'lucide-react'

interface QuizCardProps {
  quiz: QuizStorage
  index?: number
  onTakeQuiz: (quiz: QuizStorage) => void
  onDeleteQuiz?: (quiz: QuizStorage) => void
  showExportButtons?: boolean
}

export default function QuizCard({ quiz, index = 0, onTakeQuiz, onDeleteQuiz, showExportButtons = true }: QuizCardProps) {
  const isIncomplete = quiz.title.includes('(In Progress)')
  const isComplete = quiz.title.includes('(Complete)') || !quiz.title.includes('(In Progress)')
  
  const certificates = loadCertificatesFromStorage()
  const certificate = certificates.find(cert => cert.id === quiz.certificateId)
  const certificateName = certificate?.name || 'Unknown Certificate'

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeleteQuiz && confirm(`Are you sure you want to delete "${quiz.title.replace(' (Complete)', '').replace(' (In Progress)', '')}"?`)) {
      onDeleteQuiz(quiz)
    }
  }

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const jsonString = exportQuizAsJSON(quiz)
    try {
      await navigator.clipboard.writeText(jsonString)
      alert('QuizStorage JSON copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      alert('Failed to copy to clipboard')
    }
  }

  return (
    <div
      className="glass-card rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300 group floating-animation"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium text-slate-700 group-hover:text-slate-800 transition-colors mr-2">
                {quiz.title.replace(' (Complete)', '').replace(' (In Progress)', '')}
              </h3>
              {isIncomplete && (
                <div className="flex items-center bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  In Progress
                </div>
              )}
              {isComplete && !quiz.title.includes('(In Progress)') && (
                <div className="flex items-center bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-3">
              {certificateName}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ml-3 ${
            isIncomplete ? 'bg-gradient-to-br from-orange-400 to-yellow-400' : 'bg-gradient-button-secondary'
          }`}>
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
      
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
          <div className="flex items-center bg-white/40 px-2 py-1 rounded-full">
            <Calendar className="w-3 h-3 mr-1" />
            {quiz.createdAt.toLocaleDateString()}
          </div>
          <div className="flex items-center bg-white/40 px-2 py-1 rounded-full">
            <Globe className="w-3 h-3 mr-1" />
            {SUPPORTED_LANGUAGES.find(lang => lang.code === quiz.language)?.nativeName || 'English'}
          </div>
        </div>

        <div className="bg-gradient-pastel-accent rounded-2xl p-3 text-center mb-6">
          <p className="text-2xl font-light text-slate-600 mb-1">
            {quiz.questions.length}
          </p>
          <p className="text-xs text-slate-500">
            question{quiz.questions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={(e) => { e.stopPropagation(); onTakeQuiz(quiz); }}
          className="flex-1 bg-gradient-button-primary text-white font-medium py-3 px-4 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center group"
        >
          <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Start Quiz
        </button>
        
        {showExportButtons && (
          <>
            <button
              onClick={handleDelete}
              className="w-12 h-12 bg-red-50 hover:bg-red-100 border border-red-200/50 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
              title="Delete QuizStorage"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            
            <button
              onClick={copyToClipboard}
              className="w-12 h-12 bg-white/60 hover:bg-white/80 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
              title="Copy JSON to clipboard"
            >
              <FileText className="w-4 h-4 text-slate-600" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}