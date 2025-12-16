# Renderers 使用指南

`renderers` 允许你为不同的 HTML 标签自定义渲染函数，支持返回 React 组件或 HTML 字符串。

## 类型定义

```typescript
import type { 
  Renderers, 
  TagRenderer, 
  TagRenderContext,
  TagAttributes 
} from 'simple-editor-pro'

// Renderers 是所有标签渲染函数的映射
interface Renderers {
  [tagName: string]: TagRenderer
}

// TagRenderer 是单个标签的渲染函数
type TagRenderer = (context: TagRenderContext) => string | ReactElement

// TagRenderContext 是渲染函数的参数
interface TagRenderContext {
  tagName: string           // 标签名，如 'img', 'a', 'video'
  attributes: TagAttributes // 标签属性对象
  innerHTML: string         // 标签内部 HTML 内容
  originalHTML: string      // 原始 HTML 字符串
}

// TagAttributes 是属性对象
interface TagAttributes {
  [key: string]: string | undefined
}
```

## 基本使用

### 示例 1: 返回 React 组件

```typescript
import { PreviewPanel, type Renderers } from 'simple-editor-pro'
import React from 'react'

const renderers: Renderers = {
  // 自定义图片渲染，返回 React 组件
  img: (context) => {
    const src = context.attributes.src || ''
    const alt = context.attributes.alt || ''
    
    return (
      <img 
        src={processImageUrl(src)} 
        alt={alt}
        onClick={() => openImagePreview(src)}
        style={{ cursor: 'pointer', maxWidth: '100%' }}
      />
    )
  },
  
  // 自定义链接渲染
  a: (context) => {
    const href = context.attributes.href || '#'
    const target = context.attributes.target || '_blank'
    
    return (
      <a 
        href={href} 
        target={target}
        rel="noopener noreferrer"
      >
        {context.innerHTML}
      </a>
    )
  }
}

function MyComponent() {
  return (
    <PreviewPanel 
      content={htmlContent}
      renderers={renderers}
    />
  )
}
```

### 示例 2: 返回 HTML 字符串

```typescript
import { PreviewPanel, type Renderers } from 'simple-editor-pro'

const renderers: Renderers = {
  // 返回 HTML 字符串
  img: (context) => {
    const src = context.attributes.src || ''
    const processedSrc = processImageUrl(src)
    return `<img src="${processedSrc}" alt="${context.attributes.alt || ''}" />`
  },
  
  video: (context) => {
    const src = context.attributes.src || ''
    return `<video src="${src}" controls style="max-width: 100%;"></video>`
  }
}
```

### 示例 3: 混合使用

```typescript
import { PreviewPanel, type Renderers } from 'simple-editor-pro'
import { CustomImageComponent } from './components/CustomImage'

const renderers: Renderers = {
  // React 组件
  img: (context) => {
    return <CustomImageComponent src={context.attributes.src} />
  },
  
  // HTML 字符串
  a: (context) => {
    return `<a href="${context.attributes.href}" target="_blank">${context.innerHTML}</a>`
  },
  
  // React 组件（带子节点）
  blockquote: (context) => {
    return (
      <blockquote className="custom-blockquote">
        {context.innerHTML}
      </blockquote>
    )
  }
}
```

## 高级用法

### 条件渲染

```typescript
const renderers: Renderers = {
  img: (context) => {
    const src = context.attributes.src || ''
    
    // 根据 URL 类型选择不同的渲染方式
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return <img src={src} alt={context.attributes.alt} />
    } else {
      // 本地图片，使用特殊处理
      return <img src={`/api/images/${src}`} alt={context.attributes.alt} />
    }
  }
}
```

### 处理多个标签

```typescript
const renderers: Renderers = {
  img: (context) => {
    // 图片处理
    return <img src={processImage(context.attributes.src)} />
  },
  
  video: (context) => {
    // 视频处理
    return <video src={processVideo(context.attributes.src)} controls />
  },
  
  iframe: (context) => {
    // iframe 处理
    return <iframe src={context.attributes.src} allowFullScreen />
  },
  
  a: (context) => {
    // 链接处理
    return <a href={context.attributes.href} target="_blank">{context.innerHTML}</a>
  }
}
```

### 使用 context 中的信息

```typescript
const renderers: Renderers = {
  img: (context) => {
    // 访问所有可用的上下文信息
    console.log('Tag name:', context.tagName)        // 'img'
    console.log('Attributes:', context.attributes)    // { src: '...', alt: '...' }
    console.log('Inner HTML:', context.innerHTML)    // '' (img 是自闭合标签)
    console.log('Original HTML:', context.originalHTML) // '<img src="..." />'
    
    const src = context.attributes.src || ''
    const alt = context.attributes.alt || ''
    const title = context.attributes.title || ''
    
    return (
      <img 
        src={src}
        alt={alt}
        title={title}
        data-original-src={src}
      />
    )
  }
}
```

## 完整示例

```typescript
import React from 'react'
import { PreviewPanel, type Renderers, type TagRenderContext } from 'simple-editor-pro'

// 定义 renderers
const createRenderers = (onImageClick?: (src: string) => void): Renderers => ({
  img: (context: TagRenderContext) => {
    const src = context.attributes.src || ''
    const alt = context.attributes.alt || ''
    
    return (
      <img
        src={src}
        alt={alt}
        onClick={() => onImageClick?.(src)}
        style={{ 
          cursor: onImageClick ? 'pointer' : 'default',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    )
  },
  
  a: (context: TagRenderContext) => {
    const href = context.attributes.href || '#'
    
    return (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // 可以添加自定义点击处理
          console.log('Link clicked:', href)
        }}
      >
        {context.innerHTML}
      </a>
    )
  },
  
  video: (context: TagRenderContext) => {
    const src = context.attributes.src || ''
    
    return (
      <video
        src={src}
        controls
        style={{ maxWidth: '100%' }}
      />
    )
  }
})

function MyPreviewComponent() {
  const handleImageClick = (src: string) => {
    console.log('Image clicked:', src)
    // 打开图片预览等操作
  }
  
  const renderers = createRenderers(handleImageClick)
  
  return (
    <PreviewPanel
      content={htmlContent}
      renderers={renderers}
      onClose={() => console.log('Preview closed')}
    />
  )
}
```

## 注意事项

1. **性能优化**: 如果没有提供 `renderers`，组件会使用 `dangerouslySetInnerHTML` 直接渲染，性能更好。

2. **递归处理**: 如果 renderer 返回的 HTML 字符串中包含需要渲染的标签，这些标签也会被处理。

3. **错误处理**: 如果 renderer 函数抛出错误，组件会回退到默认渲染。

4. **子节点处理**: 当返回 React 组件时，如果原标签有子节点，子节点会自动传递给 React 组件。

5. **类型安全**: 使用 TypeScript 时，类型定义提供了完整的类型检查和智能提示。

