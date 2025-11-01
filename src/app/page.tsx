'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAppStore } from '@/lib/store'
import { processDocxFile } from '@/lib/documentProcessor'
import ConversationFlow from '@/components/ConversationFlow'
import DocumentPreview from '@/components/DocumentPreview'
import DownloadPage from '@/components/DownloadPage'
import {
  uploadOriginalDocument,
  createDocumentRecord,
  savePlaceholders,
  logActivity
} from '@/lib/services/documentService'

export default function Home() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingToCloud, setUploadingToCloud] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { document, setDocumentContent, setDocumentId, setProcessing, setError, reset } = useAppStore()

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      setError('Please select a .docx file')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Store binary for layout-preserved preview
      const arrayBuffer = await file.arrayBuffer()

      // Process with AI for placeholder detection
      const { processDocxFileWithAI } = await import('@/lib/documentProcessor')
      const { content, placeholders } = await processDocxFileWithAI(file)

      // Store both text and binary
      setDocumentContent(content, placeholders, arrayBuffer, file.name)

      // If user is logged in, save to Supabase
      if (user) {
        setUploadingToCloud(true)
        
        // Upload original document
        const { path: originalPath, error: uploadError } = await uploadOriginalDocument(file, user.id)
        if (uploadError) {
          console.error('Failed to upload document:', uploadError)
          // Continue anyway - document still works locally
          setUploadingToCloud(false)
          return
        }

        // Create document record
        const { documentId, error: recordError } = await createDocumentRecord(
          user.id,
          file.name,
          originalPath,
          placeholders.length
        )
        if (recordError) {
          console.error('Failed to create document record:', recordError)
          setUploadingToCloud(false)
          return
        }

        // Save placeholders
        const { error: placeholdersError } = await savePlaceholders(documentId, placeholders, user.id)
        if (placeholdersError) {
          console.error('Failed to save placeholders:', placeholdersError)
        }

        // Update store with document ID
        setDocumentId(documentId, originalPath)

        // Log activity
        await logActivity(user.id, 'document_uploaded', 'document', documentId, {
          filename: file.name,
          placeholder_count: placeholders.length
        })

        setUploadingToCloud(false)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process file')
      setUploadingToCloud(false)
    } finally {
      setProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleReset = () => {
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Show download page if ready to download
  if (document.readyToDownload) {
    return <DownloadPage />
  }

  // show conversation flow if document is loaded and has placeholders
  if (document.originalContent && document.placeholders.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1800px] mx-auto px-3 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Legal Document Assistant</h1>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Start Over
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-4 items-start">
            <div className="h-[calc(100vh-120px)]">
              <ConversationFlow />
            </div>
            <div className="h-[calc(100vh-120px)]">
              <DocumentPreview />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Legal Document Assistant</h1>
            </div>
            
            {user ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Legal Document Assistant</h1>
            <p className="text-gray-600 dark:text-gray-400">Upload a legal document template to get started</p>
          </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Upload your document</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop a .docx file here, or click to browse
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileInputChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer transition-colors"
          >
            Choose File
          </label>
        </div>

        {(document.isProcessing || uploadingToCloud) && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center text-blue-600 dark:text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400 mr-2"></div>
              {uploadingToCloud ? 'Saving to cloud...' : 'Processing document...'}
            </div>
          </div>
        )}

        {document.error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
              <p className="text-red-700 dark:text-red-300">{document.error}</p>
            </div>
          </div>
        )}

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Supported format: .docx files only</p>
            <p className="mt-1">
              {user 
                ? '✅ Signed in - Documents will be saved to your account' 
                : '📁 Documents processed locally only. Sign in to save to cloud.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
