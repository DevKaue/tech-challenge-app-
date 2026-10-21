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
| Criar a infra AWS (VPC, EKS, ECR, ALB) | repo `techchallenge-infra-k8s` |
| Criar o banco (RDS + parâmetros no SSM) | repo `techchallenge-infra-db` |

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
| `aws` | `secretGenerator` lendo `.env.secret`, montado pelo `deploy.yml` a partir do SSM (RDS e segredo JWT) + secrets de aplicação do environment do GitHub; o namespace é criado pelo próprio overlay (`namespace.yaml`) |

O **base não aplica Secret nenhum**, de propósito: se aplicasse placeholders,
cada `apply -k overlays/aws` do CI sobrescreveria o Secret real e derrubaria a
produção no restart seguinte.

No `local`, o Kustomize sufixa o nome do Secret com um hash do conteúdo — então
**editar o `.env.secret` dispara rolling restart automaticamente**.

> ⚠️ `PASSWORD_SALT` é salt fixo e global do scrypt. Trocá-lo invalida **todas**
> as senhas já gravadas no banco. Defina uma vez e não rotacione sem plano.

---

## Dois avisos que não podem se perder

**NetworkPolicy é implementada pelo CNI, não pelo Kubernetes.** O Docker Desktop
usa bridge nativa, sem Calico/Cilium: os manifestos são aceitos e
**silenciosamente não aplicados**. No EKS só valem com `enableNetworkPolicy:
true` no addon VPC CNI (o Terraform configura). **Não conclua que o isolamento
funciona a partir de um teste local.**

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
| `ci.yml` | PR e push em `develop`/`main` | lint, typecheck, build, testes unitários e de integração, build da imagem e validação dos manifestos com `kubeconform` |
| `deploy.yml` | push em `main`, e em `develop` só com `STAGING_ENABLED=true` (ou manual) | push no ECR com a tag do SHA, monta o Secret a partir do SSM, `apply -k`, `rollout status`, **`rollout undo` automático** se falhar, e smoke test em `/api/health` |

O deploy autentica por **OIDC** quando existe o secret `AWS_DEPLOY_ROLE`. No AWS
Academy, que não tem OIDC, usa as credenciais temporárias do lab (`AWS_LAB_*`),
que expiram a cada sessão.
Os valores saem dos outputs do Terraform dos repos de infra. Configure em
*Settings → Environments* (crie `production` e `staging`) e *Settings → Secrets
and variables → Actions*:

| Tipo | Nome | Valor |
|---|---|---|
| Secret | `AWS_DEPLOY_ROLE` | output `github_app_deploy_role_arn` do repo `techchallenge-infra-k8s` |
| Secret | `AWS_LAB_ACCESS_KEY_ID`, `AWS_LAB_SECRET_ACCESS_KEY`, `AWS_LAB_SESSION_TOKEN` | credenciais do Learner Lab (só sem `AWS_DEPLOY_ROLE`) |
| Secret | `PASSWORD_SALT` | gerado manualmente — **fixo**: trocá-lo invalida todas as senhas |
| Secret | `WEBHOOK_SECRET` | gerado manualmente |
| Variable | `AWS_REGION` | `us-east-1` |
| Variable | `ECR_REPOSITORY` | output `ecr_repository_name` |
| Variable | `EKS_CLUSTER_NAME` | output `cluster_name` |

O banco e o segredo JWT não são secrets do GitHub: o deploy lê
`/techchallenge/<env>/db/{host,port,name,username,password}` (publicados pelo
repo do banco) e `/techchallenge/<env>/auth/jwt-secret` (repo da infra
Kubernetes) no SSM, com `<env>` = `staging` na `develop` e `prod` na `main`.

Em `production`, exija aprovação manual no environment *Settings*.

---

## RBAC — dar acesso de leitura a alguém

`base/rbac.yaml` cria a Role `techchallenge-readonly` (pods, logs, HPA, Ingress —
**sem Secrets**) ligada ao grupo `techchallenge:readonly`.

Não é preciso tocar em manifesto: basta o ARN em `cluster_readonly_arns` no
`terraform.tfvars` do repo `techchallenge-infra-k8s`. O access entry do EKS
coloca o principal no grupo e o RoleBinding faz o resto — **IAM autentica, RBAC
autoriza**.

```bash
kubectl auth can-i get pods    --as-group=techchallenge:readonly -n techchallenge   # yes
kubectl auth can-i get secrets --as-group=techchallenge:readonly -n techchallenge   # no
```
