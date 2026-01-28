import 'server-only'

import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not configured. Add it to your .env.local or Vercel environment variables.')
}

export const stripe = new Stripe(stripeSecretKey)
