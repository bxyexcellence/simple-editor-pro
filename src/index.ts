// Main exports
export { SimpleEditor } from './components/SimpleEditor'
export { PreviewPanel } from './components/PreviewPanel'

// Types
export type { SimpleEditorProps, ImageUploadFunction } from './components/SimpleEditor'
export type { 
  PreviewPanelProps, 
  TagRenderer, 
  TagRenderContext, 
  TagAttributes, 
  Renderers 
} from './components/PreviewPanel'
export type { Language, Translations } from './lib/i18n'
export type { MentionUser } from './lib/api'
export type { Editor } from '@tiptap/react'

// Utilities
export { getMarkdownFromEditor, setMarkdownToEditor } from './lib/tiptap-utils'
export { detectContentType } from './components/PreviewPanel'

// Styles - users should import this
import './styles/index.css'

