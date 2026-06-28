import React from 'react'

export default function ChatList({ chats, activeChat, onSelectChat }) {
  return (
    <div style={{
      width: '360px',
      borderRight: '1px solid #e5e5ea',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#ffffff'
    }}>
      {/* Search Bar */}
      <div style={{ padding: '16px' }}>
        <input
          type="text"
          placeholder="Buscar conversación..."
          style={{
            width: '100%',
            border: '1px solid #e5e5ea',
            borderRadius: '20px',
            padding: '10px 16px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {chats.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              background: activeChat === chat.id ? '#f0f0f0' : 'transparent',
              transition: 'background 0.2s',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = activeChat === chat.id ? '#f0f0f0' : 'transparent'}
          >
            {/* Avatar */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#0052CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 600,
              flexShrink: 0
            }}>
              {chat.avatar}
            </div>

            {/* Chat Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a'
                }}>
                  {chat.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#999'
                }}>
                  {chat.timestamp}
                </div>
              </div>
              <div style={{
                fontSize: '13px',
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {chat.lastMessage}
              </div>
            </div>

            {/* Unread Badge */}
            {chat.unread > 0 && (
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
                {chat.unread}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
