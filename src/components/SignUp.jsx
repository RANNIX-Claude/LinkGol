import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signUp as signUpAPI } from '../services/api'
import '../styles/theme.css'

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState('email')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    idioma: 'es'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const languages = [
    { code: 'es', name: 'Español', flag: '🇲🇽' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ]

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

    // Validate current step
    if (step === 'email' && !formData.email) {
      setError('El email es requerido')
      return
    }
    if (step === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email inválido')
      return
    }
    if (step === 'password' && !formData.password) {
      setError('La contraseña es requerida')
      return
    }
    if (step === 'password' && formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (step === 'profile' && !formData.nombre) {
      setError('El nombre es requerido')
      return
    }

    // Move to next step or submit
    if (step === 'email') {
      setStep('password')
    } else if (step === 'password') {
      setStep('profile')
    } else if (step === 'profile') {
      setStep('confirm')
    } else if (step === 'confirm') {
      // Submit to backend
      setLoading(true)
      try {
        const user = await signUpAPI(
          formData.email,
          formData.password,
          formData.nombre,
          formData.apellido,
          formData.idioma
        )

        // Save user to context and localStorage
        login(user)

        // Redirect to create invitation
        navigate('/liga/create')
      } catch (err) {
        setError(err.message || 'Error al crear la cuenta')
        setLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (step === 'email') {
      navigate('/')
    } else if (step === 'password') {
      setStep('email')
    } else if (step === 'profile') {
      setStep('password')
    } else if (step === 'confirm') {
      setStep('profile')
    }
    setError('')
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
          maxWidth: '450px',
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
            Crear Cuenta
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)' }}>
            Paso {step === 'email' ? 1 : step === 'password' ? 2 : step === 'profile' ? 3 : 4} de 4
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '32px'
          }}
        >
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background:
                  (num === 1 && (step === 'email' || step === 'password' || step === 'profile' || step === 'confirm')) ||
                  (num === 2 && (step === 'password' || step === 'profile' || step === 'confirm')) ||
                  (num === 3 && (step === 'profile' || step === 'confirm')) ||
                  (num === 4 && step === 'confirm')
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
              color: '#dc2626',
              fontWeight: 500
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Email */}
          {step === 'email' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginBottom: '20px'
                }}
              />
            </div>
          )}

          {/* Step 2: Password */}
          {step === 'password' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              />
              {/* Strength indicator */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background:
                        level <= passwordStrength
                          ? level === 1
                            ? '#ef4444'
                            : level === 2
                              ? '#f59e0b'
                              : level === 3
                                ? '#3b82f6'
                                : '#10b981'
                          : 'rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)' }}>
                Fortaleza:{' '}
                {passwordStrength === 0
                  ? 'Muy débil'
                  : passwordStrength === 1
                    ? 'Débil'
                    : passwordStrength === 2
                      ? 'Regular'
                      : passwordStrength === 3
                        ? 'Fuerte'
                        : 'Muy fuerte'}
              </div>
            </div>
          )}

          {/* Step 3: Profile */}
          {step === 'profile' && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Tu nombre"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              />

              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
                Apellido (Opcional)
              </label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Tu apellido"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              />

              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
                Idioma Preferido
              </label>
              <select
                value={formData.idioma}
                onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && (
            <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text)' }}>
              <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--cream)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', marginBottom: '4px' }}>
                  Email
                </div>
                <div style={{ fontWeight: 600 }}>{formData.email}</div>
              </div>
              <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--cream)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', marginBottom: '4px' }}>
                  Nombre
                </div>
                <div style={{ fontWeight: 600 }}>
                  {formData.nombre}
                  {formData.apellido && ` ${formData.apellido}`}
                </div>
              </div>
              <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--cream)', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', marginBottom: '4px' }}>
                  Idioma
                </div>
                <div style={{ fontWeight: 600 }}>
                  {languages.find((l) => l.code === formData.idioma)?.name}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(26,26,26,0.6)', marginTop: '20px' }}>
                Se te asignará automáticamente un código NIP de 4 dígitos para identificarte de forma anónima.
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button
              type="button"
              onClick={handleBack}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid rgba(0,0,0,0.1)',
                background: 'transparent',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                color: 'var(--text)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.target.style.background = 'var(--cream)')}
              onMouseLeave={(e) => (e.target.style.background = 'transparent')}
            >
              {step === 'email' ? 'Cancelar' : 'Atrás'}
            </button>
            <button
              type="submit"
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
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
            >
              {loading ? 'Cargando...' : step === 'confirm' ? 'Crear Cuenta' : 'Siguiente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
