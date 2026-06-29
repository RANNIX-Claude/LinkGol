// Stripe payment integration for LinkN.click
import { loadStripe as stripeLoadFunction } from '@stripe/stripe-js'

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY

if (!STRIPE_PUBLIC_KEY) {
  console.warn('⚠️ VITE_STRIPE_PUBLIC_KEY not configured in Netlify environment')
}

// Load Stripe.js singleton
let stripePromise = null
const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLIC_KEY) {
    stripePromise = stripeLoadFunction(STRIPE_PUBLIC_KEY)
  }
  return stripePromise
}

export const createCheckoutSession = async (userId, plan = 'monthly') => {
  try {
    const response = await fetch('/api/v2/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan })
    })

    if (!response.ok) throw new Error('Failed to create checkout session')
    const { sessionId } = await response.json()

    // Redirect to Stripe Checkout
    const stripe = await getStripe()
    if (!stripe) throw new Error('Stripe not initialized')

    const { error } = await stripe.redirectToCheckout({ sessionId })
    if (error) throw error
  } catch (err) {
    console.error('Stripe error:', err)
    throw err
  }
}

export const getSubscription = async (userId) => {
  try {
    const response = await fetch(`/api/v2/users/${userId}/subscription`)
    if (!response.ok) throw new Error('Failed to fetch subscription')
    return await response.json()
  } catch (err) {
    console.error('Error fetching subscription:', err)
    throw err
  }
}

export const cancelSubscription = async (userId) => {
  try {
    const response = await fetch(`/api/v2/users/${userId}/subscription/cancel`, {
      method: 'POST'
    })
    if (!response.ok) throw new Error('Failed to cancel subscription')
    return await response.json()
  } catch (err) {
    console.error('Error canceling subscription:', err)
    throw err
  }
}
