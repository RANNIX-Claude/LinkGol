import React, { useState } from 'react'

export default function ChatMessage({
  message,
  sender,
  timestamp,
  userName = 'Usuario',
  userAvatar = '👤',
  translated = false,
  originalLanguage = null,
  originalText = null,
  read = false
}) {
  const [showOriginal, setShowOriginal] = useState(false)
  const isSent = sender === 'self'

  // Formatear timestamp
  const formatTime = (ts) => {
    if (!ts) return ''
    try {
      return new Date(ts).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return ts
    }
  }

  return (
    <div
      className={`message-group ${isSent ? 'sent' : 'received'}`}
      onClick={() => originalText && setShowOriginal(!showOriginal)}
      style={{
        cursor: originalText ? 'pointer' : 'default',
        opacity: showOriginal ? 1 : 1,
        transition: 'all 0.2s ease'
      }}
    >
      {!isSent && (
        <div className="message-avatar" title={userName}>
          {userAvatar}
        </div>
      )}

      <div className="message-content">
        {!isSent && (
          <div className="message-username">
            {userName}
          </div>
        )}

        {/* Main Message Bubble */}
        <div
          className={`message-bubble ${isSent ? 'sent' : 'received'} ${translated ? 'translated' : ''}`}
        >
          {showOriginal && originalText ? (
            // Show Original (Discreet)
            <div>
              <div style={{
                fontSize: '13px',
                marginBottom: '8px',
                opacity: 0.7,
                fontStyle: 'italic'
              }}>
                📌 {originalLanguage || 'Original'}
              </div>
              <div style={{ fontSize: '15px', lineHeight: '1.45', fontWeight: 400 }}>
                {originalText}
              </div>
            </div>
          ) : (
            // Show Translated (Pure, No Indicators)
            <div style={{ fontSize: '15px', lineHeight: '1.45', fontWeight: 400 }}>
              {message}
            </div>
          )}
        </div>

        {/* Meta (Time + Read receipt + Tap hint) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          justifyContent: isSent ? 'flex-end' : 'flex-start',
          paddingTop: '4px'
        }}>
          <span className="message-meta">
            {formatTime(timestamp)}
          </span>

          {isSent && read && (
            <span className="read-receipt">✓✓</span>
          )}

          {originalText && !showOriginal && (
            <span style={{
              fontSize: '10px',
              opacity: 0.3,
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}>
              ▲
            </span>
          )}

          {originalText && showOriginal && (
            <span style={{
              fontSize: '10px',
              opacity: 0.3
            }}>
              ▼
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
