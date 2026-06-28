import React, { useState } from 'react'

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' }
]

export default function InviteDialog({
  contacts,
  hostLanguage,
  onInvite,
  onClose
}) {
  const [selectedContact, setSelectedContact] = useState(null)
  const [inviteLanguage, setInviteLanguage] = useState(hostLanguage)
  const [copied, setCopied] = useState(false)

  const handleInvite = () => {
    if (selectedContact) {
      onInvite(selectedContact.contact_email, selectedContact.contact_name)
    }
  }

  const copyQRLink = () => {
    const link = `linkgol.app/conv/QR_${Math.random().toString(36).substr(2, 9)}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          width: '90%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F0F0F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#000000'
            }}
          >
            Invitar Contacto
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#A0AEC0'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', flex: 1 }}>
          {/* Select Contact */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#000000',
              display: 'block',
              marginBottom: '8px'
            }}>
              Selecciona un contacto:
            </label>
            <div style={{
              border: '1px solid #E5E5EA',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: selectedContact?.id === contact.id ? '#E8F0FF' : 'transparent',
                    color: '#000000',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    borderBottom: '1px solid #F5F5F5',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedContact?.id !== contact.id) {
                      e.target.style.background = '#F9F9F9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedContact?.id !== contact.id) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{contact.contact_photo}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{contact.contact_name}</div>
                    <div style={{ fontSize: '12px', color: '#A0AEC0' }}>
                      {contact.contact_email}
                    </div>
                  </div>
                  {selectedContact?.id === contact.id && (
                    <span style={{ marginLeft: 'auto', color: '#0052CC' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Invitation Details */}
          {selectedContact && (
            <div style={{
              background: '#F5F5F5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#000000',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Detalles de Invitación
              </div>

              {/* Your Language */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#65676B',
                  marginBottom: '4px'
                }}>
                  Tu idioma:
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000'
                }}>
                  {LANGUAGES.find(l => l.code === hostLanguage)?.flag}{' '}
                  {LANGUAGES.find(l => l.code === hostLanguage)?.name}
                </div>
              </div>

              {/* Guest Language Selector */}
              <div>
                <div style={{
                  fontSize: '12px',
                  color: '#65676B',
                  marginBottom: '8px'
                }}>
                  Idioma del invitado:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '6px'
                }}>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setInviteLanguage(lang.code)}
                      style={{
                        padding: '8px 12px',
                        border: inviteLanguage === lang.code ? '2px solid #0052CC' : '1px solid #E5E5EA',
                        background: inviteLanguage === lang.code ? '#E8F0FF' : '#FFFFFF',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: inviteLanguage === lang.code ? 600 : 400,
                        color: '#000000',
                        transition: 'all 0.2s'
                      }}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* QR Link */}
          {selectedContact && (
            <div style={{
              background: '#E8F0FF',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#0052CC',
                marginBottom: '8px',
                fontWeight: 600
              }}>
                🔗 Link de Invitación
              </div>
              <div
                onClick={copyQRLink}
                style={{
                  background: '#FFFFFF',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#0052CC',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  border: '1px solid #D0E0FF'
                }}
                title={copied ? 'Copiado!' : 'Click para copiar'}
              >
                {copied ? '✓ Copiado!' : 'linkgol.app/conv/...'}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #F0F0F0',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #E5E5EA',
              background: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#000000',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#F5F5F5'}
            onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
          >
            Cancelar
          </button>
          <button
            onClick={handleInvite}
            disabled={!selectedContact}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: selectedContact ? '#0052CC' : '#D0D0D0',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: selectedContact ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (selectedContact) e.target.style.background = '#0041A3'
            }}
            onMouseLeave={(e) => {
              if (selectedContact) e.target.style.background = '#0052CC'
            }}
          >
            Invitar
          </button>
        </div>
      </div>
    </div>
  )
}
