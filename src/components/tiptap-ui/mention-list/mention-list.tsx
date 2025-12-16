import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { createRoot, Root } from 'react-dom/client'
import type { SuggestionOptions } from '@tiptap/suggestion'
import type { MentionUser } from '@/lib/api'
import { searchUsers } from '@/lib/api'
import '@/components/tiptap-ui/mention-list/mention-list.scss'

export interface MentionListProps {
  items: MentionUser[]
  command: (item: MentionUser) => void
}

export const MentionList = forwardRef<any, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  // 获取用户名字的第一个字
  const getInitial = (name: string): string => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="mention-list">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`mention-item ${index === selectedIndex ? 'is-selected' : ''}`}
            key={item.id}
            onClick={() => selectItem(index)}
          >
            <div className="mention-avatar-container">
              {item.avatar ? (
                <img src={item.avatar} alt={item.label} className="mention-avatar" />
              ) : (
                <div className="mention-avatar-placeholder">
                  {getInitial(item.label)}
                </div>
              )}
            </div>
            <div className="mention-content">
              <div className="mention-label">{item.label}</div>
              {item.email && (
                <div className="mention-email">{item.email}</div>
              )}
            </div>
          </button>
        ))
      ) : (
        <div className="mention-item">没有找到用户</div>
      )}
    </div>
  )
})

MentionList.displayName = 'MentionList'

export function createMentionSuggestion(
  userList: MentionUser[] | (() => MentionUser[]) = []
): Omit<SuggestionOptions<MentionUser>, 'editor'> {
  return {
    char: '@',
    allowedPrefixes: [' ', '\n'],
    command: ({ editor, range, props }) => {
      editor
        .chain()
        .focus()
        .insertContentAt(range, [
          {
            type: 'mention',
            attrs: {
              id: props.id,
              label: props.label,
            },
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run()
    },
    items: async ({ query }) => {
      // 获取最新的 userList（支持函数或数组）
      const currentUserList = typeof userList === 'function' ? userList() : userList
      
      // 如果传入了 userList，使用传入的列表；否则使用 API
      if (currentUserList.length > 0) {
        const lowerQuery = query.toLowerCase()
        return currentUserList.filter(
          (user) =>
            user.label.toLowerCase().includes(lowerQuery) ||
            user.username?.toLowerCase().includes(lowerQuery) ||
            user.email?.toLowerCase().includes(lowerQuery)
        )
      }
      return await searchUsers(query)
    },
    render: () => {
    let mentionListRef: any = null
    let root: Root | null = null
    let container: HTMLElement | null = null
    let getReferenceClientRect: (() => DOMRect) | null = null

    return {
      onStart: (props: any) => {
        if (!props.clientRect) {
          return
        }

        getReferenceClientRect = props.clientRect

        // 创建容器
        container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.zIndex = '2010'
        document.body.appendChild(container)

        // 渲染 React 组件
        const component = React.createElement(MentionList, {
          items: props.items,
          command: props.command,
          ref: (ref: any) => {
            mentionListRef = ref
          },
        })
        root = createRoot(container)
        root.render(component)

        // 更新位置 - 显示在 @ 符号下方
        const updatePosition = () => {
          if (!container || !getReferenceClientRect) return
          const rect = getReferenceClientRect()
          // 在 @ 符号下方显示，添加一些偏移量
          container.style.top = `${rect.bottom + window.scrollY + 4}px`
          container.style.left = `${rect.left + window.scrollX}px`
        }

        updatePosition()

        // 使用 requestAnimationFrame 确保 DOM 已更新
        requestAnimationFrame(updatePosition)

        return {
          getBoundingClientRect: getReferenceClientRect,
          mount: () => {},
        }
      },

      onUpdate(props: any) {
        if (!container || !props.clientRect) {
          return
        }

        getReferenceClientRect = props.clientRect

        // 更新组件
        const component = React.createElement(MentionList, {
          items: props.items,
          command: props.command,
          ref: (ref: any) => {
            mentionListRef = ref
          },
        })
        if (root) {
          root.render(component)
        }

        // 更新位置 - 显示在 @ 符号下方
        const updatePosition = () => {
          if (!container || !getReferenceClientRect) return
          const rect = getReferenceClientRect()
          // 在 @ 符号下方显示，添加一些偏移量
          container.style.top = `${rect.bottom + window.scrollY + 4}px`
          container.style.left = `${rect.left + window.scrollX}px`
        }

        requestAnimationFrame(updatePosition)
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          return true
        }

        return mentionListRef?.onKeyDown?.(props)
      },

      onExit() {
        if (root && container) {
          root.unmount()
          if (container.parentNode) {
            container.parentNode.removeChild(container)
          }
          root = null
          container = null
        }
        getReferenceClientRect = null
        mentionListRef = null
      },
    }
  }
  }
}
