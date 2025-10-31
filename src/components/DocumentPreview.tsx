'use client'

import { useMemo, Fragment } from 'react'
import { useAppStore } from '@/lib/store'
import { replacePlaceholders, fillSignatureBlocks } from '@/lib/documentProcessor'

export default function DocumentPreview() {
  const { document } = useAppStore()

  // Text-based preview with yellow highlighting for unfilled placeholders
  const textPreviewContent = useMemo(() => {
    if (!document.originalContent) return ''

    let filledContent = replacePlaceholders(document.originalContent, document.placeholders)
    filledContent = fillSignatureBlocks(filledContent, document.placeholders)

    // Build regex pattern from all placeholders
    const allPlaceholders = document.placeholders.map(p => p.placeholder).filter(Boolean)
    if (allPlaceholders.length === 0) return filledContent

    // Escape special regex characters and create pattern
    const escapedPlaceholders = allPlaceholders.map(p => p!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const pattern = new RegExp(`(${escapedPlaceholders.join('|')})`, 'g')

    const parts = filledContent.split(pattern)

    const rendered = parts.map((part, index) => {
      // Check if this part is an unfilled placeholder
      const matchingPlaceholder = document.placeholders.find(p => p.placeholder === part)
      const isUnfilledPlaceholder = matchingPlaceholder && !matchingPlaceholder.isFilled

      if (isUnfilledPlaceholder) {
        return (
          <span
            key={index}
            id={`placeholder-${matchingPlaceholder.id}`}
            className="bg-yellow-200 text-gray-900 px-1 rounded transition-all duration-300"
          >
            {part}
          </span>
        )
      }

      return <span key={index}>{part}</span>
    })

    return <>{rendered}</>
  }, [document.originalContent, document.placeholders])

  // Removed docx-preview - using text-based preview only for stability

  // Early return if no document
  if (!document.originalContent) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Upload a document to see preview
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Document Preview
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
          Text-based preview (unfilled fields highlighted in yellow)
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 bg-white"
        id="document-preview-container"
      >
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-900 p-4 bg-gray-50 rounded border">
            {textPreviewContent}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
          <span>
            {document.placeholders.filter(p => p.isFilled).length}/
            {document.placeholders.length} fields filled
          </span>
          {document.originalContent && (
            <span>
              {document.originalContent.length.toLocaleString()} characters
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
