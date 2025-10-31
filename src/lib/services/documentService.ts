import { createClient } from '@/lib/supabase/client'
import type { Placeholder } from '@/lib/store'

export interface DocumentMetadata {
  id: string
  user_id: string
  title: string
  file_name: string
  original_file_path: string
  filled_file_path?: string
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  total_placeholders: number
  filled_placeholders: number
  created_at: string
  updated_at: string
}

/**
 * Upload original document to Supabase Storage
 */
export async function uploadOriginalDocument(
  file: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  const supabase = createClient()
  
  // Generate unique filename
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-z0-9.-]/gi, '_')
  const filename = `${userId}/${timestamp}_${sanitizedName}`
  
  // Upload to 'documents' bucket
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Upload error:', error)
    return { path: '', error: error.message }
  }
  
  return { path: data.path }
}

/**
 * Upload filled document binary to Supabase Storage
 */
export async function uploadFilledDocument(
  arrayBuffer: ArrayBuffer,
  originalPath: string,
  userId: string
): Promise<{ path: string; error?: string }> {
  const supabase = createClient()
  
  // Create filled filename based on original
  const filledPath = originalPath.replace(/(\.[^.]+)$/, '_filled$1')
  
  // Convert ArrayBuffer to Blob
  const blob = new Blob([arrayBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  })
  
  // Upload to 'documents' bucket
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filledPath, blob, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (error) {
    console.error('Upload filled document error:', error)
    return { path: '', error: error.message }
  }
  
  return { path: data.path }
}

/**
 * Create document record in database
 */
export async function createDocumentRecord(
  userId: string,
  fileName: string,
  originalPath: string,
  placeholderCount: number
): Promise<{ documentId: string; error?: string }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      title: fileName.replace('.docx', ''),
      file_name: fileName,
      file_type: 'docx',
      original_file_path: originalPath,
      status: 'draft',
      total_placeholders: placeholderCount,
      filled_placeholders: 0
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Create document record error:', error)
    return { documentId: '', error: error.message }
  }
  
  return { documentId: data.id }
}

/**
 * Save placeholders to database
 */
export async function savePlaceholders(
  documentId: string,
  placeholders: Placeholder[],
  userId: string
): Promise<{ error?: string }> {
  const supabase = createClient()
  
  // Filter out invalid placeholders and map to database format
  const placeholderRecords = placeholders
    .filter(p => p.placeholder && p.label) // Only include placeholders with required fields
    .map((p, index) => ({
      document_id: documentId,
      user_id: userId,
      placeholder_text: p.placeholder,
      label: p.label,
      value: p.value || null,
      field_type: p.type || 'text',
      is_filled: !!p.value,
      position: index,
      prompt: p.prompt || null,
      validation_rule: null
    }))
  
  // If no valid placeholders, return success (nothing to save)
  if (placeholderRecords.length === 0) {
    console.log('No valid placeholders to save')
    return {}
  }
  
  const { error } = await supabase
    .from('placeholders')
    .insert(placeholderRecords)
  
  if (error) {
    console.error('Save placeholders error:', error)
    return { error: error.message }
  }
  
  return {}
}

/**
 * Update document with filled data
 */
export async function updateDocumentFilled(
  documentId: string,
  filledPath: string,
  filledCount: number
): Promise<{ error?: string }> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('documents')
    .update({
      filled_file_path: filledPath,
      filled_placeholders: filledCount,
      status: 'completed',
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    })
    .eq('id', documentId)
  
  if (error) {
    console.error('Update document error:', error)
    return { error: error.message }
  }
  
  return {}
}

/**
 * Update placeholder value
 */
export async function updatePlaceholderValue(
  documentId: string,
  label: string,
  value: string
): Promise<{ error?: string }> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('placeholders')
    .update({ 
      value: value,
      is_filled: value.trim() !== '',
      updated_at: new Date().toISOString()
    })
    .eq('document_id', documentId)
    .eq('label', label)
  
  if (error) {
    console.error('Update placeholder error:', error)
    return { error: error.message }
  }
  
  return {}
}

/**
 * Get user's documents
 */
export async function getUserDocuments(
  userId: string,
  limit: number = 50
): Promise<{ documents: DocumentMetadata[]; error?: string }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Get documents error:', error)
    return { documents: [], error: error.message }
  }
  
  return { documents: data as DocumentMetadata[] }
}

/**
 * Get document by ID with placeholders
 */
export async function getDocumentById(
  documentId: string
): Promise<{ document: DocumentMetadata | null; placeholders: any[]; error?: string }> {
  const supabase = createClient()
  
  // Get document
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()
  
  if (docError) {
    console.error('Get document error:', docError)
    return { document: null, placeholders: [], error: docError.message }
  }
  
  // Get placeholders
  const { data: placeholders, error: plError } = await supabase
    .from('placeholders')
    .select('*')
    .eq('document_id', documentId)
    .order('position', { ascending: true })
  
  if (plError) {
    console.error('Get placeholders error:', plError)
    return { document: document as DocumentMetadata, placeholders: [], error: plError.message }
  }
  
  return { document: document as DocumentMetadata, placeholders: placeholders || [] }
}

/**
 * Download document from Supabase Storage
 */
export async function downloadDocument(
  path: string
): Promise<{ blob: Blob | null; error?: string }> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from('documents')
    .download(path)
  
  if (error) {
    console.error('Download document error:', error)
    return { blob: null, error: error.message }
  }
  
  return { blob: data }
}

/**
 * Delete document and all associated data
 */
export async function deleteDocument(
  documentId: string,
  originalPath: string,
  filledPath?: string
): Promise<{ error?: string }> {
  const supabase = createClient()
  
  // Delete files from storage
  const pathsToDelete = [originalPath]
  if (filledPath) pathsToDelete.push(filledPath)
  
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove(pathsToDelete)
  
  if (storageError) {
    console.error('Delete storage error:', storageError)
    // Continue even if storage delete fails
  }
  
  // Delete placeholders (cascades in database)
  const { error: placeholderError } = await supabase
    .from('placeholders')
    .delete()
    .eq('document_id', documentId)
  
  if (placeholderError) {
    console.error('Delete placeholders error:', placeholderError)
  }
  
  // Soft delete document record (set deleted_at)
  const { error: docError } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', documentId)
  
  if (docError) {
    console.error('Delete document error:', docError)
    return { error: docError.message }
  }
  
  return {}
}

/**
 * Log activity
 */
export async function logActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: any
): Promise<void> {
  const supabase = createClient()
  
  await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata
    })
}

