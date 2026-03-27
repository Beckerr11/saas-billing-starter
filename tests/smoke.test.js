import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createStore,
  createWorkspace,
  createCheckoutSession,
  createBillingPortalSession,
  processBillingWebhook,
  listSubscriptions,
  signWebhookPayload,
  verifyWebhookSignature,
} from '../src/app.js'
import { createMockBillingProvider } from '../src/providers/billingProvider.js'

test('billing flow creates active subscription after signed checkout webhook', () => {
  const store = createStore()
  const workspace = createWorkspace(store, { name: 'Acme', ownerEmail: 'owner@acme.com' })
  const checkout = createCheckoutSession(store, { workspaceId: workspace.id, planId: 'growth' })

  const payload = JSON.stringify({
    eventId: 'evt-1',
    type: 'checkout.completed',
    sessionId: checkout.sessionId,
  })
  const signature = signWebhookPayload(payload, 'test-secret')

  assert.equal(verifyWebhookSignature(payload, signature, 'test-secret'), true)

  processBillingWebhook(store, JSON.parse(payload))

  const subscriptions = listSubscriptions(store)
  assert.equal(subscriptions.length, 1)
  assert.equal(subscriptions[0].status, 'active')

  const portal = createBillingPortalSession(store, { workspaceId: workspace.id })
  assert.ok(portal.portalUrl.includes(workspace.id))
})

test('webhook is idempotent by event id', () => {
  const store = createStore()
  const workspace = createWorkspace(store, { name: 'Beta', ownerEmail: 'owner@beta.com' })
  const checkout = createCheckoutSession(store, { workspaceId: workspace.id, planId: 'starter' })

  const event = {
    eventId: 'evt-duplicate',
    type: 'checkout.completed',
    sessionId: checkout.sessionId,
  }

  const first = processBillingWebhook(store, event)
  const second = processBillingWebhook(store, event)

  assert.equal(first.duplicate, false)
  assert.equal(second.duplicate, true)
  assert.equal(listSubscriptions(store).length, 1)
})

test('mock billing provider exposes predictable URLs', async () => {
  const provider = createMockBillingProvider()
  const checkout = await provider.createCheckoutSession({ sessionId: 'sess-123' })
  const portal = await provider.createBillingPortalSession({ workspaceId: 'ws-1' })

  assert.ok(checkout.checkoutUrl.includes('sess-123'))
  assert.ok(portal.portalUrl.includes('ws-1'))
})
