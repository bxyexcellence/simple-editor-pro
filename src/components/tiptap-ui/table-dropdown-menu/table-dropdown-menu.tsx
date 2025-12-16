import { forwardRef, useCallback, useState, useEffect } from "react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useI18n } from "@/hooks/use-i18n"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"
import { TableIcon } from "@/components/tiptap-icons/table-icon"
import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import type { Editor } from "@tiptap/react"
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"

interface TableDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor
  rows?: number
  cols?: number
  hideWhenUnavailable?: boolean
  onOpenChange?: (open: boolean) => void
  portal?: boolean
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

/**
 * Adds a row before the current row
 */
function addRowBefore(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isInTable(editor)) return false

  try {
    return editor.chain().focus().addRowBefore().run()
  } catch {
    return false
  }
}

/**
 * Adds a row after the current row
 */
function addRowAfter(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isInTable(editor)) return false

  try {
    return editor.chain().focus().addRowAfter().run()
  } catch {
    return false
  }
}

/**
 * Deletes the current row
 */
function deleteRow(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isInTable(editor)) return false

  try {
    return editor.chain().focus().deleteRow().run()
  } catch {
    return false
  }
}

/**
 * Adds a column before the current column
 */
function addColumnBefore(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isInTable(editor)) return false

  try {
    return editor.chain().focus().addColumnBefore().run()
  } catch {
    return false
  }
}

/**
 * Adds a column after the current column
 */
function addColumnAfter(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isInTable(editor)) return false

  try {
    return editor.chain().focus().addColumnAfter().run()
  } catch {
    return false
  }
}

/**
 * Deletes the current column
 */
function deleteColumn(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isInTable(editor)) return false

  try {
    return editor.chain().focus().deleteColumn().run()
  } catch {
    return false
  }
}

export const TableDropdownMenu = forwardRef<HTMLButtonElement, TableDropdownMenuProps>(
  (
    {
      editor: providedEditor,
      rows = 3,
      cols = 3,
      hideWhenUnavailable = false,
      onOpenChange,
      portal = false,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const { t } = useI18n()
    const [isOpen, setIsOpen] = useState(false)
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

    const handleOpenChange = useCallback(
      (open: boolean) => {
        setIsOpen(open)
        onOpenChange?.(open)
      },
      [onOpenChange]
    )

    const handleInsertTable = useCallback(() => {
      if (!editor) return
      insertTable(editor, rows, cols)
      handleOpenChange(false)
    }, [editor, rows, cols, handleOpenChange])

    const handleDeleteTable = useCallback(() => {
      if (!editor) return
      deleteTable(editor)
      handleOpenChange(false)
    }, [editor, handleOpenChange])

    const handleAddRowBefore = useCallback(() => {
      if (!editor) return
      addRowBefore(editor)
      handleOpenChange(false)
    }, [editor, handleOpenChange])

    const handleAddRowAfter = useCallback(() => {
      if (!editor) return
      addRowAfter(editor)
      handleOpenChange(false)
    }, [editor, handleOpenChange])

    const handleDeleteRow = useCallback(() => {
      if (!editor) return
      deleteRow(editor)
      handleOpenChange(false)
    }, [editor, handleOpenChange])

    const handleAddColumnBefore = useCallback(() => {
      if (!editor) return
      addColumnBefore(editor)
      handleOpenChange(false)
    }, [editor, handleOpenChange])

    const handleAddColumnAfter = useCallback(() => {
      if (!editor) return
      addColumnAfter(editor)
      handleOpenChange(false)
    }, [editor, handleOpenChange])

    const handleDeleteColumn = useCallback(() => {
      if (!editor) return
      deleteColumn(editor)
      handleOpenChange(false)
    }, [editor, handleOpenChange])

    if (!editor) {
      return null
    }

    return (
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            data-active-state={isActive ? "on" : "off"}
            role="button"
            tabIndex={-1}
            aria-label={t('tableOperations')}
            tooltip={t('tableOperations')}
            {...buttonProps}
            ref={ref}
          >
            <TableIcon className="tiptap-button-icon" />
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" portal={portal}>
          <Card>
            <CardBody>
              <ButtonGroup>
                {!isActive ? (
                  <DropdownMenuItem asChild>
                    <Button
                      type="button"
                      data-style="ghost"
                      onClick={handleInsertTable}
                    >
                      <span className="tiptap-button-text">{t('insertTable')}</span>
                    </Button>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Button
                        type="button"
                        data-style="ghost"
                        onClick={handleAddRowBefore}
                      >
                        <span className="tiptap-button-text">{t('addRowBefore')}</span>
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Button
                        type="button"
                        data-style="ghost"
                        onClick={handleAddRowAfter}
                      >
                        <span className="tiptap-button-text">{t('addRowAfter')}</span>
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Button
                        type="button"
                        data-style="ghost"
                        onClick={handleDeleteRow}
                      >
                        <span className="tiptap-button-text">{t('deleteRow')}</span>
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Button
                        type="button"
                        data-style="ghost"
                        onClick={handleAddColumnBefore}
                      >
                        <span className="tiptap-button-text">{t('addColumnBefore')}</span>
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Button
                        type="button"
                        data-style="ghost"
                        onClick={handleAddColumnAfter}
                      >
                        <span className="tiptap-button-text">{t('addColumnAfter')}</span>
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Button
                        type="button"
                        data-style="ghost"
                        onClick={handleDeleteColumn}
                      >
                        <span className="tiptap-button-text">{t('deleteColumn')}</span>
                      </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Button
                        type="button"
                        data-style="ghost"
                        onClick={handleDeleteTable}
                      >
                        <span className="tiptap-button-text">{t('deleteTable')}</span>
                      </Button>
                    </DropdownMenuItem>
                  </>
                )}
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

TableDropdownMenu.displayName = "TableDropdownMenu"

