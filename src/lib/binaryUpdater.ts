import PizZip from 'pizzip'

/**
 * Updates placeholders in .docx binary with filled values
 * This preserves the original document structure, formatting, tables, etc.
 *
 * @param originalBinary - Original .docx ArrayBuffer
 * @param placeholders - Array with placeholder text and values
 * @returns Updated .docx ArrayBuffer
 */
export function updateBinaryWithValues(
  originalBinary: ArrayBuffer,
  placeholders: Array<{ placeholder: string; value: string; type?: string }>
): ArrayBuffer {
  try {
    // 1. Unzip .docx (it's actually a ZIP file with XML inside)
    const zip = new PizZip(originalBinary)

    // 2. Get main document XML content
    const documentXmlFile = zip.file('word/document.xml')
    if (!documentXmlFile) {
      throw new Error('Invalid .docx structure: document.xml not found')
    }

    let documentXml = documentXmlFile.asText()

    // 3. Replace each placeholder in the XML
    placeholders.forEach(p => {
      if (!p.value.trim()) return // Skip empty values

      // Escape XML special characters in the replacement value
      const safeValue = escapeXml(p.value)

      // Escape regex special characters in the placeholder pattern
      const escapedPlaceholder = escapeRegex(p.placeholder)

      // Replace all occurrences of this placeholder
      const regex = new RegExp(escapedPlaceholder, 'g')
      documentXml = documentXml.replace(regex, safeValue)
    })

    // 4. Update the document.xml file in the zip
    zip.file('word/document.xml', documentXml)

    // 5. Generate new .docx binary with updated content
    const updatedBinary = zip.generate({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6 // Balanced compression
      }
    })

    return updatedBinary
  } catch (error) {
    console.error('Binary update failed:', error)
    throw new Error(`Failed to update document binary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Escapes XML special characters to prevent breaking the document structure
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Escapes regex special characters for safe pattern matching
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
