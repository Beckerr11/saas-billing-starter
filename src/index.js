import http from 'node:http'
import { createApp, createStore } from './app.js'
import { createMockBillingProvider, createStripeBillingProvider } from './providers/billingProvider.js'

const port = Number(process.env.PORT || 3000)
const store = createStore()
const billingProvider = process.env.STRIPE_SECRET_KEY
  ? createStripeBillingProvider({
      secretKey: process.env.STRIPE_SECRET_KEY,
      successUrl: process.env.STRIPE_SUCCESS_URL,
      cancelUrl: process.env.STRIPE_CANCEL_URL,
    })
  : createMockBillingProvider()

const app = createApp(store, { billingProvider })

http.createServer(app).listen(port, () => {
  console.log(`saas-billing-starter running on port ${port}`)
})
