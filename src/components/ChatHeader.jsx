import React from 'react'

export default function ChatHeader({ user, status = 'online' }) {
  return (
    <header className="chat-header">
      <div className="header-avatar">
        {user?.avatar || user?.initial || '👤'}
      </div>
      <div className="header-info">
        <div className="header-name">{user?.name || 'Usuario'}</div>
        <div className="header-status">
          {status === 'online' && <div className="status-dot"></div>}
          <span>{status === 'online' ? 'En línea' : 'Offline'}</span>
        </div>
      </div>
    </header>
  )
}
