// Stripe payment integration for LinkN.click

const STRIPE_PUBLIC_KEY = process.env.VITE_STRIPE_PUBLIC_KEY

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
    const stripe = await loadStripe(STRIPE_PUBLIC_KEY)
    await stripe.redirectToCheckout({ sessionId })
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

// Load Stripe.js
const stripePromise = typeof window !== 'undefined' 
  ? import('@stripe/stripe-js').then(m => m.loadStripe(STRIPE_PUBLIC_KEY))
  : Promise.resolve(null)

export const loadStripe = async () => {
  return await stripePromise
}
