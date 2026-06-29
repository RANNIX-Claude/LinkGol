import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AudioRecorder from './AudioRecorder'

export default function LinkChat() {
  const { conversacionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [mensajes, setMensajes] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [verOriginal, setVerOriginal] = useState(null)
  const messagesEndRef = useRef(null)

  if (!user) return <div>Redirigiendo...</div>

  useEffect(() => {
    const mockMensajes = [
      {
        id: 'msg-1',
        sender_id: 'other',
        sender_nombre: 'Roberto',
        texto_original: 'Hola, ¿cómo estás?',
        idioma_original: 'es',
        texto_usuario: 'Hola, ¿cómo estás?',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        es_traducido: false
      },
      {
        id: 'msg-2',
        sender_id: user.id,
        sender_nombre: user.nombre,
        texto_original: '¡Muy bien! ¿Y tú?',
        idioma_original: user.idioma,
        texto_usuario: '¡Muy bien! ¿Y tú?',
        timestamp: new Date(Date.now() - 3 * 60 * 1000),
        es_traducido: false
      }
    ]
    setMensajes(mockMensajes)
  }, [user.idioma])

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

    setTimeout(() => {
      const respuesta = {
        id: `msg-${Date.now() + 1}`,
        sender_id: 'other',
        sender_nombre: 'Roberto',
        texto_original: '¡Excelente! Seguimos conectados.',
        idioma_original: 'es',
        texto_usuario: '¡Excelente! Seguimos conectados.',
        timestamp: new Date(),
        es_traducido: false
      }
      setMensajes((prev) => [...prev, respuesta])
      setLoading(false)
    }, 1000)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--cream)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--fill-accent)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Roberto</h2>
          <p style={{ fontSize: '12px', opacity: 0.8, margin: '4px 0 0 0' }}>En línea</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
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
        >
          ← Atrás
        </button>
      </header>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {mensajes.map((msg) => {
          const isSent = msg.sender_id === user.id
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isSent ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}
            >
              {/* Nombre del usuario */}
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text2)',
                paddingX: isSent ? '14px' : '14px',
                textAlign: isSent ? 'right' : 'left'
              }}>
                {msg.sender_nombre}
              </div>

              {/* Mensaje bubble */}
              <div style={{
                maxWidth: '70%',
                background: isSent ? 'var(--fill-accent)' : 'white',
                color: isSent ? 'white' : 'var(--text)',
                padding: '12px 16px',
                borderRadius: isSent ? '20px 4px 20px 20px' : '4px 20px 20px 20px',
                fontSize: '14px',
                lineHeight: 1.5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                wordWrap: 'break-word'
              }}>
                {msg.texto_usuario}

                {msg.es_traducido && (
                  <button
                    onClick={() => setVerOriginal(verOriginal === msg.id ? null : msg.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: isSent ? 'rgba(255,255,255,0.7)' : 'var(--fill-accent)',
                      fontSize: '10px',
                      cursor: 'pointer',
                      marginTop: '6px',
                      padding: 0,
                      textDecoration: 'underline',
                      display: 'block',
                      fontWeight: 500
                    }}
                  >
                    Ver original
                  </button>
                )}

                {verOriginal === msg.id && msg.es_traducido && (
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.8,
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: `1px solid ${isSent ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>Original ({msg.idioma_original})</div>
                    <div>{msg.texto_original}</div>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div style={{
                fontSize: '11px',
                color: 'var(--text3)',
                paddingX: '14px'
              }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleEnviarMensaje}
        style={{
          display: 'flex',
          gap: '10px',
          padding: '16px',
          background: 'white',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
          alignItems: 'flex-end'
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
            padding: '10px 14px',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'none',
            maxHeight: '100px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--fill-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')}
        />

        <AudioRecorder onAudioSend={(blob) => console.log('Audio:', blob)} disabled={loading} />

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
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
        >
          →
        </button>
      </form>
    </div>
  )
}
