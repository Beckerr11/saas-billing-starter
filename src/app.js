import { buildLandingHtml } from './ui/landing.js'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { createMockBillingProvider } from './providers/billingProvider.js'

const MAX_BODY_SIZE_BYTES = 1_000_000

const PLAN_CATALOG = [
  { id: 'starter', amountInCents: 4900, currency: 'BRL' },
  { id: 'growth', amountInCents: 12900, currency: 'BRL' },
  { id: 'scale', amountInCents: 29900, currency: 'BRL' },
]

export function createStore() {
  return {
    workspaces: [],
    checkoutSessions: [],
    subscriptions: [],
    processedWebhookEvents: new Set(),
  }
}

export function listPlans() {
  return PLAN_CATALOG.map((plan) => ({ ...plan }))
}

function findPlan(planId) {
  return PLAN_CATALOG.find((item) => item.id === planId)
}

export function signWebhookPayload(rawBody, webhookSecret) {
  return createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
}

export function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  if (!signature || !webhookSecret) {
    return false
  }

  const expected = signWebhookPayload(rawBody, webhookSecret)
  const left = Buffer.from(expected)
  const right = Buffer.from(String(signature))

  if (left.length !== right.length) {
    return false
  }

  return timingSafeEqual(left, right)
}

export function createWorkspace(store, { name, ownerEmail }) {
  if (!name || !ownerEmail) {
    throw new Error('name e ownerEmail sao obrigatorios')
  }

  const workspace = {
    id: randomUUID(),
    name: String(name).trim(),
    ownerEmail: String(ownerEmail).trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  }

  store.workspaces.push(workspace)
  return workspace
}

export function createCheckoutSession(store, { workspaceId, planId }) {
  const workspace = store.workspaces.find((item) => item.id === workspaceId)
  if (!workspace) {
    throw new Error('workspace nao encontrado')
  }

  const plan = findPlan(planId)
  if (!plan) {
    throw new Error('plano invalido')
  }

  const session = {
    id: randomUUID(),
    workspaceId,
    planId: plan.id,
    amountInCents: plan.amountInCents,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  store.checkoutSessions.push(session)

  return {
    sessionId: session.id,
    checkoutUrl: `https://checkout.example.com/session/${session.id}`,
    amountInCents: session.amountInCents,
    currency: plan.currency,
  }
}

export function processBillingWebhook(store, event) {
  const eventId = String(event.eventId || '').trim()
  if (!eventId) {
    throw new Error('eventId obrigatorio')
  }

  if (store.processedWebhookEvents.has(eventId)) {
    return { duplicate: true, eventId }
  }

  const session = store.checkoutSessions.find((item) => item.id === event.sessionId)
  if (!session) {
    throw new Error('sessao nao encontrada')
  }

  if (event.type === 'checkout.completed') {
    session.status = 'completed'

    const existing = store.subscriptions.find((item) => item.workspaceId === session.workspaceId && item.status === 'active')
    if (existing) {
      existing.status = 'canceled'
      existing.canceledAt = new Date().toISOString()
    }

    const subscription = {
      id: randomUUID(),
      workspaceId: session.workspaceId,
      planId: session.planId,
      status: 'active',
      startedAt: new Date().toISOString(),
    }

    store.subscriptions.push(subscription)
    store.processedWebhookEvents.add(eventId)

    return { duplicate: false, eventId, subscription }
  }

  if (event.type === 'subscription.canceled') {
    const active = store.subscriptions.find((item) => item.workspaceId === session.workspaceId && item.status === 'active')
    if (!active) {
      throw new Error('assinatura ativa nao encontrada')
    }

    active.status = 'canceled'
    active.canceledAt = new Date().toISOString()
    store.processedWebhookEvents.add(eventId)

    return { duplicate: false, eventId, subscription: active }
  }

  throw new Error('evento nao suportado')
}

export function createBillingPortalSession(store, { workspaceId }) {
  const active = store.subscriptions.find((item) => item.workspaceId === workspaceId && item.status === 'active')
  if (!active) {
    throw new Error('assinatura ativa nao encontrada para este workspace')
  }

  return {
    workspaceId,
    portalUrl: `https://billing.example.com/portal/${workspaceId}`,
    planId: active.planId,
  }
}

export function listSubscriptions(store) {
  return store.subscriptions.map((item) => ({ ...item }))
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json' })
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let totalSize = 0
    req.on('data', (chunk) => {
      totalSize += chunk.length
      if (totalSize > MAX_BODY_SIZE_BYTES) {
        reject(new Error('payload excede limite de 1MB'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      const raw = chunks.length ? Buffer.concat(chunks).toString('utf8') : ''
      resolve(raw)
    })
    req.on('error', reject)
  })
}

function parseJson(rawBody) {
  if (!rawBody) {
    return {}
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    throw new Error('JSON invalido')
  }
}

export function createApp(store = createStore(), options = {}) {
  const webhookSecret = options.webhookSecret || process.env.BILLING_WEBHOOK_SECRET || 'dev-webhook-secret'
  const billingProvider = options.billingProvider || createMockBillingProvider()

  return async function app(req, res) {
    const url = new URL(req.url || '/', 'http://localhost')

    try {
            if (req.method === 'GET' && url.pathname === '/') {
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
        res.end(buildLandingHtml())
        return
      }

      if (req.method === 'GET' && url.pathname === '/health') {
        sendJson(res, 200, { ok: true, service: 'saas-billing-starter' })
        return
      }

      if (req.method === 'GET' && url.pathname === '/plans') {
        sendJson(res, 200, { plans: listPlans() })
        return
      }

      if (req.method === 'POST' && url.pathname === '/workspaces') {
        const payload = parseJson(await readBody(req))
        const workspace = createWorkspace(store, payload)
        sendJson(res, 201, { workspace })
        return
      }

      if (req.method === 'POST' && url.pathname === '/billing/checkout') {
        const payload = parseJson(await readBody(req))
        const checkout = createCheckoutSession(store, payload)
        const providerSession = await billingProvider.createCheckoutSession({
          sessionId: checkout.sessionId,
          workspaceId: payload.workspaceId,
          planId: payload.planId,
          amountInCents: checkout.amountInCents,
          currency: checkout.currency,
        })
        sendJson(res, 201, {
          checkout: {
            ...checkout,
            provider: providerSession.provider,
            checkoutUrl: providerSession.checkoutUrl || checkout.checkoutUrl,
            externalSessionId: providerSession.externalSessionId || null,
          },
        })
        return
      }

      if (req.method === 'POST' && url.pathname === '/billing/portal') {
        const payload = parseJson(await readBody(req))
        const portal = createBillingPortalSession(store, payload)
        const providerPortal = await billingProvider.createBillingPortalSession({
          workspaceId: payload.workspaceId,
          planId: portal.planId,
        })
        sendJson(res, 200, {
          portal: {
            ...portal,
            provider: providerPortal.provider,
            portalUrl: providerPortal.portalUrl || portal.portalUrl,
          },
        })
        return
      }

      if (req.method === 'POST' && url.pathname === '/billing/webhook') {
        const rawBody = await readBody(req)
        const signature = req.headers['x-billing-signature']

        if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
          sendJson(res, 401, { error: 'assinatura de webhook invalida' })
          return
        }

        const payload = parseJson(rawBody)
        const result = processBillingWebhook(store, payload)
        sendJson(res, 200, { result })
        return
      }

      if (req.method === 'GET' && url.pathname === '/billing/subscriptions') {
        sendJson(res, 200, { subscriptions: listSubscriptions(store) })
        return
      }

      sendJson(res, 404, { error: 'rota nao encontrada' })
    } catch (error) {
      sendJson(res, 400, { error: error instanceof Error ? error.message : 'erro inesperado' })
    }
  }
}


