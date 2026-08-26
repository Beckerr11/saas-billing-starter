# SaaS Billing Starter

![CI](https://github.com/Beckerr11/saas-billing-starter/actions/workflows/ci.yml/badge.svg)

Referência de backend para estudar o **ciclo de assinatura de um SaaS** sem acoplar a regra de negócio diretamente a um provedor de pagamento.

A aplicação mantém planos, workspaces, sessões de checkout, assinaturas e eventos processados em memória e usa uma interface de provider para separar o domínio de billing da integração externa.

## Fluxos implementados

- catálogo de planos em BRL;
- criação de workspace;
- criação de checkout para um plano válido;
- provider de billing injetável, com implementação mock por padrão;
- portal de assinatura por workspace;
- webhook protegido por HMAC SHA-256;
- comparação de assinatura com `timingSafeEqual`;
- idempotência por `eventId`;
- ativação de assinatura após `checkout.completed`;
- cancelamento da assinatura ativa anterior ao trocar de plano;
- cancelamento por evento;
- limite de 1 MB para payload HTTP;
- health check e API HTTP sem framework externo.

## O que o projeto prova

O foco técnico não é “integrar Stripe em poucas linhas”, mas manter uma fronteira clara:

```text
HTTP API
   ↓
billing domain
   ├── plans
   ├── workspaces
   ├── checkout sessions
   ├── subscriptions
   └── webhook idempotency
   ↓
Billing Provider interface
   ↓
mock provider / futuro provider real
```

Isso permite testar o domínio sem fazer chamadas reais de pagamento.

## Segurança do webhook

O payload bruto é assinado/validado com HMAC SHA-256 antes do processamento. Eventos já processados não são aplicados novamente.

O fallback `dev-webhook-secret` existe apenas para execução local. Em qualquer ambiente real, `BILLING_WEBHOOK_SECRET` precisaria ser obrigatório e fornecido por secret management.

## Executando

```bash
npm ci
npm test
npm run dev
```

## Limites atuais

Este repositório **não processa pagamentos reais**.

- o provider padrão é mock;
- URLs de checkout/portal locais são demonstrativas;
- workspaces, sessões, assinaturas e idempotency keys ficam em memória;
- não existe banco de dados;
- não existe autenticação/autorização de workspace;
- não existe reconciliação com um provedor externo;
- o repositório é “Stripe-ready” apenas no sentido arquitetural de possuir uma fronteira de provider — não há uma integração Stripe de produção aqui.

## Próximos passos de produção

- adapter real de provedor;
- persistência transacional;
- unique constraint para event IDs;
- autenticação e autorização por workspace;
- retries/dead-letter para eventos;
- reconciliação de assinatura;
- observabilidade e alertas de falha de webhook;
- gestão de secrets e rotação de chaves.

## Qualidade

- testes com o test runner nativo do Node.js;
- GitHub Actions CI;
- Dependabot;
- documentação de deploy, segurança e checklist de produção.

## Autor

**Douglas Silva**  
[GitHub](https://github.com/Beckerr11) · [Portfólio](https://douglasdev.tech)
