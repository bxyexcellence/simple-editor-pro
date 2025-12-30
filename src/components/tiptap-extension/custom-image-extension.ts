import { Image } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CustomImageNodeView } from './custom-image-node-view'

export interface CustomImageOptions {
  renderImage?: (url: string) => string
  filterImageSrc?: (src: string) => string | null | false
}

/**
 * 自定义 Image 扩展，支持 renderImage 函数
 * - 在渲染时使用 renderImage 处理 URL（添加 token 等）
 * - 在 getHTML() 时返回原始 URL（不带 token）
 */
export const CustomImage = Image.extend<CustomImageOptions>({
  // 确保图片节点是可选的
  selectable: true,
  
  addOptions() {
    return {
      ...this.parent?.(),
      renderImage: undefined,
      filterImageSrc: undefined,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      // 保存原始 URL（不带 token）
      originalSrc: {
        default: null,
        parseHTML: (element) => {
          // 如果已经有 originalSrc，使用它；否则使用 src
          return element.getAttribute('data-original-src') || element.getAttribute('src')
        },
        renderHTML: (_attributes) => {
          // 不渲染 originalSrc 到 HTML，只在内部使用
          return {}
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          if (typeof element === 'string') return false
          const img = element as HTMLImageElement
          const src = img.getAttribute('src')
          if (!src) return false

          // 使用外部传入的过滤函数处理 src
          let filteredSrc = src
          if (this.options.filterImageSrc) {
            const result = this.options.filterImageSrc(src)
            if (result === false || result === null) {
              // 如果过滤函数返回 false 或 null，表示拒绝此图片
              return false
            }
            filteredSrc = result
          }

          return {
            src: filteredSrc,
            originalSrc: filteredSrc, // 保存原始 URL
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
          }
        },
      },
    ]
  },

  // 使用 React NodeView 来渲染图片，这样可以响应 renderImage 的变化
  addNodeView() {
    return ReactNodeViewRenderer(CustomImageNodeView)
  },

  // 重写 renderHTML 方法，用于 HTML 序列化（getHTML 时使用原始 URL）
  renderHTML({ HTMLAttributes, node }) {
    let originalSrc = node.attrs.originalSrc || node.attrs.src
    const alt = node.attrs.alt
    const title = node.attrs.title

    // 清理 originalSrc，确保它只包含 URL，不包含其他属性内容
    // 如果 originalSrc 包含了类似 "url alt=\"...\" title=\"...\"" 的内容，需要提取纯 URL
    if (originalSrc && typeof originalSrc === 'string') {
      // 移除可能包含的其他属性（如 alt="..." title="..."）
      // URL 通常不会包含未转义的空格，所以遇到空格就停止
      // 或者如果包含 alt= 或 title=，说明可能混入了其他属性
      const trimmedSrc = originalSrc.trim()
      if (trimmedSrc.includes(' alt=') || trimmedSrc.includes(' title=') || trimmedSrc.includes('alt="') || trimmedSrc.includes('title="')) {
        // 提取第一个空格之前的部分作为 URL
        const spaceIndex = trimmedSrc.indexOf(' ')
        if (spaceIndex > 0) {
          originalSrc = trimmedSrc.substring(0, spaceIndex)
        } else {
          // 如果没有空格，尝试匹配 URL 部分（不包含引号）
          const urlMatch = trimmedSrc.match(/^([^\s"']+)/)
          if (urlMatch) {
            originalSrc = urlMatch[1]
          }
        }
      } else {
        originalSrc = trimmedSrc
      }
    }

    // 清理 HTMLAttributes，移除可能冲突的属性，避免属性拼接错误
    const { src, alt: _alt, title: _title, ...restAttributes } = HTMLAttributes || {}

    // 构建属性对象，确保所有属性值都是字符串类型
    // 过滤掉非字符串类型的值，避免序列化错误
    const attrs: Record<string, string> = {}
    
    // 只保留字符串类型的属性值，避免属性未闭合的问题
    for (const [key, value] of Object.entries(restAttributes || {})) {
      if (value != null && typeof value === 'string') {
        attrs[key] = value
      }
    }

    // 在序列化时，始终使用原始 URL（不带 token）
    // 这样 getHTML() 会返回原始 URL
    // 确保所有属性值都是字符串类型，避免属性未闭合
    if (originalSrc != null && originalSrc !== '') {
      attrs.src = String(originalSrc).trim()
    }

    if (alt != null && alt !== '') {
      attrs.alt = String(alt).trim()
    }

    if (title != null && title !== '') {
      attrs.title = String(title).trim()
    }

    return ['img', attrs]
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImage: (options) => ({ commands }) => {
        // 保存原始 URL 到 originalSrc
        return commands.insertContent({
          type: this.name,
          attrs: {
            ...options,
            originalSrc: options.src, // 保存原始 URL
          },
        })
      },
    }
  },
})

