import React, { useMemo, useEffect, ReactElement } from 'react';
import parse, { HTMLReactParserOptions, domToReact, DOMNode } from 'html-react-parser';
import { marked } from 'marked';
import { applyThemeColor } from '@/lib/theme'
import { normalizeUrl } from '@/lib/tiptap-utils'

// Import all node styles for preview
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import "@/components/tiptap-node/table-node/table-node.scss"

/**
 * 标签属性解析结果
 * 
 * @example
 * ```typescript
 * const attributes: TagAttributes = {
 *   src: '/path/to/image.jpg',
 *   alt: 'Image description',
 *   class: 'custom-class'
 * }
 * ```
 */
export interface TagAttributes {
  [key: string]: string | undefined
}

/**
 * 标签渲染函数的参数
 * 
 * @example
 * ```typescript
 * const renderer: TagRenderer = (context) => {
 *   console.log(context.tagName)      // 'img'
 *   console.log(context.attributes)    // { src: '...', alt: '...' }
 *   console.log(context.innerHTML)     // '' (对于自闭合标签)
 *   console.log(context.originalHTML)  // '<img src="..." />'
 *   return <img src={context.attributes.src} />
 * }
 * ```
 */
export interface TagRenderContext {
  /** 标签名，如 'img', 'a', 'video' */
  tagName: string
  /** 标签属性对象 */
  attributes: TagAttributes
  /** 标签内部 HTML 内容（对于成对标签） */
  innerHTML: string
  /** 原始 HTML 字符串 */
  originalHTML: string
}

/**
 * 单个标签的渲染函数
 * 
 * 可以返回：
 * - React 组件（ReactElement）
 * - HTML 字符串
 * 
 * @param context 标签的上下文信息
 * @returns 处理后的 HTML 字符串或 React 组件
 * 
 * @example
 * ```typescript
 * // 返回 React 组件
 * const imgRenderer: TagRenderer = (context) => {
 *   return <img src={context.attributes.src} />
 * }
 * 
 * // 返回 HTML 字符串
 * const linkRenderer: TagRenderer = (context) => {
 *   return `<a href="${context.attributes.href}">${context.innerHTML}</a>`
 * }
 * ```
 */
export type TagRenderer = (context: TagRenderContext) => string | ReactElement

/**
 * 所有标签的渲染函数映射
 * 
 * 键是标签名（小写），值是对应的渲染函数
 * 
 * @example
 * ```typescript
 * const renderers: Renderers = {
 *   img: (context) => <img src={context.attributes.src} />,
 *   a: (context) => <a href={context.attributes.href}>{context.innerHTML}</a>,
 *   video: (context) => <video src={context.attributes.src} controls />
 * }
 * 
 * <PreviewPanel content={html} renderers={renderers} />
 * ```
 */
export interface Renderers {
  [tagName: string]: TagRenderer
}

export interface PreviewPanelProps {
  content: string;
  onClose?: () => void;
  /** 标签渲染函数映射，支持为不同标签传入自定义渲染函数 */
  renderers?: Renderers;
  themeColor?: string;
  /** 内容类型：'html'、'markdown' 或 'auto'（自动检测），默认为 'auto' */
  contentType?: 'html' | 'markdown' | 'auto';
}

/**
 * 自动检测内容类型（HTML 或 Markdown）
 * @param content 要检测的内容
 * @returns 'html' 或 'markdown'
 */
export function detectContentType(content: string): 'html' | 'markdown' {
  if (!content || content.trim().length === 0) {
    return 'html' // 空内容默认为 HTML
  }

  const trimmed = content.trim()

  // 检测明显的 HTML 标签
  const htmlTagPattern = /<\/?[a-z][\s\S]*>/i
  const hasHtmlTags = htmlTagPattern.test(trimmed)

  // 检测 HTML 标签是否成对出现（更可能是 HTML）
  const htmlTagCount = (trimmed.match(/<\/?[a-z][\s\S]*>/gi) || []).length
  const closingTagCount = (trimmed.match(/<\/[a-z][\s\S]*>/gi) || []).length
  
  // 如果有很多成对的 HTML 标签，很可能是 HTML
  if (hasHtmlTags && closingTagCount > 0 && htmlTagCount >= 2) {
    return 'html'
  }

  // 检测 Markdown 特征（使用全局匹配，不限制行首行尾）
  const markdownPatterns = [
    /#{1,6}\s+.+/m,                    // 标题 # ## ###
    /\*\*.*?\*\*/m,                   // 粗体 **text**
    /\*[^*\n].*?\*/m,                 // 斜体 *text* (不匹配 **)
    /^\- .+/m,                        // 无序列表 - item
    /^\d+\. .+/m,                     // 有序列表 1. item
    /```[\s\S]*?```/m,                // 代码块 ```
    /`[^`\n]+`/m,                     // 行内代码 `code`
    /\[([^\]]*)\]\([^)]+\)/m,        // 链接 [text](url) 或 [](url) 或 [url](url)
    /!\[\]\([^)]+\)/m,                // 图片 ![](url) - 空 alt
    /!\[[^\]]*\]\([^)]+\)/m,          // 图片 ![alt](url) - 有 alt
    /^> .+/m,                         // 引用 > text
    /^---$/m,                         // 分隔线 ---
    /\|.+\|/m,                        // 表格 | col |
  ]

  const markdownScore = markdownPatterns.reduce((score, pattern) => {
    return score + (pattern.test(trimmed) ? 1 : 0)
  }, 0)

  // 如果有明显的 HTML 标签且没有 markdown 特征，判断为 HTML
  if (hasHtmlTags && markdownScore === 0) {
    return 'html'
  }

  // 如果有任何 markdown 特征，判断为 markdown（更宽松的检测）
  if (markdownScore > 0) {
    return 'markdown'
  }

  // 如果内容以 < 开头且以 > 结尾，很可能是 HTML
  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    return 'html'
  }

  // 默认判断为 HTML（更安全，因为 HTML 解析器对纯文本更宽容）
  return 'html'
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  content, 
  onClose, 
  renderers,
  themeColor,
  contentType = 'auto'
}) => {
  // 应用主题色
  useEffect(() => {
    if (themeColor) {
      applyThemeColor(themeColor)
    }
  }, [themeColor])

  // 使用传入的 renderers
  const mergedRenderers = useMemo(() => {
    return renderers || {}
  }, [renderers])

  // 处理内容（HTML 或 Markdown），支持多个标签的自定义渲染（包括 React 组件）
  const processedContent = useMemo(() => {
    // 确定实际的内容类型
    const actualContentType = contentType === 'auto' 
      ? detectContentType(content) 
      : contentType

    // 如果是 markdown，先转换为 HTML
    let htmlContent = content
    if (actualContentType === 'markdown') {
      try {
        // 使用 marked 将 markdown 转换为 HTML
        // 配置 marked 以支持链接和图片的正确解析，以及更完整的 markdown 特性
        const parsed = marked.parse(content, { 
          breaks: true,
          gfm: true // 启用 GitHub Flavored Markdown
        })
        htmlContent = typeof parsed === 'string' ? parsed : String(parsed)
      } catch (error) {
        console.error('Failed to parse markdown:', error)
        // 如果转换失败，使用原始内容
        htmlContent = content
      }
    }

    if (!mergedRenderers || Object.keys(mergedRenderers).length === 0) {
      // 没有 renderers，直接使用 dangerouslySetInnerHTML
      // 自动为所有链接添加 target="_blank" 和 rel="noopener noreferrer"，并规范化 URL
      const processedHtml = htmlContent.replace(
        /<a\s+([^>]*?)href=(["'])([^"']*?)\2([^>]*)>/gi,
        (_match, beforeHref, quote, url, afterHref) => {
          // 规范化 URL
          const normalizedUrl = normalizeUrl(url)
          
          // 构建新的属性字符串
          let newAttrs = `${beforeHref}href=${quote}${normalizedUrl}${quote}${afterHref}`
          
          // 检查是否已经有 target 属性
          if (!/target=/i.test(newAttrs)) {
            newAttrs += ' target="_blank"'
          }
          // 检查是否已经有 rel 属性
          if (!/rel=/i.test(newAttrs)) {
            newAttrs += ' rel="noopener noreferrer"'
          }
          return `<a ${newAttrs}>`
        }
      )
      return { type: 'html' as const, content: processedHtml }
    }

    try {
      // 使用 html-react-parser 的 replace 选项来处理自定义 renderers
      const options: HTMLReactParserOptions = {
        replace: (domNode: DOMNode, _index: number) => {
          // 只处理元素节点
          if (domNode.type === 'tag' && 'name' in domNode && domNode.name) {
            const tagName = domNode.name.toLowerCase()
            
            // 对于链接标签，如果没有自定义 renderer，自动添加 target 和 rel 属性，并规范化 URL
            if (tagName === 'a' && !mergedRenderers['a']) {
              if ('attribs' in domNode && domNode.attribs) {
                // 规范化 href URL
                if (domNode.attribs.href) {
                  domNode.attribs.href = normalizeUrl(domNode.attribs.href)
                }
                // 添加 target 和 rel 属性
                if (!domNode.attribs.target) {
                  domNode.attribs.target = '_blank'
                }
                if (!domNode.attribs.rel) {
                  domNode.attribs.rel = 'noopener noreferrer'
                }
              }
            }
            
            const renderer = mergedRenderers[tagName]

            if (renderer) {
              try {
                // 解析属性
                const attributes: TagAttributes = {}
                if ('attribs' in domNode && domNode.attribs) {
                  Object.entries(domNode.attribs).forEach(([key, value]) => {
                    attributes[key.toLowerCase()] = String(value)
                  })
                }

                // 获取内部 HTML（html-react-parser 不直接提供，我们通过子节点构建）
                let innerHTML = ''
                if ('children' in domNode && domNode.children && domNode.children.length > 0) {
                  // 为了简化，我们暂时使用空字符串
                  // 如果需要 innerHTML，可以通过递归处理子节点来构建
                  innerHTML = ''
                }

                const context: TagRenderContext = {
                  tagName,
                  attributes,
                  innerHTML,
                  originalHTML: '', // html-react-parser 不提供 outerHTML
                }

                const result = renderer(context)

                // 如果返回的是 React 组件，直接返回
                if (React.isValidElement(result)) {
                  // 如果组件需要子节点，使用 domToReact 处理子节点
                  if ('children' in domNode && domNode.children && domNode.children.length > 0) {
                    const childElements = domToReact(domNode.children as DOMNode[], options)
                    // 如果 result 已经有 children，合并它们
                    const existingChildren = (result.props as any)?.children
                    if (existingChildren) {
                      return React.cloneElement(result, {
                        children: [existingChildren, childElements]
                      } as any)
                    }
                    return React.cloneElement(result, {
                      children: childElements
                    } as any)
                  }
                  return result
                }

                // 如果返回的是字符串
                if (typeof result === 'string') {
                  // 如果返回的字符串是 HTML，需要递归解析
                  if (result.trim().startsWith('<')) {
                    // 创建一个新的 options，避免无限递归
                    const recursiveOptions: HTMLReactParserOptions = {
                      replace: (node: DOMNode, idx: number) => {
                        // 对于递归解析中的相同标签，使用默认渲染（避免无限递归）
                        if (node.type === 'tag' && 'name' in node && node.name === tagName) {
                          return undefined
                        }
                        // 继续使用 replace 处理其他标签
                        return options.replace?.(node, idx)
                      }
                    }
                    return parse(result, recursiveOptions) as any
                  }

                  // 如果返回的是纯文本，直接返回
                  return result
                }

                // 如果返回的不是字符串也不是 React 元素，使用默认渲染
                console.warn(`Renderer for ${tagName} returned invalid value, using default rendering`)
              } catch (error) {
                console.error(`Error rendering ${tagName} tag:`, error)
                // 出错时，继续使用默认渲染
              }
            }
          }

          // 返回 undefined 表示使用默认渲染
          return undefined
        }
      }

      // 使用 html-react-parser 解析 HTML
      const reactElements = parse(htmlContent, options)

      // 检查是否成功解析为 React 元素
      if (reactElements && (Array.isArray(reactElements) || React.isValidElement(reactElements))) {
        return { type: 'react' as const, elements: reactElements }
      }

      // 如果解析失败，回退到 HTML 渲染
      return { type: 'html' as const, content: htmlContent }
    } catch (error) {
      console.error('Error parsing HTML:', error)
      // 解析失败，回退到 HTML 渲染
      return { type: 'html' as const, content: htmlContent }
    }
  }, [content, contentType, mergedRenderers])

  return (
    <div className="preview-panel">
      {onClose && (
        <div className="preview-panel-header">
          <h2>预览</h2>
          <button 
            className="preview-close-button"
            onClick={onClose}
            aria-label="关闭预览"
          >
            ✕
          </button>
        </div>
      )}
      <div className="preview-content tiptap ProseMirror">
        {processedContent.type === 'html' ? (
          <div dangerouslySetInnerHTML={{ __html: processedContent.content }} />
        ) : (
          processedContent.elements
        )}
      </div>
    </div>
  );
};

