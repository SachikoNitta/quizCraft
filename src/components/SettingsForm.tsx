'use client'

import { useState } from 'react'
import { AppSettings, SUPPORTED_LANGUAGES } from '@/types/quiz'
import { saveSettingsToStorage } from '@/lib/storage'
import { Key, Globe, Save, CheckCircle } from 'lucide-react'

interface SettingsFormProps {
  settings: AppSettings
  onUpdate: () => void
}

export default function SettingsForm({ settings, onUpdate }: SettingsFormProps) {
  const [formData, setFormData] = useState<AppSettings>(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      saveSettingsToStorage(formData)
      setSaved(true)
      onUpdate()
      
      // Reset saved state after 2 seconds
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const isValid = formData.apiKey.trim().length > 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-slate-700 mb-2">Settings</h2>
        <p className="text-slate-500">Configure your API key and default language</p>
      </div>

      <div className="glass-card rounded-3xl p-8">
        <div className="space-y-6">
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
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
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
            <label htmlFor="language" className="flex items-center text-sm font-medium text-slate-600 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-button-secondary flex items-center justify-center mr-3">
                <Globe className="w-4 h-4 text-white" />
              </div>
              Default Language
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
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
              Default language for generating questions and explanations
            </p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className={`w-full flex items-center justify-center px-6 py-4 font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300/50 ${
              saved
                ? 'bg-green-500 text-white'
                : isValid
                  ? 'bg-gradient-button-primary text-white hover:shadow-lg hover:scale-[1.02]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle className="mr-3 h-5 w-5" />
                Settings Saved!
              </>
            ) : isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-3 h-5 w-5" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {!isValid && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-2xl">
            <p className="text-sm text-orange-600">
              Please enter your Gemini API key to save settings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}