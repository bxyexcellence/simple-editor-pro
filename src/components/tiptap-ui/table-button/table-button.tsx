import { forwardRef, useCallback, useState, useEffect } from "react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useI18n } from "@/hooks/use-i18n"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { TableIcon } from "@/components/tiptap-icons/table-icon"
import { TrashIcon } from "@/components/tiptap-icons/trash-icon"
import type { Editor } from "@tiptap/react"

interface TableButtonProps {
  editor?: Editor
  rows?: number
  cols?: number
  hideWhenUnavailable?: boolean
  onInserted?: () => void
  [key: string]: any
}

/**
 * Checks if the editor is currently in a table
 */
function isInTable(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.isActive("table")
}

/**
 * Inserts a table in the editor
 */
function insertTable(editor: Editor | null, rows: number = 3, cols: number = 3): boolean {
  if (!editor || !editor.isEditable) return false

  try {
    return editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run()
  } catch {
    return false
  }
}

/**
 * Deletes the table the cursor is currently in
 */
function deleteTable(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isInTable(editor)) return false

  try {
    return editor.chain().focus().deleteTable().run()
  } catch {
    return false
  }
}

export const TableButton = forwardRef<HTMLButtonElement, TableButtonProps>(
  (
    {
      editor: providedEditor,
      rows = 3,
      cols = 3,
      hideWhenUnavailable = false,
      onInserted,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isActive, setIsActive] = useState(false)

    // 监听表格状态变化
    useEffect(() => {
      if (!editor) return

      const updateActive = () => {
        setIsActive(isInTable(editor))
      }

      updateActive()
      editor.on("selectionUpdate", updateActive)
      editor.on("transaction", updateActive)

      return () => {
        editor.off("selectionUpdate", updateActive)
        editor.off("transaction", updateActive)
      }
    }, [editor])

    const handleClick = useCallback(
      (_event: React.MouseEvent<HTMLButtonElement>) => {
        if (!editor) return

        if (isActive) {
          // 如果在表格内，删除表格
          deleteTable(editor)
        } else {
          // 否则插入新表格
          const success = insertTable(editor, rows, cols)
          if (success) {
            onInserted?.()
          }
        }
      },
      [editor, rows, cols, onInserted, isActive]
    )

    if (!editor) {
      return null
    }

    const { t } = useI18n()

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        aria-label={isActive ? t('deleteTable') : t('insertTable')}
        tooltip={isActive ? t('deleteTable') : t('insertTable')}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {isActive ? (
          <TrashIcon className="tiptap-button-icon" />
        ) : (
          <TableIcon className="tiptap-button-icon" />
        )}
      </Button>
    )
  }
)

TableButton.displayName = "TableButton"

