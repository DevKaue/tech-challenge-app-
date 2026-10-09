# RFC 001: Estratégia de autenticação — Lambda emite, Kong valida, aplicação revalida

* **Status**: Em discussão
* **Data**: 2026-10-06
* **Autor**: Thiago Almeida
* **Repositórios afetados**: aplicação, Lambda de autenticação, infraestrutura Kubernetes

## Problema

Dois tipos de usuário precisam consumir a API:
- **funcionários:** login por e-mail e senha, já existente em `POST /api/auth/login`;
- **clientes:** autenticação por CPF, exigida pela Fase 3.

O gateway (ADR-005) precisa validar os dois tipos de token sem conhecer a regra de negócio de cada um.

## Proposta

### Um contrato, dois emissores

| Emissor | `iss` | Claims principais | KongConsumer |
|---|---|---|---|
| Lambda `techchallenge-auth-<env>` | `techchallenge-auth-lambda` | `sub` (id do cliente), `type: "customer"`, `jti`, `exp` | `auth-lambda` |
| Aplicação, `POST /api/auth/login` | `techchallenge-app` | `sub` (id do usuário), `email`, `role`, `exp` | `app-staff` |

- Algoritmo **HS256**, com um único segredo no SSM `/techchallenge/<env>/auth/jwt-secret`. Ele é gerado pelo repositório de infraestrutura Kubernetes e lido pela Lambda (runtime) e pelo deploy da aplicação (Secret do app e credenciais dos KongConsumers).
- O plugin `jwt` do Kong usa `key_claim_name: iss` para escolher o consumer e verifica `exp`. Token sem `iss`, com `iss` desconhecido, com assinatura inválida ou expirado recebe 401 no gateway.

### Fluxo do cliente

1. `POST /auth {cpf}` chega no Kong. O plugin `aws-lambda` invoca a Lambda com a credencial IRSA dos pods do Kong.
2. A Lambda valida os dígitos do CPF e consulta o cliente: precisa existir, não estar deletado e ter status ACTIVE. Então devolve `{access_token, token_type, expires_in}`.
   - CPF inexistente e cliente inelegível recebem o mesmo 401, para não permitir enumeração.
3. As rotas sob `/api` passam pelo plugin `jwt`. A aplicação valida o token de novo (defesa em profundidade) e aplica a autorização por papel.

### Por que a aplicação continua validando

O gateway garante que o token é **autêntico**. A aplicação decide se ele é **autorizado**: papel do funcionário, cliente ativo, posse do recurso.

Remover a validação do app também deixaria a API aberta a quem alcançasse o Service por dentro do cluster.

## Alternativas descartadas

- **Lambda Authorizer:** foi substituído pelo plugin `jwt`, conforme o ADR-005.
- **RS256 com JWKS:**
  - **A favor:** só a Lambda teria a chave privada.
  - **Contra:** exigiria publicar e rotacionar o JWKS, e mudar o `JwtStrategy` do app.
  - **Por que fica para depois:** com o segredo restrito ao SSM e a IAM, o ganho não compensa nesta fase. É o próximo passo natural, se houver rotação frequente.

## Acesso do cliente na aplicação

O `JwtStrategy` aceita só HS256 e só os dois emissores da tabela acima, e escolhe a
validação pelo `iss`:

- `techchallenge-app`: busca o `sub` em `users`, como antes;
- `techchallenge-auth-lambda`: exige `type: customer` e busca o `sub` em `customers`, com a
  mesma regra da Lambda (existe, `deleted_at` nulo, `status = ACTIVE`). Isso fecha a janela
  de até 1 h entre bloquear um cliente e ele perder o acesso, que o Kong sozinho não fecha.

O cliente é **negado por padrão** pelo `JwtAuthGuard` (403). Várias rotas de OS só têm o
`JwtAuthGuard`, sem `@Roles`, e sem essa regra um token de cliente mudaria status ou
encerraria OS. Uma rota só abre para cliente com `@CustomerAccess`, que também confere a
posse do recurso:

| Rota | O que o cliente faz | Posse conferida por |
|---|---|---|
| `GET /api/service-orders/:id` | Consulta a própria OS, com histórico | `service_orders.customer_id` |
| `GET /api/service-orders/:id/status` | Consulta o status da própria OS | `service_orders.customer_id` |
| `PATCH /api/service-orders/estimates/:estimateId/status` | Aprova ou rejeita o orçamento da própria OS | `customer_id` da OS do orçamento |

OS ou orçamento de outro cliente recebe **404**, não 403, pelo mesmo motivo da Lambda não
distinguir CPF inexistente de inelegível. Todas as outras rotas, incluindo `GET
/api/service-orders` e `GET /api/auth/me`, continuam só para funcionário.

A coluna `customers.status` (`ACTIVE`, `INACTIVE`, `BLOCKED`, padrão `ACTIVE`) vem da
migration `20261009230000_add_status_to_customers`. Os valores são os mesmos do enum
`CustomerStatus` da Lambda.

## Pendências

- Listagem das OS do próprio cliente (`GET /api/service-orders` filtrado por `customer_id`), se a demonstração precisar.
