'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Certificate, QuizConfig, QuizStorage } from '@/types/quiz'
import { 
  saveCertificatesToStorage, 
  getQuestionSetByCertificateId,
  createCertificate,
  loadSettingsFromStorage,
  createOrUpdateQuestionSet
} from '@/lib/storage'
import { FileText, Plus, Trash2, BookOpen, Settings, Eye, Zap, Play, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react'

interface CertificateManagerProps {
  certificates: Certificate[]
  onUpdate: () => void
}

export default function CertificateManager({ certificates, onUpdate }: CertificateManagerProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newCertName, setNewCertName] = useState('')
  const [newCertDescription, setNewCertDescription] = useState('')
  const [viewingQuestions, setViewingQuestions] = useState<Certificate | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    correctedName?: string
    description?: string
    suggestions?: string[]
    confidence: 'high' | 'medium' | 'low'
  } | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [isAutoDescription, setIsAutoDescription] = useState(false)
  const router = useRouter()

  const settings = loadSettingsFromStorage()
  const hasValidSettings = settings.apiKey.trim().length > 0

  const handleDeleteCertificate = (certificate: Certificate) => {
    if (confirm(`Are you sure you want to delete "${certificate.name}" and all its questions?`)) {
      const updatedCertificates = certificates.filter(cert => cert.id !== certificate.id)
      saveCertificatesToStorage(updatedCertificates)
      onUpdate()
    }
  }

  const validateCertificationName = async (name: string) => {
    if (!name.trim()) return
    
    if (!hasValidSettings) {
      alert('Please configure your API key in Settings first to enable certification validation')
      return
    }

    setIsValidating(true)
    setValidationResult(null)
    setShowValidation(false)
    
    try {
      const response = await fetch('/api/validate-certification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificationName: name.trim(),
          apiKey: settings.apiKey
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Validation API error:', errorData)
        
        // Show detailed error for debugging
        if (errorData.rawResponse) {
          console.log('AI Raw Response:', errorData.rawResponse)
          alert(`Validation failed. Raw AI response: ${errorData.rawResponse.substring(0, 200)}...`)
        } else {
          throw new Error(errorData.error || `Validation failed with status ${response.status}`)
        }
        return
      }

      const result = await response.json()
      
      setValidationResult(result)
      setShowValidation(true)
      
      // Auto-fill description if validation is successful and description is empty
      if (result.isValid && result.description && !newCertDescription.trim()) {
        setNewCertDescription(result.description)
        setIsAutoDescription(true)
      }
    } catch (error) {
      console.error('Validation error:', error)
      // Show error to user for debugging
      alert(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsValidating(false)
    }
  }

  const handleCreateCertificate = async () => {
    if (!newCertName.trim()) return
    
    try {
      const finalName = validationResult?.correctedName || newCertName.trim()
      createCertificate(finalName, newCertDescription.trim() || undefined)
      setIsCreatingNew(false)
      setNewCertName('')
      setNewCertDescription('')
      setValidationResult(null)
      setShowValidation(false)
      setIsAutoDescription(false)
      onUpdate()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create certificate')
    }
  }

  const handleNameChange = (name: string) => {
    setNewCertName(name)
    setValidationResult(null)
    setShowValidation(false)
  }

  const handleDescriptionChange = (description: string) => {
    setNewCertDescription(description)
    setIsAutoDescription(false) // User is manually editing, no longer auto-generated
  }

  const handleUseCorrectedName = () => {
    if (validationResult?.correctedName) {
      setNewCertName(validationResult.correctedName)
      // Auto-fill description when using corrected name
      if (validationResult.description && !newCertDescription.trim()) {
        setNewCertDescription(validationResult.description)
        setIsAutoDescription(true)
      }
      setValidationResult({ ...validationResult, isValid: true })
    }
  }

  const handleUseSuggestion = async (suggestion: string) => {
    setNewCertName(suggestion)
    setValidationResult(null)
    setShowValidation(false)
    
    // Auto-validate the suggestion to get its description
    if (hasValidSettings) {
      await validateCertificationName(suggestion)
    }
  }

  const handleGenerateQuestions = async (certificate: Certificate) => {
    if (!hasValidSettings) {
      alert('Please configure your API key in Settings first')
      return
    }

    setIsGenerating(true)
    try {
      const config: QuizConfig = {
        apiKey: settings.apiKey,
        certificateId: certificate.id,
        certificateName: certificate.name,
        numberOfQuestions,
        language: settings.language
      }

      const generatedQuestions = []

      for (let i = 0; i < numberOfQuestions; i++) {
        const response = await fetch('/api/generate-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config,
            questionNumber: i + 1
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate question')
        }

        const data = await response.json()
        generatedQuestions.push(data.question)
      }

      // Save all generated questions to the question set
      createOrUpdateQuestionSet(certificate.id, generatedQuestions)

      alert(`Successfully generated ${numberOfQuestions} question${numberOfQuestions !== 1 ? 's' : ''} for ${certificate.name}!`)
      setSelectedCertificate(null)
      onUpdate()
    } catch (error) {
      console.error('Question generation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate questions')
    } finally {
      setIsGenerating(false)
    }
  }

  const getQuestionCount = (certificateId: string): number => {
    const questionSet = getQuestionSetByCertificateId(certificateId)
    return questionSet?.questions.length || 0
  }

  const getQuestions = (certificateId: string) => {
    const questionSet = getQuestionSetByCertificateId(certificateId)
    return questionSet?.questions || []
  }

  const handleTakeQuiz = (certificate: Certificate) => {
    const questionSet = getQuestionSetByCertificateId(certificate.id)
    
    if (!questionSet || questionSet.questions.length === 0) {
      alert('No questions available for this certificate. Please generate questions first.')
      return
    }

    if (!hasValidSettings) {
      alert('Please configure your API key in Settings first')
      return
    }

    // Create a quiz object from the certificate
    const quiz: QuizStorage = {
      id: `practice_${certificate.id}`,
      title: `${certificate.name} Practice Quiz`,
      certificateId: certificate.id,
      language: settings.language,
      questions: questionSet.questions,
      createdAt: questionSet.updatedAt
    }

    // Store the quiz in sessionStorage and navigate to session
    sessionStorage.setItem('currentQuiz', JSON.stringify(quiz))
    router.push('/session')
  }

  if (!hasValidSettings) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-pastel-accent mx-auto mb-6 flex items-center justify-center">
            <Settings className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-light text-slate-600 mb-2">Settings Required</h3>
          <p className="text-slate-500 mb-6">
            Please configure your API key in Settings before creating certificates
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="bg-gradient-button-primary text-white font-medium py-3 px-6 rounded-2xl hover:shadow-lg transition-all duration-300"
          >
            Go to Settings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-slate-700 mb-2">Certificates</h2>
        <p className="text-slate-500">Create certificates and build question banks</p>
      </div>

      {/* Create New Certificate Section */}
      <div className="glass-card rounded-3xl p-6 mb-8">
        <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create New Certificate
        </h3>
        
        {!isCreatingNew ? (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-button-primary text-white rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Certificate
          </button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={newCertName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all pr-12"
                  placeholder="Certificate name (e.g., AWS Solutions Architect) - Click ✓ to validate"
                  required
                />
                {newCertName.trim() && (
                  <button
                    onClick={() => validateCertificationName(newCertName)}
                    disabled={isValidating}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/60 rounded-lg transition-all"
                    title={hasValidSettings ? "Validate certification name" : "Configure API key in Settings to enable validation"}
                  >
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : (
                      <CheckCircle className={`w-4 h-4 transition-all ${
                        hasValidSettings 
                          ? 'text-slate-400 hover:text-purple-500' 
                          : 'text-slate-300 cursor-not-allowed'
                      }`} />
                    )}
                  </button>
                )}
              </div>

              {/* Validation Results */}
              {showValidation && validationResult && (
                <div className={`p-4 rounded-2xl border ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {validationResult.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {validationResult.isValid ? (
                        <div>
                          <p className="text-sm font-medium text-green-700 mb-1">
                            ✓ Valid certification name
                          </p>
                          {validationResult.correctedName && validationResult.correctedName !== newCertName.trim() && (
                            <div className="space-y-2">
                              <p className="text-xs text-green-600">
                                Suggested official name: <span className="font-medium">{validationResult.correctedName}</span>
                              </p>
                              <button
                                onClick={handleUseCorrectedName}
                                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg transition-all"
                              >
                                Use official name
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-orange-700 mb-2">
                            Certification not recognized
                          </p>
                          {validationResult.correctedName && (
                            <div className="mb-3">
                              <p className="text-xs text-orange-600 mb-1">
                                Did you mean: <span className="font-medium">{validationResult.correctedName}</span>
                              </p>
                              <button
                                onClick={handleUseCorrectedName}
                                className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded-lg transition-all"
                              >
                                Use this name
                              </button>
                            </div>
                          )}
                          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                            <div>
                              <p className="text-xs text-orange-600 mb-2">Similar certifications:</p>
                              <div className="flex flex-wrap gap-1">
                                {validationResult.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleUseSuggestion(suggestion)}
                                    className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded-lg transition-all"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        Confidence: {validationResult.confidence}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={newCertDescription}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all resize-none h-20"
                  placeholder="Description (optional - will be auto-generated from validation)"
                  rows={2}
                />
                {isAutoDescription && newCertDescription && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </div>
                  </div>
                )}
              </div>
              
              {isAutoDescription && (
                <p className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-xl">
                  💡 This description was automatically generated based on the certification validation. You can edit it as needed.
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCreateCertificate}
                disabled={!newCertName.trim()}
                className="flex-1 bg-gradient-button-primary text-white font-medium py-3 px-4 rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                Create Certificate
              </button>
              <button
                onClick={() => {
                  setIsCreatingNew(false)
                  setNewCertName('')
                  setNewCertDescription('')
                  setValidationResult(null)
                  setShowValidation(false)
                  setIsAutoDescription(false)
                }}
                className="px-4 py-3 bg-white/40 text-slate-600 rounded-2xl hover:bg-white/60 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-pastel-accent mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-light text-slate-600 mb-2">No certificates yet</h3>
          <p className="text-slate-500">
            Create your first certificate to start building question sets
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate, index) => {
            const questionCount = getQuestionCount(certificate.id)
            
            return (
              <div
                key={certificate.id}
                className="glass-card rounded-3xl p-6 hover:scale-[1.02] transition-all duration-300 floating-animation"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-slate-700 mb-2">
                        {certificate.name}
                      </h3>
                      {certificate.description && (
                        <p className="text-sm text-slate-500 mb-3">
                          {certificate.description}
                        </p>
                      )}
                      <div className="text-xs text-slate-400">
                        Created {certificate.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-button-secondary flex items-center justify-center ml-3">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="bg-gradient-pastel-accent rounded-2xl p-4 text-center mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="w-5 h-5 text-slate-600 mr-2" />
                      <span className="text-2xl font-light text-slate-600">
                        {questionCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      question{questionCount !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {questionCount > 0 ? (
                    <button
                      onClick={() => handleTakeQuiz(certificate)}
                      className="w-full bg-gradient-button-primary text-white font-medium py-3 px-4 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Take Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedCertificate(certificate)}
                      className="w-full bg-gradient-button-primary text-white font-medium py-3 px-4 rounded-2xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Questions
                    </button>
                  )}
                  
                  <div className="flex gap-2">
                    {questionCount > 0 && (
                      <>
                        <button
                          onClick={() => setSelectedCertificate(certificate)}
                          className="flex-1 bg-orange-50 hover:bg-orange-100 border border-orange-200/50 text-orange-600 py-2 px-3 rounded-2xl transition-all duration-300 flex items-center justify-center"
                        >
                          <Zap className="w-4 h-4 mr-1" />
                          Add More
                        </button>
                        <button
                          onClick={() => setViewingQuestions(certificate)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 border border-blue-200/50 text-blue-600 py-2 px-3 rounded-2xl transition-all duration-300 flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteCertificate(certificate)}
                      className="bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-600 py-2 px-3 rounded-2xl transition-all duration-300 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Question Generation Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-xl font-medium text-slate-700 mb-6">
              Generate Questions for {selectedCertificate.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-white/60 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-sm text-blue-600">
                  <strong>Current settings:</strong><br />
                  Language: {settings.language.toUpperCase()}<br />
                  Using stored API key
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleGenerateQuestions(selectedCertificate)}
                disabled={isGenerating}
                className="flex-1 bg-gradient-button-primary text-white font-medium py-3 px-4 rounded-2xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Questions'}
              </button>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="px-4 py-3 bg-white/40 text-slate-600 rounded-2xl hover:bg-white/60 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Viewing Modal */}
      {viewingQuestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-3xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-slate-700">
                Questions for {viewingQuestions.name}
              </h3>
              <button
                onClick={() => setViewingQuestions(null)}
                className="px-4 py-2 bg-white/40 text-slate-600 rounded-2xl hover:bg-white/60 transition-all duration-200"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-6">
              {getQuestions(viewingQuestions.id).map((question, index) => (
                <div key={question.id} className="bg-white/40 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-button-primary text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-700 mb-3">
                        {question.question}
                      </h4>
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex}
                            className={`p-2 rounded-xl text-sm ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-white/60 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-xs font-medium text-blue-600 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-700">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}