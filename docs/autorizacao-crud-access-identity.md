# Autorizacao dos CRUDs com Access Identity

Este documento mostra como usar o modulo `access-identity` para autorizar as APIs CRUD do backend.

## Estrutura do modulo

O fluxo de identidade de acesso segue o novo padrao em camadas:

```text
backend/src/access-identity/
|-- application/usecases/
|   |-- login.usecase.ts
|   `-- validate-authenticated-user.usecase.ts
|-- domain/contracts/
|   |-- access-identity-repository.interface.ts
|   |-- password-hasher.interface.ts
|   `-- token-service.interface.ts
|-- domain/entities/
|   |-- authenticated-user.entity.ts
|   `-- internal-user.entity.ts
|-- infra/repositories/
|   `-- prisma-access-identity.repository.ts
|-- infra/security/
|   |-- jwt-token.service.ts
|   `-- scrypt-password-hasher.ts
`-- presentation/
    |-- controllers/auth.controller.ts
    |-- dto/
    |-- guards/jwt-auth.guard.ts
    |-- interfaces/
    `-- strategies/jwt.strategy.ts
```

As rotas continuam expostas como `/api/auth/...`; o nome `access-identity` representa a organizacao interna do modulo.

## Como obter um token

Depois de aplicar migrations e seed, use um usuario interno criado no banco:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.santos@oficina.com","password":"Tech@123"}'
```

A resposta possui o token JWT:

```json
{
  "access_token": "<TOKEN>",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-id",
    "name": "Ana Santos",
    "email": "ana.santos@oficina.com",
    "role": "ATTENDANT"
  }
}
```

## Como chamar uma API CRUD autorizada

Envie o token no header `Authorization`:

```bash
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer <TOKEN>"
```

Exemplo criando um item de CRUD:

```bash
curl -X POST http://localhost:3000/api/service-catalog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"Higienizacao","description":"Limpeza interna completa","price":220}'
```

Sem o header, com token expirado ou com token invalido, a API retorna `401 Unauthorized`.

## Como proteger um controller CRUD

Importe o guard do modulo `access-identity`:

```ts
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
```

Para proteger o controller inteiro:

```ts
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {}
```

Para proteger apenas uma rota:

```ts
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
create(@Body() dto: CreateClientDto) {
  return this.clientsService.create(dto);
}
```

O `JwtAuthGuard` aciona a `JwtStrategy`, que valida o token e chama o caso de uso `ValidateAuthenticatedUserUseCase`. Esse caso de uso confirma se o usuario ainda existe no banco via `PrismaAccessIdentityRepository`.

## CRUDs protegidos atualmente

As APIs abaixo exigem `Authorization: Bearer <TOKEN>`:

```text
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
DELETE /api/clients/:id

GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PATCH  /api/vehicles/:id
DELETE /api/vehicles/:id

GET    /api/parts
POST   /api/parts
GET    /api/parts/:id
PATCH  /api/parts/:id
DELETE /api/parts/:id

GET    /api/service-catalog
POST   /api/service-catalog
GET    /api/service-catalog/:id
PATCH  /api/service-catalog/:id
DELETE /api/service-catalog/:id
```

As rotas administrativas de `service-orders` tambem usam o mesmo guard. A rota `GET /api/service-orders/:id` permanece publica para acompanhamento do cliente.

## Como autorizar pelo Swagger

1. Inicie a API com `npm run start:dev`.
2. Acesse `http://localhost:3000/api/docs`.
3. Execute `POST /auth/login`.
4. Copie o `access_token` retornado.
5. Clique em `Authorize`.
6. Informe o valor no formato:

```text
Bearer <TOKEN>
```

Depois disso, as chamadas dos CRUDs protegidos feitas pelo Swagger ja enviam o header `Authorization`.
