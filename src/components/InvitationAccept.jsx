import React, { useState, useEffect } from 'react'

const IDIOMAS = [
  { code: 'es', nombre: '🇪🇸 Español', flag: '🇪🇸' },
  { code: 'en', nombre: '🇺🇸 English', flag: '🇺🇸' },
  { code: 'pt', nombre: '🇧🇷 Português', flag: '🇧🇷' },
  { code: 'fr', nombre: '🇫🇷 Français', flag: '🇫🇷' },
  { code: 'de', nombre: '🇩🇪 Deutsch', flag: '🇩🇪' },
  { code: 'it', nombre: '🇮🇹 Italiano', flag: '🇮🇹' },
  { code: 'ru', nombre: '🇷🇺 Русский', flag: '🇷🇺' },
  { code: 'zh', nombre: '🇨🇳 中文', flag: '🇨🇳' },
  { code: 'ja', nombre: '🇯🇵 日本語', flag: '🇯🇵' },
  { code: 'ko', nombre: '🇰🇷 한국어', flag: '🇰🇷' }
]

export default function InvitationAccept({ invitationToken, onAccepted, onError }) {
  const [step, setStep] = useState('loading') // loading, preview, select, confirm, success
  const [invitacion, setInvitacion] = useState(null)
  const [selectedIdioma, setSelectedIdioma] = useState('es')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // TODO: Fetch invitation details from backend
    // For now: mock data
    setTimeout(() => {
      const mockInvitacion = {
        id: `inv-${Date.now()}`,
        remitente_nombre: 'Roberto Aguilar',
        contexto: 'venta_autos',
        contexto_nombre: '🚗 Venta de Autos',
        primer_mensaje: 'Hola, tengo un auto que te va a encanta. Es modelo 2023, muy bien cuidado. ¿Te interesa?',
        idiomas_permitidos: ['es', 'en', 'pt', 'fr', 'de'],
        expira_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
      setInvitacion(mockInvitacion)
      setStep('preview')
    }, 800)
  }, [invitationToken])

  const handleAccept = async () => {
    setLoading(true)
    setError('')

    try {
      // TODO: Backend call to aceptar_invitacion
      // For now: mock success
      setTimeout(() => {
        const nuevoUsuario = {
          id: `user-${Date.now()}`,
          nip_4_digitos: Math.floor(1000 + Math.random() * 9000).toString(),
          idioma: selectedIdioma
        }
        onAccepted({
          usuario: nuevoUsuario,
          conversacion_id: `conv-${Date.now()}`,
          primer_mensaje: invitacion.primer_mensaje
        })
      }, 1200)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // LOADING
  if (step === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--surface-0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'pulse 1.5s infinite'
          }}>
            🔗
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Cargando invitación...
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            Esto toma solo un momento
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    )
  }

  // PREVIEW
  if (step === 'preview' && invitacion) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--fill-accent) 0%, var(--fill-accent) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%'
        }}>
          {/* HEADER */}
          <div style={{
            textAlign: 'center',
            marginBottom: '48px'
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '16px'
            }}>
              {invitacion.contexto === 'venta_autos' && '🚗'}
              {invitacion.contexto === 'renta_inmueble' && '🏠'}
              {invitacion.contexto === 'networking' && '👔'}
              {invitacion.contexto === 'cita_informal' && '😊'}
              {invitacion.contexto === 'soporte_tecnico' && '🔧'}
              {invitacion.contexto === 'comercio' && '🛍️'}
              {invitacion.contexto === 'turismo' && '✈️'}
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '8px',
              lineHeight: 1.2
            }}>
              Te invita<br/>{invitacion.remitente_nombre}
            </h1>
            <p style={{
              fontSize: '14px',
              opacity: 0.8,
              marginBottom: '4px'
            }}>
              {invitacion.contexto_nombre}
            </p>
          </div>

          {/* CARD CON PRIMER MENSAJE */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '32px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              opacity: 0.7,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Primer mensaje
            </div>
            <div style={{
              fontSize: '16px',
              lineHeight: 1.6,
              fontWeight: 400,
              opacity: 0.95
            }}>
              "{invitacion.primer_mensaje}"
            </div>
          </div>

          {/* CTA PRINCIPAL */}
          <button
            onClick={() => setStep('select')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'white',
              color: 'var(--fill-accent)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Aceptar invitación
          </button>

          <button
            onClick={() => onError('Usuario rechazó la invitación')}
            style={{
              width: '100%',
              padding: '16px',
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Rechazar
          </button>

          {/* INFO */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '12px',
            opacity: 0.6
          }}>
            <div style={{ marginBottom: '8px' }}>✅ Sin instalar nada</div>
            <div style={{ marginBottom: '8px' }}>✅ Sin crear cuenta (usamos NIP 4-dígitos)</div>
            <div>✅ Conversación privada 1:1</div>
          </div>
        </div>
      </div>
    )
  }

  // SELECT IDIOMA
  if (step === 'select' && invitacion) {
    const idiomasDisponibles = IDIOMAS.filter(i => invitacion.idiomas_permitidos.includes(i.code))

    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--surface-0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%',
          background: 'var(--surface-1)',
          borderRadius: '16px',
          padding: '40px 24px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>
            ¿Cuál es tu idioma?
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>
            Elige el idioma en que deseas conversar. Puedes cambiarlo después.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {idiomasDisponibles.map((idioma) => (
              <button
                key={idioma.code}
                onClick={() => setSelectedIdioma(idioma.code)}
                style={{
                  padding: '16px',
                  background: selectedIdioma === idioma.code ? 'var(--fill-accent)' : 'var(--surface-2)',
                  color: selectedIdioma === idioma.code ? 'white' : 'var(--text-primary)',
                  border: '0.5px solid ' + (selectedIdioma === idioma.code ? 'var(--fill-accent)' : 'var(--border)'),
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                  {idioma.flag}
                </div>
                <div>{idioma.nombre.split(' ')[1]}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep('confirm')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--fill-accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Continuar
          </button>

          <button
            onClick={() => setStep('preview')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              color: 'var(--fill-accent)',
              border: '2px solid var(--fill-accent)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Atrás
          </button>
        </div>
      </div>
    )
  }

  // CONFIRM
  if (step === 'confirm' && invitacion) {
    const idiomaSeleccionado = IDIOMAS.find(i => i.code === selectedIdioma)

    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--surface-0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '420px',
          width: '100%',
          background: 'var(--surface-1)',
          borderRadius: '16px',
          padding: '40px 24px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>
            Confirmación
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>
            Estás a punto de iniciar una conversación con {invitacion.remitente_nombre}.
          </p>

          <div style={{
            background: 'var(--surface-2)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                CON
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {invitacion.remitente_nombre}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                CATEGORÍA
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {invitacion.contexto_nombre}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                IDIOMA
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {idiomaSeleccionado?.nombre}
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-accent)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            fontSize: '12px',
            color: 'var(--text-accent)',
            lineHeight: 1.5
          }}>
            Cuando aceptes, tu conversación comenzará automáticamente con el primer mensaje de {invitacion.remitente_nombre}.
          </div>

          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleAccept}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--fill-accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '8px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '⏳ Creando conversación...' : '✅ Aceptar invitación'}
          </button>

          <button
            onClick={() => setStep('select')}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'transparent',
              color: 'var(--fill-accent)',
              border: '2px solid var(--fill-accent)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            Cambiar idioma
          </button>
        </div>
      </div>
    )
  }

  return null
}
