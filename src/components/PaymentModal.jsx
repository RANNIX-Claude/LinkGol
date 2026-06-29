import React, { useState } from 'react'
import { createCheckoutSession, STRIPE_PLANS } from '../services/stripe'

export default function PaymentModal({ userId, onClose, onUpgrade }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('PRO')

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      await createCheckoutSession(userId, selectedPlan)
      onUpgrade()
    } catch (err) {
      setError(err.message || 'Error en el pago')
      setLoading(false)
    }
  }

  const plan = STRIPE_PLANS[selectedPlan]

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
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '550px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>

        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
          Se acabaron tus mensajes
        </h2>

        <p style={{ fontSize: '14px', color: 'var(--text2)', marginBottom: '32px', lineHeight: 1.6 }}>
          Has alcanzado el límite de mensajes gratuitos. Elige un plan para continuar conectando.
        </p>

        {/* Plan Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {Object.entries(STRIPE_PLANS).map(([key, planData]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              style={{
                background: selectedPlan === key ? 'var(--fill-accent)' : 'var(--cream)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                border: selectedPlan === key ? '2px solid var(--fill-accent)' : '1px solid rgba(0,0,0,0.1)',
                color: selectedPlan === key ? 'white' : 'var(--text)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedPlan !== key) {
                  e.currentTarget.style.background = 'rgba(0,82,204,0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPlan !== key) {
                  e.currentTarget.style.background = 'var(--cream)'
                }
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                ${planData.price}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '12px' }}>
                {planData.period}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.7, lineHeight: 1.5 }}>
                {planData.features.join(' • ')}
              </div>
            </div>
          ))}
        </div>

        {/* Plan Details */}
        <div style={{
          background: selectedPlan === 'PRO' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            {plan.name}
          </div>
          <ul style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, paddingLeft: '20px', lineHeight: 1.8 }}>
            {plan.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
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
          {loading ? 'Procesando...' : `Actualizar a ${plan.name}`}
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
