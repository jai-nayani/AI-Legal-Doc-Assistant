// Database types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  firm_name: string | null
  role: 'user' | 'admin' | 'partner'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  description: string | null
  file_name: string
  file_type: 'docx' | 'pdf'
  file_size: number | null
  original_file_path: string
  filled_file_path: string | null
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  total_placeholders: number
  filled_placeholders: number
  completion_percentage: number
  created_at: string
  updated_at: string
  completed_at: string | null
  last_accessed_at: string
  deleted_at: string | null
}

export interface Placeholder {
  id: string
  document_id: string
  user_id: string
  placeholder_text: string
  label: string
  value: string | null
  field_type: 'text' | 'currency' | 'date' | 'email' | 'address' | 'phone' | 'number'
  is_filled: boolean
  position: number
  prompt: string | null
  validation_rule: string | null
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  user_id: string | null
  title: string
  description: string | null
  category: string | null
  tags: string[] | null
  file_name: string
  file_type: 'docx' | 'pdf'
  file_size: number | null
  file_path: string
  placeholder_count: number
  is_public: boolean
  is_featured: boolean
  use_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ActivityLog {
  id: string
  user_id: string
  document_id: string | null
  action: string
  details: Record<string, any> | null
  created_at: string
}

// Database schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'completion_percentage' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Document, 'id' | 'user_id' | 'completion_percentage' | 'created_at' | 'updated_at'>>
      }
      placeholders: {
        Row: Placeholder
        Insert: Omit<Placeholder, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Placeholder, 'id' | 'document_id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      templates: {
        Row: Template
        Insert: Omit<Template, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
      }
      activity_logs: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'>
        Update: never
      }
    }
  }
}

