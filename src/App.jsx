import { useState, useRef, useEffect } from 'react'
import ChatHeader from './components/ChatHeader'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import TypingIndicator from './components/TypingIndicator'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy Roberto de México.',
      sender: 'received',
      userName: 'Roberto · México',
      userAvatar: '👨',
      timestamp: '09:41',
      translated: false,
      read: true
    },
    {
      id: 2,
      text: 'Hi! I\'m Anna from Russia. Nice to meet you!',
      sender: 'self',
      timestamp: '09:42',
      read: true
    },
    {
      id: 3,
      text: 'Спасибо! Приятно познакомиться. Как дела?',
      sender: 'received',
      userName: 'Roberto · México',
      userAvatar: '👨',
      timestamp: '09:43',
      translated: true,
      originalLanguage: 'Español',
      originalText: '¡Gracias! Encantado de conocerte. ¿Cómo estás?',
      read: true
    }
  ])
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (text) => {
    const newMessage = {
      id: messages.length + 1,
      text,
      sender: 'self',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([...messages, newMessage])

    // Simular respuesta traducida
    setTyping(true)
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        text: 'Привет! Спасибо за сообщение. Это перевод на русский.',
        sender: 'received',
        avatar: '🇷🇺',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        translated: true,
        originalLanguage: 'Ruso',
        originalText: 'Привет! Спасибо за сообщение. Это перевод на русский.'
      }
      setMessages(prev => [...prev, response])
      setTyping(false)
    }, 2000)
  }

  return (
    <div className="chat-container">
      <ChatHeader user={{ name: 'Anna · Rusia', initial: '🇷🇺', avatar: '👩' }} status="online" />

      <div className="chat-messages">
        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            message={msg.text}
            sender={msg.sender}
            timestamp={msg.timestamp}
            userName={msg.userName}
            userAvatar={msg.userAvatar}
            translated={msg.translated}
            originalLanguage={msg.originalLanguage}
            originalText={msg.originalText}
            read={msg.read}
          />
        ))}
        {typing && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={typing} />
    </div>
  )
}

export default App
