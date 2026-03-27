function formatFormPayload(input) {
  return Object.entries(input)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

export function createMockBillingProvider() {
  return {
    provider: 'mock',
    async createCheckoutSession({ sessionId }) {
      return {
        provider: 'mock',
        checkoutUrl: `https://checkout.example.com/session/${sessionId}`,
      }
    },
    async createBillingPortalSession({ workspaceId }) {
      return {
        provider: 'mock',
        portalUrl: `https://billing.example.com/portal/${workspaceId}`,
      }
    },
  }
}

export function createStripeBillingProvider(options = {}) {
  const secretKey = String(options.secretKey || '').trim()
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY nao configurada')
  }

  const successUrl = String(options.successUrl || 'https://example.com/success')
  const cancelUrl = String(options.cancelUrl || 'https://example.com/cancel')

  return {
    provider: 'stripe',
    async createCheckoutSession({ sessionId, amountInCents, currency = 'BRL' }) {
      const body = formatFormPayload({
        mode: 'payment',
        'line_items[0][quantity]': 1,
        'line_items[0][price_data][currency]': currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]': amountInCents,
        'line_items[0][price_data][product_data][name]': `Plano assinatura (${sessionId})`,
        success_url: `${successUrl}?session_id=${sessionId}`,
        cancel_url: cancelUrl,
      })

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${secretKey}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`falha stripe checkout: ${response.status} ${text}`)
      }

      const payload = await response.json()
      return {
        provider: 'stripe',
        checkoutUrl: payload.url,
        externalSessionId: payload.id,
      }
    },
    async createBillingPortalSession({ workspaceId }) {
      return {
        provider: 'stripe',
        portalUrl: `${successUrl.replace('/success', '')}/billing/portal/${workspaceId}`,
      }
    },
  }
}