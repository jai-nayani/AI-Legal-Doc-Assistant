'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/supabase/types'

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  async function createDocument(document: {
    title: string
    file_name: string
    file_type: 'docx' | 'pdf'
    file_size: number
    original_file_path: string
    total_placeholders: number
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('documents')
        .insert([{ ...document, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      
      setDocuments(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create document')
    }
  }

  async function updateDocument(id: string, updates: Partial<Document>) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setDocuments(prev =>
        prev.map(doc => (doc.id === id ? data : doc))
      )
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update document')
    }
  }

  async function deleteDocument(id: string) {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error

      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete document')
    }
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  }
}

