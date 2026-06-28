import React, { useState } from 'react'

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' }
]

export default function ContactList({
  contacts,
  conversations,
  activeConversation,
  onSelectConversation,
  onInvite,
  searchTerm,
  onSearchChange,
  hostProfile,
  onChangeLanguage
}) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  const getConversationForContact = (contactEmail) => {
    return conversations.find(c => c.guest_email === contactEmail)
  }

  const getLastMessage = (conversation) => {
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return 'Sin mensajes'
    }
    const lastMsg = conversation.messages[conversation.messages.length - 1]
    return lastMsg.text.substring(0, 40) + (lastMsg.text.length > 40 ? '...' : '')
  }

  const getUnreadCount = (conversation) => {
    if (!conversation) return 0
    return conversation.messages.filter(m => m.sender === 'received' && !m.read).length
  }

  return (
    <div style={{
      width: '360px',
      borderRight: '1px solid #E5E5EA',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#FFFFFF',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header: Host Profile + Language Selector */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #F0F0F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          minWidth: 0
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#0052CC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0
          }}>
            {hostProfile.avatar}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#000000',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {hostProfile.nombre}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#A0AEC0'
            }}>
              {hostProfile.email}
            </div>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            style={{
              background: '#F5F5F5',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={`Idioma: ${hostProfile.idioma_default}`}
          >
            {LANGUAGES.find(l => l.code === hostProfile.idioma_default)?.flag}
            <span style={{ fontSize: '11px' }}>▼</span>
          </button>

          {showLanguageMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: '#FFFFFF',
              border: '1px solid #E5E5EA',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000,
              minWidth: '150px',
              marginTop: '4px'
            }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChangeLanguage(lang.code)
                    setShowLanguageMenu(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    border: 'none',
                    background: hostProfile.idioma_default === lang.code ? '#E8F0FF' : 'transparent',
                    color: '#000000',
                    fontSize: '13px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                    fontWeight: hostProfile.idioma_default === lang.code ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (hostProfile.idioma_default !== lang.code) {
                      e.target.style.background = '#F5F5F5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hostProfile.idioma_default !== lang.code) {
                      e.target.style.background = 'transparent'
                    }
                  }}
                >
                  <span>{lang.flag}</span>
                  {lang.name}
                  {hostProfile.idioma_default === lang.code && <span style={{ marginLeft: 'auto' }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '12px 16px' }}>
        <input
          type="text"
          placeholder="Buscar contacto..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            border: '1px solid #E5E5EA',
            borderRadius: '20px',
            padding: '10px 16px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Add Contact Button */}
      <div style={{ padding: '8px 16px' }}>
        <button
          onClick={onInvite}
          style={{
            width: '100%',
            background: '#0052CC',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#0041A3'}
          onMouseLeave={(e) => e.target.style.background = '#0052CC'}
        >
          ➕ Invitar Contacto
        </button>
      </div>

      {/* Conversations List (Contacts with active conversations) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        borderTop: '1px solid #F0F0F0'
      }}>
        {contacts.length === 0 ? (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: '#A0AEC0',
            fontSize: '14px'
          }}>
            No hay contactos. Invita a alguien para comenzar.
          </div>
        ) : (
          contacts.map(contact => {
            const conversation = getConversationForContact(contact.contact_email)
            const unread = getUnreadCount(conversation)
            const isActive = conversation && conversation.id === activeConversation

            return (
              <div
                key={contact.id}
                onClick={() => conversation && onSelectConversation(conversation.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #F0F0F0',
                  cursor: conversation ? 'pointer' : 'default',
                  background: isActive ? '#F5F5F5' : 'transparent',
                  transition: 'background 0.2s',
                  opacity: conversation ? 1 : 0.6,
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (conversation && !isActive) {
                    e.currentTarget.style.background = '#F9F9F9'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#E8F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {contact.contact_photo}
                </div>

                {/* Contact Info */}
                <div style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#000000',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {contact.contact_name}
                    </div>
                    {conversation && (
                      <div style={{
                        fontSize: '11px',
                        color: '#A0AEC0'
                      }}>
                        {conversation.timestamp}
                      </div>
                    )}
                  </div>

                  {conversation && (
                    <div style={{
                      fontSize: '13px',
                      color: unread > 0 ? '#000000' : '#65676B',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: unread > 0 ? 500 : 400
                    }}>
                      {getLastMessage(conversation)}
                    </div>
                  )}
                </div>

                {/* Unread Badge */}
                {unread > 0 && (
                  <div style={{
                    background: '#0052CC',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    {unread}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
