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

// Generate questions in smaller batches to avoid timeouts
async function generateQuestionBatch(
  model: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  batchSize: number, 
  certificateName: string, 
  languageName: string,
  retryCount = 0
): Promise<QuizQuestion[]> {
  const maxRetries = 2
  const timeoutMs = 60000 // 60 seconds per batch

  const prompt = `
    You are an expert certification exam creator. Generate exactly ${batchSize} multiple-choice quiz questions for the "${certificateName}" certification.

    IMPORTANT: Generate all content in ${languageName}. All questions, options, and explanations must be written in ${languageName}.

    Each question should:
    1. Be based on the latest documentation, best practices, and exam objectives
    2. Have 4 multiple choice options
    3. Have exactly one correct answer
    4. Include a detailed explanation of why the correct answer is right and why other options are wrong
    5. Be at the appropriate difficulty level for the certification
    6. Cover different domains/topics of the certification
    7. Use proper ${languageName} language and terminology

    Return ONLY a valid JSON array with this exact structure (no additional text):
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Detailed explanation of the correct answer and why other options are incorrect."
      }
    ]

    Generate exactly ${batchSize} questions now.
  `

  try {
    const result = await withTimeout(
      model.generateContent(prompt),
      timeoutMs
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (result as any).response
    const text = await response.text()

    let questionsData
    try {
      // Clean up the response text
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
      
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0])
      } else {
        questionsData = JSON.parse(cleanText)
      }
    } catch {
      throw new Error('Failed to parse AI response as JSON')
    }

    if (!Array.isArray(questionsData)) {
      throw new Error('Invalid response format from AI')
    }

    if (questionsData.length === 0) {
      throw new Error('AI returned empty question list')
    }

    // Validate each question
    const validQuestions = questionsData.filter(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length === 4 &&
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 && 
      q.correctAnswer < 4 &&
      q.explanation
    )

    if (validQuestions.length === 0) {
      throw new Error('No valid questions in AI response')
    }

    const questions: QuizQuestion[] = validQuestions.map((q: { question: string; options: string[]; correctAnswer: number; explanation: string }, index: number) => ({
      id: `q-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 11)}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }))

    return questions

  } catch (error) {
    if (retryCount < maxRetries) {
      console.warn(`Batch generation failed (attempt ${retryCount + 1}), retrying...`, error)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
      return generateQuestionBatch(model, batchSize, certificateName, languageName, retryCount + 1)
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to generate question batch: ${error.message}`)
    }
    throw new Error('Failed to generate question batch: Unknown error')
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: QuizConfig = await request.json()

    // Validate the request
    if (!config.apiKey || !config.certificateId || !config.certificateName || !config.numberOfQuestions || !config.language) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, certificateId, certificateName, numberOfQuestions, language' },
        { status: 400 }
      )
    }

    if (config.numberOfQuestions < 1 || config.numberOfQuestions > 20) {
      return NextResponse.json(
        { error: 'numberOfQuestions must be between 1 and 20' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(config.apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    })

    const languageName = getLanguageName(config.language)
    
    // Generate questions in smaller batches to avoid timeouts
    const maxBatchSize = 5 // Generate max 5 questions per API call
    const allQuestions: QuizQuestion[] = []
    
    let remainingQuestions = config.numberOfQuestions
    let batchIndex = 0
    
    while (remainingQuestions > 0) {
      const batchSize = Math.min(remainingQuestions, maxBatchSize)
      batchIndex++
      
      try {
        const batchQuestions = await generateQuestionBatch(
          model, 
          batchSize, 
          config.certificateName, 
          languageName
        )
        allQuestions.push(...batchQuestions)
        remainingQuestions -= batchSize
        
        // Add a small delay between batches to be respectful to the API
        if (remainingQuestions > 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        // If a batch fails, we still continue with other batches
        console.warn(`Batch ${batchIndex} failed:`, error)
        remainingQuestions -= batchSize // Skip this batch
      }
    }

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions were generated successfully' },
        { status: 500 }
      )
    }

    const quiz = {
      id: `quiz-${Date.now()}`,
      title: `${config.certificateName} Practice Quiz`,
      certificateId: config.certificateId,
      language: config.language,
      questions: allQuestions.slice(0, config.numberOfQuestions), // Ensure we don't exceed requested count
      createdAt: new Date()
    }

    return NextResponse.json({ quiz })

  } catch (error) {
    console.error('Quiz generation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to generate quiz: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate quiz: Unknown error occurred' },
      { status: 500 }
    )
  }
}