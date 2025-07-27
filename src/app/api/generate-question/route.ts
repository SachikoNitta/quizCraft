import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { QuizConfig, QuizQuestion, SUPPORTED_LANGUAGES } from '@/types/quiz'

function getLanguageName(languageCode: string): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode)
  return language ? language.name : 'English'
}

// Create timeout wrapper for API calls
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((result) => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

// Generate a single question
async function generateSingleQuestion(
  model: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  certificateName: string, 
  languageName: string,
  questionNumber: number,
  retryCount = 0
): Promise<QuizQuestion> {
  const maxRetries = 2
  const timeoutMs = 30000 // 30 seconds for single question

  const prompt = `
    You are an expert certification exam creator. Generate exactly 1 multiple-choice quiz question for the "${certificateName}" certification.

    IMPORTANT: Generate all content in ${languageName}. All questions, options, and explanations must be written in ${languageName}.

    This is question number ${questionNumber}. Make sure it covers a different topic/domain than previous questions to ensure variety.

    The question should:
    1. Be based on the latest documentation, best practices, and exam objectives
    2. Have 4 multiple choice options
    3. Have exactly one correct answer
    4. Include a detailed explanation of why the correct answer is right and why other options are wrong
    5. Be at the appropriate difficulty level for the certification
    6. Cover a specific domain/topic of the certification
    7. Use proper ${languageName} language and terminology

    Return ONLY a valid JSON object with this exact structure (no additional text):
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of the correct answer and why other options are incorrect."
    }

    Generate the question now.
  `

  try {
    const result = await withTimeout(
      model.generateContent(prompt),
      timeoutMs
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (result as any).response
    const text = await response.text()

    let questionData
    try {
      // Clean up the response text
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        questionData = JSON.parse(jsonMatch[0])
      } else {
        questionData = JSON.parse(cleanText)
      }
    } catch {
      throw new Error('Failed to parse AI response as JSON')
    }

    // Validate the question
    if (!questionData.question || 
        !Array.isArray(questionData.options) || 
        questionData.options.length !== 4 ||
        typeof questionData.correctAnswer !== 'number' ||
        questionData.correctAnswer < 0 || 
        questionData.correctAnswer >= 4 ||
        !questionData.explanation) {
      throw new Error('Invalid question format from AI')
    }

    const question: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation
    }

    return question

  } catch (error) {
    if (retryCount < maxRetries) {
      console.warn(`Question generation failed (attempt ${retryCount + 1}), retrying...`, error)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
      return generateSingleQuestion(model, certificateName, languageName, questionNumber, retryCount + 1)
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to generate question: ${error.message}`)
    }
    throw new Error('Failed to generate question: Unknown error')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const config: QuizConfig = body.config
    const apiKey: string = body.apiKey
    const language: string = body.language
    const questionNumber: number = body.questionNumber || 1

    // Validate the request
    if (!apiKey || !config.certificateId || !config.certificateName || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, certificateId, certificateName, language' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    })

    const languageName = getLanguageName(language)
    
    const question = await generateSingleQuestion(
      model, 
      config.certificateName, 
      languageName,
      questionNumber
    )

    return NextResponse.json({ question })

  } catch (error) {
    console.error('Question generation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to generate question: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate question: Unknown error occurred' },
      { status: 500 }
    )
  }
}