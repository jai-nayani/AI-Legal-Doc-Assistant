'use client'

import { useState } from 'react'
import { ArrowLeft, FileText, Download, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { downloadAsDocx, replacePlaceholders, fillSignatureBlocks, validatePlaceholders } from '@/lib/documentProcessor'

export default function DownloadPage() {
  const { document, setReadyToDownload, reset } = useAppStore()
  const [filename, setFilename] = useState('completed_document')
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [downloadedFormats, setDownloadedFormats] = useState<Set<string>>(new Set())

  const handleDownload = (format: 'docx' | 'pdf') => {
    // Validate all placeholders before download
    const validationErrors = validatePlaceholders(document.placeholders)
    if (validationErrors.length > 0) {
      alert('Please fix the following issues before downloading:\n\n' + validationErrors.join('\n'))
      return
    }

    const setDownloading = format === 'docx' ? setIsDownloadingDocx : setIsDownloadingPdf
    setDownloading(true)
    
    try {
      let filledContent = replacePlaceholders(document.originalContent, document.placeholders)
      filledContent = fillSignatureBlocks(filledContent, document.placeholders)
      downloadAsDocx(filledContent, filename || 'completed_document', format)

      // Mark this format as downloaded
      setDownloadedFormats(prev => new Set([...prev, format]))
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleBack = () => {
    setReadyToDownload(false)
  }

  const handleUploadNew = () => {
    reset()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Document Ready for Download
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review your information and choose your download format
            </p>
          </div>

          {/* Summary Section */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Document Summary
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {document.placeholders.map((placeholder) => (
                <div
                  key={placeholder.id}
                  className="flex justify-between items-start text-sm py-1"
                >
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {placeholder.label}:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 text-right ml-4 max-w-xs truncate">
                    {placeholder.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Download Options
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                You can download both formats. Click each button to download.
              </p>
              
              <div className="space-y-3">
                {/* Download DOCX Button */}
                <button
                  onClick={() => handleDownload('docx')}
                  disabled={isDownloadingDocx || !filename.trim()}
                  className={`w-full px-6 py-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                    downloadedFormats.has('docx')
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Download as DOCX
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Microsoft Word format (editable)
                      </div>
                    </div>
                  </div>
                  {isDownloadingDocx ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : downloadedFormats.has('docx') ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>

                {/* Download PDF Button */}
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloadingPdf || !filename.trim()}
                  className={`w-full px-6 py-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                    downloadedFormats.has('pdf')
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Download as PDF
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Portable Document Format (final)
                      </div>
                    </div>
                  </div>
                  {isDownloadingPdf ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  ) : downloadedFormats.has('pdf') ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Download className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Success Message */}
            {downloadedFormats.size > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-300">
                      Successfully downloaded!
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                      {downloadedFormats.has('docx') && downloadedFormats.has('pdf')
                        ? 'Both DOCX and PDF files have been downloaded.'
                        : downloadedFormats.has('docx')
                        ? 'DOCX file downloaded. You can also download as PDF.'
                        : 'PDF file downloaded. You can also download as DOCX.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload New Document Button */}
            <button
              onClick={handleUploadNew}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Upload Another Document
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
