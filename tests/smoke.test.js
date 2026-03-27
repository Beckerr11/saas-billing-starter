import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createStore,
  createWorkspace,
  createCheckoutSession,
  processBillingWebhook,
  listSubscriptions,
} from '../src/app.js'

test('billing flow creates active subscription after checkout completed', () => {
  const store = createStore()
  const workspace = createWorkspace(store, { name: 'Acme', ownerEmail: 'owner@acme.com' })
  const checkout = createCheckoutSession(store, { workspaceId: workspace.id, planId: 'growth' })

  processBillingWebhook(store, { type: 'checkout.completed', sessionId: checkout.sessionId })

  const subscriptions = listSubscriptions(store)
  assert.equal(subscriptions.length, 1)
  assert.equal(subscriptions[0].status, 'active')
  assert.equal(subscriptions[0].planId, 'growth')
})