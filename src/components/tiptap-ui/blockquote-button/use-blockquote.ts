"use client"

import { useCallback, useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import { NodeSelection, TextSelection } from "@tiptap/pm/state"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useI18n } from "@/hooks/use-i18n"

// --- Icons ---
import { BlockquoteIcon } from "@/components/tiptap-icons/blockquote-icon"

// --- UI Utils ---
import {
  findNodePosition,
  isNodeInSchema,
  isNodeTypeSelected,
  isValidPosition,
} from "@/lib/tiptap-utils"

export const BLOCKQUOTE_SHORTCUT_KEY = "mod+shift+b"

/**
 * Configuration for the blockquote functionality
 */
export interface UseBlockquoteConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when blockquote is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Callback function called after a successful toggle.
   */
  onToggled?: () => void
}

/**
 * Checks if blockquote can be toggled in the current editor state
 */
export function canToggleBlockquote(
  editor: Editor | null,
  _turnInto: boolean = true
): boolean {
  // 基本检查：编辑器必须存在且可编辑
  if (!editor || !editor.isEditable) return false
  
  // 如果选择了图片节点，不允许转换为引用
  if (isNodeTypeSelected(editor, ["image"])) return false
  
  // 检查 blockquote 是否在 schema 中
  if (!isNodeInSchema("blockquote", editor)) return false

  // 放宽条件：只要编辑器可编辑且不在图片节点中，就允许操作
  // 编辑器会在执行时自动处理转换
  return true
}

/**
 * Toggles blockquote formatting for a specific node or the current selection
 */
export function toggleBlockquote(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canToggleBlockquote(editor)) return false

  try {
    const view = editor.view
    let state = view.state
    let tr = state.tr

    // No selection, find the the cursor position
    if (state.selection.empty || state.selection instanceof TextSelection) {
      const pos = findNodePosition({
        editor,
        node: state.selection.$anchor.node(1),
      })?.pos
      if (!isValidPosition(pos)) return false

      tr = tr.setSelection(NodeSelection.create(state.doc, pos))
      view.dispatch(tr)
      state = view.state
    }

    const selection = state.selection

    let chain = editor.chain().focus()

    // Handle NodeSelection
    if (selection instanceof NodeSelection) {
      const firstChild = selection.node.firstChild?.firstChild
      const lastChild = selection.node.lastChild?.lastChild

      const from = firstChild
        ? selection.from + firstChild.nodeSize
        : selection.from + 1

      const to = lastChild
        ? selection.to - lastChild.nodeSize
        : selection.to - 1

      const resolvedFrom = state.doc.resolve(from)
      const resolvedTo = state.doc.resolve(to)

      chain = chain
        .setTextSelection(TextSelection.between(resolvedFrom, resolvedTo))
        .clearNodes()
    }

    const toggle = editor.isActive("blockquote")
      ? chain.lift("blockquote")
      : chain.wrapIn("blockquote")

    toggle.run()

    editor.chain().focus().selectTextblockEnd().run()

    return true
  } catch {
    return false
  }
}

/**
 * Determines if the blockquote button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false
  if (!isNodeInSchema("blockquote", editor)) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleBlockquote(editor)
  }

  return true
}

/**
 * Custom hook that provides blockquote functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage - no params needed
 * function MySimpleBlockquoteButton() {
 *   const { isVisible, handleToggle, isActive } = useBlockquote()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleToggle}>Blockquote</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedBlockquoteButton() {
 *   const { isVisible, handleToggle, label, isActive } = useBlockquote({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onToggled: () => console.log('Blockquote toggled!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleToggle}
 *       aria-label={label}
 *       aria-pressed={isActive}
 *     >
 *       Toggle Blockquote
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useBlockquote(config?: UseBlockquoteConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onToggled,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canToggle = canToggleBlockquote(editor)
  const isActive = editor?.isActive("blockquote") || false

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleToggle = useCallback(() => {
    if (!editor) return false

    const success = toggleBlockquote(editor)
    if (success) {
      onToggled?.()
    }
    return success
  }, [editor, onToggled])

  return {
    isVisible,
    isActive,
    handleToggle,
    canToggle,
    label: t('blockquote'),
    shortcutKeys: BLOCKQUOTE_SHORTCUT_KEY,
    Icon: BlockquoteIcon,
  }
}
