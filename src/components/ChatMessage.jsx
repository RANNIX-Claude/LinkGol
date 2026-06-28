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
    <div className={`message-group ${isSent ? 'sent' : 'received'}`}>
      {!isSent && (
        <div className="message-avatar">
          {userAvatar}
        </div>
      )}
      <div className="message-content">
        {!isSent && (
          <div style={{ fontSize: '12px', fontWeight: 600, color: var(--text2), paddingLeft: '8px' }}>
            {userName}
          </div>
        )}
        <div className={`message-bubble ${isSent ? 'sent' : 'received'} ${translated ? 'translated' : ''}`}>
          {showOriginal && originalText ? (
            <div>
              <div style={{ opacity: 0.7, fontSize: '12px', marginBottom: '6px', fontStyle: 'italic' }}>
                {originalLanguage ? `Original en ${originalLanguage}` : 'Original'}
              </div>
              <div style={{ marginTop: '4px' }}>{originalText}</div>
            </div>
          ) : (
            message
          )}
        </div>
        <div className="message-meta">
          <span>{timestamp}</span>
          {isSent && read && <span className="read-receipt">✓✓</span>}
          {originalText && !showOriginal && (
            <button
              className="view-original-btn"
              onClick={() => setShowOriginal(!showOriginal)}
              style={{ marginLeft: 'auto', padding: '2px 4px', fontSize: '10px' }}
            >
              Ver original
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
