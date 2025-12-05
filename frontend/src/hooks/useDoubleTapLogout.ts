import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"

export function useDoubleTapLogout(logoutHandler: () => Promise<void> | void) {
  const [isFirstTap, setIsFirstTap] = useState(false)
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleLogoutClick = useCallback(async () => {
    if (!isFirstTap) {
      // First tap - show toast
      setIsFirstTap(true)
      toast.info("Tap again to logout")

      // Reset after 2 seconds if not tapped again
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
      }

      tapTimeoutRef.current = setTimeout(() => {
        setIsFirstTap(false)
      }, 2000)
    } else {
      // Second tap - actually logout
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current)
      }
      setIsFirstTap(false)
      await logoutHandler()
    }
  }, [isFirstTap, logoutHandler])

  return { handleLogoutClick, isFirstTap }
}
