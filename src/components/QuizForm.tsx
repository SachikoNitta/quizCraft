'use client'

import { useState } from 'react'
import { QuizConfig, SUPPORTED_LANGUAGES } from '@/types/quiz'
import { Play, Key, FileText, Hash, Globe } from 'lucide-react'

interface QuizFormProps {
  onStartQuiz: (config: QuizConfig) => void
}

export default function QuizForm({ onStartQuiz }: QuizFormProps) {
  const [config, setConfig] = useState<QuizConfig>({
    apiKey: '',
    certificateName: '',
    numberOfQuestions: 5,
    language: 'en'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onStartQuiz(config)
  }

  return (
    <div className="w-full">
      <div className="glass-card rounded-3xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-slate-700 mb-2">Start Your Quiz</h2>
          <p className="text-slate-500">Begin your personalized certification practice session</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="flex items-center text-sm font-medium text-slate-600 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-button-secondary flex items-center justify-center mr-3">
                <Key className="w-4 h-4 text-white" />
              </div>
              Gemini API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              className="w-full px-4 py-4 bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all placeholder-slate-400 text-slate-700"
              placeholder="sk-..."
              required
            />
            <p className="text-xs text-slate-500 mt-2 pl-11">
              Get your API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-500 transition-colors"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="certificateName" className="flex items-center text-sm font-medium text-slate-600 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-button-secondary flex items-center justify-center mr-3">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Certificate Name
            </label>
            <input
              type="text"
              id="certificateName"
              value={config.certificateName}
              onChange={(e) => setConfig(prev => ({ ...prev, certificateName: e.target.value }))}
              className="w-full px-4 py-4 bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all placeholder-slate-400 text-slate-700"
              placeholder="AWS Solutions Architect, Google Cloud Professional..."
              required
            />
            <p className="text-xs text-slate-500 mt-2 pl-11">
              The certification you want to prepare for
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="language" className="flex items-center text-sm font-medium text-slate-600 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-button-secondary flex items-center justify-center mr-3">
                <Globe className="w-4 h-4 text-white" />
              </div>
              Quiz Language
            </label>
            <select
              id="language"
              value={config.language}
              onChange={(e) => setConfig(prev => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-4 bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all text-slate-700 cursor-pointer"
              required
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="py-2">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2 pl-11">
              Choose your preferred language for questions and explanations
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="numberOfQuestions" className="flex items-center text-sm font-medium text-slate-600 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-button-secondary flex items-center justify-center mr-3">
                <Hash className="w-4 h-4 text-white" />
              </div>
              Number of Questions
            </label>
            <input
              type="number"
              id="numberOfQuestions"
              min="1"
              max="20"
              value={config.numberOfQuestions}
              onChange={(e) => setConfig(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) }))}
              className="w-full px-4 py-4 bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all placeholder-slate-400 text-slate-700"
              required
            />
            <p className="text-xs text-slate-500 mt-2 pl-11">
              Choose between 1-20 questions for your quiz
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-4 mt-8 bg-gradient-button-primary text-white font-medium rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
          >
            <Play className="mr-3 h-5 w-5" />
            Start Quiz Session
          </button>
        </form>
      </div>
    </div>
  )
}