import { create } from 'zustand'
import { PlaceholderMetadata } from './geminiService'

export interface Placeholder extends PlaceholderMetadata {}

export interface DocumentState {
  documentId: string | null
  fileName: string | null
  originalContent: string
  originalBinary: ArrayBuffer | null
  originalPath: string | null
  placeholders: Placeholder[]
  currentStep: number
  isProcessing: boolean
  error: string | null
  readyToDownload: boolean
  isSaved: boolean
}

interface AppStore {
  document: DocumentState
  setDocumentContent: (content: string, placeholders: Placeholder[], binary?: ArrayBuffer, fileName?: string) => void
  setDocumentId: (documentId: string, originalPath: string) => void
  updatePlaceholder: (id: string, value: string) => void
  setCurrentStep: (step: number) => void
  setProcessing: (processing: boolean) => void
  setError: (error: string | null) => void
  setReadyToDownload: (ready: boolean) => void
  setSaved: (saved: boolean) => void
  reset: () => void
}

const initialDocumentState: DocumentState = {
  documentId: null,
  fileName: null,
  originalContent: '',
  originalBinary: null,
  originalPath: null,
  placeholders: [],
  currentStep: 0,
  isProcessing: false,
  error: null,
  readyToDownload: false,
  isSaved: false
}

export const useAppStore = create<AppStore>((set, get) => ({
  document: initialDocumentState,

  setDocumentContent: (content: string, placeholders: Placeholder[], binary?: ArrayBuffer, fileName?: string) => {
    set({
      document: {
        ...get().document,
        originalContent: content,
        originalBinary: binary || null,
        fileName: fileName || null,
        placeholders,
        currentStep: 0,
        error: null,
        readyToDownload: false,
        isSaved: false
      }
    })
  },

  setDocumentId: (documentId: string, originalPath: string) => {
    set({
      document: {
        ...get().document,
        documentId,
        originalPath,
        isSaved: true
      }
    })
  },

  updatePlaceholder: (id: string, value: string) => {
    set({
      document: {
        ...get().document,
        placeholders: get().document.placeholders.map(p =>
          p.id === id ? { ...p, value, isFilled: value.trim() !== '' } : p
        )
      }
    })
  },

  setCurrentStep: (step: number) => {
    set({
      document: {
        ...get().document,
        currentStep: step
      }
    })
  },

  setProcessing: (processing: boolean) => {
    set({
      document: {
        ...get().document,
        isProcessing: processing
      }
    })
  },

  setError: (error: string | null) => {
    set({
      document: {
        ...get().document,
        error
      }
    })
  },

  setReadyToDownload: (ready: boolean) => {
    set({
      document: {
        ...get().document,
        readyToDownload: ready
      }
    })
  },

  setSaved: (saved: boolean) => {
    set({
      document: {
        ...get().document,
        isSaved: saved
      }
    })
  },

  reset: () => {
    set({ document: initialDocumentState })
  }
}))