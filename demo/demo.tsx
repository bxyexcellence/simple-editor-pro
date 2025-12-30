import React, { useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { SimpleEditor } from '../src/components/SimpleEditor'
import { PreviewPanel } from '../src/components/PreviewPanel'
import type { Editor } from '@tiptap/react'
import '../src/styles/index.css'

const MarkdownDemo: React.FC = () => {
  const editorRef = useRef<Editor | null>(null)
  const [htmlOutput, setHtmlOutput] = useState('')
  const [markdownOutput, setMarkdownOutput] = useState('')
  const [initialMarkdown, setInitialMarkdown] = useState<string | undefined>(undefined)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'html' | 'markdown'>('html')

  // 测试用的 markdown 内容示例
  const testMarkdowns = {
    basic: `# 标题 1
## 标题 2
### 标题 3

这是一段**粗体**和*斜体*文本。

- 无序列表项 1
- 无序列表项 2
- 无序列表项 3

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

[这是一个链接](https://example.com)

![这是一张图片](https://via.placeholder.com/400x200)

\`行内代码\`

\`\`\`javascript
// 代码块
function hello() {
  console.log('Hello, World!')
}
\`\`\`

> 这是一个引用块
> 可以有多行

| 表格 | 列1 | 列2 |
|------|-----|-----|
| 行1  | 数据1 | 数据2 |
| 行2  | 数据3 | 数据4 |`,
    
    links: `[普通链接](https://example.com)
[带标题的链接](https://example.com "链接标题")
[图片链接](https://example.com/image.png)`,
    
    images: `![图片1](https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Image+1)
![图片2](https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Image+2)
![带标题的图片](https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Image+3 "图片标题")`,
    
    mixed: `# 混合内容测试

这是一个包含**多种格式**的测试。

## 链接测试
点击这里访问 [示例网站](https://example.com)

## 图片测试
![示例图片](https://via.placeholder.com/400x300)

## 代码测试
\`console.log('Hello')\`

## 列表测试
- 项目 1
- 项目 2
  - 嵌套项目 2.1
  - 嵌套项目 2.2`,
    
    empty: ''
  }

  // 更新输出
  const updateOutput = () => {
    if (editorRef.current) {
      try {
        const html = editorRef.current.getHTML()
        const markdown = editorRef.current.getMarkdown()
        setHtmlOutput(html)
        setMarkdownOutput(markdown)
      } catch (error) {
        console.error('获取内容失败:', error)
      }
    }
  }

  // 加载测试 markdown
  const loadTestMarkdown = (key: keyof typeof testMarkdowns) => {
    const markdown = testMarkdowns[key]
    setInitialMarkdown(markdown)
    if (editorRef.current) {
      try {
        editorRef.current.commands.setContent(markdown, { contentType: 'markdown' })
        setTimeout(updateOutput, 100)
      } catch (error) {
        console.error('设置内容失败:', error)
      }
    }
  }

  // 清空编辑器
  const clearEditor = () => {
    setInitialMarkdown('')
    if (editorRef.current) {
      editorRef.current.commands.clearContent()
      setTimeout(updateOutput, 100)
    }
  }

  // 粘贴 markdown 测试
  const pasteMarkdownTest = () => {
    const testMarkdown = `[测试链接](https://example.com)
![测试图片](https://via.placeholder.com/200x100)`
    
    // 模拟粘贴事件
    if (editorRef.current) {
      editorRef.current.commands.insertContent(testMarkdown, { contentType: 'markdown' })
      setTimeout(updateOutput, 100)
    }
  }

  // 监听编辑器变化
  useEffect(() => {
    const interval = setInterval(updateOutput, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container">
      <div className="header">
        <h1>SimpleEditor Markdown 功能测试</h1>
        <p>测试 markdown 解析、转换和编辑功能</p>
      </div>
      
      <div className="content">
        <div className="info-box">
          <p>
            <strong>测试说明：</strong>
            <br />
            1. 点击下方按钮加载不同的测试 markdown 内容
            <br />
            2. 在编辑器中直接输入 markdown 语法（如 [链接](url) 或 ![图片](url)）
            <br />
            3. 粘贴 markdown 内容测试自动转换功能
            <br />
            4. 查看下方实时输出的 HTML 和 Markdown 内容
          </p>
        </div>

        <div className="editor-section">
          <div className="section-title">编辑器</div>
          <div className="test-buttons">
            <button className="test-btn" onClick={() => loadTestMarkdown('basic')}>
              加载基础 Markdown
            </button>
            <button className="test-btn" onClick={() => loadTestMarkdown('links')}>
              加载链接测试
            </button>
            <button className="test-btn" onClick={() => loadTestMarkdown('images')}>
              加载图片测试
            </button>
            <button className="test-btn" onClick={() => loadTestMarkdown('mixed')}>
              加载混合内容
            </button>
            <button className="test-btn" onClick={pasteMarkdownTest}>
              粘贴 Markdown 测试
            </button>
            <button className="test-btn" onClick={clearEditor}>
              清空编辑器
            </button>
            <button 
              className="test-btn" 
              onClick={() => setShowPreview(!showPreview)}
              style={{ background: showPreview ? '#4caf50' : '#667eea' }}
            >
              {showPreview ? '隐藏预览' : '显示预览'}
            </button>
          </div>
          <div className="editor-wrapper">
            <SimpleEditor
              onEditorReady={(editor) => {
                editorRef.current = editor
                if (initialMarkdown !== undefined) {
                  setTimeout(() => {
                    editor?.commands.setContent(initialMarkdown, { contentType: 'markdown' })
                    updateOutput()
                  }, 100)
                }
              }}
              initialMarkdown={initialMarkdown}
              enableMarkdown={true}
              language="zh"
              enableThemeToggle={true}
              showLeftToolbar={true}
              filterImageSrc={(src) => {
                return src
              }}
              onChange={(html) => {
                setHtmlOutput(html)
              }}
              onMarkdownChange={(markdown) => {
                setMarkdownOutput(markdown)
              }}
            />
          </div>
        </div>

        {showPreview && (
          <div className="editor-section">
            <div className="section-title">
              预览面板
              <div style={{ display: 'inline-block', marginLeft: '15px' }}>
                <button
                  className="test-btn"
                  onClick={() => setPreviewMode('html')}
                  style={{
                    background: previewMode === 'html' ? '#4caf50' : '#667eea',
                    fontSize: '12px',
                    padding: '6px 12px',
                    marginRight: '5px'
                  }}
                >
                  HTML 预览
                </button>
                <button
                  className="test-btn"
                  onClick={() => setPreviewMode('markdown')}
                  style={{
                    background: previewMode === 'markdown' ? '#4caf50' : '#667eea',
                    fontSize: '12px',
                    padding: '6px 12px'
                  }}
                >
                  Markdown 预览
                </button>
              </div>
            </div>
            <div className="editor-wrapper" style={{ minHeight: '300px', maxHeight: '600px', overflow: 'auto' }}>
              <PreviewPanel
                content={previewMode === 'html' ? htmlOutput : markdownOutput}
                contentType={previewMode === 'html' ? 'html' : 'markdown'}
                themeColor="#667eea"
              />
            </div>
          </div>
        )}

        <div className="output-section">
          <div className="section-title">实时输出</div>
          
          <div style={{ marginBottom: '20px' }}>
            <div className="output-title">Markdown 输出：</div>
            <div className="output-content">{markdownOutput || '(空)'}</div>
          </div>
          
          <div>
            <div className="output-title">HTML 输出：</div>
            <div className="output-content">{htmlOutput || '(空)'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 渲染应用
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<MarkdownDemo />)
}

