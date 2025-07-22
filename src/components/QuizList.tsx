'use client'

import { Quiz, SUPPORTED_LANGUAGES } from '@/types/quiz'
import { exportQuizAsJSON } from '@/lib/gemini'
import { getStorageInfo } from '@/lib/storage'
import { Calendar, FileText, Download, Play, Globe, Clock, CheckCircle, HardDrive } from 'lucide-react'

interface QuizListProps {
  quizzes: Quiz[]
  onTakeQuiz: (quiz: Quiz) => void
}

export default function QuizList({ quizzes, onTakeQuiz }: QuizListProps) {
  const storageInfo = getStorageInfo()
  const handleExportQuiz = (quiz: Quiz, e: React.MouseEvent) => {
    e.stopPropagation()
    const jsonString = exportQuizAsJSON(quiz)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async (quiz: Quiz, e: React.MouseEvent) => {
    e.stopPropagation()
    const jsonString = exportQuizAsJSON(quiz)
    try {
      await navigator.clipboard.writeText(jsonString)
      alert('Quiz JSON copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      alert('Failed to copy to clipboard')
    }
  }

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
        {quizzes.map((quiz, index) => {
          const isIncomplete = quiz.title.includes('(In Progress)')
          const isComplete = quiz.title.includes('(Complete)') || !quiz.title.includes('(In Progress)')
          
          return (
            <div
              key={quiz.id}
              className="glass-card rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group floating-animation"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onTakeQuiz(quiz)}
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
                      {quiz.certificateName}
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

              <div className="bg-gradient-pastel-accent rounded-2xl p-3 text-center">
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
                className="flex-1 bg-gradient-button-primary text-white font-medium py-3 px-4 rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center group"
              >
                <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Start Quiz
              </button>
              
              <button
                onClick={(e) => handleExportQuiz(quiz, e)}
                className="w-12 h-12 bg-white/60 hover:bg-white/80 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="Download as JSON"
              >
                <Download className="w-4 h-4 text-slate-600" />
              </button>
              
              <button
                onClick={(e) => copyToClipboard(quiz, e)}
                className="w-12 h-12 bg-white/60 hover:bg-white/80 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="Copy JSON to clipboard"
              >
                <FileText className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}