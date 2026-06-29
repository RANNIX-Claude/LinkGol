import React, { useState, useEffect } from 'react'
import * as API from '../services/linkn-api'

const IDIOMAS = [
  { codigo: 'es', nombre: 'Español', flag: '🇪🇸' },
  { codigo: 'en', nombre: 'English', flag: '🇺🇸' },
  { codigo: 'fr', nombre: 'Français', flag: '🇫🇷' },
  { codigo: 'de', nombre: 'Deutsch', flag: '🇩🇪' },
  { codigo: 'ru', nombre: 'Русский', flag: '🇷🇺' },
  { codigo: 'zh', nombre: '中文', flag: '🇨🇳' },
  { codigo: 'ja', nombre: '日本語', flag: '🇯🇵' },
  { codigo: 'pt', nombre: 'Português', flag: '🇧🇷' },
  { codigo: 'it', nombre: 'Italiano', flag: '🇮🇹' },
  { codigo: 'ar', nombre: 'العربية', flag: '🇸🇦' },
]

export default function LinkJoin({ linkSlug, onJoinSuccess }) {
  const [step, setStep] = useState('loading') // loading, seleccionar-idioma, ingresando, error
  const [link, setLink] = useState(null)
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar link info
  useEffect(() => {
    const cargarLink = async () => {
      try {
        const result = await API.obtenerLink(linkSlug)
        if (result.success && result.link) {
          setLink(result.link)
          // Filtrar idiomas disponibles
          const idiomas = result.link.idiomas_permitidos || ['es']
          const idiomasDisponibles = IDIOMAS.filter(i => idiomas.includes(i.codigo))

          // Preseleccionar primer idioma disponible
          if (idiomasDisponibles.length > 0) {
            setIdiomaSeleccionado(idiomasDisponibles[0].codigo)
          }

          setStep('seleccionar-idioma')
        } else {
          setError('Link no encontrado o no está activo')
          setStep('error')
        }
      } catch (err) {
        setError('Error cargando el link: ' + err.message)
        setStep('error')
      }
    }

    cargarLink()
  }, [linkSlug])

  const handleIngresar = async () => {
    setLoading(true)
    try {
      // 1. Crear usuario anónimo
      const usuarioResult = await API.crearUsuarioAnonimo(idiomaSeleccionado)
      if (!usuarioResult.success) throw new Error(usuarioResult.error)

      // 2. Crear conversación
      const convResult = await API.crearConversacion(
        link.id,
        usuarioResult.usuario_id,
        idiomaSeleccionado
      )
      if (!convResult.success) throw new Error(convResult.error)

      // 3. Guardar sesión local
      API.guardarSesionAnonima(linkSlug, usuarioResult.usuario_id, usuarioResult.nip_4_digitos, idiomaSeleccionado)

      // 4. Callback
      if (onJoinSuccess) {
        onJoinSuccess({
          usuario_id: usuarioResult.usuario_id,
          nip_4_digitos: usuarioResult.nip_4_digitos,
          conversacion_id: convResult.conversacion_id,
          link_slug: linkSlug,
          idioma: idiomaSeleccionado
        })
      }

      setStep('ingresando')
    } catch (err) {
      setError('Error ingresando al link: ' + err.message)
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════════════════

  if (step === 'loading') {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '1rem', animation: 'spin 1s infinite' }}>⏳</div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando link...</p>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // ERROR
  // ═══════════════════════════════════════════════════════════

  if (step === 'error') {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '1rem' }}>❌</div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '0.5rem' }}>
          Oops, algo salió mal
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {error}
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'var(--fill-accent)',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          ← Volver al inicio
        </a>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // SELECCIONAR IDIOMA
  // ═══════════════════════════════════════════════════════════

  if (step === 'seleccionar-idioma' && link) {
    const idiomas = link.idiomas_permitidos || ['es']
    const idiomasDisponibles = IDIOMAS.filter(i => idiomas.includes(i.codigo))

    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '0.5rem' }}>
          {link.titulo || 'Conversación en LinkN.click'}
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {link.descripcion || 'Elige tu idioma para continuar'}
        </p>

        <div style={{ background: 'var(--surface-1)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Contexto: <strong>{link.contexto}</strong>
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Esta conversación está disponible en: {idiomasDisponibles.map(i => i.flag).join(' ')}
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            ¿Cuál es tu idioma?
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {idiomasDisponibles.map(idioma => (
              <button
                key={idioma.codigo}
                onClick={() => setIdiomaSeleccionado(idioma.codigo)}
                style={{
                  padding: '1rem',
                  background: idiomaSeleccionado === idioma.codigo ? 'var(--bg-accent)' : 'var(--surface-1)',
                  border: idiomaSeleccionado === idioma.codigo ? '2px solid var(--fill-accent)' : '0.5px solid var(--border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: idiomaSeleccionado === idioma.codigo ? 600 : 400,
                  color: idiomaSeleccionado === idioma.codigo ? 'var(--text-accent)' : 'var(--text-primary)',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{idioma.flag}</div>
                <div>{idioma.nombre}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleIngresar}
          disabled={loading || !idiomaSeleccionado}
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
            opacity: (loading || !idiomaSeleccionado) ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Ingresando...' : '💬 Ingresar a la conversación'}
        </button>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
          No necesitas crear una cuenta. Usaremos un NIP de 4 dígitos para identificarte.
        </p>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // INGRESANDO (placeholder)
  // ═══════════════════════════════════════════════════════════

  if (step === 'ingresando') {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '1rem', animation: 'spin 1s infinite' }}>⏳</div>
        <p style={{ color: 'var(--text-muted)' }}>Abriendo conversación...</p>
      </div>
    )
  }

  return null
}

// Agregar animación de spin (la sumaremos al CSS)
const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)
