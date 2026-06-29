import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LinkChat() {
  const { conversacionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mensajes, setMensajes] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [otroUsuarioEscribiendo, setOtroUsuarioEscribiendo] = useState(false)
  const [verOriginal, setVerOriginal] = useState(null)
  const messagesEndRef = useRef(null)

  if (!user) {
    return <div>Redirigiendo...</div>
  }

  // Load initial messages
  useEffect(() => {
    // Mock: initial message
    const mockMensajes = [
      {
        id: 'msg-1',
        sender_id: 'other-user',
        sender_nombre: 'Roberto',
        texto_original: 'Hola, ¿cómo estás?',
        idioma_original: 'es',
        texto_usuario: user.idioma === 'es' ? 'Hola, ¿cómo estás?' : 'Hello, how are you?',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        es_traducido: user.idioma !== 'es'
      }
    ]
    setMensajes(mockMensajes)
  }, [user.idioma])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const nuevoMensaje = {
      id: `msg-${Date.now()}`,
      sender_id: user.id,
      sender_nombre: user.nombre,
      texto_original: inputValue,
      idioma_original: user.idioma,
      texto_usuario: inputValue,
      timestamp: new Date(),
      es_traducido: false
    }

    setMensajes((prev) => [...prev, nuevoMensaje])
    setInputValue('')
    setLoading(true)

    try {
      // TODO: POST /api/v2/mensajes
      // - Send message to backend
      // - Backend translates via Claude API
      // - Broadcast via Supabase Realtime

      // For now: mock response
      setTimeout(() => {
        const respuesta = {
          id: `msg-${Date.now() + 1}`,
          sender_id: 'other-user',
          sender_nombre: 'Roberto',
          texto_original: '¡Muy bien! ¿Y tú?',
          idioma_original: 'es',
          texto_usuario: user.idioma === 'es' ? '¡Muy bien! ¿Y tú?' : 'Very well! And you?',
          timestamp: new Date(),
          es_traducido: user.idioma !== 'es'
        }
        setMensajes((prev) => [...prev, respuesta])
        setLoading(false)
      }, 1000)
    } catch (err) {
      console.error('Error sending message:', err)
      setLoading(false)
    }
  }

  const handleExitChat = () => {
    navigate('/dashboard')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'white',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'var(--fill-accent)',
          color: 'white',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>Roberto</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>En línea</div>
        </div>
        <button
          onClick={handleExitChat}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.3)')}
          onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.2)')}
        >
          Salir
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {mensajes.map((msg) => {
          const isSent = msg.sender_id === user.id
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
                marginBottom: '8px'
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  background: isSent ? 'var(--fill-accent)' : 'var(--cream2)',
                  color: isSent ? 'white' : 'var(--text)',
                  padding: '10px 14px',
                  borderRadius: isSent ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  fontSize: '14px',
                  lineHeight: 1.4,
                  wordWrap: 'break-word'
                }}
              >
                <div>{msg.texto_usuario}</div>
                {msg.es_traducido && (
                  <button
                    onClick={() => setVerOriginal(verOriginal === msg.id ? null : msg.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isSent ? 'rgba(255,255,255,0.7)' : 'var(--fill-accent)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      marginTop: '4px',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Ver original
                  </button>
                )}
                {verOriginal === msg.id && msg.es_traducido && (
                  <div
                    style={{
                      fontSize: '11px',
                      opacity: 0.7,
                      marginTop: '4px',
                      paddingTop: '4px',
                      borderTop: `1px solid ${isSent ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>Original ({msg.idioma_original})</div>
                    <div>{msg.texto_original}</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {otroUsuarioEscribiendo && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Escribiendo</span>
            <span style={{ fontSize: '12px', animation: 'pulse 1.4s infinite' }}>●●●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleEnviarMensaje}
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          background: 'white',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleEnviarMensaje(e)
            }
          }}
          placeholder="Escribe tu mensaje..."
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'none',
            maxHeight: '100px',
            outline: 'none'
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--fill-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.1)')}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: loading ? 'rgba(0,82,204,0.5)' : 'var(--fill-accent)',
            color: 'white',
            border: 'none',
            fontSize: '18px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          →
        </button>
      </form>
    </div>
  )
}
