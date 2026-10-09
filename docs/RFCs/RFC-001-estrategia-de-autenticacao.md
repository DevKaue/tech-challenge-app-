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

## Pendências

- A aplicação ainda rejeita token de cliente: o `ValidateAuthenticatedUserUseCase` só procura o `sub` em `users`. É preciso definir quais rotas o cliente acessa (por exemplo, consultar e aprovar as próprias OS) antes de aceitar `type: customer`.
- Falta a migration da coluna `status` em `customers`, que a Lambda já consulta.
