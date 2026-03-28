const CONTENT = {
  brand: "SaaS Billing Starter",
  strap: "revenue engine",
  subtitle: "Base de cobranca para SaaS com catalogo de planos, checkout e webhooks seguros.",
  accent: "#9fb4ff",
  ctaPrimary: "Ver health",
  ctaSecondary: "API de billing",
  apiTitle: "Billing endpoints",
  featuresHtml: `<li><span>01</span><strong>Catalogo de planos e fluxo de checkout orientado a workspace.</strong></li><li><span>02</span><strong>Webhook assinado e idempotente para processamento financeiro robusto.</strong></li><li><span>03</span><strong>Portal de assinatura com provider mock e caminho pronto para Stripe.</strong></li>`,
  endpointsHtml: `<li><span class="method">GET</span><span class="path">/health</span></li><li><span class="method">GET</span><span class="path">/plans</span></li><li><span class="method">POST</span><span class="path">/workspaces</span></li><li><span class="method">POST</span><span class="path">/billing/checkout</span></li><li><span class="method">POST</span><span class="path">/billing/portal</span></li><li><span class="method">POST</span><span class="path">/billing/webhook</span></li><li><span class="method">GET</span><span class="path">/billing/subscriptions</span></li>`,
}

export function buildLandingHtml() {
  const now = new Date().toISOString()

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${CONTENT.brand}</title>
  <meta name="description" content="${CONTENT.subtitle}" />
  <style>
    :root {
      --bg: #070b16;
      --ink: #f6f8ff;
      --muted: #a9b3c7;
      --line: rgba(255,255,255,.16);
      --accent: ${CONTENT.accent};
      --max: 1120px;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: "Sora", "IBM Plex Sans", "Segoe UI", sans-serif;
      background: radial-gradient(1200px 700px at 85% -10%, rgba(255,255,255,.09), transparent 55%),
                  radial-gradient(800px 600px at 0% 15%, rgba(255,255,255,.06), transparent 60%),
                  var(--bg);
      color: var(--ink);
      line-height: 1.45;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .hero {
      min-height: 100svh;
      display: grid;
      align-content: end;
      padding: clamp(1.2rem, 2vw, 2rem);
      border-bottom: 1px solid var(--line);
      background:
        linear-gradient(130deg, rgba(0,0,0,.55), rgba(0,0,0,.18)),
        radial-gradient(1000px 700px at 80% 10%, color-mix(in srgb, var(--accent) 40%, transparent), transparent 65%),
        linear-gradient(160deg, #0d1428, #060910);
    }

    .hero-inner {
      max-width: var(--max);
      width: 100%;
      margin: 0 auto;
      display: grid;
      gap: 1rem;
      transform: translateY(14px);
      opacity: 0;
      animation: rise .8s cubic-bezier(.2,.8,.2,1) .1s forwards;
    }

    .kicker {
      text-transform: uppercase;
      letter-spacing: .17em;
      color: var(--accent);
      font-size: .74rem;
      font-weight: 600;
    }

    h1 {
      margin: 0;
      font-size: clamp(2.2rem, 8vw, 5rem);
      line-height: .95;
      letter-spacing: -.03em;
      max-width: 12ch;
    }

    .subtitle {
      margin: 0;
      color: var(--muted);
      font-size: clamp(1rem, 2.6vw, 1.26rem);
      max-width: 52ch;
    }

    .hero-actions {
      display: flex;
      gap: .75rem;
      flex-wrap: wrap;
      margin-top: .4rem;
    }

    .btn {
      border: 1px solid var(--line);
      color: var(--ink);
      text-decoration: none;
      padding: .78rem 1.05rem;
      font-weight: 600;
      font-size: .9rem;
      transition: transform .22s ease, background-color .22s ease, border-color .22s ease;
      backdrop-filter: blur(4px);
    }

    .btn:hover {
      transform: translateY(-2px);
      border-color: color-mix(in srgb, var(--accent) 70%, white 30%);
    }

    .btn.primary {
      background: color-mix(in srgb, var(--accent) 38%, transparent);
      border-color: color-mix(in srgb, var(--accent) 80%, white 20%);
    }

    .section {
      max-width: var(--max);
      margin: 0 auto;
      padding: clamp(1.3rem, 2.5vw, 2.6rem) clamp(1.2rem, 2vw, 2rem);
      border-bottom: 1px solid var(--line);
      opacity: 0;
      transform: translateY(18px);
      transition: opacity .55s ease, transform .55s ease;
    }

    .section.show {
      opacity: 1;
      transform: translateY(0);
    }

    .section-head {
      margin: 0 0 .8rem 0;
      font-size: clamp(1.15rem, 2.2vw, 1.8rem);
      letter-spacing: -.02em;
      max-width: 30ch;
    }

    .feature-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: .75rem;
    }

    .feature-list li {
      display: grid;
      grid-template-columns: 3ch 1fr;
      gap: .85rem;
      border-top: 1px solid var(--line);
      padding-top: .7rem;
      color: var(--muted);
    }

    .feature-list strong {
      color: var(--ink);
      font-weight: 600;
      letter-spacing: .02em;
    }

    .feature-list span {
      color: var(--accent);
      font-size: .75rem;
      text-transform: uppercase;
      letter-spacing: .12em;
      padding-top: .3rem;
    }

    .api-title {
      margin: 0 0 .75rem 0;
      color: var(--ink);
      font-size: .95rem;
      letter-spacing: .1em;
      text-transform: uppercase;
    }

    .endpoint-list {
      margin: 0;
      padding: 0;
      list-style: none;
      border-top: 1px solid var(--line);
    }

    .endpoint-list li {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: .7rem;
      align-items: baseline;
      border-bottom: 1px solid var(--line);
      padding: .72rem 0;
      transition: transform .2s ease, border-color .2s ease;
    }

    .endpoint-list li:hover {
      transform: translateX(5px);
      border-color: color-mix(in srgb, var(--accent) 55%, white 45%);
    }

    .method {
      display: inline-flex;
      min-width: 3.9rem;
      justify-content: center;
      font-size: .72rem;
      letter-spacing: .1em;
      font-weight: 700;
      padding: .28rem .42rem;
      border: 1px solid var(--line);
      color: var(--accent);
    }

    .path {
      color: #e6ecff;
      font-family: "IBM Plex Mono", "Consolas", monospace;
      font-size: .85rem;
      word-break: break-word;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 1rem;
      color: var(--muted);
      font-size: .8rem;
      border-top: 1px solid var(--line);
      padding-top: .8rem;
      flex-wrap: wrap;
    }

    @keyframes rise {
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 800px) {
      .hero { align-content: center; }
      .endpoint-list li { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="hero">
    <div class="hero-inner">
      <p class="kicker">${CONTENT.strap}</p>
      <h1>${CONTENT.brand}</h1>
      <p class="subtitle">${CONTENT.subtitle}</p>
      <div class="hero-actions">
        <a class="btn primary" href="/health">${CONTENT.ctaPrimary}</a>
        <a class="btn" href="#api">${CONTENT.ctaSecondary}</a>
      </div>
    </div>
  </header>

  <section class="section" id="support">
    <h2 class="section-head">Stack pronta para demonstracao de portfolio, com narrativa clara e foco operacional.</h2>
    <ul class="feature-list">
      ${CONTENT.featuresHtml}
    </ul>
  </section>

  <section class="section" id="api">
    <p class="api-title">${CONTENT.apiTitle}</p>
    <ul class="endpoint-list">
      ${CONTENT.endpointsHtml}
    </ul>
    <div class="meta">
      <span>Responsivo: mobile-first</span>
      <span>Atualizado em ${now}</span>
    </div>
  </section>

  <script>
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.12 })

    for (const section of document.querySelectorAll('.section')) {
      observer.observe(section)
    }
  </script>
</body>
</html>`
}
