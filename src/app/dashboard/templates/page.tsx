'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { FileText, Upload, Search, Trash2, Download, FileEdit } from 'lucide-react'

interface Template {
  id: string
  user_id: string
  title: string
  description?: string
  category?: string
  file_name: string
  file_path: string
  file_size?: number
  created_at: string
  updated_at: string
}

export default function TemplatesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [openingTemplate, setOpeningTemplate] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadTemplates()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Filter templates based on search query
    if (searchQuery.trim() === '') {
      setFilteredTemplates(templates)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = templates.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query) ||
          t.file_name.toLowerCase().includes(query)
      )
      setFilteredTemplates(filtered)
    }
  }, [searchQuery, templates])

  const loadTemplates = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTemplates(data || [])
      setFilteredTemplates(data || [])
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.name.endsWith('.docx')) {
      setUploadError('Please select a .docx file')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Upload to storage
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-z0-9.-]/gi, '_')
      const filePath = `${user.id}/templates/${timestamp}_${sanitizedName}`

      const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      // Create template record
      const { error: dbError } = await supabase.from('templates').insert({
        user_id: user.id,
        title: file.name.replace('.docx', ''),
        file_name: file.name,
        file_type: 'docx',
        file_path: filePath,
        file_size: file.size,
      })

      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`)
      }

      // Reload templates
      await loadTemplates()
    } catch (error) {
      console.error('Upload failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setUploadError(`Failed to upload template: ${errorMessage}`)
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleDelete = async (template: Template) => {
    if (!confirm(`Delete "${template.title}"? This cannot be undone.`)) {
      return
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Delete from storage
      await supabase.storage.from('templates').remove([template.file_path])

      // Delete from database
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', template.id)

      if (error) throw error

      // Remove from local state
      setTemplates(templates.filter(t => t.id !== template.id))
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete template')
    }
  }

  const handleDownload = async (template: Template) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase.storage
        .from('templates')
        .download(template.file_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = template.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download template')
    }
  }

  const handleOpenWithAssistant = async (template: Template) => {
    setOpeningTemplate(template.id)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Download template from storage
      const { data: blob, error } = await supabase.storage
        .from('templates')
        .download(template.file_path)

      if (error) throw error

      // Convert blob to File object
      const file = new File([blob], template.file_name, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      // Process the document (same as upload flow)
      const { processDocxFileWithAI } = await import('@/lib/documentProcessor')
      const arrayBuffer = await file.arrayBuffer()
      const { content, placeholders } = await processDocxFileWithAI(file)

      // Load into document store
      const { useAppStore } = await import('@/lib/store')
      const { setDocumentContent } = useAppStore.getState()
      setDocumentContent(content, placeholders, arrayBuffer, template.file_name)

      // Redirect to home page where document is ready to fill
      router.push('/')
    } catch (error) {
      console.error('Failed to open template:', error)
      alert('Failed to open template. Please try again.')
      setOpeningTemplate(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Template Library
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {templates.length} template{templates.length !== 1 ? 's' : ''} total
              </p>
            </div>

            {/* Upload Button */}
            <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Template'}
              <input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Error */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{uploadError}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates by name, description, or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Upload your first template to get started'}
            </p>
            {!searchQuery && (
              <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Upload className="w-5 h-5" />
                Upload Template
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Template Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Template Info */}
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">
                  {template.title}
                </h3>
                {template.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  <p>Added {new Date(template.created_at).toLocaleDateString()}</p>
                  {template.category && <p className="mt-1">Category: {template.category}</p>}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  {/* Primary Action Button */}
                  <button
                    onClick={() => handleOpenWithAssistant(template)}
                    disabled={openingTemplate === template.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {openingTemplate === template.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Opening...
                      </>
                    ) : (
                      <>
                        <FileEdit className="w-4 h-4" />
                        Open with Legal Document Assistant
                      </>
                    )}
                  </button>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

