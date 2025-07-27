import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ValidationRequest {
  certificationName: string
  apiKey: string
}

interface ValidationResponse {
  isValid: boolean
  correctedName?: string
  description?: string
  suggestions?: string[]
  confidence: 'high' | 'medium' | 'low'
}

function createFallbackValidation(certificationName: string): ValidationResponse | null {
  // Basic keyword-based validation for common certifications
  const name = certificationName.toLowerCase()
  
  // AWS certifications
  if (name.includes('aws') && (name.includes('architect') || name.includes('saa'))) {
    return {
      isValid: true,
      correctedName: 'AWS Certified Solutions Architect Associate',
      description: 'Cloud architecture certification for AWS. Validates distributed system design skills for developers.',
      suggestions: [],
      confidence: 'medium'
    }
  }
  
  // Google Cloud
  if (name.includes('google') || name.includes('gcp') || name.includes('cloud architect')) {
    return {
      isValid: true,
      correctedName: 'Google Cloud Professional Cloud Architect',
      description: 'Cloud architecture certification for Google Cloud Platform. Validates cloud solution design skills.',
      suggestions: [],
      confidence: 'medium'
    }
  }
  
  // CompTIA Security+
  if (name.includes('comptia') || name.includes('security+') || name.includes('sec+')) {
    return {
      isValid: true,
      correctedName: 'CompTIA Security+',
      description: 'Entry-level cybersecurity certification covering security principles and practices.',
      suggestions: [],
      confidence: 'medium'
    }
  }
  
  // Generic fallback for unknown certifications
  return {
    isValid: false,
    correctedName: '',
    description: '',
    suggestions: ['AWS Certified Solutions Architect', 'CompTIA Security+', 'Google Cloud Professional Cloud Architect'],
    confidence: 'low'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { certificationName, apiKey }: ValidationRequest = await request.json()

    if (!certificationName || !apiKey) {
      return NextResponse.json(
        { error: 'Certification name and API key are required' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    
    const prompt = `Is "${certificationName}" a real professional certification? 

Respond with JSON only:

{
  "isValid": boolean,
  "correctedName": "official name if valid",
  "description": "what it covers and target audience",
  "suggestions": ["alt1", "alt2", "alt3"],
  "confidence": "high"
}

If valid: set isValid=true, provide correctedName and description, empty suggestions array
If invalid: set isValid=false, empty correctedName and description, provide 3 real alternatives

Example valid: AWS SAA
{"isValid": true, "correctedName": "AWS Certified Solutions Architect Associate", "description": "Cloud architecture certification for AWS. Validates distributed system design skills. Targets developers with 1+ years AWS experience.", "suggestions": [], "confidence": "high"}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      // Clean the response text to remove any markdown formatting
      let cleanText = text.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '')
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '')
      }
      
      const validationResult: ValidationResponse = JSON.parse(cleanText)
      
      // Validate the response structure
      if (typeof validationResult.isValid !== 'boolean' || 
          !['high', 'medium', 'low'].includes(validationResult.confidence)) {
        console.error('Invalid response structure:', validationResult)
        throw new Error('Invalid response structure')
      }

      return NextResponse.json(validationResult)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      console.error('Parse error:', parseError)
      
      // Fallback: try to create a basic validation response
      const fallbackResult = createFallbackValidation(certificationName)
      if (fallbackResult) {
        return NextResponse.json(fallbackResult)
      }
      
      // Return error with details for debugging
      return NextResponse.json({
        error: 'Invalid response from AI service',
        rawResponse: text,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Certification validation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Validation failed' },
      { status: 500 }
    )
  }
}