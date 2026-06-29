import React, { useState } from 'react'

const CONTEXTOS = [
  { id: 'venta_autos', nombre: '🚗 Venta de Autos', default: 'Hola, tengo un auto para ti' },
  { id: 'renta_inmueble', nombre: '🏠 Renta de Inmueble', default: 'Hola, te quiero mostrar este inmueble' },
  { id: 'networking', nombre: '👔 Networking Profesional', default: 'Hola, fue un placer conocerte' },
  { id: 'cita_informal', nombre: '😊 Cita Informal', default: 'Hola, me gustaría seguir platicando' },
  { id: 'soporte_tecnico', nombre: '🔧 Soporte Técnico', default: 'Hola, estoy aquí para ayudarte' },
  { id: 'comercio', nombre: '🛍️ Comercio General', default: 'Hola, tengo esto para ti' },
  { id: 'turismo', nombre: '✈️ Turismo', default: 'Hola, te ayudaré con tu viaje' },
]

const SHARE_CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'email', name: 'Email', icon: '📧', color: '#EA4335' },
  { id: 'qr', name: 'QR Code', icon: '📱', color: '#000000' },
  { id: 'copy', name: 'Copiar Link', icon: '📋', color: '#0052CC' },
]

export default function CreateInvitation({ userProfile, onInvitationCreated }) {
  const [step, setStep] = useState('contexto') // contexto, mensaje, compartir, resultado
  const [selectedContext, setSelectedContext] = useState(null)
  const [firstMessage, setFirstMessage] = useState('')
  const [invitationLink, setInvitationLink] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleContextSelect = (contexto) => {
    setSelectedContext(contexto)
    setFirstMessage(contexto.default.replace('[nombre]', userProfile.nombre))
    setStep('mensaje')
  }

  const handleGenerateInvitation = async () => {
    setLoading(true)
    try {
      // TODO: Backend call to crear_liga endpoint
      const mockLink = {
        id: `liga-${Date.now()}`,
        slug: `inv-${Math.random().toString(36).substr(2, 8)}`,
        url: `https://linkn.click/${Math.random().toString(36).substr(2, 8)}`,
        contexto: selectedContext.id,
        primer_mensaje: firstMessage,
        host: userProfile.nombre,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://linkn.click/${Math.random().toString(36).substr(2, 8)}`)}`,
        created_at: new Date().toISOString()
      }
      setInvitationLink(mockLink)
      setStep('compartir')
    } catch (err) {
      alert('Error creando invitación: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = (channel) => {
    const message = `${userProfile.nombre} te invita a conversar en LinkN.click\n\n${firstMessage}\n\n${invitationLink.url}`
    const encodedMessage = encodeURIComponent(message)

    switch (channel) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(invitationLink.url)}`, '_blank')
        break
      case 'email':
        window.location.href = `mailto:?subject=Te invito a conectar en LinkN.click&body=${encodedMessage}`
        break
      case 'qr':
        // Show QR code modal
        alert('QR Code: ' + invitationLink.qr_code)
        break
      case 'copy':
        navigator.clipboard.writeText(invitationLink.url)
        alert('¡Link copiado al portapapeles!')
        break
    }
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 1: SELECT CONTEXTO
  // ═══════════════════════════════════════════════════════════

  if (step === 'contexto') {
    return (
      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '0.5rem' }}>
          Crea una Liga
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Elige el tipo de conversación para generar tu link personalizado
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          {CONTEXTOS.map(ctx => (
            <button
              key={ctx.id}
              onClick={() => handleContextSelect(ctx)}
              style={{
                padding: '1.5rem',
                background: 'var(--surface-1)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--bg-accent)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--surface-1)'}
            >
              <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>
                {ctx.nombre.split(' ')[0]}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>
                {ctx.nombre.substring(2)}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 2: CUSTOMIZE MESSAGE
  // ═══════════════════════════════════════════════════════════

  if (step === 'mensaje' && selectedContext) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <button
          onClick={() => setStep('contexto')}
          style={{
            marginBottom: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--fill-accent)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          ← Cambiar contexto
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '1rem' }}>
          {selectedContext.nombre}
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Personaliza el primer mensaje que recibirá tu contacto al aceptar la invitación.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: 'var(--text-secondary)'
          }}>
            Primer mensaje
          </label>
          <textarea
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '0.5px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              minHeight: '100px',
              resize: 'vertical'
            }}
          />
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '0.5rem'
          }}>
            {firstMessage.length}/500 caracteres
          </div>
        </div>

        {/* PREVIEW */}
        <div style={{
          background: 'var(--surface-1)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}>
            Vista previa:
          </div>
          <div style={{
            background: 'var(--surface-0)',
            borderRadius: '8px',
            padding: '1rem',
            borderLeft: '4px solid var(--fill-accent)'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem' }}>
              {userProfile.nombre}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
              {firstMessage}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerateInvitation}
          disabled={loading || !firstMessage.trim()}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--fill-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: (loading || !firstMessage.trim()) ? 0.6 : 1
          }}
        >
          {loading ? 'Generando liga...' : '🔗 Generar Liga'}
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 3: SHARE
  // ═══════════════════════════════════════════════════════════

  if (step === 'compartir' && invitationLink) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '1rem' }}>
          🎉 ¡Liga lista!
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Comparte este link con {selectedContext.nombre}. No necesita instalar nada.
        </p>

        {/* LINK DISPLAY */}
        <div style={{
          background: 'var(--surface-1)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Tu link:
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--fill-accent)',
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            backgroundColor: 'var(--surface-0)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '0.5rem'
          }}>
            {invitationLink.url}
          </div>
        </div>

        {/* SHARE BUTTONS */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '1rem',
            color: 'var(--text-secondary)'
          }}>
            Compartir en:
          </label>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px'
          }}>
            {SHARE_CHANNELS.map(channel => (
              <button
                key={channel.id}
                onClick={() => handleShare(channel.id)}
                style={{
                  padding: '12px',
                  background: 'var(--surface-1)',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-accent)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--surface-1)'}
              >
                <div style={{ fontSize: '20px', marginBottom: '0.25rem' }}>
                  {channel.icon}
                </div>
                <div>{channel.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* INFO MESSAGE */}
        <div style={{
          background: 'var(--bg-accent)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          fontSize: '13px',
          color: 'var(--text-accent)'
        }}>
          <strong>Qué sucede cuando hagan clic:</strong><br/>
          1. No necesitan instalar nada<br/>
          2. Ven tu nombre y contexto<br/>
          3. Eligen su idioma<br/>
          4. Ven tu primer mensaje<br/>
          5. Comienza la conversación
        </div>

        <button
          onClick={() => setStep('contexto')}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: 'var(--fill-accent)',
            border: '2px solid var(--fill-accent)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Crear otra liga
        </button>
      </div>
    )
  }

  return null
}
