import { useCallback, useMemo, useState } from 'react'
import Toast from '../components/ui/Toast'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: '', type: 'info' })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ open: true, message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }))
  }, [])

  const value = useMemo(
    () => ({ showToast, hideToast }),
    [showToast, hideToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  )
}
