import { useEffect, useState } from "react"
import { FloatingPortal } from "@floating-ui/react"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import { Card, CardBody } from "@/components/tiptap-ui-primitive/card"
import type { Editor } from "@tiptap/react"
import "@/components/tiptap-ui-primitive/dropdown-menu/dropdown-menu.scss"

interface TableContextMenuProps {
  editor: Editor
}

/**
 * Checks if the editor is currently in a table
 */
function isInTable(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.isActive("table")
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

export function TableContextMenu({ editor }: TableContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!editor) return

    const editorElement = editor.view.dom as HTMLElement

    const handleContextMenu = (e: MouseEvent) => {
      // 检查是否在表格内
      if (!isInTable(editor)) {
        return
      }

      // 检查点击的目标是否在表格内
      const target = e.target as HTMLElement
      if (!target.closest("table")) {
        return
      }

      // 阻止默认右键菜单
      e.preventDefault()
      e.stopPropagation()

      // 设置菜单位置
      setPosition({ x: e.clientX, y: e.clientY })
      setIsOpen(true)
    }

    editorElement.addEventListener("contextmenu", handleContextMenu)

    return () => {
      editorElement.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [editor])

  // 处理点击和 ESC 键关闭菜单
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".table-context-menu")) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("click", handleClick, true)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <FloatingPortal>
      <div
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 2000,
        }}
        className="tiptap-dropdown-menu table-context-menu"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Card>
          <CardBody>
            <ButtonGroup>
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  addRowBefore(editor)
                  setIsOpen(false)
                }}
              >
                <span className="tiptap-button-text">在上方插入行</span>
              </Button>
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  addRowAfter(editor)
                  setIsOpen(false)
                }}
              >
                <span className="tiptap-button-text">在下方插入行</span>
              </Button>
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  deleteRow(editor)
                  setIsOpen(false)
                }}
              >
                <span className="tiptap-button-text">删除行</span>
              </Button>
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  addColumnBefore(editor)
                  setIsOpen(false)
                }}
              >
                <span className="tiptap-button-text">在左侧插入列</span>
              </Button>
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  addColumnAfter(editor)
                  setIsOpen(false)
                }}
              >
                <span className="tiptap-button-text">在右侧插入列</span>
              </Button>
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  deleteColumn(editor)
                  setIsOpen(false)
                }}
              >
                <span className="tiptap-button-text">删除列</span>
              </Button>
              <Button
                type="button"
                data-style="ghost"
                onClick={() => {
                  deleteTable(editor)
                  setIsOpen(false)
                }}
              >
                <span className="tiptap-button-text">删除表格</span>
              </Button>
            </ButtonGroup>
          </CardBody>
        </Card>
      </div>
    </FloatingPortal>
  )
}

