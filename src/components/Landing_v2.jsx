import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const [scrollY, setScrollY] = useState(0)
  const navigate = useNavigate()

  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ background: 'var(--cream)', fontFamily: "'DM Sans', sans-serif" }}>
      {/* NAV */}
      <nav style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: 'calc(100% - 48px)',
        maxWidth: '900px'
      }}>
        <div style={{
          background: scrollY > 60 ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: '60px',
          padding: '10px 10px 10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: scrollY > 60 ? '0 4px 32px rgba(0,0,0,0.12)' : '0 2px 20px rgba(0,0,0,0.08)',
          border: '0.5px solid rgba(0,0,0,0.08)',
          transition: 'all 0.2s'
        }}>
          <a href="#" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '-0.5px',
            color: 'var(--text)',
            textDecoration: 'none'
          }}>
            <svg width="24" height="24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              {/* Burbuja izquierda */}
              <circle cx="30" cy="40" r="18" fill="none" stroke="#0052CC" strokeWidth="6" opacity="0.8"/>
              {/* Burbuja derecha */}
              <circle cx="70" cy="40" r="18" fill="none" stroke="#0052CC" strokeWidth="6" opacity="1"/>
              {/* Onda de sonido */}
              <path d="M 35 40 Q 45 50 50 40 Q 55 30 65 40" fill="none" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
            </svg>
            LinkN<span style={{ color: 'var(--fill-accent)' }}>.</span>click
          </a>

          <div style={{
            display: 'flex',
            gap: '28px',
            alignItems: 'center'
          }}>
            <a href="#fases" style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'rgba(26,26,26,0.6)',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}>
              Cómo funciona
            </a>
            <a href="#casos" style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'rgba(26,26,26,0.6)',
              textDecoration: 'none'
            }}>
              Casos de uso
            </a>
            <a href="#pricing" style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'rgba(26,26,26,0.6)',
              textDecoration: 'none'
            }}>
              Precios
            </a>
          </div>

          <button
            onClick={() => navigate('/auth/signup')}
            style={{
              background: 'var(--fill-accent)',
              color: 'white',
              padding: '10px 22px',
              borderRadius: '40px',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Empezar ahora
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'var(--fill-accent)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
        color: 'white'
      }}>
        {/* LOGO */}
        <div style={{ marginBottom: '24px' }}>
          <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>
            {/* Burbuja izquierda */}
            <circle cx="30" cy="40" r="18" fill="none" stroke="white" strokeWidth="6" opacity="0.9"/>
            {/* Burbuja derecha */}
            <circle cx="70" cy="40" r="18" fill="none" stroke="white" strokeWidth="6"/>
            {/* Onda de sonido */}
            <path d="M 35 40 Q 45 50 50 40 Q 55 30 65 40" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '40px',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '24px',
          display: 'inline-block',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          linkn.click — Comunicación Universal
        </div>

        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: 700,
          color: 'white',
          textAlign: 'center',
          lineHeight: 1,
          letterSpacing: '-3px',
          maxWidth: '900px',
          marginBottom: '24px'
        }}>
          Conversa en<br/>tu idioma.<br/>
          <em style={{ fontStyle: 'italic', fontWeight: 400 }}>El contacto escucha en el suyo.</em>
        </h1>

        <p style={{
          fontSize: 'clamp(17px, 2.5vw, 22px)',
          color: 'rgba(255,255,255,0.82)',
          textAlign: 'center',
          maxWidth: '600px',
          lineHeight: 1.5,
          marginBottom: '48px',
          fontWeight: 400
        }}>
          No necesita instalar nada. Solo un link. Sin barreras de idioma. Traducción en tiempo real invisible.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '72px'
        }}>
          <button
            onClick={() => navigate('/auth/signup')}
            style={{
              background: 'white',
              color: 'var(--fill-accent)',
              padding: '16px 32px',
              borderRadius: '50px',
              fontSize: '17px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚀 Crear Cuenta Gratis
          </button>
          <button
            onClick={() => navigate('/auth/signup')}
            style={{
              background: 'transparent',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '50px',
              fontSize: '17px',
              fontWeight: 600,
              border: '2px solid rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.borderColor = 'white'}
            onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
          >
            Entrar →
          </button>
        </div>

        {/* PHONE MOCKUPS */}
        <div style={{
          display: 'flex',
          gap: '-20px',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
          maxWidth: '800px',
          marginTop: '72px'
        }}>
          {/* Phone 1 - Remitente crea liga */}
          <div style={{
            width: '220px',
            background: 'white',
            borderRadius: '36px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
            border: '8px solid #1a1a1a',
            position: 'relative',
            flex: '0 0 auto',
            transform: 'rotate(-6deg) translateY(20px)',
            zIndex: 1
          }}>
            <div style={{ height: '28px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '80px', height: '6px', background: '#333', borderRadius: '10px' }}></div>
            </div>
            <div style={{ padding: '16px', background: 'white', minHeight: '360px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>
                <span>09:41</span>
                <span>LTE ▪▪▪</span>
              </div>
              <div style={{ background: 'var(--cream2)', borderRadius: '16px', padding: '14px', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(26,26,26,0.6)', fontWeight: 500, marginBottom: '4px' }}>
                  PASO 1
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                  Crea una Liga
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(26,26,26,0.6)', marginTop: '6px' }}>
                  Elige contexto
                </div>
              </div>
              <div style={{ background: 'var(--cream2)', borderRadius: '16px', padding: '14px', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(26,26,26,0.6)', fontWeight: 500, marginBottom: '4px' }}>
                  PASO 2
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                  Personaliza
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(26,26,26,0.6)', marginTop: '6px' }}>
                  Tu primer mensaje
                </div>
              </div>
              <div style={{ background: 'var(--fill-accent)', borderRadius: '16px', padding: '14px', color: 'white' }}>
                <div style={{ fontSize: '10px', opacity: 0.7, fontWeight: 500, marginBottom: '4px' }}>
                  PASO 3
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>
                  Comparte
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '6px' }}>
                  WhatsApp, QR, Link
                </div>
              </div>
            </div>
          </div>

          {/* Phone 2 - Chat central */}
          <div style={{
            width: '220px',
            background: 'white',
            borderRadius: '36px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
            border: '8px solid #1a1a1a',
            position: 'relative',
            flex: '0 0 auto',
            transform: 'rotate(0deg)',
            zIndex: 3,
            margin: '0 -30px'
          }}>
            <div style={{ height: '28px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '80px', height: '6px', background: '#333', borderRadius: '10px' }}></div>
            </div>
            <div style={{ padding: '16px', background: 'white', minHeight: '360px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>
                <span>09:41</span>
                <span>LTE ▪▪▪</span>
              </div>
              <div style={{ background: 'var(--cream2)', borderRadius: '16px', padding: '14px', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(26,26,26,0.6)', fontWeight: 500, marginBottom: '4px' }}>
                  CHAT EN VIVO
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                  Conversación activa
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--fill-accent)', marginTop: '8px' }}>
                  2/2
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(26,26,26,0.6)', marginTop: '4px' }}>
                  Usuarios conectados
                </div>
              </div>
              <div style={{ background: '#f0f0f0', borderRadius: '16px', padding: '10px', marginBottom: '8px', fontSize: '11px', color: '#666' }}>
                📍 Tu idioma: Español
              </div>
              <div style={{ background: '#e8f5e9', borderRadius: '16px', padding: '10px', marginBottom: '8px', fontSize: '11px', color: '#2e7d32', fontWeight: 600 }}>
                ✅ Traducción automática
              </div>
              <div style={{ background: 'var(--fill-accent)', borderRadius: '16px', padding: '14px', color: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>
                  Chat disponible
                </div>
              </div>
            </div>
          </div>

          {/* Phone 3 - Receptor acepta */}
          <div style={{
            width: '220px',
            background: 'white',
            borderRadius: '36px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
            border: '8px solid #1a1a1a',
            position: 'relative',
            flex: '0 0 auto',
            transform: 'rotate(6deg) translateY(20px)',
            zIndex: 1
          }}>
            <div style={{ height: '28px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '80px', height: '6px', background: '#333', borderRadius: '10px' }}></div>
            </div>
            <div style={{ padding: '16px', background: 'white', minHeight: '360px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }}>
                <span>09:41</span>
                <span>LTE ▪▪▪</span>
              </div>
              <div style={{ background: 'var(--fill-accent)', borderRadius: '16px', padding: '14px', marginBottom: '8px', color: 'white' }}>
                <div style={{ fontSize: '10px', opacity: 0.7, fontWeight: 500, marginBottom: '4px' }}>
                  INVITACIÓN
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>
                  Roberto te invita
                </div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '6px' }}>
                  Conversación 1:1
                </div>
              </div>
              <div style={{ background: 'var(--cream2)', borderRadius: '16px', padding: '14px', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(26,26,26,0.6)', fontWeight: 500, marginBottom: '4px' }}>
                  ELIGE IDIOMA
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                  English
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(26,26,26,0.6)', marginTop: '6px' }}>
                  Puedes cambiar después
                </div>
              </div>
              <div style={{ background: '#e8f5e9', borderRadius: '16px', padding: '12px', marginBottom: '8px', fontSize: '11px', color: '#2e7d32', fontWeight: 600 }}>
                ✅ Sin crear cuenta
              </div>
              <button style={{
                width: '100%',
                background: 'var(--fill-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                Aceptar invitación
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2A: CHAT EXAMPLE - La Traducción es 100% Invisible */}
      <section style={{
        background: 'var(--cream)',
        padding: '100px 24px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700,
            letterSpacing: '-1.5px',
            marginBottom: '16px'
          }}>
            La Traducción es 100% Invisible
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '18px',
            color: 'rgba(26,26,26,0.6)',
            maxWidth: '600px',
            margin: '0 auto 64px',
            lineHeight: 1.6
          }}>
            Cada usuario ve mensajes en su propio idioma, sin botones, sin fricción, sin instalar nada.
          </p>

          {/* Two-column chat example */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'start'
          }}>
            {/* Roberto (Spanish) */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>
                Roberto de México 🇲🇽
              </div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {/* Roberto's message bubble (sent) */}
                <div style={{
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '20px 4px 20px 20px',
                  marginBottom: '12px',
                  display: 'inline-block',
                  maxWidth: '85%',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  Hola Ana, ¿cómo estás?
                </div>

                {/* Anna's message bubble (received, in Spanish for Roberto) */}
                <div style={{
                  background: 'var(--cream2)',
                  color: 'var(--text)',
                  padding: '12px 16px',
                  borderRadius: '4px 20px 20px 20px',
                  marginBottom: '12px',
                  display: 'inline-block',
                  maxWidth: '85%',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  ¡Muy bien, gracias! ¿Y tú?
                </div>

                {/* Roberto's response */}
                <div style={{
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '20px 4px 20px 20px',
                  display: 'inline-block',
                  maxWidth: '85%',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  Excelente, adelante! 🚀
                </div>
              </div>
            </div>

            {/* Anna (Russian) */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>
                Anna de Rusia 🇷🇺
              </div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {/* Anna's message (sent, in Russian) */}
                <div style={{
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '20px 4px 20px 20px',
                  marginBottom: '12px',
                  display: 'inline-block',
                  maxWidth: '85%',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  Привет Роберто, я в порядке 👋
                </div>

                {/* Roberto's message (received, in Russian for Anna) */}
                <div style={{
                  background: 'var(--cream2)',
                  color: 'var(--text)',
                  padding: '12px 16px',
                  borderRadius: '4px 20px 20px 20px',
                  marginBottom: '12px',
                  display: 'inline-block',
                  maxWidth: '85%',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  Замечательно, давайте начинать! 🚀
                </div>

                {/* Anna's response */}
                <div style={{
                  background: 'var(--primary)',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '20px 4px 20px 20px',
                  display: 'inline-block',
                  maxWidth: '85%',
                  fontSize: '14px',
                  lineHeight: 1.5
                }}>
                  Отлично! 💪
                </div>
              </div>
            </div>
          </div>

          {/* Key insight badge */}
          <div style={{
            maxWidth: '800px',
            margin: '60px auto 0',
            padding: '24px',
            background: 'white',
            borderRadius: '16px',
            border: '2px solid var(--fill-accent)',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,82,204,0.1)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fill-accent)', marginBottom: '8px' }}>
              ✨ SIN FRICCIÓN
            </div>
            <div style={{ fontSize: '16px', color: 'var(--text)', lineHeight: 1.6 }}>
              No hay botones de "traducir". No hay indicadores visibles. Solo un chat natural donde cada persona habla su idioma.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2B: EXPERIENCIA HIPERRREALISTA - Two phones mockup */}
      <section style={{
        background: 'var(--fill-accent)',
        padding: '100px 24px',
        position: 'relative',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700,
            letterSpacing: '-1.5px',
            marginBottom: '16px'
          }}>
            La Experiencia Hiperrrealista
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '18px',
            color: 'rgba(255,255,255,0.82)',
            maxWidth: '600px',
            margin: '0 auto 64px',
            lineHeight: 1.6
          }}>
            Dos teléfonos, mismo mensaje, cada uno en su idioma. El contacto percibe un nativo hablando.
          </p>

          {/* Two phones side-by-side with annotations */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
            position: 'relative',
            marginBottom: '60px'
          }}>
            {/* Phone 1 - Remitente (Spanish) */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              {/* Phone frame with content */}
              <div style={{
                width: '100%',
                maxWidth: '280px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '40px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '12px solid #1a1a1a',
                transform: 'rotate(-5deg)',
                position: 'relative'
              }}>
                {/* Notch */}
                <div style={{
                  height: '24px',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ width: '100px', height: '5px', background: '#333', borderRadius: '10px' }}></div>
                </div>
                {/* Screen content */}
                <div style={{ padding: '16px', background: 'white', height: '360px', overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
                    LinkN.click
                  </div>
                  <div style={{
                    background: 'var(--fill-accent)',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '18px 4px 18px 18px',
                    marginBottom: '8px',
                    fontSize: '13px',
                    display: 'inline-block',
                    maxWidth: '80%'
                  }}>
                    Hola Anna, tengo un auto
                  </div>
                  <div style={{
                    background: 'var(--cream2)',
                    color: '#1a1a1a',
                    padding: '10px 14px',
                    borderRadius: '4px 18px 18px 18px',
                    fontSize: '13px',
                    display: 'inline-block',
                    maxWidth: '80%'
                  }}>
                    ¿Te interesa?
                  </div>
                </div>
              </div>

              {/* Annotation: Remitente */}
              <div style={{
                marginTop: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'white',
                opacity: 0.9
              }}>
                Remitente (Roberto)<br/>
                Escribe en Español 🇲🇽
              </div>
            </div>

            {/* Phone 2 - Receptor (Russian) */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              {/* Phone frame with content */}
              <div style={{
                width: '100%',
                maxWidth: '280px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '40px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '12px solid #1a1a1a',
                transform: 'rotate(5deg)',
                position: 'relative'
              }}>
                {/* Notch */}
                <div style={{
                  height: '24px',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ width: '100px', height: '5px', background: '#333', borderRadius: '10px' }}></div>
                </div>
                {/* Screen content */}
                <div style={{ padding: '16px', background: 'white', height: '360px', overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
                    LinkN.click
                  </div>
                  <div style={{
                    background: 'var(--fill-accent)',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '18px 4px 18px 18px',
                    marginBottom: '8px',
                    fontSize: '13px',
                    display: 'inline-block',
                    maxWidth: '80%'
                  }}>
                    Привет Анна, у меня есть машина
                  </div>
                  <div style={{
                    background: 'var(--cream2)',
                    color: '#1a1a1a',
                    padding: '10px 14px',
                    borderRadius: '4px 18px 18px 18px',
                    fontSize: '13px',
                    display: 'inline-block',
                    maxWidth: '80%'
                  }}>
                    Вам интересно?
                  </div>
                </div>
              </div>

              {/* Annotation: Receptor */}
              <div style={{
                marginTop: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'white',
                opacity: 0.9
              }}>
                Receptor (Anna)<br/>
                Lee en Ruso 🇷🇺
              </div>
            </div>
          </div>

          {/* Three callout boxes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {/* Callout 1: 100% Invisible */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>👻</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                100% Invisible
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9 }}>
                Sin botones de "traducir" ni indicadores visibles de inteligencia artificial
              </div>
            </div>

            {/* Callout 2: Cero Fricción */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚡</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                Cero Fricción
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9 }}>
                Sin instalación, sin configuración, sin cuenta. Solo un link o código QR
              </div>
            </div>

            {/* Callout 3: Nativo */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>🎭</div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>
                Nativo
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9 }}>
                El usuario percibe que habla con un nativo de su idioma. Conexión más profunda.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLE */}
      <section style={{
        background: 'var(--cream)',
        padding: '100px 24px',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'var(--fill-accent)',
            borderRadius: '48px',
            padding: '48px',
            color: 'white'
          }}>
            <div style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 500,
              lineHeight: 1.4,
              fontStyle: 'italic',
              marginBottom: '24px'
            }}>
              "La comunicación sin barreras de idioma es el futuro. LinkN.click lo hace hoy."
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8, fontWeight: 500 }}>
              — Usuario de LinkN.click
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--fill-accent)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              El principio
            </div>
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 700,
              letterSpacing: '-1.5px',
              marginBottom: '16px',
              color: 'var(--text)'
            }}>
              Habla tu idioma.<br/>Sin instalar nada.
            </h2>
            <p style={{
              fontSize: '17px',
              color: 'rgba(26,26,26,0.6)',
              lineHeight: 1.7,
              marginBottom: '16px'
            }}>
              LinkN.click revoluciona la comunicación remota eliminando dos barreras:
            </p>
            <ul style={{
              fontSize: '17px',
              color: 'rgba(26,26,26,0.6)',
              lineHeight: 1.7,
              listStyle: 'none',
              padding: 0
            }}>
              <li style={{ marginBottom: '12px' }}>✅ <strong>Sin instalación</strong> — Un link. Punto.</li>
              <li>✅ <strong>Sin barreras de idioma</strong> — Cada quien habla su idioma nativo.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FASES */}
      <section style={{
        background: 'white',
        padding: '100px 24px',
        position: 'relative'
      }} id="fases">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--fill-accent)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            Cómo funciona
          </div>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-2px',
            lineHeight: 1.05,
            color: 'var(--text)',
            marginBottom: '64px'
          }}>
            L-I-N-K
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {[
              {
                letter: 'L',
                fase: 'Fase 1',
                nombre: 'Landing',
                desc: 'Portal de información. Crea tu cuenta anónima en 30 segundos.'
              },
              {
                letter: 'I',
                fase: 'Fase 2',
                nombre: 'Invitación',
                desc: 'Crea una liga, personaliza tu primer mensaje, comparte por WhatsApp/QR/Email.',
                featured: true
              },
              {
                letter: 'N',
                fase: 'Fase 3',
                nombre: 'Negociación',
                desc: 'Receptor recibe tu invitación, elige idioma, acepta. Conversación comienza.'
              },
              {
                letter: 'K',
                fase: 'Fase 4',
                nombre: 'Knowledge',
                desc: 'Chat en tiempo real. Traducción automática invisible. Ambos en su idioma.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: item.featured ? 'var(--fill-accent)' : 'var(--cream2)',
                  borderRadius: '32px',
                  padding: '32px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  color: item.featured ? 'white' : 'var(--text)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  fontSize: '80px',
                  fontWeight: 700,
                  opacity: item.featured ? 0.2 : 0.08,
                  position: 'absolute',
                  top: '8px',
                  right: '20px',
                  lineHeight: 1,
                  letterSpacing: '-4px',
                  color: item.featured ? 'white' : 'var(--text)'
                }}>
                  {item.letter}
                </div>

                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: item.featured ? 'rgba(255,255,255,0.7)' : 'var(--fill-accent)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}>
                  {item.fase}
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-1px',
                  marginBottom: '8px'
                }}>
                  {item.nombre}
                </div>
                <div style={{
                  fontSize: '15px',
                  lineHeight: 1.6,
                  opacity: item.featured ? 0.8 : 0.6
                }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASOS DE USO */}
      <section style={{
        background: 'var(--cream)',
        padding: '100px 24px'
      }} id="casos">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--fill-accent)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            Casos de uso
          </div>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-2px',
            marginBottom: '64px'
          }}>
            Para cualquier conversación
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>🚗 Venta de Autos</h4>
              <p style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)' }}>
                Vendedor comparte liga. Comprador ve detalles. Conversan en idiomas diferentes sin fricción.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>🏠 Renta de Inmuebles</h4>
              <p style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)' }}>
                Agente envía liga con detalles. Inquilino internacional pregunta en su idioma.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>👔 Networking</h4>
              <p style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)' }}>
                Conocer gente sin compartir número. Conversación sin barreras de idioma.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>😊 Cita Casual</h4>
              <p style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)' }}>
                Comparte liga sin dar teléfono. Conversa sin presión. Si funca, intercambian info.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>🔧 Soporte Técnico</h4>
              <p style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)' }}>
                Soporte multiidioma. Cliente habla su idioma. Equipo entiende automático.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '0.5rem' }}>✈️ Turismo</h4>
              <p style={{ fontSize: '14px', color: 'rgba(26,26,26,0.6)' }}>
                Guía comparte liga. Turista pregunta en su idioma. Sin barreras de comunicación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{
        background: 'white',
        padding: '100px 24px'
      }} id="pricing">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--fill-accent)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Planes
          </div>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-2px',
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            Escala según necesites
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                name: 'FREE',
                price: '$0',
                features: [
                  '✅ Crear ligas ilimitadas',
                  '✅ Mensajes de texto ilimitados',
                  '✅ Traducción automática',
                  '❌ Audio limitado (3/día)',
                  '❌ Analytics'
                ]
              },
              {
                name: 'STARTER',
                price: '$5',
                featured: true,
                features: [
                  '✅ Todo de FREE',
                  '✅ Audio limitado (20/día)',
                  '✅ Voces premium',
                  '✅ Sin ads',
                  '❌ API'
                ]
              },
              {
                name: 'PRO',
                price: '$20',
                features: [
                  '✅ Todo de STARTER',
                  '✅ Audio ilimitado',
                  '✅ Multi-voces',
                  '✅ Analytics avanzado',
                  '✅ API + Webhooks'
                ]
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                style={{
                  background: plan.featured ? 'var(--fill-accent)' : 'var(--cream2)',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: plan.featured ? '2px solid var(--fill-accent)' : '0.5px solid rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  color: plan.featured ? 'white' : 'var(--text)'
                }}
              >
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: plan.featured ? 'white' : 'var(--text)'
                }}>
                  {plan.name}
                </h4>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: plan.featured ? 'white' : 'var(--fill-accent)'
                }}>
                  {plan.price}
                </div>
                <p style={{
                  fontSize: '12px',
                  color: plan.featured ? 'rgba(255,255,255,0.7)' : 'rgba(26,26,26,0.6)',
                  marginBottom: '2rem'
                }}>
                  por mes
                </p>
                <ul style={{
                  fontSize: '14px',
                  textAlign: 'left',
                  marginBottom: '2rem',
                  lineHeight: 1.8,
                  listStyle: 'none',
                  padding: 0
                }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ color: plan.featured ? 'rgba(255,255,255,0.9)' : 'rgba(26,26,26,0.6)' }}>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        background: 'var(--fill-accent)',
        padding: '120px 24px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: 700,
          color: 'white',
          letterSpacing: '-3px',
          lineHeight: 1,
          marginBottom: '24px'
        }}>
          Comienza gratis ahora
        </h2>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.8)',
          maxWidth: '500px',
          margin: '0 auto 48px',
          lineHeight: 1.5
        }}>
          No necesitas tarjeta de crédito. Sin instalación. Comienza en 30 segundos.
        </p>
        <button
          onClick={() => navigate('/auth/signup')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            color: 'var(--fill-accent)',
            padding: '18px 40px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          🚀 Crear Cuenta Gratis
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: 'var(--text)',
        padding: '48px 24px',
        color: 'rgba(255,255,255,0.5)'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-1px'
          }}>
            LinkN<span style={{ color: 'var(--fill-accent)' }}>.</span>click
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
            >
              Privacidad
            </a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
            >
              Términos
            </a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
            >
              Contacto
            </a>
          </div>
          <div style={{ fontSize: '13px' }}>
            © 2026 LinkN.click. Comunicación universal, sin barreras.
          </div>
        </div>
      </footer>
    </div>
  )
}
