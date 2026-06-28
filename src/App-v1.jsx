import { useState, useRef, useEffect } from 'react'
import ChatHeader from './components/ChatHeader'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import ChatList from './components/ChatList'
import TypingIndicator from './components/TypingIndicator'
import './App.css'
import './styles/layout.css'

function App() {
  const [activeChat, setActiveChat] = useState('anna-rusia')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const [chats, setChats] = useState([
    {
      id: 'anna-rusia',
      name: 'Anna · Rusia',
      avatar: '👩',
      lastMessage: '¿Cómo estás?',
      timestamp: '09:43',
      unread: 0,
      messages: [
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
          text: 'Спасибо! Приятно познакомиться. Как дelas?',
          sender: 'received',
          userName: 'Roberto · México',
          userAvatar: '👨',
          timestamp: '09:43',
          translated: true,
          originalLanguage: 'Español',
          originalText: '¡Gracias! Encantado de conocerte. ¿Cómo estás?',
          read: true
        }
      ]
    },
    {
      id: 'carlos-alemania',
      name: 'Carlos · Alemania',
      avatar: '👨',
      lastMessage: 'Perfecto, nos vemos mañana',
      timestamp: '08:15',
      unread: 2,
      messages: [
        {
          id: 1,
          text: 'Hola Carlos, ¿qué tal?',
          sender: 'self',
          timestamp: '08:10',
          read: true
        },
        {
          id: 2,
          text: 'Alles gut! Bin gerade unterwegs.',
          sender: 'received',
          userName: 'Carlos · Alemania',
          userAvatar: '👨',
          timestamp: '08:15',
          translated: true,
          originalLanguage: 'Alemán',
          originalText: '¡Todo bien! Estoy en el camino.',
          read: false
        }
      ]
    },
    {
      id: 'maria-japon',
      name: 'Maria · Japón',
      avatar: '👩',
      lastMessage: 'ありがとうございます！',
      timestamp: '07:30',
      unread: 0,
      messages: [
        {
          id: 1,
          text: 'Hola María, ¿cómo va todo?',
          sender: 'self',
          timestamp: '07:25',
          read: true
        },
        {
          id: 2,
          text: 'ありがとうございます！お疲れさまです。',
          sender: 'received',
          userName: 'Maria · Japón',
          userAvatar: '👩',
          timestamp: '07:30',
          translated: true,
          originalLanguage: 'Japonés',
          originalText: '¡Muchas gracias! Buen trabajo.',
          read: true
        }
      ]
    }
  ])

  const currentChat = chats.find(c => c.id === activeChat)
  const messages = currentChat?.messages || []

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
    <div className="linkgol-main">
      {/* Sidebar con lista de chats */}
      <ChatList
        chats={chats}
        activeChat={activeChat}
        onSelectChat={setActiveChat}
      />

      {/* Chat Area */}
      <div className="linkgol-chat-area">
        <ChatHeader
          user={{
            name: currentChat?.name,
            initial: currentChat?.avatar,
            avatar: currentChat?.avatar
          }}
          status="online"
        />

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
    </div>
  )
}

export default App
