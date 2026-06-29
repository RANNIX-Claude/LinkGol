import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Landing_v2 from './components/Landing_v2'
import SignUp from './components/SignUp'
import Dashboard from './components/Dashboard'
import CreateInvitation from './components/CreateInvitation'
import InvitationAccept from './components/InvitationAccept'
import LinkChat from './components/LinkChat'
import './App.css'
import './styles/layout.css'

// Protected route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

// Public route wrapper (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>
  }

  if (user && window.location.pathname === '/') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}


function App() {
  const { loading } = useAuth()

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing_v2 />
          </PublicRoute>
        }
      />

      {/* Authentication routes */}
      <Route path="/auth/signup" element={<SignUp />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/liga/create"
        element={
          <PrivateRoute>
            <CreateInvitation />
          </PrivateRoute>
        }
      />
      <Route
        path="/chat/:conversacionId"
        element={
          <PrivateRoute>
            <LinkChat />
          </PrivateRoute>
        }
      />

      {/* Invitation acceptance (public, no auth needed) */}
      <Route path="/accept/:token" element={<InvitationAccept />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
