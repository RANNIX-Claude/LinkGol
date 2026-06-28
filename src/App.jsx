import { useState, useRef, useEffect } from 'react'
import ChatHeader from './components/ChatHeader'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import ContactList from './components/ContactList'
import TypingIndicator from './components/TypingIndicator'
import InviteDialog from './components/InviteDialog'
import './App.css'
import './styles/layout.css'

function App() {
  // ═══════════════════════════════════════════════════════════
  // HOST STATE
  // ═══════════════════════════════════════════════════════════
  const [hostProfile, setHostProfile] = useState({
    id: '550e8400-e29b-41d4-a716-446655440001',
    nombre: 'Roberto',
    email: 'roberto@mexico.mx',
    idioma_default: 'es',  // HOST IDIOMA (FIJO)
    avatar: '👨'
  })

  // ═══════════════════════════════════════════════════════════
  // CONVERSATIONS & CONTACTS
  // ═══════════════════════════════════════════════════════════
  const [contacts, setContacts] = useState([
    {
      id: 'contact-1',
      contact_name: 'Anna Volkov',
      contact_email: 'anna@russia.ru',
      contact_photo: '👩',
      contact_phone: '+7 999 123-45-67'
    },
    {
      id: 'contact-2',
      contact_name: 'Carlos Mueller',
      contact_email: 'carlos@alemania.de',
      contact_photo: '👨',
      contact_phone: '+49 30 1234567'
    },
    {
      id: 'contact-3',
      contact_name: 'Maria Tanaka',
      contact_email: 'maria@japon.jp',
      contact_photo: '👩',
      contact_phone: '+81 90 1234-5678'
    }
  ])

  const [conversations, setConversations] = useState([
    {
      id: 'conv-1',
      guest_name: 'Anna',
      guest_email: 'anna@russia.ru',
      guest_photo: '👩',
      host_idioma: 'es',
      guest_idioma: 'ru',
      qr_code: 'QR_001',
      lastMessage: '¿Cómo estás?',
      timestamp: '09:43',
      messages: [
        {
          id: 1,
          text: '¡Hola Anna! Soy Roberto de México.',
          sender: 'self',
          userName: 'Roberto',
          userAvatar: '👨',
          timestamp: '09:41',
          translated: false,
          read: true
        },
        {
          id: 2,
          text: 'Привет, Роберто! Я Анна из России!',
          sender: 'received',
          userName: 'Anna',
          userAvatar: '👩',
          timestamp: '09:42',
          translated: true,
          originalLanguage: 'Ruso',
          originalText: '¡Hola, Roberto! ¡Yo soy Anna de Rusia!',
          read: true
        },
        {
          id: 3,
          text: '¡Encantado de conocerte! ¿Cómo estás?',
          sender: 'self',
          timestamp: '09:43',
          translated: false,
          read: true
        },
        {
          id: 4,
          text: 'Очень хорошо, спасибо! Как дела у тебя?',
          sender: 'received',
          userName: 'Anna',
          userAvatar: '👩',
          timestamp: '09:44',
          translated: true,
          originalLanguage: 'Ruso',
          originalText: '¡Muy bien, gracias! ¿Y tú qué tal?',
          read: true
        }
      ]
    },
    {
      id: 'conv-2',
      guest_name: 'Carlos',
      guest_email: 'carlos@alemania.de',
      guest_photo: '👨',
      host_idioma: 'es',
      guest_idioma: 'de',
      qr_code: 'QR_002',
      lastMessage: 'Perfecto, nos vemos mañana',
      timestamp: '08:15',
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
          text: 'Mir geht es gut! Wir sehen uns morgen.',
          sender: 'received',
          userName: 'Carlos',
          userAvatar: '👨',
          timestamp: '08:15',
          translated: true,
          originalLanguage: 'Alemán',
          originalText: '¡Me va bien! Nos vemos mañana.',
          read: false
        }
      ]
    }
  ])

  // ═══════════════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════════════
  const [activeConversation, setActiveConversation] = useState('conv-1')
  const [typing, setTyping] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

  const currentConversation = conversations.find(c => c.id === activeConversation)
  const messages = currentConversation?.messages || []

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (text) => {
    if (!text.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text,
      sender: 'self',
      timestamp: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      translated: false,
      read: true
    }

    // Actualizar messages
    setConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === activeConversation
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    )

    // Simular respuesta traducida
    setTyping(true)
    setTimeout(() => {
      const guestLanguages = {
        'conv-1': { idioma: 'ru', nombre: 'Anna' },
        'conv-2': { idioma: 'de', nombre: 'Carlos' }
      }

      const guestInfo = guestLanguages[activeConversation]
      if (!guestInfo) return

      const responses = {
        ru: {
          'thanks': 'Спасибо за сообщение!',
          'hi': 'Привет! Как дела?',
          'bye': 'До свидания!',
          'default': 'Я согласен! 👍'
        },
        de: {
          'thanks': 'Danke für die Nachricht!',
          'hi': 'Hallo! Wie geht es dir?',
          'bye': 'Auf Wiedersehen!',
          'default': 'Ich stimme zu! 👍'
        }
      }

      const translations = responses[guestInfo.idioma] || responses.ru
      const randomResponse = Object.values(translations)[
        Math.floor(Math.random() * Object.values(translations).length - 1)
      ]

      const response = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'received',
        userName: guestInfo.nombre,
        userAvatar:
          activeConversation === 'conv-1'
            ? '👩'
            : activeConversation === 'conv-2'
              ? '👨'
              : '👤',
        timestamp: new Date().toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        translated: true,
        originalLanguage: guestInfo.idioma === 'ru' ? 'Ruso' : 'Alemán',
        originalText: randomResponse + ' (Original)',
        read: true
      }

      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === activeConversation
            ? { ...conv, messages: [...conv.messages, response] }
            : conv
        )
      )

      setTyping(false)
    }, 1500)
  }

  const handleInviteContact = (contactEmail, contactName) => {
    console.log(`Invitando a ${contactName} (${contactEmail})`)
    // En producción: POST /api/v2/conversations
    setShowInviteDialog(false)
  }

  const handleChangeHostLanguage = (newLanguage) => {
    setHostProfile(prev => ({ ...prev, idioma_default: newLanguage }))
  }

  const filteredContacts = contacts.filter(c =>
    c.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="linkgol-main">
      {/* Sidebar: Contacts */}
      <ContactList
        contacts={filteredContacts}
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onInvite={() => setShowInviteDialog(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        hostProfile={hostProfile}
        onChangeLanguage={handleChangeHostLanguage}
      />

      {/* Chat Area */}
      <div className="linkgol-chat-area">
        <ChatHeader
          user={{
            name: currentConversation?.guest_name || 'Chat',
            initial: currentConversation?.guest_photo || '👤',
            avatar: currentConversation?.guest_photo || '👤'
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

      {/* Invite Dialog */}
      {showInviteDialog && (
        <InviteDialog
          contacts={contacts}
          hostLanguage={hostProfile.idioma_default}
          onInvite={handleInviteContact}
          onClose={() => setShowInviteDialog(false)}
        />
      )}
    </div>
  )
}

export default App
