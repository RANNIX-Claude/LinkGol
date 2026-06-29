import React, { useState } from 'react'

export default function SignUp({ onSuccess, onBack }) {
  const [step, setStep] = useState('email') // email, password, profile, confirm
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    idioma: 'es',
    foto: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handlePasswordChange = (val) => {
    setFormData({ ...formData, password: val })
    let strength = 0
    if (val.length >= 8) strength++
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) strength++
    if (/[0-9]/.test(val)) strength++
    if (/[^a-zA-Z0-9]/.test(val)) strength++
    setPasswordStrength(strength)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Backend call to create user
      // For now: mock success
      setTimeout(() => {
        const nuevoUsuario = {
          id: `user-${Date.now()}`,
          email: formData.email,
          nombre: formData.nombre,
          apellido: formData.apellido,
          idioma: formData.idioma,
          nip_4_digitos: Math.floor(1000 + Math.random() * 9000).toString()
        }
        onSuccess(nuevoUsuario)
      }, 1000)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // STEP 1: EMAIL
  if (step === 'email') {
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
          maxWidth: '400px',
          width: '100%',
          background: 'var(--surface-1)',
          borderRadius: '16px',
          padding: '40px 24px',
          textAlign: 'center'
        }}>
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              background: 'transparent',
              border: 'none',
              color: 'var(--fill-accent)',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 600
            }}
          >
            ← Volver
          </button>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>
            Crea tu cuenta
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>
            LinkN.click es gratis. Sin datos personales requeridos más allá.
          </p>

          <form onSubmit={(e) => {
            e.preventDefault()
            if (!formData.email) return
            setStep('password')
          }}>
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tú@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!formData.email || loading}
              style={{
                width: '100%',
                padding: '12px',
                background: formData.email ? 'var(--fill-accent)' : 'rgba(0,0,0,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: formData.email ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Continuar
            </button>
          </form>

          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginTop: '24px'
          }}>
            Al registrarte aceptas nuestros{' '}
            <a href="#" style={{ color: 'var(--fill-accent)', textDecoration: 'none' }}>
              términos
            </a>
            {' '}y{' '}
            <a href="#" style={{ color: 'var(--fill-accent)', textDecoration: 'none' }}>
              privacidad
            </a>
          </p>
        </div>
      </div>
    )
  }

  // STEP 2: PASSWORD
  if (step === 'password') {
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
          maxWidth: '400px',
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
            Crea una contraseña
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>
            Mínimo 8 caracteres, mayúsculas, números y símbolo.
          </p>

          <form onSubmit={(e) => {
            e.preventDefault()
            if (passwordStrength < 3) return
            setStep('profile')
          }}>
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Strength indicator */}
            {formData.password && (
              <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '16px'
              }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background: i < passwordStrength ? 'var(--fill-accent)' : 'var(--border)',
                      transition: 'background 0.2s'
                    }}
                  />
                ))}
              </div>
            )}

            <p style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              {passwordStrength === 0 && '❌ Contraseña débil'}
              {passwordStrength === 1 && '🟡 Débil'}
              {passwordStrength === 2 && '🟡 Media'}
              {passwordStrength === 3 && '🟢 Fuerte'}
              {passwordStrength === 4 && '🟢 Muy fuerte'}
            </p>

            <button
              type="submit"
              disabled={passwordStrength < 3 || loading}
              style={{
                width: '100%',
                padding: '12px',
                background: passwordStrength >= 3 ? 'var(--fill-accent)' : 'rgba(0,0,0,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: passwordStrength >= 3 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Continuar
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'var(--fill-accent)',
                border: '2px solid var(--fill-accent)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Atrás
            </button>
          </form>
        </div>
      </div>
    )
  }

  // STEP 3: PROFILE
  if (step === 'profile') {
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
          maxWidth: '400px',
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
            Tu perfil
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>
            Esto es lo que verán tus contactos en las invitaciones.
          </p>

          <form onSubmit={(e) => {
            e.preventDefault()
            if (!formData.nombre) return
            setStep('confirm')
          }}>
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Roberto"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Apellido (opcional)
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Ej: Aguilar"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Idioma principal
              </label>
              <select
                value={formData.idioma}
                onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit'
                }}
              >
                <option value="es">🇪🇸 Español</option>
                <option value="en">🇺🇸 English</option>
                <option value="pt">🇧🇷 Português</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="it">🇮🇹 Italiano</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ja">🇯🇵 日本語</option>
                <option value="ko">🇰🇷 한국어</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '8px',
                color: 'var(--text-secondary)'
              }}>
                Foto (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, foto: e.target.files[0] })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--surface-2)',
                  cursor: 'pointer'
                }}
              />
              {formData.foto && (
                <p style={{ fontSize: '12px', color: 'var(--fill-accent)', marginTop: '8px' }}>
                  ✅ {formData.foto.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!formData.nombre || loading}
              style={{
                width: '100%',
                padding: '12px',
                background: formData.nombre ? 'var(--fill-accent)' : 'rgba(0,0,0,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: formData.nombre ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
            >
              Revisar
            </button>

            <button
              type="button"
              onClick={() => setStep('password')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'var(--fill-accent)',
                border: '2px solid var(--fill-accent)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Atrás
            </button>
          </form>
        </div>
      </div>
    )
  }

  // STEP 4: CONFIRM
  if (step === 'confirm') {
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
          maxWidth: '400px',
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
            Confirma tu registro
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>
            Revisa que todo sea correcto antes de crear tu cuenta.
          </p>

          <div style={{
            background: 'var(--surface-2)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                EMAIL
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {formData.email}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                NOMBRE
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {formData.nombre} {formData.apellido}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                IDIOMA PRINCIPAL
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {formData.idioma === 'es' && '🇪🇸 Español'}
                {formData.idioma === 'en' && '🇺🇸 English'}
                {formData.idioma === 'pt' && '🇧🇷 Português'}
                {formData.idioma === 'fr' && '🇫🇷 Français'}
                {formData.idioma === 'de' && '🇩🇪 Deutsch'}
                {formData.idioma === 'it' && '🇮🇹 Italiano'}
                {formData.idioma === 'ru' && '🇷🇺 Русский'}
                {formData.idioma === 'zh' && '🇨🇳 中文'}
                {formData.idioma === 'ja' && '🇯🇵 日本語'}
                {formData.idioma === 'ko' && '🇰🇷 한국어'}
              </div>
            </div>
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

          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading}
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
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Creando cuenta...' : '✅ Crear mi cuenta'}
            </button>

            <button
              type="button"
              onClick={() => setStep('profile')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                color: 'var(--fill-accent)',
                border: '2px solid var(--fill-accent)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Editar
            </button>
          </form>
        </div>
      </div>
    )
  }
}
