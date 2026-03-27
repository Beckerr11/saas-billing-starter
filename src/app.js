import { randomUUID } from 'node:crypto'

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
  }
}

export function listPlans() {
  return PLAN_CATALOG.map((plan) => ({ ...plan }))
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

  const plan = PLAN_CATALOG.find((item) => item.id === planId)
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

export function processBillingWebhook(store, { type, sessionId }) {
  const session = store.checkoutSessions.find((item) => item.id === sessionId)
  if (!session) {
    throw new Error('sessao nao encontrada')
  }

  if (type === 'checkout.completed') {
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
    return subscription
  }

  if (type === 'subscription.canceled') {
    const active = store.subscriptions.find((item) => item.workspaceId === session.workspaceId && item.status === 'active')
    if (!active) {
      throw new Error('assinatura ativa nao encontrada')
    }
    active.status = 'canceled'
    active.canceledAt = new Date().toISOString()
    return active
  }

  throw new Error('evento nao suportado')
}

export function listSubscriptions(store) {
  return store.subscriptions.map((item) => ({ ...item }))
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json' })
  res.end(JSON.stringify(payload))
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (!chunks.length) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('JSON invalido'))
      }
    })
    req.on('error', reject)
  })
}

export function createApp(store = createStore()) {
  return async function app(req, res) {
    const url = new URL(req.url || '/', 'http://localhost')

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        sendJson(res, 200, { ok: true, service: 'saas-billing-starter' })
        return
      }

      if (req.method === 'GET' && url.pathname === '/plans') {
        sendJson(res, 200, { plans: listPlans() })
        return
      }

      if (req.method === 'POST' && url.pathname === '/workspaces') {
        const payload = await readJsonBody(req)
        const workspace = createWorkspace(store, payload)
        sendJson(res, 201, { workspace })
        return
      }

      if (req.method === 'POST' && url.pathname === '/billing/checkout') {
        const payload = await readJsonBody(req)
        const checkout = createCheckoutSession(store, payload)
        sendJson(res, 201, { checkout })
        return
      }

      if (req.method === 'POST' && url.pathname === '/billing/webhook') {
        const payload = await readJsonBody(req)
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