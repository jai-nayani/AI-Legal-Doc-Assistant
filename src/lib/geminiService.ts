import { GoogleGenerativeAI } from '@google/generative-ai'

export interface PlaceholderMetadata {
  id: string
  label: string
  placeholder: string
  value: string
  isFilled: boolean
  type: 'text' | 'currency' | 'date' | 'email' | 'address' | 'phone' | 'number'
  prompt?: string
  validation?: string
}

const getGeminiApiKey = (): string => {
  // ✅ Updated API key for demo
  const apiKey = 'AIzaSyCur9eeg-VdI9wuMoTm6i2ndw_iPOj3uN8'
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured.')
  }
  return apiKey
}

export async function detectPlaceholdersWithAI(documentContent: string): Promise<PlaceholderMetadata[]> {
  const apiKey = getGeminiApiKey()
  const genAI = new GoogleGenerativeAI(apiKey)
  // Using gemini-2.5-flash: Latest model with improved performance
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `
You are analyzing a legal document to find ALL EMPTY placeholders that need user input.

⚠️ CRITICAL: ONLY detect EMPTY/UNFILLED placeholders. SKIP any fields that already contain filled data.

Document:
"""
${documentContent}
"""

YOUR TASK:
Scan the entire document and identify EVERY blank field, placeholder, or fill-in section that is EMPTY. SKIP fields that already have content. Use your intelligence to recognize these patterns:

PATTERN 1: TEXT IN BRACKETS
[any text here] → This is a placeholder

PATTERN 2: DOLLAR SIGNS WITH UNDERSCORES
$[____] → This is a placeholder for currency

PATTERN 3: MULTIPLE UNDERSCORES
_____ or ___________ → These are blank lines to fill

PATTERN 4: LABEL WITH UNDERSCORES
SomeWord: _____ → The underscores are the placeholder (NOT the label)

PATTERN 5: LABEL WITH COLON FOLLOWED BY WHITESPACE/BLANK LINES (IMPORTANT!)
If you see a word/phrase ending with colon (:) and the next line is blank OR there's significant whitespace, it's likely a form field.
Example:
  By:

  Name:

These are fillable fields. The placeholder is the entire "Label:" including the colon.

**CRITICAL: SKIP ALREADY-FILLED FIELDS**
If a label like "Name:" or "Signature:" is followed by actual filled content (names, dates, text, etc.), DO NOT treat it as a placeholder.
Examples to SKIP:
- "Name: John Smith" → SKIP (already filled)
- "Signature: John Doe" → SKIP (already filled)
- "Date: 2025-01-01" → SKIP (already filled)
- "CLIENT:Name: JAi JARN Signature: RAMA JARN" → SKIP (already filled)

Only detect as placeholder if:
- Followed by blank lines/whitespace
- Followed by underscores: "Name: _____"
- Followed by brackets: "Name: [Enter Name]"
- Obviously empty/unfilled

CRITICAL RULES:
- For Pattern 4 (Label: _____): placeholder = just the underscores
- For Pattern 5 (Label: with blank after): placeholder = "Label:" (the whole thing including colon)
- **SKIP any label that already has filled content after it**
- If the same pattern appears multiple times, create separate entries for EACH occurrence
- Use surrounding context to give each a unique, descriptive label
- Use your intelligence: in signature blocks, form sections, or contracts, labels with colons are usually fields

FOR EACH PLACEHOLDER:
{
  "placeholder": "The exact text to find/replace",
  "label": "Unique descriptive name based on context",
  "type": "text, currency, date, email, address, phone, or number",
  "prompt": "Conversational question to ask user",
  "validation": ""
}

RETURN FORMAT:
Return ONLY valid JSON array. NO markdown, NO explanations:

[
  {
    "placeholder": "By:",
    "label": "Company Signature",
    "type": "text",
    "prompt": "Who is signing for the company?",
    "validation": ""
  }
]

⚠️ FINAL REMINDER: 
- ONLY return EMPTY/UNFILLED placeholders
- SKIP any field with filled content like "Name: John Smith"
- BE THOROUGH: Find EVERY EMPTY placeholder, even if patterns repeat many times
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON format. Please try again.')
    }

    const placeholders = JSON.parse(jsonMatch[0]) as Array<{
      placeholder: string
      label: string
      type: string
      prompt?: string
      validation?: string
    }>

    console.log('✅ Gemini detected', placeholders.length, 'placeholders:', placeholders.map(p => p.label).join(', '))

    // Convert to PlaceholderMetadata format
    return placeholders.map((p, index) => ({
      id: `${p.label.toLowerCase().replace(/\s+/g, '_')}_${index}`,
      label: p.label,
      placeholder: p.placeholder,
      value: '',
      isFilled: false,
      type: (p.type as PlaceholderMetadata['type']) || 'text',
      prompt: p.prompt,
      validation: p.validation
    }))
  } catch (error) {
    console.error('Gemini API Error:', error)
    // For API errors, throw detailed error
    if (error instanceof Error && error.message.includes('quota')) {
      throw new Error('Gemini API quota exceeded. Please wait a moment and try again, or check your API key at https://aistudio.google.com/app/apikey')
    }

    throw new Error(`AI placeholder detection failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and internet connection.`)
  }
}
