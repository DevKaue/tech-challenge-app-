# Kubernetes — manifestos

Kustomize da API (NestJS + Prisma + PostgreSQL).

```
k8s/
├── base/              comum aos dois ambientes
└── overlays/
    ├── local/         docker-desktop / kind — Postgres em StatefulSet
    └── aws/           EKS — imagem no ECR, banco no RDS, ALB Ingress
```

| Você quer… | Vá para |
|---|---|
| **Subir** (local ou AWS), passo a passo | [`../QUICKSTART.md`](../QUICKSTART.md) |
| Provisionar a infra AWS (VPC, cluster EKS, RDS, ECR) | Repositórios de infraestrutura (Kubernetes e banco) — ver [`../README.md`](../README.md#estrutura-multi-repositorio) |

Este arquivo tem só o que não cabe nos outros: contrato de configuração,
validação e CI/CD.

---

## Contrato de configuração

`validateEnv()` (`src/common/infra/config/env.ts`) exige **quatro** variáveis.
Faltando qualquer uma, o pod sobe e morre com `Missing required environment
variables` — falha alta e óbvia, que é o comportamento desejado.

```
DATABASE_URL   JWT_SECRET   PASSWORD_SALT   WEBHOOK_SECRET
```

| Overlay | De onde vêm |
|---|---|
| `local` | `secretGenerator` lendo `.env.secret` (gitignored) |
| `aws` | `secretGenerator` lendo `.env.secret` (gitignored); no CI o deploy.yml cria o arquivo a partir das Secrets do ambiente |

O **base não aplica Secret nenhum**, de propósito: cada overlay gera o seu via
`secretGenerator`. Como o Kustomize sufixa o nome do Secret com um hash do
conteúdo, **editar o `.env.secret` dispara rolling restart automaticamente**.

> ⚠️ `PASSWORD_SALT` é salt fixo e global do scrypt. Trocá-lo invalida **todas**
> as senhas já gravadas no banco. Defina uma vez e não rotacione sem plano.

---

## Dois avisos que não podem se perder

**NetworkPolicy é implementada pelo CNI, não pelo Kubernetes.** O Docker Desktop
usa bridge nativa, sem Calico/Cilium: os manifestos são aceitos e
**silenciosamente não aplicados**. No EKS só valem com `enableNetworkPolicy:
true` no addon VPC CNI (configurado no repositório de infraestrutura). **Não
conclua que o isolamento funciona a partir de um teste local.**

**`kubectl port-forward` ignora NetworkPolicy** em qualquer cluster — passa pelo
kubelet. É por isso que o acesso local funciona mesmo com `default-deny-all`.

---

## Validação dos manifestos

```bash
# schema, contra a versão do cluster alvo
kubectl kustomize overlays/local | kubeconform -kubernetes-version 1.32.2 -strict -summary
kubectl kustomize overlays/aws   | kubeconform -kubernetes-version 1.32.0 -strict -summary

# as duas falhas silenciosas clássicas
kubectl -n techchallenge get endpoints techchallenge-api   # não pode ser <none>
kubectl -n techchallenge get hpa                           # TARGETS não pode ser <unknown>
```

O CI roda os dois `kubeconform` e ainda garante que a `api-vpc-access` existe no
overlay `aws` — sem ela o ALB não alcança os pods.

> `apply -k --dry-run=server` num cluster onde o namespace ainda não existe
> reporta `namespaces "techchallenge" not found` para tudo. É limitação do
> dry-run, não erro de manifesto.

---

## CI/CD

| Workflow | Dispara em | Faz |
|---|---|---|
| `ci.yml` | PR e push em `develop`/`main` | lint, typecheck, build, testes unitários e de integração, build da imagem, `kubeconform` e checagens de overlay |
| `deploy.yml` | push em `develop` → **homolog**, push em `main` → **production** (ou manual) | push no ECR com a tag do SHA, `apply -k`, `rollout status`, **`rollout undo` automático** se falhar, e smoke test em `/api/health` |

O deploy autentica por **OIDC** — não existe `AWS_ACCESS_KEY_ID` no repositório.
Cada ambiente (homolog e production) tem as próprias variáveis e Secrets, criadas
em *Settings → Environments* e preenchidas com os outputs dos repositórios de
infraestrutura:

| Tipo | Nome | Valor (output do repo de infra) |
|---|---|---|
| Secret | `AWS_DEPLOY_ROLE` | role do GitHub Actions para o EKS (`github_deploy_role_arn`) |
| Secret | `AWS_DATABASE_URL` | `DATABASE_URL` do RDS (repo de banco) |
| Secret | `AWS_JWT_SECRET`, `AWS_PASSWORD_SALT`, `AWS_WEBHOOK_SECRET` | gerados uma vez, por ambiente |
| Variable | `AWS_REGION` | região do cluster |
| Variable | `ECR_REPOSITORY` | nome do repositório ECR (`ecr_repository_name`) |
| Variable | `EKS_CLUSTER_NAME` | nome do cluster EKS (`cluster_name`) |

Cada job usa o environment do destino (`homolog` ou `production`) — crie-os em
*Settings → Environments* para exigir aprovação manual antes de cada deploy de
produção.

---

## RBAC — dar acesso de leitura a alguém

`base/rbac.yaml` cria a Role `techchallenge-readonly` (pods, logs, HPA, Ingress —
**sem Secrets**) ligada ao grupo `techchallenge:readonly`.

Não é preciso tocar em manifesto: basta o ARN em `cluster_readonly_arns` no
repositório de infraestrutura Kubernetes (EKS). O access entry do EKS coloca o
principal no grupo e o RoleBinding faz o resto — **IAM autentica, RBAC autoriza**.

```bash
kubectl auth can-i get pods    --as-group=techchallenge:readonly -n techchallenge   # yes
kubectl auth can-i get secrets --as-group=techchallenge:readonly -n techchallenge   # no
```
