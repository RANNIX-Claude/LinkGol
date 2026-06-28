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
          <div className="message-username">
            {userName}
          </div>
        )}
        <div className={`message-bubble ${isSent ? 'sent' : 'received'} ${translated ? 'translated' : ''}`}>
          {showOriginal && originalText ? (
            <div>
              <div style={{ opacity: 0.7, fontSize: '13px', marginBottom: '4px', fontStyle: 'italic' }}>
                {originalLanguage ? `[${originalLanguage}]` : '[Original]'}
              </div>
              <div style={{ marginTop: '2px' }}>{originalText}</div>
            </div>
          ) : (
            message
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: isSent ? 'flex-end' : 'flex-start', paddingTop: '1px' }}>
          <span className="message-meta">
            {timestamp}
          </span>
          {isSent && read && <span className="read-receipt">✓✓</span>}
          {originalText && !showOriginal && (
            <button
              className="view-original-btn"
              onClick={() => setShowOriginal(!showOriginal)}
            >
              ver original
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
