const STORAGE_KEY = 'linkn_user'

export function getStoredUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error reading user from localStorage:', error)
    return null
  }
}

export function setStoredUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Error saving user to localStorage:', error)
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing user from localStorage:', error)
  }
}
