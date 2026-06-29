import React, { useState } from 'react'
import * as API from '../services/linkn-api'

const CONTEXTOS = [
  { id: 'venta_autos', nombre: '🚗 Venta de Autos', icon: '🚗' },
  { id: 'renta_inmueble', nombre: '🏠 Renta de Inmueble', icon: '🏠' },
  { id: 'networking', nombre: '👔 Networking Profesional', icon: '👔' },
  { id: 'cita_informal', nombre: '😊 Cita Informal', icon: '😊' },
  { id: 'soporte_tecnico', nombre: '🔧 Soporte Técnico', icon: '🔧' },
  { id: 'comercio_general', nombre: '🛍️ Comercio General', icon: '🛍️' },
  { id: 'turismo', nombre: '✈️ Turismo', icon: '✈️' },
]

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

export default function LinkCreator({ usuarioID, onLinkCreated }) {
  const [step, setStep] = useState('contexto') // contexto, detalles, configurar, resultado
  const [formData, setFormData] = useState({
    contexto: '',
    titulo: '',
    descripcion: '',
    idioma_base: 'es',
    idiomas_permitidos: ['es', 'en'],
    tono: 'amigable',
    modo: 'conversacion'
  })
  const [loading, setLoading] = useState(false)
  const [linkCreated, setLinkCreated] = useState(null)

  const handleContextoSelect = (contexto) => {
    setFormData({ ...formData, contexto })
    setStep('detalles')
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const toggleIdiomaPermitido = (codigo) => {
    const idiomas = formData.idiomas_permitidos.includes(codigo)
      ? formData.idiomas_permitidos.filter(i => i !== codigo)
      : [...formData.idiomas_permitidos, codigo]
    setFormData({ ...formData, idiomas_permitidos: idiomas })
  }

  const handleCrearLink = async () => {
    setLoading(true)
    try {
      const result = await API.crearLink(usuarioID, {
        titulo: formData.titulo || CONTEXTOS.find(c => c.id === formData.contexto)?.nombre,
        descripcion: formData.descripcion,
        contexto: formData.contexto,
        idioma_base: formData.idioma_base,
        idiomas_permitidos: formData.idiomas_permitidos,
        tono: formData.tono,
        modo: formData.modo,
        prompt_base: `Contexto: ${formData.contexto}. Ayuda al usuario de forma ${formData.tono}.`
      })

      if (result.success) {
        setLinkCreated(result)
        setStep('resultado')
        if (onLinkCreated) onLinkCreated(result)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err) {
      alert('Error creando link: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 1: Seleccionar Contexto
  // ═══════════════════════════════════════════════════════════

  if (step === 'contexto') {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '1rem' }}>
          ¿De qué trata tu conversación?
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Elige el contexto para que LinkN.click entienda qué tipo de ayuda necesitas
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {CONTEXTOS.map(ctx => (
            <button
              key={ctx.id}
              onClick={() => handleContextoSelect(ctx.id)}
              style={{
                padding: '1.5rem',
                background: 'var(--surface-1)',
                border: '0.5px solid var(--border)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--bg-accent)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--surface-1)'}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{ctx.icon}</div>
              <div>{ctx.nombre}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 2: Detalles del Link
  // ═══════════════════════════════════════════════════════════

  if (step === 'detalles') {
    const contextInfo = CONTEXTOS.find(c => c.id === formData.contexto)

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
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          ← Cambiar contexto
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '1.5rem' }}>
          {contextInfo?.nombre}
        </h1>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Título (opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Vendo mi auto 2020"
            value={formData.titulo}
            onChange={(e) => handleInputChange('titulo', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Descripción (opcional)
          </label>
          <textarea
            placeholder="Cuéntale más detalles..."
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '0.5px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              minHeight: '80px',
              resize: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Tu idioma
          </label>
          <select
            value={formData.idioma_base}
            onChange={(e) => handleInputChange('idioma_base', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '0.5px solid var(--border)',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          >
            {IDIOMAS.map(idioma => (
              <option key={idioma.codigo} value={idioma.codigo}>
                {idioma.flag} {idioma.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Otros idiomas que aceptas
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {IDIOMAS.map(idioma => (
              <button
                key={idioma.codigo}
                onClick={() => toggleIdiomaPermitido(idioma.codigo)}
                style={{
                  padding: '8px 12px',
                  border: formData.idiomas_permitidos.includes(idioma.codigo) ? '2px solid var(--fill-accent)' : '0.5px solid var(--border)',
                  background: formData.idiomas_permitidos.includes(idioma.codigo) ? 'var(--bg-accent)' : 'var(--surface-2)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: formData.idiomas_permitidos.includes(idioma.codigo) ? 600 : 400,
                  color: formData.idiomas_permitidos.includes(idioma.codigo) ? 'var(--text-accent)' : 'var(--text-primary)',
                  transition: 'all 0.2s'
                }}
              >
                {idioma.flag} {idioma.nombre}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCrearLink}
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
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Creando link...' : '🔗 Crear mi link'}
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 3: Resultado (Link creado)
  // ═══════════════════════════════════════════════════════════

  if (step === 'resultado' && linkCreated) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🎉</div>

        <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '0.5rem' }}>
          ¡Link creado!
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Comparte este link con quien quiera conversar contigo en cualquier idioma
        </p>

        <div style={{
          background: 'var(--surface-1)',
          border: '0.5px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Tu link:
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--fill-accent)',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {linkCreated.url}
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(linkCreated.url)
            alert('Link copiado al portapapeles')
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--fill-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          📋 Copiar link
        </button>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Comparte en Instagram, Facebook, WhatsApp, Email o cualquier lado
        </p>
      </div>
    )
  }

  return null
}
