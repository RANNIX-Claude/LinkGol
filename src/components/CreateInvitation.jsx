import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createInvitation as createInvitationAPI } from '../services/api'
import '../styles/theme.css'

const CONTEXTOS = [
  { id: 'venta_autos', nombre: '🚗 Venta de Autos', default: 'Hola, tengo un auto para ti' },
  { id: 'renta_inmueble', nombre: '🏠 Renta de Inmueble', default: 'Hola, te quiero mostrar este inmueble' },
  { id: 'networking', nombre: '👔 Networking', default: 'Hola, fue un placer conocerte' },
  { id: 'cita_informal', nombre: '😊 Cita Informal', default: 'Hola, me gustaría seguir platicando' },
  { id: 'soporte_tecnico', nombre: '🔧 Soporte', default: 'Hola, estoy aquí para ayudarte' },
  { id: 'comercio', nombre: '🛍️ Comercio', default: 'Hola, tengo esto para ti' },
  { id: 'turismo', nombre: '✈️ Turismo', default: 'Hola, te ayudaré con tu viaje' },
]

const SHARE_CHANNELS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'email', name: 'Email', icon: '📧' },
  { id: 'qr', name: 'QR Code', icon: '📱' },
  { id: 'copy', name: 'Copiar', icon: '📋' },
]

export default function CreateInvitation() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState('contexto')
  const [selectedContext, setSelectedContext] = useState(null)
  const [firstMessage, setFirstMessage] = useState('')
  const [invitationData, setInvitationData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return <div>Redirigiendo...</div>
  }

  const handleContextSelect = (contexto) => {
    setSelectedContext(contexto)
    setFirstMessage(contexto.default)
    setStep('mensaje')
    setError('')
  }

  const handleMessageChange = (text) => {
    if (text.length <= 500) {
      setFirstMessage(text)
    }
  }

  const handleGenerateInvitation = async () => {
    if (!firstMessage.trim()) {
      setError('El mensaje no puede estar vacío')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await createInvitationAPI(user.id, selectedContext.id, firstMessage)
      setInvitationData(result)
      setStep('compartir')
    } catch (err) {
      setError(err.message || 'Error creando invitación')
      setLoading(false)
    }
  }

  const handleShare = (channel) => {
    if (!invitationData) return

    const message = `${user.nombre} te invita a conversar en LinkN.click\n\n"${firstMessage}"\n\n${invitationData.url}`

    if (channel === 'whatsapp') {
      window.open(invitationData.compartir_url.whatsapp, '_blank')
    } else if (channel === 'facebook') {
      window.open(invitationData.compartir_url.facebook, '_blank')
    } else if (channel === 'email') {
      window.open(invitationData.compartir_url.email, '_blank')
    } else if (channel === 'qr') {
      window.open(invitationData.qr_code_url, '_blank')
    } else if (channel === 'copy') {
      navigator.clipboard.writeText(invitationData.url)
      alert('Link copiado al portapapeles')
    }
  }

  const handleFinish = () => {
    navigate('/dashboard')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        padding: '20px',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          paddingTop: '40px'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
            Generar Liga
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)' }}>
            Paso {step === 'contexto' ? 1 : step === 'mensaje' ? 2 : step === 'compartir' ? 3 : 4} de 4
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '32px' }}>
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background:
                  (num === 1 && (step === 'contexto' || step === 'mensaje' || step === 'compartir' || step === 'resultado')) ||
                  (num === 2 && (step === 'mensaje' || step === 'compartir' || step === 'resultado')) ||
                  (num === 3 && (step === 'compartir' || step === 'resultado')) ||
                  (num === 4 && step === 'resultado')
                    ? 'var(--fill-accent)'
                    : 'rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#dc2626'
            }}
          >
            {error}
          </div>
        )}

        {/* Step 1: Context Selection */}
        {step === 'contexto' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {CONTEXTOS.map((contexto) => (
              <button
                key={contexto.id}
                onClick={() => handleContextSelect(contexto)}
                style={{
                  padding: '16px',
                  background: 'white',
                  border: '2px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'var(--fill-accent)'
                  e.target.style.background = 'rgba(0,82,204,0.05)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.1)'
                  e.target.style.background = 'white'
                }}
              >
                {contexto.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Customize Message */}
        {step === 'mensaje' && (
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text)' }}>
              Tu Mensaje Inicial
            </label>
            <textarea
              value={firstMessage}
              onChange={(e) => handleMessageChange(e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '14px',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '8px'
              }}
            />
            <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', textAlign: 'right' }}>
              {firstMessage.length} / 500 caracteres
            </div>
          </div>
        )}

        {/* Step 3: Share */}
        {step === 'compartir' && invitationData && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text)' }}>
                Tu Liga está Lista
              </div>
              <div
                style={{
                  background: 'white',
                  border: '2px solid var(--fill-accent)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
                <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', marginBottom: '12px' }}>
                  ID: {invitationData.invitacion_id}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--fill-accent)', marginBottom: '12px' }}>
                  Comparte este link:
                </div>
                <div
                  style={{
                    background: 'var(--cream)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                  }}
                >
                  {invitationData.url}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text)' }}>
                Canales de Compartir
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                {SHARE_CHANNELS.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => handleShare(channel.id)}
                    style={{
                      padding: '12px',
                      background: 'white',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--cream)'
                      e.target.style.borderColor = 'var(--fill-accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white'
                      e.target.style.borderColor = 'rgba(0,0,0,0.1)'
                    }}
                  >
                    {channel.icon} {channel.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('resultado')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--fill-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'resultado' && invitationData && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
              ¡Liga Creada!
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)', marginBottom: '24px', lineHeight: 1.6 }}>
              Esperando que alguien acepte tu invitación...
              <br />
              Puedes crear más ligas o ir al dashboard.
            </div>
            <button
              onClick={handleFinish}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--fill-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Ir al Dashboard
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        {step !== 'resultado' && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button
              onClick={() => {
                if (step === 'contexto') navigate('/dashboard')
                else if (step === 'mensaje') setStep('contexto')
                else if (step === 'compartir') setStep('mensaje')
              }}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid rgba(0,0,0,0.1)',
                background: 'transparent',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.target.style.background = 'var(--cream)')}
              onMouseLeave={(e) => (e.target.style.background = 'transparent')}
            >
              {step === 'contexto' ? 'Cancelar' : 'Atrás'}
            </button>
            {step === 'mensaje' && (
              <button
                onClick={handleGenerateInvitation}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: loading ? 'rgba(0,82,204,0.5)' : 'var(--fill-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
              >
                {loading ? 'Creando...' : 'Generar Liga'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
