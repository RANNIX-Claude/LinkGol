import React, { useState } from 'react'

export default function DualPhoneDemo() {
  const scenarios = {
    es_ru: {
      name: 'Roberto 🇪🇸 ↔ Anna 🇷🇺',
      person1: { name: 'Roberto', lang: 'es', flag: '🇪🇸', color: '#0052CC' },
      person2: { name: 'Anna', lang: 'ru', flag: '🇷🇺', color: '#0F6E56' },
      initial1: [
        { text: '¡Hola Anna! Soy Roberto de México.', sender: 'sent', timestamp: '09:41' },
        { text: 'Привет, Роберто! Я Анна из России!', sender: 'received', timestamp: '09:42', name: 'Anna' }
      ],
      initial2: [
        { text: 'Привет, Роберто! Я Анна из России!', sender: 'sent', timestamp: '09:42' },
        { text: '¡Hola, Anna! ¡Yo soy Roberto de México!', sender: 'received', timestamp: '09:42', name: 'Roberto' }
      ]
    },
    en_de: {
      name: 'John 🇺🇸 ↔ Klaus 🇩🇪',
      person1: { name: 'John', lang: 'en', flag: '🇺🇸', color: '#0052CC' },
      person2: { name: 'Klaus', lang: 'de', flag: '🇩🇪', color: '#0F6E56' },
      initial1: [
        { text: 'Hi Klaus! I am John from USA.', sender: 'sent', timestamp: '10:15' },
        { text: 'Hallo John! Ich bin Klaus aus Deutschland.', sender: 'received', timestamp: '10:16', name: 'Klaus' }
      ],
      initial2: [
        { text: 'Hallo John! Ich bin Klaus aus Deutschland.', sender: 'sent', timestamp: '10:16' },
        { text: 'Hi Klaus! I am John from the USA!', sender: 'received', timestamp: '10:16', name: 'John' }
      ]
    },
    fr_zh: {
      name: 'Marie 🇫🇷 ↔ Wei 🇨🇳',
      person1: { name: 'Marie', lang: 'fr', flag: '🇫🇷', color: '#0052CC' },
      person2: { name: 'Wei', lang: 'zh', flag: '🇨🇳', color: '#0F6E56' },
      initial1: [
        { text: 'Bonjour Wei! Je suis Marie de France.', sender: 'sent', timestamp: '14:22' },
        { text: '你好，玛丽！我叫韦，来自中国。', sender: 'received', timestamp: '14:23', name: 'Wei' }
      ],
      initial2: [
        { text: '你好，玛丽！我叫韦，来自中国。', sender: 'sent', timestamp: '14:23' },
        { text: 'Bonjour Wei! Je suis Marie de France!', sender: 'received', timestamp: '14:23', name: 'Marie' }
      ]
    },
    pt_it: {
      name: 'Carlos 🇧🇷 ↔ Marco 🇮🇹',
      person1: { name: 'Carlos', lang: 'pt', flag: '🇧🇷', color: '#0052CC' },
      person2: { name: 'Marco', lang: 'it', flag: '🇮🇹', color: '#0F6E56' },
      initial1: [
        { text: 'Olá Marco! Sou Carlos do Brasil.', sender: 'sent', timestamp: '16:30' },
        { text: 'Ciao Carlos! Sono Marco dall\'Italia.', sender: 'received', timestamp: '16:31', name: 'Marco' }
      ],
      initial2: [
        { text: 'Ciao Carlos! Sono Marco dall\'Italia.', sender: 'sent', timestamp: '16:31' },
        { text: 'Olá Marco! Sou Carlos do Brasil!', sender: 'received', timestamp: '16:31', name: 'Carlos' }
      ]
    }
  }

  const [activeScenario, setActiveScenario] = useState('es_ru')
  const scenario = scenarios[activeScenario]

  const [messages1, setMessages1] = useState(scenario.initial1)
  const [messages2, setMessages2] = useState(scenario.initial2)
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')

  const changeScenario = (key) => {
    setActiveScenario(key)
    const newScenario = scenarios[key]
    setMessages1(newScenario.initial1)
    setMessages2(newScenario.initial2)
    setInput1('')
    setInput2('')
  }

  const addMessage1 = () => {
    if (!input1.trim()) return
    setMessages1([...messages1, { text: input1, sender: 'sent', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }])
    setMessages2([...messages2, { text: input1 + ' [traducido]', sender: 'received', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), name: scenario.person1.name }])
    setInput1('')
  }

  const addMessage2 = () => {
    if (!input2.trim()) return
    setMessages2([...messages2, { text: input2, sender: 'sent', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) }])
    setMessages1([...messages1, { text: input2 + ' [traducido]', sender: 'received', timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }), name: scenario.person2.name }])
    setInput2('')
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
      height: '500px',
      minWidth: 0
    }}>
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
          <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'sent' ? 'flex-end' : 'flex-start' }}>
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
        {/* Scenario Selector */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', alignSelf: 'center' }}>Demo:</span>
          {Object.entries(scenarios).map(([key, s]) => (
            <button
              key={key}
              onClick={() => changeScenario(key)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                border: activeScenario === key ? '2px solid var(--fill-accent)' : '0.5px solid var(--border)',
                background: activeScenario === key ? 'var(--bg-accent)' : 'var(--surface-1)',
                color: activeScenario === key ? 'var(--text-accent)' : 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: activeScenario === key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Phones */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          flex: 1
        }}>
          <Phone
            title={`${scenario.person1.name} ${scenario.person1.flag}`}
            color={scenario.person1.color}
            messages={messages1}
            input={input1}
            setInput={setInput1}
            onSend={addMessage1}
          />
          <Phone
            title={`${scenario.person2.name} ${scenario.person2.flag}`}
            color={scenario.person2.color}
            messages={messages2}
            input={input2}
            setInput={setInput2}
            onSend={addMessage2}
          />
        </div>
      </div>
    </div>
  )
}
