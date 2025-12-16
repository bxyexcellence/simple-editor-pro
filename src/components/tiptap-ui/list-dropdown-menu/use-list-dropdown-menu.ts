"use client"

import { useEffect, useMemo, useState } from "react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useI18n } from "@/hooks/use-i18n"

// --- Icons ---
import { ListIcon } from "@/components/tiptap-icons/list-icon"
import { ListOrderedIcon } from "@/components/tiptap-icons/list-ordered-icon"
import { ListTodoIcon } from "@/components/tiptap-icons/list-todo-icon"

// --- Lib ---
import { isNodeInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils"

// --- Tiptap UI ---
import {
  isListActive,
  listIcons,
  type ListType,
} from "@/components/tiptap-ui/list-button"

/**
 * Configuration for the list dropdown menu functionality
 */
export interface UseListDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * The list types to display in the dropdown.
   * @default ["bulletList", "orderedList", "taskList"]
   */
  types?: ListType[]
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean
}

export interface ListOption {
  label: string
  type: ListType
  icon: React.ElementType
}

// listOptions will be generated dynamically with i18n
export function getListOptions(t: (key: string) => string): ListOption[] {
  return [
    {
      label: t('bulletList'),
      type: "bulletList",
      icon: ListIcon,
    },
    {
      label: t('orderedList'),
      type: "orderedList",
      icon: ListOrderedIcon,
    },
    {
      label: t('taskList'),
      type: "taskList",
      icon: ListTodoIcon,
    },
  ]
}

export function canToggleAnyList(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  // 基本检查：编辑器必须存在且可编辑
  if (!editor || !editor.isEditable) return false
  
  // 如果选择了图片节点，不允许转换为列表
  if (isNodeTypeSelected(editor, ["image"])) return false
  
  // 检查至少有一种列表类型在 schema 中
  if (!listTypes.some((type) => isNodeInSchema(type, editor))) return false

  // 放宽条件：只要编辑器可编辑且不在图片节点中，就允许操作
  return true
}

export function isAnyListActive(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor || !editor.isEditable) return false
  return listTypes.some((type) => isListActive(editor, type))
}

export function getFilteredListOptions(
  availableTypes: ListType[],
  t: (key: string) => string
): ListOption[] {
  return getListOptions(t as any).filter(
    (option) => !option.type || availableTypes.includes(option.type)
  )
}

export function shouldShowListDropdown(params: {
  editor: Editor | null
  listTypes: ListType[]
  hideWhenUnavailable: boolean
  listInSchema: boolean
  canToggleAny: boolean
}): boolean {
  const { editor, hideWhenUnavailable, listInSchema, canToggleAny } = params

  if (!listInSchema || !editor) {
    return false
  }

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canToggleAny
  }

  return true
}

/**
 * Gets the currently active list type from the available types
 */
export function getActiveListType(
  editor: Editor | null,
  availableTypes: ListType[]
): ListType | undefined {
  if (!editor || !editor.isEditable) return undefined
  return availableTypes.find((type) => isListActive(editor, type))
}

/**
 * Custom hook that provides list dropdown menu functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MyListDropdown() {
 *   const {
 *     isVisible,
 *     activeType,
 *     isAnyActive,
 *     canToggleAny,
 *     filteredLists,
 *   } = useListDropdownMenu()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <DropdownMenu>
 *       // dropdown content
 *     </DropdownMenu>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedListDropdown() {
 *   const {
 *     isVisible,
 *     activeType,
 *   } = useListDropdownMenu({
 *     editor: myEditor,
 *     types: ["bulletList", "orderedList"],
 *     hideWhenUnavailable: true,
 *   })
 *
 *   // component implementation
 * }
 * ```
 */
export function useListDropdownMenu(config?: UseListDropdownMenuConfig) {
  const {
    editor: providedEditor,
    types = ["bulletList", "orderedList", "taskList"],
    hideWhenUnavailable = false,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(true)

  const listInSchema = types.some((type) => isNodeInSchema(type, editor))

  const filteredLists = useMemo(() => getFilteredListOptions(types, t as any), [types, t])

  const canToggleAny = canToggleAnyList(editor, types)
  const isAnyActive = isAnyListActive(editor, types)
  const activeType = getActiveListType(editor, types)
  const activeList = filteredLists.find((option) => option.type === activeType)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowListDropdown({
          editor,
          listTypes: types,
          hideWhenUnavailable,
          listInSchema,
          canToggleAny,
        })
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [canToggleAny, editor, hideWhenUnavailable, listInSchema, types])

  return {
    isVisible,
    activeType,
    isActive: isAnyActive,
    canToggle: canToggleAny,
    types,
    filteredLists,
    label: t('list'),
    Icon: activeList ? listIcons[activeList.type] : ListIcon,
  }
}
