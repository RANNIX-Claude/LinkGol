import React, { useState, useEffect, useRef } from 'react'

export default function LinkChat({ conversacion, usuario, onExit }) {
  const [mensajes, setMensajes] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [otroUsuarioEscribiendo, setOtroUsuarioEscribiendo] = useState(false)
  const [verOriginal, setVerOriginal] = useState(null) // ID del mensaje para ver original
  const messagesEndRef = useRef(null)

  // Mock: cargar mensajes iniciales
  useEffect(() => {
    const mockMensajes = [
      {
        id: `msg-1`,
        sender_id: 'user-remitente',
        sender_nombre: 'Roberto Aguilar',
        es_primer_mensaje: true,
        tipo: 'TEXT',
        texto_original: 'Hola, tengo un auto que te va a encanta. Es modelo 2023, muy bien cuidado. ¿Te interesa?',
        idioma_original: 'es',
        texto_usuario: 'Hello, I have a car that you will love. 2023 model, very well maintained. Are you interested?', // traducción al idioma del usuario
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      }
    ]
    setMensajes(mockMensajes)
  }, [])

  // Auto-scroll a nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setLoading(true)
    const nuevoMensaje = {
      id: `msg-${Date.now()}`,
      sender_id: usuario.id,
      sender_nombre: usuario.nombre,
      es_primer_mensaje: false,
      tipo: 'TEXT',
      texto_original: inputValue,
      idioma_original: usuario.idioma,
      texto_usuario: inputValue, // en su idioma
      timestamp: new Date()
    }

    setMensajes([...mensajes, nuevoMensaje])
    setInputValue('')

    // TODO: Backend call to enviar_mensaje
    // - POST /api/v2/mensajes
    // - Obtiene traducción via Claude API
    // - Guarda en BD
    // - Emite via Supabase Realtime

    setTimeout(() => {
      // Mock: respuesta automática (para demostración)
      if (Math.random() > 0.7) {
        const respuesta = {
          id: `msg-${Date.now() + 1}`,
          sender_id: 'user-remitente',
          sender_nombre: 'Roberto Aguilar',
          es_primer_mensaje: false,
          tipo: 'TEXT',
          texto_original: 'Sí, el auto está disponible. ¿Quieres que te envíe las fotos?',
          idioma_original: 'es',
          texto_usuario: 'Yes, the car is available. Do you want me to send you the photos?',
          timestamp: new Date()
        }
        setMensajes((prev) => [...prev, respuesta])
      }
      setLoading(false)
    }, 800)
  }

  const handleAudio = () => {
    // TODO: PROMPT C - Activar grabación de audio
    // - Usar MediaRecorder API
    // - Whisper STT para transcribir
    // - Claude API para traducir
    // - TTS para reproducir en idioma del contacto
    alert('Audio (PROMPT C): Grabar mensaje de voz')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--surface-0)',
      overflow: 'hidden'
    }}>
      {/* HEADER */}
      <div style={{
        background: 'var(--surface-1)',
        borderBottom: '0.5px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <button
            onClick={onExit}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--fill-accent)',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Roberto Aguilar
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {otroUsuarioEscribiendo ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--fill-accent)',
                    animation: 'blink 1.4s infinite'
                  }} />
                  escribiendo...
                </>
              ) : (
                '🟢 Online'
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            📞
          </button>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ⋮
          </button>
        </div>
      </div>

      {/* MESSAGES CONTAINER */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {mensajes.map((msg) => {
          const esDelUsuario = msg.sender_id === usuario.id
          const mostrarOriginal = verOriginal === msg.id && !esDelUsuario && msg.idioma_original !== usuario.idioma

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: esDelUsuario ? 'flex-end' : 'flex-start',
                marginBottom: '4px'
              }}
            >
              <div style={{
                maxWidth: '85%',
                display: 'flex',
                flexDirection: esDelUsuario ? 'row-reverse' : 'row',
                gap: '8px',
                alignItems: 'flex-end'
              }}>
                {/* AVATAR */}
                {!esDelUsuario && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--fill-accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    R
                  </div>
                )}

                {/* BUBBLE */}
                <div
                  style={{
                    background: esDelUsuario ? 'var(--fill-accent)' : 'var(--surface-1)',
                    color: esDelUsuario ? 'white' : 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: esDelUsuario ? '18px 2px 18px 18px' : '2px 18px 18px 18px',
                    fontSize: '14px',
                    lineHeight: 1.4,
                    wordWrap: 'break-word',
                    boxShadow: esDelUsuario ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                    position: 'relative'
                  }}
                >
                  {msg.es_primer_mensaje && !esDelUsuario && (
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      opacity: 0.6,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      📌 Primer mensaje
                    </div>
                  )}

                  <div>
                    {msg.texto_usuario}
                  </div>

                  {/* VER ORIGINAL */}
                  {!esDelUsuario && msg.idioma_original !== usuario.idioma && (
                    <button
                      onClick={() => setVerOriginal(verOriginal === msg.id ? null : msg.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: esDelUsuario ? 'white' : 'var(--text-secondary)',
                        fontSize: '10px',
                        opacity: 0.3,
                        cursor: 'pointer',
                        marginTop: '4px',
                        textDecoration: 'underline',
                        padding: 0
                      }}
                    >
                      Ver original →
                    </button>
                  )}

                  {/* ORIGINAL TEXT (expandido) */}
                  {mostrarOriginal && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: `1px solid ${esDelUsuario ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`,
                      fontSize: '13px',
                      opacity: 0.7,
                      fontStyle: 'italic'
                    }}>
                      <div style={{
                        fontSize: '10px',
                        opacity: 0.5,
                        marginBottom: '4px',
                        textTransform: 'uppercase'
                      }}>
                        Español (original)
                      </div>
                      {msg.texto_original}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '4px'
          }}>
            <div style={{
              background: 'var(--fill-accent)',
              color: 'white',
              padding: '10px 14px',
              borderRadius: '18px 2px 18px 18px',
              fontSize: '14px'
            }}>
              <span style={{
                display: 'inline-block',
                animation: 'blink 1.4s infinite'
              }}>
                ⟳
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div style={{
        background: 'var(--surface-1)',
        borderTop: '0.5px solid var(--border)',
        padding: '12px 16px',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
        flexShrink: 0
      }}>
        <form
          onSubmit={handleEnviarMensaje}
          style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'flex-end' }}
        >
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '0.5px solid var(--border)',
                borderRadius: '20px',
                fontSize: '14px',
                outline: 'none',
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                resize: 'none',
                maxHeight: '80px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            style={{
              background: inputValue.trim() ? 'var(--fill-accent)' : 'var(--border)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              flexShrink: 0,
              transition: 'all 0.2s'
            }}
          >
            ↑
          </button>
        </form>

        <button
          onClick={handleAudio}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--fill-accent)',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 4px'
          }}
        >
          🎤
        </button>
      </div>

      <style>{`
        @keyframes blink {
          0%, 20%, 50%, 80%, 100% { opacity: 1; }
          40% { opacity: 0.5; }
          60% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
