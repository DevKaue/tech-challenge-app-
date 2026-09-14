# Identidade de Acesso

Este documento explica a implementacao da feature de identidade de acesso criada na branch `feature/access-identity`.

Importante: esta parte do projeto usa **NestJS** no backend. Quando eu mencionar **Next.js**, estou falando do ponto de vista de um frontend consumindo esta API.

## Objetivo

Antes da feature, o fluxo legado de `auth` emitia um token JWT fixo por meio de `POST /auth/login-admin`, sem validar um usuario real no banco.

A mudanca transformou esse fluxo em uma autenticacao baseada em usuarios internos da oficina:

- o usuario envia `email` e `password`;
- o backend valida a senha com hash seguro;
- o backend emite um JWT com a identidade do usuario;
- as rotas protegidas usam esse token no header `Authorization`;
- o backend consegue retornar quem e o usuario autenticado via `GET /auth/me`.

## Branch Criada

A branch foi criada a partir de `develop`, seguindo o padrao ja existente no projeto:

```bash
git switch -c feature/access-identity develop
```

## Estrutura Atual Em Camadas

O codigo de identidade de acesso foi reorganizado para o novo padrao do projeto:

```text
backend/src/access-identity/
|-- application/usecases/
|-- domain/contracts/
|-- domain/entities/
|-- infra/repositories/
|-- infra/security/
`-- presentation/
```

As rotas HTTP continuam em `/auth`, mas a implementacao interna agora fica no modulo `access-identity`.

## Alteracoes No Banco De Dados

Arquivo principal:

```text
backend/prisma/schema.prisma
```

O model `User` agora possui os campos necessarios para login:

```prisma
email        String @unique
passwordHash String @map("password_hash")
```

Por que isso importa:

- `email` virou a identidade de login do usuario interno;
- `@unique` impede dois usuarios com o mesmo email;
- `passwordHash` guarda a senha protegida, nunca a senha pura;
- `@map("password_hash")` mantem o padrao snake_case no banco.

A migration criada foi:

```text
backend/prisma/migrations/20260604000000_add-access-identity/migration.sql
```

Ela faz quatro coisas:

1. adiciona a coluna `password_hash`;
2. preenche emails ausentes com um email local derivado do id;
3. preenche usuarios existentes com um hash padrao para ambiente local;
4. torna `email` e `password_hash` obrigatorios.

## Hash De Senha

Arquivo:

```text
backend/src/access-identity/infra/security/scrypt-password-hasher.ts
```

Foi criado um helper para gerar e validar hashes usando `scrypt`, que ja existe no Node.js.

Formato salvo:

```text
scrypt:<salt>:<hash-base64>
```

O `salt` evita que duas senhas iguais gerem exatamente o mesmo hash. A comparacao usa `timingSafeEqual`, que reduz risco de ataques baseados em tempo de resposta.

Por enquanto nao foi adicionada dependencia externa como `bcrypt`, porque `scrypt` atende bem ao MVP e evita aumentar o escopo.

## Endpoints Criados

Arquivo:

```text
backend/src/access-identity/presentation/controllers/auth.controller.ts
```

### POST /auth/login

Novo endpoint principal de login.

Payload:

```json
{
  "email": "ana.santos@oficina.com",
  "password": "Tech@123"
}
```

Resposta:

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "...",
    "name": "Ana Santos",
    "email": "ana.santos@oficina.com",
    "role": "ATTENDANT"
  }
}
```

### POST /auth/login-admin

Esse endpoint antigo foi mantido como alias de compatibilidade.

Ele usa o mesmo payload de `POST /auth/login`. Isso evita quebrar a documentacao e o fluxo que ja existiam no projeto.

### GET /auth/me

Endpoint protegido que retorna a identidade do usuario autenticado.

Ele precisa receber:

```text
Authorization: Bearer <TOKEN>
```

## DTOs Criados

Pasta:

```text
backend/src/access-identity/presentation/dto/
```

Foram criados dois DTOs:

```text
login.dto.ts
login-response.dto.ts
```

O `LoginDto` valida entrada:

- `email` precisa ter formato de email;
- `password` precisa existir;
- `password` precisa ter pelo menos 8 caracteres.

O `LoginResponseDto` documenta a resposta no Swagger.

Esse padrao e importante no NestJS porque DTOs ajudam em tres pontos:

- validacao automatica com `class-validator`;
- documentacao Swagger mais clara;
- contrato explicito entre cliente e API.

## LoginUseCase

Arquivo:

```text
backend/src/access-identity/application/usecases/login.usecase.ts
```

O caso de uso agora faz o fluxo real de autenticacao:

1. normaliza o email com `trim().toLowerCase()`;
2. busca o usuario no Prisma;
3. valida o hash da senha;
4. cria o payload JWT;
5. retorna token e dados basicos do usuario.

Payload do token:

```ts
{
  sub: user.id,
  email: user.email,
  role: user.role
}
```

O campo `sub` e uma convencao comum em JWT e significa "subject", ou seja, quem e o dono daquele token.

## JwtStrategy

Arquivo:

```text
backend/src/access-identity/presentation/strategies/jwt.strategy.ts
```

Antes, a strategy aceitava praticamente qualquer token com `sub`.

Agora ela:

1. le o token do header `Authorization`;
2. valida assinatura e expiracao;
3. pega o `sub`;
4. consulta o usuario no banco;
5. rejeita o token se o usuario nao existir;
6. coloca os dados do usuario em `request.user`.

Isso e importante porque um token assinado pode continuar existindo mesmo depois de um usuario ser removido. Consultar o banco permite invalidar esse acesso naturalmente.

## Guard JWT

Arquivo:

```text
backend/src/access-identity/presentation/guards/jwt-auth.guard.ts
```

O guard ja existia e foi reaproveitado:

```ts
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

Quando uma rota usa `@UseGuards(JwtAuthGuard)`, o NestJS executa a strategy JWT antes de chegar no metodo do controller.

## Rota Publica De Acompanhamento De OS

Arquivo:

```text
backend/src/service-orders/service-orders.controller.ts
```

Foi removida a protecao de:

```text
GET /service-orders/:id
```

Motivo: o README ja dizia que essa rota deveria ser publica para o cliente acompanhar a ordem de servico.

As rotas administrativas continuam protegidas.

## Seed Atualizado

Arquivo:

```text
backend/prisma/seed.ts
```

O seed agora cria usuarios internos com `passwordHash`.

Senha local padrao:

```text
Tech@123
```

Usuario para teste:

```json
{
  "email": "ana.santos@oficina.com",
  "password": "Tech@123"
}
```

Essa senha e apenas para ambiente local/MVP. Em um sistema real, o ideal seria ter fluxo de convite, troca de senha e segredo inicial fora do codigo.

## Documentacao Atualizada

Arquivos:

```text
README.md
backend/README.md
```

As instrucoes agora explicam:

- como autenticar com `POST /auth/login`;
- que `POST /auth/login-admin` ainda existe como legado;
- como enviar o header `Authorization`;
- como consultar `GET /auth/me`;
- qual credencial local o seed cria.

## Testes Criados

Arquivos:

```text
backend/src/access-identity/application/usecases/login.usecase.spec.ts
backend/src/access-identity/application/usecases/validate-authenticated-user.usecase.spec.ts
backend/src/access-identity/presentation/strategies/jwt.strategy.spec.ts
```

Testes do `LoginUseCase`:

- autentica usuario valido;
- rejeita email inexistente;
- rejeita senha invalida.

Testes do `ValidateAuthenticatedUserUseCase`:

- resolve o usuario a partir do `sub`;
- rejeita token sem `sub`;
- rejeita token de usuario inexistente.

Teste da `JwtStrategy`:

- valida que o payload do token e delegado para o caso de uso.

## Como Testar Manualmente

Depois de aplicar migrations e seed:

```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:seed
npm run start:dev
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.santos@oficina.com","password":"Tech@123"}'
```

Usar o token:

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## Como Isso Conversa Com Next.js

Se houver um frontend Next.js, ele deve consumir esta API como cliente HTTP.

Exemplo simples de login no Next.js:

```ts
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  return response.json();
}
```

Depois do login, o frontend precisa guardar o token e envia-lo nas chamadas protegidas:

```ts
async function getClients(token: string) {
  const response = await fetch('http://localhost:3000/api/clients', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Request failed');
  }

  return response.json();
}
```

Ponto de aprendizado:

- NestJS cuida da API, regras, banco, validacao e autenticacao;
- Next.js cuida das telas, formularios, estado da sessao e chamadas HTTP;
- o contrato entre os dois e o JSON enviado/recebido pela API.

Para producao, o ideal e estudar armazenamento seguro do token. Em muitos casos, cookies `HttpOnly` sao mais seguros do que `localStorage`, mas isso exigiria uma estrategia propria de sessao, CORS e CSRF.

## Validacoes Executadas

Comandos executados:

```bash
npm run prisma:generate
npm test -- --runInBand
npm run build
npx eslint "src/access-identity/**/*.ts" "src/service-orders/service-orders.controller.ts"
```

Resultado:

- testes passando;
- build passando;
- lint dos arquivos da feature passando.

Observacao: o lint completo do projeto ainda aponta problemas antigos em arquivos fora desta feature. Eu nao corrigi esses pontos para manter a branch focada em identidade de acesso.

## O Que Voce Pode Estudar A Partir Dessa Feature

1. DTOs no NestJS: como validar entrada e documentar Swagger.
2. Guards e Strategies: como o NestJS protege rotas.
3. JWT: diferenca entre gerar token e validar token.
4. Prisma: como schema, migration e seed trabalham juntos.
5. Hash de senha: por que nunca salvar senha pura.
6. Integracao com Next.js: como uma tela de login consome uma API protegida.

## Possiveis Proximos Passos

- Criar controle de permissao por role (`ATTENDANT`, `MECHANIC`).
- Adicionar refresh token.
- Criar fluxo de troca de senha.
- Criar endpoint administrativo para cadastrar usuarios internos.
- Criar frontend Next.js com tela de login e area autenticada.
- Guardar token em cookie `HttpOnly` para melhorar seguranca no frontend.
