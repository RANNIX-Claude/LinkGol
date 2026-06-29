import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getConversacionesActivas } from '../services/api'
import '../styles/theme.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [conversaciones, setConversaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversaciones()
  }, [user])

  const loadConversaciones = async () => {
    if (!user?.id) return

    try {
      const data = await getConversacionesActivas(user.id)
      setConversaciones(data.conversaciones || [])
    } catch (err) {
      console.error('Error loading conversations:', err)
      setConversaciones([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewInvitation = () => {
    navigate('/liga/create')
  }

  const handleOpenChat = (conversacionId) => {
    navigate(`/chat/${conversacionId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--fill-accent)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>LinkN.click</h1>
          <p style={{ fontSize: '12px', opacity: 0.8, margin: '4px 0 0 0' }}>
            NIP: {user?.nip_4_digitos}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.3)')}
          onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.2)')}
        >
          Salir
        </button>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        {/* Welcome Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
            Bienvenido, {user?.nombre}!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '16px' }}>
            Idioma: <strong>{user?.idioma?.toUpperCase()}</strong> •
            Tipo: <strong>{user?.tipo_usuario === 'host' ? 'Anfitrión' : 'Invitado'}</strong>
          </p>
          <button
            onClick={handleNewInvitation}
            style={{
              background: 'var(--fill-accent)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            + Generar Nueva Liga
          </button>
        </div>

        {/* Conversations Section */}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
            Mis Conversaciones
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)' }}>
              Cargando conversaciones...
            </div>
          ) : conversaciones.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
              <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '12px' }}>
                Aún no tienes conversaciones activas
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
                Crea una invitación para comenzar a conectar con otros usuarios
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {conversaciones.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleOpenChat(conv.id)}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--fill-accent)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,82,204,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
                        {conv.otro_usuario_nombre || 'Usuario'}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text2)', margin: '4px 0 0 0' }}>
                        {conv.ultimo_mensaje ? conv.ultimo_mensaje.substring(0, 50) + '...' : 'Sin mensajes'}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
