# simple-editor-pro

A powerful and customizable rich text editor built with Tiptap and React.

## Installation

```bash
npm install simple-editor-pro
```

### Peer Dependencies

This package requires React 18+ as peer dependencies. Make sure you have them installed:

```bash
npm install react react-dom
```

## Quick Start

### 1. Basic Usage

```tsx
import React, { useState } from 'react'
import { SimpleEditor } from 'simple-editor-pro'
import 'simple-editor-pro/styles'

function App() {
  const [content, setContent] = useState('')
  
  return (
    <SimpleEditor
      initialContent={content}
      onEditorReady={(editor) => {
        // 编辑器准备就绪
        if (editor) {
          // 可以访问编辑器实例
          console.log('Editor ready!')
        }
      }}
    />
  )
}
```

### 2. With Image Upload

```tsx
import { SimpleEditor, PreviewPanel, type ImageUploadFunction } from 'simple-editor-pro'
import 'simple-editor-pro/styles'

function App() {
  const [content, setContent] = useState('')
  
  // 自定义图片上传函数（可选）
  const handleImageUpload: ImageUploadFunction = async (file, onProgress, abortSignal) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const xhr = new XMLHttpRequest()
    
    return new Promise((resolve, reject) => {
      // 监听上传进度
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100)
          onProgress({ progress })
        }
      })
      
      // 监听取消信号
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          xhr.abort()
          reject(new Error('Upload cancelled'))
        })
      }
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          resolve(response.url) // 返回图片 URL
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })
      
      xhr.open('POST', '/api/upload') // 你的上传 API 地址
      xhr.send(formData)
    })
  }
  
  return (
    <SimpleEditor
      onEditorReady={(editor) => {
        // Access editor instance
      }}
      initialContent={content}
      themeColor="#1677ff"
      language="zh"
      enableThemeToggle={true}
      showLeftToolbar={true}
      onImageUpload={handleImageUpload} // 使用自定义上传函数
    />
  )
}
```

## Props

### SimpleEditor

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onEditorReady` | `(editor: Editor \| null) => void` | - | Callback when editor is ready |
| `userList` | `MentionUser[]` | `[]` | List of users for @mention |
| `initialContent` | `string` | - | Initial HTML content |
| `renderImage` | `(url: string) => string` | - | Function to process image URLs |
| `themeColor` | `string` | - | Theme color for the editor |
| `language` | `'zh' \| 'en'` | `'zh'` | Language setting |
| `enableThemeToggle` | `boolean` | `false` | Enable dark/light theme toggle |
| `showLeftToolbar` | `boolean` | `true` | Show left toolbar buttons |
| `onImageUpload` | `ImageUploadFunction` | - | Custom image upload function. If not provided, uses default API |

### PreviewPanel

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | - | HTML content to preview |
| `onClose` | `() => void` | - | Callback when close button is clicked |
| `renderImage` | `(url: string) => string` | - | Function to process image URLs |
| `themeColor` | `string` | - | Theme color for the preview |

## Examples

### Get Editor Content

```tsx
import { SimpleEditor } from 'simple-editor-pro'
import 'simple-editor-pro/styles'

function App() {
  const [editor, setEditor] = useState(null)
  
  const handleSave = () => {
    if (editor) {
      const html = editor.getHTML()
      console.log('Content:', html)
      // 保存内容到服务器
    }
  }
  
  return (
    <div>
      <SimpleEditor
        onEditorReady={setEditor}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  )
}
```

### Custom Theme Color

```tsx
<SimpleEditor
  themeColor="#1677ff"  // 自定义主题色
  enableThemeToggle={true}  // 启用暗色/亮色主题切换
/>
```

### With @Mention

```tsx
const userList = [
  { id: '1', name: 'John Doe', avatar: 'https://...' },
  { id: '2', name: 'Jane Smith', avatar: 'https://...' },
]

<SimpleEditor
  userList={userList}
/>
```

### Preview Panel

```tsx
import { PreviewPanel } from 'simple-editor-pro'

function Preview({ content, onClose }) {
  return (
    <PreviewPanel
      content={content}
      onClose={onClose}
      themeColor="#1677ff"
    />
  )
}
```

## TypeScript Support

This package is written in TypeScript and includes type definitions:

```tsx
import type { 
  SimpleEditorProps, 
  ImageUploadFunction,
  PreviewPanelProps,
  MentionUser,
  Editor 
} from 'simple-editor-pro'
```

## License

MIT

