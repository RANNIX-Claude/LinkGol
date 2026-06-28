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

  return (
    <div
      className={`message-group ${isSent ? 'sent' : 'received'}`}
      onClick={() => originalText && setShowOriginal(!showOriginal)}
      title={originalText ? "Toca para ver original" : ""}
      style={{ cursor: originalText ? 'pointer' : 'default' }}
    >
      {!isSent && (
        <div className="message-avatar">
          {userAvatar}
        </div>
      )}
      <div className="message-content">
        {!isSent && (
          <div className="message-username">
            {userName}
          </div>
        )}
        <div className={`message-bubble ${isSent ? 'sent' : 'received'} ${translated ? 'translated' : ''}`}>
          {showOriginal && originalText ? (
            // Mostrar original (discreto)
            <div>
              <div style={{ opacity: 0.7, fontSize: '11px', marginBottom: '6px', fontStyle: 'italic', color: 'var(--text3)' }}>
                📌 {originalLanguage || 'Original'}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{originalText}</div>
            </div>
          ) : (
            // Mostrar mensaje traducido (normal, sin indicadores)
            <div style={{ fontSize: '15px', lineHeight: '1.4' }}>
              {message}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isSent ? 'flex-end' : 'flex-start', paddingTop: '4px', fontSize: '12px' }}>
          <span className="message-meta" style={{ color: 'var(--text3)' }}>
            {timestamp}
          </span>
          {isSent && read && <span className="read-receipt" style={{ fontSize: '11px' }}>✓✓</span>}
          {originalText && (
            <span style={{ fontSize: '10px', opacity: 0.4, cursor: 'pointer' }}>
              {showOriginal ? '▼ ver traducción' : '▲'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
