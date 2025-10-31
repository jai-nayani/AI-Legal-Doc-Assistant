'use client'

import { useRef, useState } from 'react'
import { ChevronRight, CheckCircle, DollarSign, Calendar, Building, FileText } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { downloadAsDocx, replacePlaceholders, validatePlaceholders, fillSignatureBlocks } from '@/lib/documentProcessor'

export default function ConversationFlow() {
  const { document, updatePlaceholder, setCurrentStep, setReadyToDownload } = useAppStore()
  const [currentValue, setCurrentValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingFilled, setIsEditingFilled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentPlaceholder = document.placeholders[document.currentStep]
  const allFilled = document.placeholders.every(p => p.isFilled)
  const progress = (document.placeholders.filter(p => p.isFilled).length / document.placeholders.length) * 100

  const getIcon = (type?: string) => {
    switch (type) {
      case 'currency':
      case 'number':
        return <DollarSign className="w-5 h-5" />
      case 'date':
        return <Calendar className="w-5 h-5" />
      case 'address':
        return <Building className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getPlaceholderPrompt = (placeholder: typeof currentPlaceholder) => {
    return placeholder.prompt || `What's the ${placeholder.label.toLowerCase()}?`
  }

  const formatValue = (type: string | undefined, value: string) => {
    if (type === 'currency' && value) {
      const num = parseFloat(value.replace(/[,$]/g, ''))
      return isNaN(num) ? value : `$${num.toLocaleString()}`
    }
    return value
  }

  const handleSubmit = () => {
    if (!currentValue.trim()) return

    const formattedValue = formatValue(currentPlaceholder.type, currentValue)
    updatePlaceholder(currentPlaceholder.id, formattedValue)

    // move to next: prefer next unfilled after current; otherwise next index; otherwise stay
    const nextUnfilledIndex = document.placeholders.findIndex((p, index) => index > document.currentStep && !p.isFilled)
    let nextIndex = document.currentStep

    if (nextUnfilledIndex !== -1) {
      nextIndex = nextUnfilledIndex
    } else if (document.currentStep < document.placeholders.length - 1) {
      nextIndex = document.currentStep + 1
    }

    // If we're moving to a new field, reset editing state
    if (nextIndex !== document.currentStep) {
      setCurrentValue('')
      setIsEditingFilled(false)
    }

    // Move to next placeholder
    setCurrentStep(nextIndex)

    // Scroll and focus after state update
    setTimeout(() => {
      const nextPlaceholder = document.placeholders[nextIndex]
      if (nextPlaceholder) {
        // Scroll to placeholder in document preview
        const nextElement = window.document.getElementById(`placeholder-${nextPlaceholder.id}`)
        if (nextElement) {
          nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          nextElement.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50')
          setTimeout(() => {
            nextElement.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50')
          }, 1500)
        }

        // Auto-focus next field
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }, 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    // prevent container hotkeys (spacebar) from stealing focus/clearing inputs
    if (e.key === ' ') {
      e.stopPropagation()
    }
  }

  const handleSelectPlaceholder = (index: number) => {
    setCurrentStep(index)
    const p = document.placeholders[index]
    setCurrentValue(p.isFilled ? p.value : '')
    setIsEditingFilled(p.isFilled)

    // Scroll to placeholder in document preview and highlight it
    const placeholderElement = window.document.getElementById(`placeholder-${p.id}`)
    if (placeholderElement) {
      placeholderElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Add temporary highlight animation
      placeholderElement.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50')
      setTimeout(() => {
        placeholderElement.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50')
      }, 1500)
    }
  }




  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Fill Document Details</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {document.placeholders.filter(p => p.isFilled).length}/{document.placeholders.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
        {document.placeholders.map((placeholder, index) => {
          const isActive = index === document.currentStep
          return (
            <div
              key={placeholder.id}
              className={`flex items-start p-2 rounded-lg border transition-colors cursor-pointer ${
                placeholder.isFilled
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
              }`}
              onClick={() => handleSelectPlaceholder(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectPlaceholder(index)
                }
              }}
            >
              <div className={`flex items-center justify-center w-7 h-7 rounded-full mr-2 ${
                placeholder.isFilled ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {placeholder.isFilled ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  getIcon(placeholder.type)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{placeholder.label}</p>
                {placeholder.isFilled && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{placeholder.value}</p>
                )}
                {isActive && (!placeholder.isFilled || isEditingFilled) && (
                  <div className="mt-2">
                    <p className="text-xs text-blue-900 dark:text-blue-300 mb-1.5">{getPlaceholderPrompt(placeholder)}</p>
                    <div className="flex gap-1.5">
                      <input
                        ref={inputRef}
                        type={
                          placeholder.type === 'date' || placeholder.label.toLowerCase().includes('date') 
                            ? 'date' 
                            : placeholder.type === 'currency' || placeholder.type === 'number' 
                              ? 'number' 
                              : placeholder.type === 'email' 
                                ? 'email' 
                                : 'text'
                        }
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter value..."
                        className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        onClick={handleSubmit}
                        disabled={!currentValue.trim()}
                        className="px-3 py-1.5 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isActive && (
                <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-1 mt-1" />
              )}
            </div>
          )
        })}
        </div>
      </div>

      {allFilled && (
        <div className="p-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => setReadyToDownload(true)}
            className="w-full bg-green-600 dark:bg-green-500 text-white px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 flex items-center justify-center transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Proceed to Download
          </button>
        </div>
      )}
    </div>
  )
}
