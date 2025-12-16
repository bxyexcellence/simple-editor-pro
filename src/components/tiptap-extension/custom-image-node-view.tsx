import React, { useEffect, useRef, useState } from 'react'
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import './custom-image-node-view.scss'

export const CustomImageNodeView: React.FC<ReactNodeViewProps> = ({ node, extension, selected }) => {
  const { renderImage } = (extension.options as { renderImage?: (url: string) => string })
  const originalSrc = (node.attrs.originalSrc as string | undefined) || (node.attrs.src as string)
  const imgRef = useRef<HTMLImageElement>(null)
  const [isSelected, setIsSelected] = useState(selected)

  // 监听选中状态变化
  useEffect(() => {
    setIsSelected(selected)
  }, [selected])

  // 计算显示 URL
  const displaySrc = renderImage && originalSrc ? renderImage(originalSrc) : originalSrc

  // 当 renderImage 或 originalSrc 变化时，更新图片 src
  useEffect(() => {
    if (imgRef.current && displaySrc) {
      imgRef.current.src = displaySrc
    }
  }, [displaySrc])

  return (
    <NodeViewWrapper 
      as="span" 
      className={`custom-image-wrapper ${isSelected ? 'ProseMirror-selectednode' : ''}`}
    >
      <img
        ref={imgRef}
        src={displaySrc}
        data-original-src={originalSrc}
        alt={(node.attrs.alt as string | undefined) || ''}
        title={(node.attrs.title as string | undefined) || ''}
        className={isSelected ? 'selected' : ''}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
        }}
      />
    </NodeViewWrapper>
  )
}

