import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'

export default function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true)
  const token = useAuthStore((state) => state.token)
  const setToken = useAuthStore((state) => state.setToken)
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    const verifyAuth = async () => {
      // Check localStorage first in case token is not in store yet
      const storedToken = localStorage.getItem('token')
      const currentToken = token || storedToken

      if (storedToken && !token) {
        // If token exists in localStorage but not in store, set it
        setToken(storedToken)
      }

      if (currentToken) {
        const isValid = await checkAuth()
        if (!isValid) {
          setIsChecking(false)
          return
        }
      }
      setIsChecking(false)
    }

    verifyAuth()
  }, [token, checkAuth, setToken])

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check both store token and localStorage token
  const storedToken = localStorage.getItem('token')
  const currentToken = token || storedToken

  if (!currentToken) {
    return <Navigate to="/login" replace />
  }

  return children
}
