import React from 'react'

export default function Landing({ onSignUp, onLogin }) {
  return (
    <div style={{ background: 'var(--surface-0)' }}>
      {/* HERO SECTION */}
      <div style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 64px)',
          fontWeight: 700,
          marginBottom: '1rem',
          color: 'var(--text-primary)'
        }}>
          🌍 LinkN.click
        </h1>
        <h2 style={{
          fontSize: 'clamp(20px, 3vw, 36px)',
          fontWeight: 600,
          marginBottom: '1rem',
          color: 'var(--text-primary)'
        }}>
          La plataforma de conversación universal
        </h2>
        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Comunícate en tu idioma. Tu contacto escucha en el suyo.<br/>
          Sin apps. Sin barreras. Solo un link.
        </p>

        <button
          onClick={onSignUp}
          style={{
            padding: '14px 40px',
            fontSize: '16px',
            fontWeight: 600,
            background: 'var(--fill-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '1rem',
            marginBottom: '1rem'
          }}
        >
          🚀 Crear Cuenta Gratis
        </button>
        <button
          onClick={onLogin}
          style={{
            padding: '14px 40px',
            fontSize: '16px',
            fontWeight: 600,
            background: 'transparent',
            color: 'var(--fill-accent)',
            border: '2px solid var(--fill-accent)',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Entrar
        </button>
      </div>

      {/* FEATURES SECTION */}
      <div style={{
        padding: '6rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h3 style={{
          fontSize: '32px',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '4rem',
          color: 'var(--text-primary)'
        }}>
          ¿Cómo funciona?
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Feature 1 */}
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '12px',
            padding: '2rem',
            border: '0.5px solid var(--border)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>1️⃣</div>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem' }}>
              Crea tu cuenta
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Regístrate en LinkN.click con tu email. Solo necesitas un NIP de 4 dígitos para identificarte.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '12px',
            padding: '2rem',
            border: '0.5px solid var(--border)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>2️⃣</div>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem' }}>
              Crea una liga
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Selecciona un contexto (venta, renta, networking, cita, etc.) y personaliza tu mensaje inicial.
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '12px',
            padding: '2rem',
            border: '0.5px solid var(--border)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>3️⃣</div>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem' }}>
              Comparte
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Envía el link por WhatsApp, Facebook, email, QR o cópialo. Tu contacto no necesita instalar nada.
            </p>
          </div>

          {/* Feature 4 */}
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '12px',
            padding: '2rem',
            border: '0.5px solid var(--border)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>4️⃣</div>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem' }}>
              Conversa en tu idioma
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Cada persona habla en su idioma. Traducción en tiempo real automática. Sin fricción.
            </p>
          </div>

          {/* Feature 5 */}
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '12px',
            padding: '2rem',
            border: '0.5px solid var(--border)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📱</div>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem' }}>
              Texto + Audio
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Envía mensajes de voz. Se transcriben y traducen automáticamente. Escucha en tu idioma.
            </p>
          </div>

          {/* Feature 6 */}
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '12px',
            padding: '2rem',
            border: '0.5px solid var(--border)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔒</div>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem' }}>
              Privado y seguro
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              No compartes teléfono ni redes sociales. Identidad anónima con NIP 4 dígitos. Mensajes cifrados.
            </p>
          </div>
        </div>
      </div>

      {/* USE CASES SECTION */}
      <div style={{
        padding: '6rem 2rem',
        background: 'var(--surface-1)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h3 style={{
          fontSize: '32px',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '4rem',
          color: 'var(--text-primary)'
        }}>
          Casos de uso
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>🚗 Venta de Autos</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Vendedor comparte liga. Comprador ve fotos y detalles. Conversan en idiomas diferentes.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>🏠 Renta de Inmuebles</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Agente inmobiliario envía liga con detalles. Inquilino internacional pregunta en su idioma.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>👔 Networking Profesional</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Conocer gente sin compartir número. Conversación de negocios sin barreras de idioma.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>😊 Cita Casual</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Comparte liga sin dar teléfono. Conversa sin presión. Si funca, intercambian info.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>🔧 Soporte Técnico</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Soporte multiidioma. Cliente habla su idioma. Equipo de soporte entiende automático.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>✈️ Turismo</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Guía turística comparte liga. Turista pregunta en su idioma. Sin barreras de comunicación.
            </p>
          </div>
        </div>
      </div>

      {/* PRICING SECTION */}
      <div style={{
        padding: '6rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h3 style={{
          fontSize: '32px',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: '4rem',
          color: 'var(--text-primary)'
        }}>
          Planes
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {/* FREE */}
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '12px',
            padding: '2rem',
            border: '0.5px solid var(--border)',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem' }}>🟢 FREE</h4>
            <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--fill-accent)' }}>
              $0
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2rem' }}>Siempre</p>
            <ul style={{ fontSize: '14px', textAlign: 'left', marginBottom: '2rem', lineHeight: '1.8' }}>
              <li>✅ Crear ligas ilimitadas</li>
              <li>✅ Mensajes de texto ilimitados</li>
              <li>✅ Traducción automática</li>
              <li>❌ Audio limitado (3/día)</li>
              <li>❌ Dashboard avanzado</li>
            </ul>
          </div>

          {/* STARTER */}
          <div style={{
            background: 'var(--bg-accent)',
            borderRadius: '12px',
            padding: '2rem',
            border: '2px solid var(--fill-accent)',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-accent)' }}>
              ⭐ STARTER
            </h4>
            <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--fill-accent)' }}>
              $5
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2rem' }}>por mes</p>
            <ul style={{ fontSize: '14px', textAlign: 'left', marginBottom: '2rem', lineHeight: '1.8' }}>
              <li>✅ Todo de FREE</li>
              <li>✅ Audio limitado (20/día)</li>
              <li>✅ Voces premium</li>
              <li>✅ Sin ads</li>
              <li>❌ Dashboard avanzado</li>
            </ul>
          </div>

          {/* PRO */}
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '12px',
            padding: '2rem',
            border: '0.5px solid var(--border)',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '1rem' }}>🚀 PRO</h4>
            <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--fill-accent)' }}>
              $20
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2rem' }}>por mes</p>
            <ul style={{ fontSize: '14px', textAlign: 'left', marginBottom: '2rem', lineHeight: '1.8' }}>
              <li>✅ Todo de STARTER</li>
              <li>✅ Audio ilimitado</li>
              <li>✅ Multi-voces (formal, casual)</li>
              <li>✅ Analytics avanzado</li>
              <li>✅ API para integraciones</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div style={{
        padding: '6rem 2rem',
        background: 'var(--fill-accent)',
        color: 'white',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '36px',
          fontWeight: 600,
          marginBottom: '1rem'
        }}>
          Comienza gratis ahora
        </h3>
        <p style={{
          fontSize: '18px',
          marginBottom: '2rem',
          opacity: 0.9
        }}>
          No necesitas tarjeta de crédito. Sin instalación. Comienza en 30 segundos.
        </p>
        <button
          onClick={onSignUp}
          style={{
            padding: '14px 40px',
            fontSize: '16px',
            fontWeight: 600,
            background: 'white',
            color: 'var(--fill-accent)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🚀 Crear Cuenta Gratis
        </button>
      </div>

      {/* FOOTER */}
      <div style={{
        padding: '3rem 2rem',
        background: 'var(--surface-1)',
        borderTop: '0.5px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px'
      }}>
        <p>© 2026 LinkN.click. Comunicación universal, sin barreras.</p>
        <p>
          <a href="#privacy" style={{ color: 'var(--fill-accent)', textDecoration: 'none' }}>Privacidad</a>
          {' • '}
          <a href="#terms" style={{ color: 'var(--fill-accent)', textDecoration: 'none' }}>Términos</a>
          {' • '}
          <a href="#contact" style={{ color: 'var(--fill-accent)', textDecoration: 'none' }}>Contacto</a>
        </p>
      </div>
    </div>
  )
}
