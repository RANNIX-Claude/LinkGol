import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getInvitation, acceptInvitation } from '../services/api'
import '../styles/theme.css'

const IDIOMAS = [
  { code: 'es', nombre: '🇪🇸 Español' },
  { code: 'en', nombre: '🇺🇸 English' },
  { code: 'pt', nombre: '🇧🇷 Português' },
  { code: 'fr', nombre: '🇫🇷 Français' },
  { code: 'de', nombre: '🇩🇪 Deutsch' },
  { code: 'it', nombre: '🇮🇹 Italiano' },
  { code: 'ru', nombre: '🇷🇺 Русский' },
  { code: 'zh', nombre: '🇨🇳 中文' },
  { code: 'ja', nombre: '🇯🇵 日本語' },
  { code: 'ko', nombre: '🇰🇷 한국어' }
]

export default function InvitationAccept() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState('loading')
  const [invitacion, setInvitacion] = useState(null)
  const [selectedIdioma, setSelectedIdioma] = useState('es')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const data = await getInvitation(token)
        setInvitacion(data)
        setStep('preview')
      } catch (err) {
        setError(err.message || 'Invitación no encontrada o expirada')
        setStep('error')
      }
    }

    if (token) {
      loadInvitation()
    }
  }, [token])

  const handleAccept = async () => {
    if (!selectedIdioma) {
      setError('Por favor selecciona un idioma')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await acceptInvitation(token, selectedIdioma)

      // Login the new guest user
      login({
        id: result.usuario.id,
        email: `guest-${result.usuario.nip_4_digitos}@linkn.click`,
        nombre: `Guest`,
        idioma: result.usuario.idioma,
        nip: result.usuario.nip_4_digitos,
        token: ''
      })

      // Redirect to chat
      navigate(`/chat/${result.conversacion_id}`)
    } catch (err) {
      setError(err.message || 'Error al aceptar invitación')
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  if (step === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--cream)',
          fontSize: '16px',
          color: 'var(--text)'
        }}
      >
        Cargando invitación...
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--cream)',
          padding: '20px'
        }}
      >
        <div
          style={{
            maxWidth: '450px',
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
            Invitación Inválida
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)', marginBottom: '24px' }}>
            {error}
          </div>
          <button
            onClick={handleCancel}
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
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {/* Step 1: Preview */}
        {step === 'preview' && invitacion && (
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', textAlign: 'center' }}>
              ¡Te han Invitado!
            </div>

            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--cream)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', marginBottom: '4px' }}>
                De:
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
                {invitacion.remitente_nombre}
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', marginBottom: '4px' }}>
                Contexto:
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fill-accent)', marginBottom: '12px' }}>
                {invitacion.contexto}
              </div>

              <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', marginBottom: '4px' }}>
                Mensaje:
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>
                "{invitacion.primer_mensaje}"
              </div>
            </div>

            <button
              onClick={() => setStep('select')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--fill-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              Continuar
            </button>
            <button
              onClick={handleCancel}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Step 2: Language Selection */}
        {step === 'select' && (
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)' }}>
              Selecciona tu Idioma
            </div>
            <div style={{ marginBottom: '24px' }}>
              {IDIOMAS.map((idioma) => (
                <button
                  key={idioma.code}
                  onClick={() => setSelectedIdioma(idioma.code)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '12px 14px',
                    background: selectedIdioma === idioma.code ? 'var(--fill-accent)' : 'white',
                    color: selectedIdioma === idioma.code ? 'white' : 'var(--text)',
                    border: selectedIdioma === idioma.code ? 'none' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '8px',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedIdioma !== idioma.code) {
                      e.target.style.borderColor = 'var(--fill-accent)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedIdioma !== idioma.code) {
                      e.target.style.borderColor = 'rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {idioma.nombre}
                </button>
              ))}
            </div>

            <button
              onClick={handleAccept}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? 'rgba(0,82,204,0.5)' : 'var(--fill-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '12px'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
            >
              {loading ? 'Aceptando...' : 'Aceptar Invitación'}
            </button>
            <button
              onClick={() => setStep('preview')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Atrás
            </button>
          </div>
        )}

        {/* Error message */}
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
      </div>
    </div>
  )
}
