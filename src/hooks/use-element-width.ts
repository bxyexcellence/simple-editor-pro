import { useEffect, useState } from "react"
import { useThrottledCallback } from "@/hooks/use-throttled-callback"

/**
 * Hook that tracks the width of an element.
 * 
 * @param elementRef - Ref to the element to measure
 * @returns The width of the element in pixels
 */
export function useElementWidth(
  elementRef: React.RefObject<HTMLElement | null>
): number {
  const [width, setWidth] = useState(0)

  const updateWidth = useThrottledCallback(() => {
    if (!elementRef.current) {
      setWidth(0)
      return
    }

    const element = elementRef.current
    const newWidth = element.clientWidth
    setWidth(newWidth)
  }, 100)

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    // Initial measurement
    updateWidth()

    // Use ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(() => {
      updateWidth()
    })

    resizeObserver.observe(element)

    // Listen to window resize (in case the container size changes)
    window.addEventListener('resize', updateWidth)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateWidth)
    }
  }, [elementRef, updateWidth])

  return width
}

