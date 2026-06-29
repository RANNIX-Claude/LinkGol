import React, { createContext, useContext, useState, useEffect } from 'react'
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/localStorage'

// Create context
const AuthContext = createContext(null)

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  // Login function
  const login = (userData) => {
    const userToStore = {
      id: userData.id,
      email: userData.email,
      nombre: userData.nombre,
      apellido: userData.apellido || '',
      idioma: userData.idioma,
      nip: userData.nip_4_digitos || '',
      token: userData.token || '',
      avatar: userData.avatar || '👤'
    }
    setUser(userToStore)
    setStoredUser(userToStore)
    setError(null)
  }

  // Logout function
  const logout = () => {
    setUser(null)
    clearStoredUser()
    setError(null)
  }

  // Update user
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    setStoredUser(updatedUser)
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
