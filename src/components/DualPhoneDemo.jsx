import React, { useState } from 'react'

export default function DualPhoneDemo() {
  const [messagesRoberto, setMessagesRoberto] = useState([
    { text: '¡Hola Anna! Soy Roberto de México.', sender: 'sent', timestamp: '09:41' },
    { text: 'Привет, Анна! Я Роберто из Мексики!', sender: 'received', timestamp: '09:42', name: 'Anna' }
  ])

  const [messagesAnna, setMessagesAnna] = useState([
    { text: 'Привет, Роберто! Я Анна из России!', sender: 'sent', timestamp: '09:42' },
    { text: '¡Hola, Roberto! ¡Yo soy Anna de Rusia!', sender: 'received', timestamp: '09:42', name: 'Roberto' }
  ])

  const [inputRoberto, setInputRoberto] = useState('')
  const [inputAnna, setInputAnna] = useState('')

  const addMessageRoberto = () => {
    if (!inputRoberto.trim()) return

    const autoResponses = {
      es: [
        'Спасибо! Это здорово!',
        'Как интересно!',
        'Я согласна!',
        'Отлично!'
      ],
      ru: [
        '¡Qué bueno!',
        '¡Me encanta!',
        '¡De acuerdo!',
        '¡Perfecto!'
      ]
    }

    setMessagesRoberto([
      ...messagesRoberto,
      { text: inputRoberto, sender: 'sent', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }
    ])

    setMessagesAnna([
      ...messagesAnna,
      { text: inputRoberto + ' [traducido al ruso]', sender: 'received', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), name: 'Roberto' }
    ])

    setInputRoberto('')

    setTimeout(() => {
      const response = autoResponses.ru[Math.floor(Math.random() * autoResponses.ru.length)]
      setMessagesAnna(prev => [...prev, { text: response, sender: 'sent', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }])
      setMessagesRoberto(prev => [...prev, { text: response + ' [traducido al español]', sender: 'received', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), name: 'Anna' }])
    }, 800)
  }

  const addMessageAnna = () => {
    if (!inputAnna.trim()) return

    setMessagesAnna([
      ...messagesAnna,
      { text: inputAnna, sender: 'sent', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }
    ])

    setMessagesRoberto([
      ...messagesRoberto,
      { text: inputAnna + ' [traducido al español]', sender: 'received', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), name: 'Anna' }
    ])

    setInputAnna('')
  }

  const Phone = ({ title, color, messages, input, setInput, onSend }) => (
    <div style={{
      background: 'var(--surface-1)',
      borderRadius: '24px',
      border: '0.5px solid var(--border)',
      overflow: 'hidden',
      boxShadow: '0 0 0 8px var(--surface-0)',
      display: 'flex',
      flexDirection: 'column',
      height: '520px',
      minWidth: 0
    }}>
      {/* Status Bar */}
      <div style={{
        background: color,
        color: 'white',
        padding: '8px 16px',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 500
      }}>
        <span>{title}</span>
        <span>09:45</span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'var(--surface-0)'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.sender === 'sent' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              background: msg.sender === 'sent' ? color : 'var(--surface-1)',
              color: msg.sender === 'sent' ? 'white' : 'var(--text-primary)',
              borderRadius: msg.sender === 'sent' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
              padding: '10px 14px',
              maxWidth: '70%',
              wordWrap: 'break-word',
              fontSize: '14px',
              border: msg.sender === 'sent' ? 'none' : '0.5px solid var(--border)'
            }}>
              {msg.name && <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', opacity: 0.7 }}>{msg.name}</div>}
              <div>{msg.text}</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.6 }}>{msg.timestamp}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px',
        borderTop: '0.5px solid var(--border)',
        display: 'flex',
        gap: '8px',
        background: 'var(--surface-0)'
      }}>
        <input
          type="text"
          placeholder="Escribe aquí..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          style={{
            flex: 1,
            border: '0.5px solid var(--border)',
            borderRadius: '20px',
            padding: '10px 14px',
            fontSize: '13px',
            outline: 'none',
            background: 'var(--surface-2)',
            color: 'var(--text-primary)',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={onSend}
          style={{
            background: color,
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0
          }}
        >
          →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '1.5rem', background: 'var(--surface-0)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
          LinkGol — Traducción Invisible
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Escribe en cualquier teléfono y ve la traducción en tiempo real
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          flex: 1
        }}>
          <Phone
            title="Roberto 🇪🇸"
            color="#0052CC"
            messages={messagesRoberto}
            input={inputRoberto}
            setInput={setInputRoberto}
            onSend={addMessageRoberto}
          />
          <Phone
            title="Anna 🇷🇺"
            color="#0F6E56"
            messages={messagesAnna}
            input={inputAnna}
            setInput={setInputAnna}
            onSend={addMessageAnna}
          />
        </div>

      </div>
    </div>
  )
}
