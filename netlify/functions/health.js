exports.handler = async (event) => {
  console.log('Health check called')
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasStripe: !!process.env.STRIPE_SECRET_KEY,
        hasSupabase: !!process.env.SUPABASE_URL
      }
    })
  }
}
