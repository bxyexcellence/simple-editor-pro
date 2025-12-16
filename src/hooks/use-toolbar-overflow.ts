import { useEffect, useState, useRef } from "react"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"

/**
 * Hook that detects if a toolbar is overflowing (showing scrollbar).
 * Uses hysteresis to prevent flickering when near the threshold.
 * 
 * @param toolbarRef - Ref to the toolbar container element
 * @returns Whether the toolbar is overflowing
 */
export function useToolbarOverflow(
  toolbarRef: React.RefObject<HTMLElement | null>
): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false)
  const previousStateRef = useRef(false)
  
  // 滞后区间：避免在临界值附近频繁切换
  // 当从非溢出变为溢出时，需要超过 5px 才切换
  // 当从溢出变为非溢出时，需要低于 -5px 才切换
  const HYSTERESIS_THRESHOLD = 5

  const checkOverflow = useThrottledCallback(() => {
    if (!toolbarRef.current) {
      setIsOverflowing(false)
      previousStateRef.current = false
      return
    }

    // 如果窗口宽度 >= 650px，不启用简化模式
    const windowWidth = window.innerWidth || document.documentElement.clientWidth
    if (windowWidth >= 650) {
      setIsOverflowing(false)
      previousStateRef.current = false
      return
    }

    const toolbar = toolbarRef.current
    const overflowAmount = toolbar.scrollWidth - toolbar.clientWidth
    const wasOverflowing = previousStateRef.current
    
    let shouldBeOverflowing: boolean
    
    if (wasOverflowing) {
      // 当前是溢出状态，只有当溢出量小于 -5px 时才切换为非溢出
      shouldBeOverflowing = overflowAmount > -HYSTERESIS_THRESHOLD
    } else {
      // 当前是非溢出状态，只有当溢出量大于 5px 时才切换为溢出
      shouldBeOverflowing = overflowAmount > HYSTERESIS_THRESHOLD
    }
    
    if (shouldBeOverflowing !== wasOverflowing) {
      setIsOverflowing(shouldBeOverflowing)
      previousStateRef.current = shouldBeOverflowing
    }
  }, 200) // 增加节流时间到 200ms

  useEffect(() => {
    if (!toolbarRef.current) return

    const toolbar = toolbarRef.current

    // Initial check
    checkOverflow()

    // Use ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow()
    })

    resizeObserver.observe(toolbar)

    // Listen to window resize
    window.addEventListener('resize', checkOverflow)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', checkOverflow)
    }
  }, [toolbarRef, checkOverflow])

  return isOverflowing
}

