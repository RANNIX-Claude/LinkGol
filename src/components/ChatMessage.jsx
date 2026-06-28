import React, { useState } from 'react'

export default function ChatMessage({
  message,
  sender,
  timestamp,
  translated = false,
  originalLanguage = null,
  originalText = null
}) {
  const [showOriginal, setShowOriginal] = useState(false)
  const isSent = sender === 'self'

  return (
    <div className={`message-group ${isSent ? 'sent' : 'received'}`}>
      {!isSent && (
        <div className="message-avatar">
          {message?.avatar || message?.initial || '👤'}
        </div>
      )}
      <div>
        <div className={`message-bubble ${isSent ? 'sent' : 'received'} ${translated ? 'translated' : ''}`}>
          {showOriginal && originalText ? (
            <div>
              <div style={{ opacity: 0.7, fontSize: '12px', marginBottom: '6px' }}>
                {originalLanguage ? `[Original en ${originalLanguage}]` : '[Original]'}
              </div>
              <div>{originalText}</div>
            </div>
          ) : (
            message
          )}
        </div>
        {originalText && !showOriginal && (
          <button
            className="view-original-btn"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            Ver original
          </button>
        )}
        {translated && !originalText && (
          <div className="translated-badge">Traducido</div>
        )}
        <div className="message-meta">
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  )
}
