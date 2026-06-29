// Credit system for LinkN.click
// FREE TIER: 10 messages, 0 audio minutes
// PAID TIER: Unlimited messages, 100 audio minutes/month

const CREDITS = {
  MESSAGE_COST: 1,
  AUDIO_MINUTE_COST: 5,
  FREE_TIER_MESSAGES: 10,
  FREE_TIER_AUDIO: 0
}

export const getUserCredits = async (userId) => {
  try {
    const response = await fetch(`/api/v2/users/${userId}/credits`)
    if (!response.ok) throw new Error('Failed to fetch credits')
    return await response.json()
  } catch (err) {
    console.error('Error fetching credits:', err)
    throw err
  }
}

export const deductCredits = async (userId, amount, type = 'message') => {
  try {
    const response = await fetch(`/api/v2/users/${userId}/credits/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type })
    })
    if (!response.ok) throw new Error('Insufficient credits')
    return await response.json()
  } catch (err) {
    console.error('Error deducting credits:', err)
    throw err
  }
}

export const canSendMessage = (credits) => {
  return credits.balance >= CREDITS.MESSAGE_COST
}

export const canSendAudio = (credits, durationSeconds) => {
  const cost = Math.ceil(durationSeconds / 60) * CREDITS.AUDIO_MINUTE_COST
  return credits.balance >= cost
}

export const getCreditsRequired = (type = 'message') => {
  return type === 'audio' ? CREDITS.AUDIO_MINUTE_COST : CREDITS.MESSAGE_COST
}

export const CREDITS as default
