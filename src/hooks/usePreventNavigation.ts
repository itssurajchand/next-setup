import { useEffect } from 'react'

type UsePreventNavigationProps = {
  message?: string
  preventNavigation: boolean
}

export const usePreventNavigation = ({ message, preventNavigation }: UsePreventNavigationProps) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (preventNavigation) {
        const confirmationMessage = message ?? 'Changes you made may not be saved. Are you sure you want to leave?'
        e.returnValue = confirmationMessage
        return confirmationMessage
      }
    }

    const handleRouteChangeStart = (e: PopStateEvent) => {
      if (preventNavigation && !window.confirm('Your operation is in progress. Are you sure you want to leave?')) {
        // Cancel navigation
        window.history.pushState(null, '', window.location.href)
        return
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handleRouteChangeStart)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handleRouteChangeStart)
    }
  }, [preventNavigation, message])
}
