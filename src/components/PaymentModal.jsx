import React, { useState } from 'react'
import { createCheckoutSession } from '../services/stripe'

export default function PaymentModal({ userId, onClose, onUpgrade }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      await createCheckoutSession(userId, 'monthly')
      onUpgrade()
    } catch (err) {
      setError(err.message || 'Payment error')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
        
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
          Se acabaron tus mensajes
        </h2>

        <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '24px', lineHeight: 1.6 }}>
          Has alcanzado el límite de 10 mensajes gratuitos. Upgrade a Premium para mensajes ilimitados.
        </p>

        <div style={{
          background: 'var(--cream)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--fill-accent)', marginBottom: '4px' }}>
            $20 USD/mes
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>
            ✅ Mensajes ilimitados
            <br />
            ✅ 100 minutos de audio
            <br />
            ✅ Invitaciones ilimitadas
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? 'rgba(0,82,204,0.5)' : 'var(--fill-accent)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '12px'
          }}
        >
          {loading ? 'Procesando...' : 'Upgrade a Premium'}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: 'var(--text2)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
