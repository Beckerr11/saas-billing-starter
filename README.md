# saas-billing-starter

![CI](https://github.com/Beckerr11/saas-billing-starter/actions/workflows/ci.yml/badge.svg)

SaaS billing starter.

## Objetivo
Este repositorio faz parte de uma trilha de portfolio profissional full stack, com foco em simplicidade, clareza e boas praticas.

## Stack
Node.js, API HTTP, Stripe-ready provider

## Funcionalidades implementadas
- Catalogo de planos e checkout
- Webhook com assinatura e idempotencia
- Portal de assinaturas por workspace
- Provider mock e provider Stripe-ready

## Como executar
~~~bash
npm ci
npm test
npm run dev
~~~

## Scripts uteis
- npm run dev, npm test

## Qualidade
- CI em .github/workflows/ci.yml
- Dependabot em .github/dependabot.yml
- Testes locais obrigatorios antes de merge

## Documentacao
- [Guia de deploy](docs/DEPLOY.md)
- [Roadmap](docs/ROADMAP.md)
- [Checklist de producao](docs/PRODUCTION-CHECKLIST.md)
- [Contribuicao](CONTRIBUTING.md)
- [Seguranca](SECURITY.md)

## Status
- [x] Scaffold inicial
- [x] Base funcional com testes
- [ ] Deploy publico com observabilidade completa
- [ ] Versao 1.0.0 com demo publica

