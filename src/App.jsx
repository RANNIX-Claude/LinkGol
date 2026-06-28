import { useState, useRef, useEffect } from 'react'
import ChatHeader from './components/ChatHeader'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import ContactList from './components/ContactList'
import TypingIndicator from './components/TypingIndicator'
import InviteDialog from './components/InviteDialog'
import DualPhoneDemo from './components/DualPhoneDemo'
import * as API from './services/api'
import './App.css'
import './styles/layout.css'

function App() {
  const [showDemo, setShowDemo] = useState(false)
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
  // API LOADING STATE
  // ═══════════════════════════════════════════════════════════
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // ═══════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════

  // Load conversations & contacts on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // En producción: usar APIs reales
        // const convResponse = await API.getConversations(hostProfile.id)
        // const contactResponse = await API.getContacts(hostProfile.id)
        // setConversations(convResponse.conversations || [])
        // setContacts(contactResponse.contacts || [])

        // Por ahora: usar datos simulados (ya están en state)
        console.log('✅ Datos simulados cargados')
      } catch (err) {
        setError(err.message)
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [hostProfile.id])

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    const newMessage = {
      id: Date.now(),
      text,
      sender: 'self',
      timestamp: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      translated: false,
      read: true
    }

    // Optimistic update
    setConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === activeConversation
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    )

    // En producción: POST /api/v2/messages
    try {
      // const apiResponse = await API.sendMessage(
      //   activeConversation,
      //   hostProfile.id,
      //   hostProfile.nombre,
      //   text,
      //   hostProfile.idioma_default
      // )
      // console.log('✅ Mensaje enviado:', apiResponse)

      // Por ahora: simular respuesta
      setTyping(true)
      setTimeout(() => {
        const guestLanguages = {
          'conv-1': { idioma: 'ru', nombre: 'Anna' },
          'conv-2': { idioma: 'de', nombre: 'Carlos' }
        }

        const guestInfo = guestLanguages[activeConversation]
        if (!guestInfo) {
          setTyping(false)
          return
        }

        const responses = {
          ru: ['Спасибо! 👍', 'Согласен!', 'Отлично!', 'Понятно!'],
          de: ['Danke! 👍', 'Einverstanden!', 'Perfekt!', 'Klar!']
        }

        const translations = responses[guestInfo.idioma] || responses.ru
        const randomResponse = translations[Math.floor(Math.random() * translations.length)]

        const response = {
          id: Date.now() + 1,
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
          originalText: randomResponse,
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
    } catch (err) {
      setError(err.message)
      console.error('Error sending message:', err)
      setTyping(false)
    }
  }

  const handleInviteContact = async (contactEmail, contactName) => {
    try {
      setIsLoading(true)

      // En producción: usar API real
      // const response = await API.createConversation(
      //   hostProfile.id,
      //   contactEmail,
      //   contactName,
      //   hostProfile.idioma_default
      // )
      // console.log('✅ Conversación creada:', response)

      // Por ahora: crear localmente
      const newConversation = {
        id: `conv-${Date.now()}`,
        guest_name: contactName,
        guest_email: contactEmail,
        guest_photo: contactName.charAt(0) === 'A' ? '👩' : '👨',
        host_idioma: hostProfile.idioma_default,
        guest_idioma: null,
        qr_code: `QR_${Date.now()}`,
        lastMessage: 'Sin mensajes',
        timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        messages: [
          {
            id: 1,
            text: `¡Hola ${contactName}! Bienvenido a LinkGol.`,
            sender: 'self',
            timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            translated: false,
            read: true
          }
        ]
      }

      setConversations(prev => [...prev, newConversation])
      setShowInviteDialog(false)
      console.log(`✅ Invitación enviada a ${contactName}`)
    } catch (err) {
      setError(err.message)
      console.error('Error inviting contact:', err)
    } finally {
      setIsLoading(false)
    }
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

  if (showDemo) {
    return (
      <div>
        <DualPhoneDemo />
        <button
          onClick={() => setShowDemo(false)}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            background: 'var(--fill-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 999
          }}
          title="Volver a la app"
        >
          ←
        </button>
      </div>
    )
  }

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

      {/* Demo Button */}
      <button
        onClick={() => setShowDemo(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'var(--fill-accent)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 999
        }}
        title="Ver demo de dos teléfonos"
      >
        📱
      </button>
    </div>
  )
}

export default App
