import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor, type Editor } from "@tiptap/react"
import { marked } from "marked"
import { applyThemeColor } from "@/lib/theme"
import { setLanguage, type Language } from "@/lib/i18n"
import { notifyLanguageChange } from "@/hooks/use-i18n"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "@tiptap/markdown"
import { CustomImage } from "@/components/tiptap-extension/custom-image-extension"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { Mention } from "@tiptap/extension-mention"
import { createMentionSuggestion } from "@/components/tiptap-ui/mention-list/mention-list"
import type { MentionUser } from "@/lib/api"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import "@/components/tiptap-node/table-node/table-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { TableDropdownMenu } from "@/components/tiptap-ui/table-dropdown-menu"
import { TableContextMenu } from "@/components/tiptap-ui/table-context-menu"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { ZoomInIcon } from "@/components/tiptap-icons/zoom-in-icon"
import { ZoomOutIcon } from "@/components/tiptap-icons/zoom-out-icon"
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useI18n } from "@/hooks/use-i18n"
import { useToolbarOverflow } from "@/hooks/use-toolbar-overflow"
import { useElementWidth } from "@/hooks/use-element-width"


// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { detectContentType } from "@/components/PreviewPanel"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"


const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  isFullscreen,
  onToggleFullscreen,
  enableThemeToggle,
  isOverflowing,
  editorWidth,
  showLeftToolbar,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
  isFullscreen: boolean
  onToggleFullscreen: () => void
  enableThemeToggle: boolean
  isOverflowing: boolean
  editorWidth: number
  showLeftToolbar: boolean
}) => {
  const { t } = useI18n()
  // 当编辑器组件宽度低于850px时，隐藏上标、下标和对齐按钮
  const shouldHideAdvancedFormatting = editorWidth > 0 && editorWidth < 850

  // 如果隐藏左侧工具栏，只显示全屏按钮（在右上角）
  if (!showLeftToolbar) {
    return (
      <>
        <Spacer />
        <ToolbarGroup>
          {enableThemeToggle && <ThemeToggle />}
          <Button
            type="button"
            data-style="ghost"
            onClick={onToggleFullscreen}
            tooltip={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
            aria-label={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          >
            {isFullscreen ? (
              <ZoomOutIcon className="tiptap-button-icon" />
            ) : (
              <ZoomInIcon className="tiptap-button-icon" />
            )}
          </Button>
        </ToolbarGroup>
      </>
    )
  }

  // 当工具栏出现滚动条时，只显示：撤销/重做、标题、列表、引用、代码块、表格、右边的放大缩小
  if (isOverflowing) {
    return (
      <>
        <Spacer />

        <ToolbarGroup>
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
          <ListDropdownMenu
            types={["bulletList", "orderedList", "taskList"]}
            portal={isMobile}
          />
          <BlockquoteButton />
          <CodeBlockButton />
          <TableDropdownMenu portal={isMobile} />
        </ToolbarGroup>

        <Spacer />

        <ToolbarGroup>
          {enableThemeToggle && <ThemeToggle />}
          <Button
            type="button"
            data-style="ghost"
            onClick={onToggleFullscreen}
            tooltip={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
            aria-label={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          >
            {isFullscreen ? (
              <ZoomOutIcon className="tiptap-button-icon" />
            ) : (
              <ZoomInIcon className="tiptap-button-icon" />
            )}
          </Button>
        </ToolbarGroup>
      </>
    )
  }

  // 正常情况显示所有功能
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
        <TableDropdownMenu portal={isMobile} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      {!shouldHideAdvancedFormatting && (
        <>
          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>

          <ToolbarSeparator />
        </>
      )}

      <ToolbarGroup>
        <ImageUploadButton />
      </ToolbarGroup>

      <Spacer />

      <ToolbarGroup>
        {enableThemeToggle && <ThemeToggle />}
        <Button
          type="button"
          data-style="ghost"
          onClick={onToggleFullscreen}
          tooltip={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          aria-label={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
        >
          {isFullscreen ? (
            <ZoomOutIcon className="tiptap-button-icon" />
          ) : (
            <ZoomInIcon className="tiptap-button-icon" />
          )}
        </Button>
      </ToolbarGroup>
    </>
  )
}

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export type ImageUploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>

interface SimpleEditorProps {
  onEditorReady?: (editor: Editor | null) => void
  userList?: MentionUser[]
  initialContent?: string
  initialMarkdown?: string
  renderImage?: (url: string) => string
  themeColor?: string
  language?: Language
  enableThemeToggle?: boolean
  showLeftToolbar?: boolean
  onImageUpload?: ImageUploadFunction
  onChange?: (content: string) => void
  onMarkdownChange?: (markdown: string) => void
  enableMarkdown?: boolean
}

export type { SimpleEditorProps }

export function SimpleEditor({
  onEditorReady,
  userList = [],
  initialContent,
  initialMarkdown,
  renderImage,
  themeColor,
  language = 'zh',
  enableThemeToggle = false,
  showLeftToolbar = true,
  onImageUpload,
  onChange,
  onMarkdownChange,
  enableMarkdown = true
}: SimpleEditorProps = {}) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const userListRef = useRef<MentionUser[]>(userList)

  // 检测工具栏是否溢出（出现滚动条）
  const isOverflowing = useToolbarOverflow(toolbarRef)

  // 获取编辑器组件的宽度
  const editorWidth = useElementWidth(wrapperRef)

  // 使用外部传入的上传函数，如果没有则使用默认的
  const imageUploadHandler = onImageUpload || handleImageUpload

  // 实时更新 userList ref
  useEffect(() => {
    userListRef.current = userList
  }, [userList])

  const editor = useEditor({
    immediatelyRender: false,
    editable: true,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleKeyDown: (view, event) => {
        // 检测并转换 markdown 语法（在输入空格或回车后）
        if (enableMarkdown && editor && (event.key === ' ' || event.key === 'Enter')) {
          // 延迟执行，确保文本已插入
          setTimeout(() => {
            if (!editor) return
            
            try {
              const markdown = editor.getMarkdown()
              // 检测 markdown 链接或图片语法
              const markdownLinkPattern = /\[([^\]]*)\]\(([^)]+)\)/
              const markdownImagePattern = /!\[([^\]]*)\]\(([^)]+)\)/
              
              // 检查最后输入的内容是否包含 markdown 语法
              const lines = markdown.split('\n')
              const lastLine = lines[lines.length - 1] || ''
              
              if (markdownLinkPattern.test(lastLine) || markdownImagePattern.test(lastLine)) {
                // 尝试转换这一行的 markdown 语法
                try {
                  const html = marked.parse(lastLine, { breaks: true, gfm: true })
                  if (typeof html === 'string' && html.trim() && html !== lastLine) {
                    // 获取当前光标位置
                    const { selection } = editor.state
                    const { $from } = selection
                    const lineStart = $from.start($from.depth)
                    const lineEnd = $from.end($from.depth)
                    
                    // 替换当前行的内容
                    editor.commands.setTextSelection({ from: lineStart, to: lineEnd })
                    editor.commands.insertContent(html)
                  }
                } catch (error) {
                  // 转换失败，忽略
                }
              }
            } catch (error) {
              // 转换失败，忽略
            }
          }, 100)
        }
        
        // 处理删除键删除表格
        if (event.key === "Backspace" || event.key === "Delete") {
          const { state } = view
          const { selection } = state
          const { $anchor } = selection

          // 检查是否在表格内
          for (let depth = $anchor.depth; depth > 0; depth--) {
            const node = $anchor.node(depth)
            if (node.type.name === "table") {
              // 检查表格是否为空（所有单元格都是空的或只有空段落）
              let isEmpty = true

              // 遍历所有行
              for (let i = 0; i < node.content.childCount; i++) {
                const row = node.content.child(i)
                if (row.type.name !== "tableRow") continue

                // 遍历行中的所有单元格
                for (let j = 0; j < row.content.childCount; j++) {
                  const cell = row.content.child(j)
                  if (cell.type.name !== "tableCell" && cell.type.name !== "tableHeader") continue

                  // 检查单元格内容
                  if (cell.content.childCount > 0) {
                    // 检查是否所有内容都是空段落
                    for (let k = 0; k < cell.content.childCount; k++) {
                      const child = cell.content.child(k)
                      if (child.type.name === "paragraph") {
                        if (child.content.size > 0) {
                          isEmpty = false
                          break
                        }
                      } else {
                        isEmpty = false
                        break
                      }
                    }
                    if (!isEmpty) break
                  }
                }
                if (!isEmpty) break
              }

              if (isEmpty) {
                event.preventDefault()
                // 获取表格的位置并删除
                const pos = $anchor.before(depth)
                view.dispatch(
                  state.tr.delete(pos, pos + node.nodeSize)
                )
                return true
              }
              break
            }
          }
        }
        return false
      },
      handlePaste: (_view, event) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const items = Array.from(clipboardData.items)
        const imageItems = items.filter((item) => item.type.startsWith("image/"))

        if (imageItems.length > 0) {
          event.preventDefault()

          const uploadPromises = imageItems.map(async (item) => {
            const file = item.getAsFile()
            if (!file) return null

            // 检查文件大小
            if (file.size > MAX_FILE_SIZE) {
              console.error(
                `File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`
              )
              return null
            }

            try {
              // 上传图片（使用外部传入的上传函数或默认函数）
              const url = await imageUploadHandler(file)
              return { url, alt: file.name.replace(/\.[^/.]+$/, "") || "pasted-image" }
            } catch (error) {
              console.error("Upload failed:", error)
              return null
            }
          })

          Promise.all(uploadPromises).then((results) => {
            const validResults = results.filter(
              (result): result is { url: string; alt: string } => result !== null
            )

            if (validResults.length > 0 && editor) {
              // 插入图片到编辑器
              const imageNodes = validResults.map((result) => ({
                type: "image",
                attrs: {
                  src: result.url,
                  originalSrc: result.url, // 保存原始 URL
                  alt: result.alt,
                  title: result.alt,
                },
              }))

              editor.chain().focus().insertContent(imageNodes).run()
            }
          })

          return true
        }

        // 处理粘贴的文本内容，检测是否为 markdown
        const text = clipboardData.getData('text/plain')
        if (text && enableMarkdown && editor) {
          // 使用 detectContentType 检测是否为 markdown（支持标题、列表、粗体、链接、图片等）
          const detectedType = detectContentType(text)
          
          if (detectedType === 'markdown') {
            try {
              event.preventDefault()
              // 使用 insertContent 并指定 contentType 为 markdown，让 Tiptap 自动转换
              editor.commands.insertContent(text, { contentType: 'markdown' })
              return true
            } catch (error) {
              console.warn('Failed to paste markdown:', error)
              // 转换失败，尝试使用 marked 转换为 HTML
              try {
                const html = marked.parse(text, { breaks: true, gfm: true })
                if (typeof html === 'string') {
                  editor.commands.insertContent(html)
                  return true
                }
              } catch (parseError) {
                console.warn('Failed to convert markdown to HTML:', parseError)
                // 转换失败，继续使用默认粘贴行为
              }
            }
          }
        }

        return false
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      Markdown,
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      CustomImage.configure({
        renderImage,
      }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: createMentionSuggestion(() => userListRef.current),
      }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: imageUploadHandler,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: (() => {
      // 如果提供了 initialMarkdown，使用 markdown（将在 useEffect 中设置）
      if (initialMarkdown) {
        return undefined
      }
      
      // 如果提供了 initialContent 且启用了 markdown，检测是否为 markdown
      if (initialContent && enableMarkdown) {
        const detectedType = detectContentType(initialContent)
        if (detectedType === 'markdown') {
          // 是 markdown，转换为 HTML
          try {
            const html = marked.parse(initialContent, { breaks: true, gfm: true })
            return typeof html === 'string' ? html : initialContent
          } catch (error) {
            console.warn('Failed to convert initial markdown content:', error)
            return initialContent
          }
        }
      }
      
      // 默认返回 initialContent（可能是 HTML 或纯文本）
      return initialContent
    })(),
    contentType: enableMarkdown ? 'markdown' : undefined,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const content = editor.getHTML()
        onChange(content)
      }
      if (enableMarkdown && onMarkdownChange) {
        try {
          const markdown = editor.getMarkdown()
          onMarkdownChange(markdown)
        } catch (error) {
          console.warn('Failed to get markdown:', error)
        }
      }
    },
  })

  // 手动保存函数（保留用于快捷键）
  const handleSave =  () => {
    if (!editor) return
    const content = editor.getHTML()
    // await saveDraft(content)
    onChange?.(content)
  }

  // 初始化 markdown 内容（如果提供了 initialMarkdown）
  useEffect(() => {
    if (editor && initialMarkdown) {
      try {
        editor.commands.setContent(initialMarkdown, { contentType: 'markdown' })
      } catch (error) {
        console.warn('Failed to set markdown:', error)
      }
    }
  }, [editor, initialMarkdown])

  // 将编辑器实例传递给父组件
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
    return () => {
      if (onEditorReady) {
        onEditorReady(null)
      }
    }
  }, [editor, onEditorReady])

  // 应用主题色
  useEffect(() => {
    if (themeColor) {
      applyThemeColor(themeColor)
    }
  }, [themeColor])

  // 设置语言
  useEffect(() => {
    setLanguage(language)
    notifyLanguageChange()
  }, [language])

  // 添加键盘快捷键保存 (Cmd/Ctrl + S) 和退出全屏 (ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // ESC 键退出全屏
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault()
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, isFullscreen])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // 处理全屏样式
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      if (wrapperRef.current) {
        wrapperRef.current.classList.add('is-fullscreen')
      }
    } else {
      document.body.style.overflow = ''
      if (wrapperRef.current) {
        wrapperRef.current.classList.remove('is-fullscreen')
      }
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  return (
    <div
      ref={wrapperRef}
      className={`simple-editor-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          variant="fixed"
          style={{
            ...(isMobile
              ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              enableThemeToggle={enableThemeToggle}
              isOverflowing={isOverflowing}
              editorWidth={editorWidth}
              showLeftToolbar={showLeftToolbar}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
        {editor && <TableContextMenu editor={editor} />}
      </EditorContext.Provider>
    </div>
  )
}
