import { createApp, createStore } from '../src/app.js'
import { createMockBillingProvider, createStripeBillingProvider } from '../src/providers/billingProvider.js'

const store = globalThis.__saasBillingStore || (globalThis.__saasBillingStore = createStore())

const billingProvider = process.env.STRIPE_SECRET_KEY
  ? createStripeBillingProvider({
      secretKey: process.env.STRIPE_SECRET_KEY,
      successUrl: process.env.STRIPE_SUCCESS_URL,
      cancelUrl: process.env.STRIPE_CANCEL_URL,
    })
  : createMockBillingProvider()

const app = createApp(store, { billingProvider })

export default app
