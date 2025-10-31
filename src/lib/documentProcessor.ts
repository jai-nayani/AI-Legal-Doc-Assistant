import mammoth from 'mammoth'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import jsPDF from 'jspdf'
import { detectPlaceholdersWithAI, PlaceholderMetadata } from './geminiService'

export async function processDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  } catch (error) {
    throw new Error('Failed to process document. Please ensure it\'s a valid .docx file.')
  }
}

export async function processDocxFileWithAI(file: File): Promise<{ content: string; placeholders: PlaceholderMetadata[] }> {
  try {
    const content = await processDocxFile(file)
    const placeholders = await detectPlaceholdersWithAI(content)
    return { content, placeholders }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to process document with AI')
  }
}

export function replacePlaceholders(content: string, placeholders: Array<{ id: string, label: string, value: string, placeholder?: string, type?: string }>): string {
  let processedContent = content

  // Group placeholders by their placeholder text
  const placeholderGroups = new Map<string, typeof placeholders>()
  placeholders.forEach(p => {
    if (p.placeholder) {
      if (!placeholderGroups.has(p.placeholder)) {
        placeholderGroups.set(p.placeholder, [])
      }
      placeholderGroups.get(p.placeholder)!.push(p)
    }
  })

  // Replace each group of placeholders
  placeholderGroups.forEach((group, placeholderText) => {
    const escapedPlaceholder = placeholderText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escapedPlaceholder, 'g')

    let matchIndex = 0
    processedContent = processedContent.replace(regex, () => {
      const p = group[matchIndex]
      matchIndex++

      if (!p || !p.value.trim()) {
        return placeholderText // Keep original if no value
      }

      let replacementValue = p.value

      // Format currency values
      if (p.type === 'currency') {
        const numeric = p.value.replace(/[^0-9.]/g, '')
        replacementValue = isNaN(parseFloat(numeric)) ? p.value : `$${Number(numeric).toLocaleString()}`
      }

      // If placeholder is a label with colon (Pattern 5: "By:", "Name:", etc.)
      // Replace with "Label: value" to preserve the label
      if (placeholderText.endsWith(':')) {
        return `${placeholderText} ${replacementValue}`
      }

      return replacementValue
    })
  })

  return processedContent
}

// Simplified signature block filling - now handled by replacePlaceholders
export function fillSignatureBlocks(content: string, placeholders: Array<{ label: string, value: string }>): string {
  // This function is now mostly handled by the AI-detected placeholders
  // Keep it for backward compatibility but it's simplified
  return content
}

// Removed extractSignatureSections - now handled by AI

export function downloadAsDocx(content: string, filename: string, format: 'docx' | 'pdf' | 'html' = 'docx') {
  if (format === 'docx') {
    const paragraphs = content.split('\n').map(line => new Paragraph({
      children: [new TextRun(line || ' ')],
    }))
    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }],
    })
    Packer.toBlob(doc).then(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    })
    return
  }

  if (format === 'pdf') {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const lines = doc.splitTextToSize(content, 520)
    let y = 40
    lines.forEach((line: string) => {
      if (y > 780) { doc.addPage(); y = 40 }
      doc.text(line, 40, y)
      y += 16
    })
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
    return
  }

  // HTML fallback
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${filename}</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
        p { margin: 0 0 10pt 0; }
        .signature-section { margin-top: 40pt; }
    </style>
</head>
<body>
${content.split('\n').map(line =>
  line.trim() ? `<p>${line.replace(/\s+/g, ' ')}</p>` : '<p><br></p>'
).join('\n')}
</body>
</html>`

  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.html') ? filename : filename.replace('.docx', '').replace('.pdf', '') + '.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function validatePlaceholders(placeholders: Array<{ label: string, value: string, type?: string, validation?: string }>): string[] {
  const errors: string[] = []

  placeholders.forEach(placeholder => {
    if (!placeholder.value.trim()) {
      errors.push(`${placeholder.label} is required`)
      return
    }

    // Type-based validation
    if (placeholder.type === 'currency' || placeholder.type === 'number') {
      const amount = parseFloat(placeholder.value.replace(/[,$]/g, ''))
      if (isNaN(amount) || amount <= 0) {
        errors.push(`${placeholder.label} must be a valid positive number`)
      }
    }

    if (placeholder.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(placeholder.value)) {
        errors.push(`${placeholder.label} must be a valid email address`)
      }
    }

    if (placeholder.type === 'date') {
      if (placeholder.value.length < 3) {
        errors.push(`${placeholder.label} appears to be invalid`)
      }
    }

    if (placeholder.type === 'text' && placeholder.value.length < 2) {
      errors.push(`${placeholder.label} appears to be too short`)
    }

    // Custom validation from AI
    if (placeholder.validation) {
      // This could be enhanced to parse and apply AI-provided validation rules
      // For now, we just ensure basic length
      if (placeholder.value.length < 1) {
        errors.push(`${placeholder.label}: ${placeholder.validation}`)
      }
    }
  })

  return errors
}
