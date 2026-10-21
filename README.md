# Tech Challenge - Sistema de Oficina Mecânica

**Aplicação principal executando em Kubernetes**: API
NestJS modular, banco PostgreSQL com Prisma, autenticação JWT, documentação
Swagger, testes automatizados, manifestos Kustomize e CI/CD com deploy em
Kubernetes (homologação e produção).

> A infraestrutura fica em repositórios separados — ver
> [Estrutura multi-repositório](#estrutura-multi-repositorio).

## Estrutura multi-repositório

O projeto está organizado em quatro repositórios independentes, cada um com o
próprio CI/CD e deploy automático para a nuvem:

| # | Repositório | Responsabilidade | CI/CD |
|---|---|---|---|
| 1 | `tech-challenge-lambda` | Função serverless (Lambda) | build, testes e deploy das funções |
| 2 | `tech-challenge-infra-k8s` | Infraestrutura Kubernetes (Terraform): VPC, EKS, ALB Controller, IAM/OIDC, ECR | `terraform fmt`/`validate` + plan automatizado |
| 3 | `tech-challenge-infra-db` | Banco de dados gerenciado (Terraform): RDS PostgreSQL | `terraform fmt`/`validate` + plan automatizado |
| **4** | **este repositório** | **Aplicação principal executando em Kubernetes** (API, manifestos, deploy homolog/prod) | Testes, build da imagem e `kubectl apply` |

Regras de proteção aplicadas em todos os repositórios:

- branch `main`/`master` protegida — sem commits diretos;
- merge somente via **Pull Request**;
- deploy automático das branches de **homologação** e **produção**.

Este repositório implementa o item 4: `develop` → ambiente **homolog**, `main` →
ambiente **production** (ver `.github/workflows/deploy.yml`).

## Contexto do projeto

O sistema atende uma oficina mecânica de médio porte que precisa sair de controles manuais e centralizar:

- cadastro de clientes e veículos;
- abertura e acompanhamento de ordens de serviço;
- catálogo de serviços de mão de obra;
- controle de peças e estoque;
- aprovação de orçamentos;
- histórico e métricas operacionais.

A modelagem foi alinhada com as notas do Obsidian em `Pessoal/Pós Graduação/Fase 1 - Tech Challenge`, principalmente os documentos de desafio, DDD, linguagem ubíqua e arquitetura do MVP.

## Stack definida

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Linguagem | TypeScript | Tipagem estática reduz bugs e é amplamente adotada no ecossistema Node.js. |
| Framework back-end | NestJS | Arquitetura modular nativa, suporte a DDD, injeção de dependência e decorators. |
| Banco de dados | PostgreSQL | Relacional robusto, ideal para OS, clientes, peças, estoque e históricos. |
| ORM | Prisma | Migrations simples, client type-safe e integração direta com NestJS. |
| Autenticação | JWT + Passport.js | Padrão de mercado e suporte nativo no NestJS. |
| Documentação API | Swagger (`@nestjs/swagger`) | Geração automática a partir de decorators e DTOs do NestJS. |
| Testes | Jest + Supertest | Testes unitários e de integração, integrados ao NestJS por padrão. |
| Containerização | Docker + Docker Compose | Orquestração local da API e banco PostgreSQL. |
| Segurança / scan | SonarQube | SAST, cobertura, vulnerabilidades e code smells em um único painel. |
| Controle de versão | Git + GitHub | Base preparada para repositório privado e colaboração do time. |

## ADRs (Architecture Decision Records)

As ADRs do projeto estão em [docs/ADRs](docs/ADRs):

- [ADR-001-monolito-modular-bounded-contexts.md](docs/ADRs/ADR-001-monolito-modular-bounded-contexts.md)
- [ADR-002-clean-architecture-ddd-tatico-por-modulo.md](docs/ADRs/ADR-002-clean-architecture-ddd-tatico-por-modulo.md)
- [ADR-003-nodejs-typescript-nest.md](docs/ADRs/ADR-003-nodejs-typescript-nest.md)
- [ADR-004-postgresql-como-banco-principal.md](docs/ADRs/ADR-004-postgresql-como-banco-principal.md)

> Observação: essas ADRs foram inseridas na Fase 2 da Pós-Graduação FIAP.

## Arquitetura

O MVP segue um monólito modular. A aplicação fica em um único deploy, mas os módulos refletem os bounded contexts do domínio para facilitar manutenção e futura separação, caso necessário.

Fluxo principal da OS:

```text
RECEIVED -> IN_DIAGNOSTICS -> WAITING_APPROVAL -> IN_PROGRESS -> FINISHED -> DELIVERED
```

## Desenho da arquitetura proposta

Os diagramas do projeto ficam em `docs/diagrams` (formato Mermaid).

O fluxo de deploy descreve o pipeline de CI/CD até o ambiente de produção em AWS:

| Diagrama | Conteúdo |
|---|---|
| [docs/diagrams/07-fluxo-deploy.mmd](docs/diagrams/07-fluxo-deploy.mmd) | Fluxo de deploy: CI, push no ECR e rollout no EKS |

## Diagramas C4

Visualização direta dos diagramas de Contexto, Container e Components no GitHub:

- [docs/C4Model/README.md](docs/C4Model/README.md)

## Estrutura principal

```text
.
├── prisma/                  # schema, migrations e config do Prisma
├── src/
│   ├── access-identity/     # identidade de acesso, JWT + Passport
│   ├── customer-management/ # clientes e veículos
│   ├── materials/           # peças e estoque
│   ├── service-orders/      # ordens de serviço (inclui catalog/)
│   └── common/              # infraestrutura compartilhada, validadores, Prisma
├── test/                    # testes de integração e e2e
├── k8s/                     # manifestos Kustomize (base + overlays local/aws)
├── .github/workflows/       # CI e deploy contínuo (homolog + produção)
├── docker-compose.yml       # API, PostgreSQL e perfil opcional do SonarQube
└── sonar-project.properties # configuração do scan SonarQube
```

> A infraestrutura AWS (VPC, EKS, RDS, ECR) **não** fica aqui — vive nos
> repositórios de infraestrutura (itens 2 e 3), com o Terraform e o ciclo de
> vida deles.

## Como rodar com Docker (API + Banco)

Pré-requisitos:

- Docker

### 1. Inicialização Básica

Copie o arquivo de variáveis e suba a aplicação completa (API e Banco de Dados),
que já executa as migrations e os dados iniciais (*seed*):

```bash
cp .env.example .env          # Windows: copy .env.example .env
docker compose up --build
```

Os valores de exemplo funcionam sem edição. O `.env` é gitignored.

> Esqueceu o `cp`? O Compose aborta com
> `required variable POSTGRES_PASSWORD is missing a value: copie .env.example para .env`.

### 2. Documentação API

http://localhost:3000/api/docs

## Deploy — Kubernetes e AWS

O Docker Compose acima é o ambiente de desenvolvimento. O alvo de produção é
**Kubernetes**: cluster local para desenvolver e **AWS EKS** para valer. A
infraestrutura (cluster, RDS, ECR) é provisionada pelos repositórios de
infraestrutura (itens 2 e 3); este repositório entrega a aplicação.

| Documento | Para quê |
|---|---|
| **[QUICKSTART.md](QUICKSTART.md)** | **Comece aqui.** Passo a passo para subir na sua máquina (~10 min) ou na AWS (~30 min) |
| [k8s/README.md](k8s/README.md) | Contrato de configuração, validação dos manifestos e CI/CD |

Atalho para o ambiente local, depois de habilitar o Kubernetes no Docker Desktop:

```bash
cp k8s/overlays/local/.env.secret.example k8s/overlays/local/.env.secret
npm run k8s:build && npm run k8s:apply
npm run k8s:seed
npm run k8s:forward     # http://localhost:8080/api/docs
```

### Ambientes

| Branch | Ambiente | Deploy |
|---|---|---|
| `develop` | homolog | automático via GitHub Actions (`deploy.yml`) |
| `main` | production | automático via GitHub Actions, com aprovação manual (environment) |

> A AWS custa **~US$ 7/dia** com tudo de pé. O teardown está no QUICKSTART e a
> ordem importa: `kubectl delete -k` **antes** de destruir a infra nos
> repositórios de infraestrutura.

## Autenticação

As rotas administrativas usam Bearer Token JWT. Autentique um usuário interno em:

```text
POST /auth/login
```

Payload:

```json
{
  "email": "ana.santos@oficina.com",
  "password": "Tech@123"
}
```

O endpoint legado abaixo continua disponível com o mesmo payload:

```text
POST /auth/login-admin
```

Depois envie o header:

```text
Authorization: Bearer <TOKEN>
```

Também é possível consultar a identidade autenticada em:

```text
GET /auth/me
```

A consulta pública de acompanhamento da OS fica em:

```text
GET /service-orders/:id
```

## Testes e qualidade

### Entre no container 
```bash
docker compose exec -it api sh
npm run test:all
npm run test:all:cov
```
- Depois abra o arquivo `coverage/lcov-report/index.html` no seu navegador