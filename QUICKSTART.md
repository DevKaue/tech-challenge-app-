# Quickstart — subir o projeto

Passo a passo direto. Cada manifesto está comentado no próprio arquivo, em
`k8s/base/` e `k8s/overlays/`; o contrato de configuração e a validação estão em
[k8s/README.md](k8s/README.md).

- [Local](#local) — sua máquina, ~10 min
- [AWS](#aws) — EKS de verdade, ~30 min e **~US$ 7/dia**

---

## Local

### Pré-requisitos

| Sistema | Instalar |
|---|---|
| **Windows / macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) → Settings → Kubernetes → ✅ **Enable Kubernetes** → Apply & Restart |
| **Linux** | Docker Engine + [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) → `kind create cluster` |

Confirme antes de começar:
```bash
kubectl get nodes
```
Precisa listar **1 nó `Ready`**. Se não listar, o Kubernetes não subiu.

### Passo 1 — metrics-server (só na primeira vez)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl -n kube-system patch deployment metrics-server --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

Sem isso o HPA fica em `<unknown>` para sempre.

### Passo 2 — segredos locais

**macOS / Linux:**
```bash
cp k8s/overlays/local/.env.secret.example k8s/overlays/local/.env.secret
```

**Windows (PowerShell):**
```powershell
copy k8s\overlays\local\.env.secret.example k8s\overlays\local\.env.secret
```

Os valores de exemplo funcionam. O arquivo é gitignored.

> Este `.env.secret` é do Kubernetes. Para o **Docker Compose** (`npm run
> docker:dev`) o arquivo é outro: `cp .env.example .env` na raiz. São ambientes
> independentes — ver [README.md](README.md#como-rodar-com-docker-api--banco).

### Passo 3 — build da imagem

```bash
npm run k8s:build
```

> **Só no `kind`**, um comando a mais:
> `kind load docker-image techchallenge-api:local`

### Passo 4 — subir

```bash
npm run k8s:apply
kubectl -n techchallenge rollout status deployment/techchallenge-api --timeout=300s
```

Espere aparecer `successfully rolled out`.

### Passo 5 — dados de exemplo

```bash
npm run k8s:seed
```

### Passo 6 — acessar

```bash
npm run k8s:forward
```

Deixe rodando e abra: **http://localhost:8080/api/docs**

Pronto. Pule para [Testar](#testar).

---

## AWS

> Custa **~US$ 7/dia**. Faça o [teardown](#derrubar) ao terminar.

A infraestrutura **não** fica neste repositório. Antes de começar, os
repositórios de infraestrutura precisam estar provisionados na sua conta AWS:

- **`tech-challenge-infra-k8s`** (item 2) — VPC, cluster EKS, ALB Controller,
  IAM/OIDC do deploy e repositório ECR;
- **`tech-challenge-infra-db`** (item 3) — RDS PostgreSQL (o endpoint vira o
  `DATABASE_URL` da aplicação).

Anote os outputs que eles exportam: `cluster_name`, `vpc_cidr`, `ecr_url` e o
endpoint do RDS.

### Pré-requisitos

- AWS CLI v2 configurado — `aws sts get-caller-identity` precisa responder
- Credencial com permissão de **administrador**
- `kubectl` (e `kustomize` para o passo do `edit set image`)

### Passo 1 — clonar e aplicar a infraestrutura (nos repositórios de infra)

```bash
# no repositório tech-challenge-infra-k8s
terraform init && terraform apply        # cria VPC, EKS, ECR, ALB Controller, OIDC

# no repositório tech-challenge-infra-db
terraform init && terraform apply        # cria o RDS PostgreSQL
```

### Passo 2 — conectar o kubectl

```bash
aws eks update-kubeconfig --name <cluster_name> --region us-east-1
kubectl get nodes
```

Precisa listar **2 nós `Ready`**.

### Passo 3 — secret da aplicação

O overlay `aws` gera o Secret pelo Kustomize a partir de um arquivo gitignored.
Copie e preencha com o endpoint real do RDS (output do repositório de banco):

```bash
cp k8s/overlays/aws/.env.secret.example k8s/overlays/aws/.env.secret
$EDITOR k8s/overlays/aws/.env.secret
```

O `DATABASE_URL` segue o formato
`postgresql://<user>:<password>@<rds-endpoint>:5432/oficinadb?schema=public`.

> No CI isso é automático: o deploy.yml cria o `.env.secret` a partir das
> Secrets do ambiente (Settings → Environments).

### Passo 4 — publicar a imagem no ECR

```bash
ECR=$(aws ecr describe-repositories --region us-east-1 \
  --repository-names techchallenge-api --query 'repositories[0].repositoryUri' --output text)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ECR%%/*}"
docker buildx build --platform linux/amd64 --target production -t "$ECR:v1" --push .
```

> **`--platform linux/amd64` não é opcional.** Os nós são amd64. Em Mac com Apple
> Silicon, sem essa flag a imagem sobe e morre com `exec format error`.

**Windows (PowerShell):**
```powershell
$ECR = (aws ecr describe-repositories --region us-east-1 --repository-names techchallenge-api --query 'repositories[0].repositoryUri' --output text)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ($ECR -split '/')[0]
docker buildx build --platform linux/amd64 --target production -t "${ECR}:v1" --push .
```

> O repositório ECR pode ter outro nome — confira o output `ecr_url` do repo de
> infra e troque `techchallenge-api` acima.

### Passo 5 — apontar o overlay para a imagem

O arquivo `k8s/overlays/aws/kustomization.yaml` vem com **placeholders**, porque
a conta AWS não pode ser commitada num repositório público. Abra o arquivo e
troque as duas linhas do bloco `images:`:

```yaml
images:
  - name: techchallenge-api
    newName: ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/techchallenge-api   # ← trocar
    newTag: PLACEHOLDER                                                   # ← trocar
```

Pelo valor real — que é exatamente a saída do `$ECR` do passo 4, mais a tag:

```yaml
images:
  - name: techchallenge-api
    newName: 123456789012.dkr.ecr.us-east-1.amazonaws.com/techchallenge-api
    newTag: v1
```

- **`ACCOUNT_ID`** → o ID de 12 dígitos da **sua** conta AWS (`aws sts get-caller-identity --query Account --output text`)
- **`REGION`** → a região onde subiu (`us-east-1`, se não mudou nada)
- **`PLACEHOLDER`** → a tag que você publicou (`v1`, depois `v2`, `v3`…)

**Confirme antes de aplicar:**

```bash
kubectl kustomize k8s/overlays/aws | grep "image:"
```

Precisa sair o endereço completo com a tag. Se ainda aparecer `ACCOUNT_ID` ou
`PLACEHOLDER`, a troca não pegou e o passo 6 resultaria em `ImagePullBackOff`.

<details>
<summary>Tem o binário <code>kustomize</code>? Dá para automatizar</summary>

```bash
cd k8s/overlays/aws
kustomize edit set image "techchallenge-api=$ECR:v1"
cd ../../..
```

O `kubectl` embute só o `kustomize build`, não o `edit` — por isso o comando
acima exige o binário separado (`brew install kustomize`). A edição manual acima
faz exatamente a mesma coisa.

</details>

> ⚠️ **Você acabou de editar um arquivo versionado.** Depois de aplicar (passo 6),
> desfaça a alteração local para não commitar o ID da sua conta AWS:
> ```bash
> git checkout k8s/overlays/aws/kustomization.yaml
> ```
> O CI barra isso, mas é melhor não depender do CI para lembrar.

### Passo 6 — subir

```bash
kubectl apply -k k8s/overlays/aws
kubectl -n techchallenge rollout status deployment/techchallenge-api --timeout=300s
```

### Passo 7 — dados de exemplo

```bash
npm run k8s:seed
```

### Passo 8 — descobrir a URL pública

```bash
kubectl -n techchallenge get ingress techchallenge-api
```

> O CIDR usado pela `NetworkPolicy` do overlay (VPC) precisa bater com o
> `vpc_cidr` do repositório de infra — confira `k8s/overlays/aws/networkpolicy-vpc.yaml`.

Copie a coluna `ADDRESS` — é o DNS do load balancer. Acesse
`http://<ADDRESS>/api/docs`.

> O ALB leva 2–3 min para ficar pronto. Enquanto isso a coluna fica vazia ou dá
> timeout no navegador.

---

## Testar

Substitua `<URL>` por `http://localhost:8080` (local) ou `http://<ADDRESS>` (AWS).

### Health checks

```bash
curl <URL>/api/health          # {"status":"ok",...}
curl <URL>/api/health/ready    # {"status":"ok","database":"up",...}
```

### Login

```bash
curl -X POST <URL>/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana.santos@oficina.com","password":"Tech@123"}'
```

Usuários criados pelo seed (todos com senha **`Tech@123`**):

| E-mail | Papel |
|---|---|
| `ana.santos@oficina.com` | ATTENDANT — cria OS, gerencia clientes |
| `joao.silva@oficina.com` | MECHANIC — executa serviços |

### Swagger

Abra `<URL>/api/docs`, clique em **Authorize** (canto superior direito) e cole o
`access_token` do login. A partir daí dá para chamar qualquer endpoint pela tela.

### Escalabilidade (HPA)

```bash
kubectl -n techchallenge get hpa
```
`TARGETS` precisa mostrar um número (ex.: `cpu: 0%/70%`). Se mostrar `<unknown>`,
o metrics-server não está funcionando.

### Teste de carga com k6

Instale o k6 ([k6.io/docs/get-started/installation](https://k6.io/docs/get-started/installation/))
— `brew install k6`, `choco install k6` ou `apt install k6`.

Abra **dois terminais**. No primeiro, observe em tempo real:

```bash
kubectl -n techchallenge get hpa,pods --watch
```

No segundo, gere a carga:

```bash
# local (com o port-forward ativo)
k6 run k6/stress-test.js

# AWS (troque pelo ADDRESS do seu Ingress)
k6 run -e BASE_URL=http://<ADDRESS> k6/stress-test.js

# mais agressivo
k6 run -e BASE_URL=http://<ADDRESS> -e VUS=100 -e DURATION=5m k6/stress-test.js
```

O script bate em `/api/auth/login` de propósito: ele executa **scrypt**, que é
caro em CPU. Bater em `/api/health` não moveria o ponteiro — o HPA escala por
CPU, e um health check custa quase nada.

Comportamento observado na AWS com `VUS=40`:

| Momento | CPU | Réplicas |
|---|---|---|
| início | 0% | 3 |
| +40s | 116% | 3 |
| +80s | 344% | 3 → 5 |
| +145s | 156% | 10 |
| fim da carga | 0% | 10 (desce após ~5 min) |

> O scale-**down** é lento de propósito: `stabilizationWindowSeconds: 300` no
> `base/hpa.yaml`. Sem essa janela o HPA oscilaria a cada pico.

> ⚠️ Com 2 nós, o 10º pod fica **`Pending`** por falta de CPU no cluster —
> `0/2 nodes are available: Insufficient cpu`. O `maxReplicas: 10` só é
> alcançável com mais nós ou com Cluster Autoscaler/Karpenter.

### Testes (Docker Compose)

Rode **dentro do container** — é a convenção do projeto e o `docker-compose.yml`
foi montado para isso: ele faz bind-mount de `src`, `test` e dos três diretórios
de cobertura, para o relatório gerado lá dentro aparecer na sua máquina.

```bash
docker compose exec api npm run test:ci            # unitários + cobertura
docker compose exec api npm run test:integration   # integração (usa o banco)
docker compose exec api npm run test:e2e           # e2e

docker compose exec api npm run test:all:cov       # tudo, cobertura combinada
# depois abra coverage/lcov-report/index.html
```

> Por que não no host: `@prisma/client` e `@prisma/adapter-pg` têm binários
> nativos por plataforma. Passar no macOS não prova que passa no Alpine — e é o
> Alpine que vai para produção. Além disso, o `DATABASE_URL` resolve diferente
> nos dois lados (`db:5432` dentro, `localhost:5433` fora).

### Atalhos

```bash
npm run k8s:status     # pods, services e HPA
npm run k8s:logs       # logs da aplicação, ao vivo
```

---

## Derrubar

### Local
```bash
npm run k8s:delete
```

### AWS — nesta ordem

```bash
kubectl delete -k k8s/overlays/aws     # PRIMEIRO
cd ../tech-challenge-infra-k8s && terraform destroy
cd ../tech-challenge-infra-db && terraform destroy
```

> Invertido, o load balancer fica órfão e **trava a remoção da rede** — o
> Terraform dos repositórios de infra fica minutos tentando apagar a subnet e
> falha.

---

## Se der errado

| Sintoma | O que fazer |
|---|---|
| `kubectl get nodes` não lista nada | O Kubernetes não subiu. Docker Desktop → Settings → Kubernetes |
| Pod em `CrashLoopBackOff` | `npm run k8s:logs` — provavelmente falta variável no `.env.secret` |
| Pod parado em `0/1 Running` | Readiness falhando. `npm run k8s:logs` e procure erro de banco |
| Pod em `Pending` | Falta CPU/memória no cluster. Aumente os recursos do Docker Desktop |
| `ImagePullBackOff` (local) | Faltou o `npm run k8s:build`, ou no kind faltou o `kind load` |
| `exec format error` (AWS) | Imagem no arch errado — refaça com `--platform linux/amd64` |
| Deployment com **0 pods** | `kubectl -n techchallenge get events --sort-by=.lastTimestamp \| tail -20` |
| Ingress sem `ADDRESS` | Espere 3 min. Se persistir: ALB Controller ausente, ou subnets sem a tag `kubernetes.io/role/elb` |

Diagnóstico geral:
```bash
kubectl -n techchallenge get pods,svc,hpa,ingress
kubectl -n techchallenge get events --sort-by=.lastTimestamp | tail -20
kubectl -n techchallenge logs deploy/techchallenge-api -c migrate   # migrations
kubectl -n techchallenge logs deploy/techchallenge-api -c api       # aplicação
```

Desfazer um deploy ruim:
```bash
kubectl -n techchallenge rollout undo deployment/techchallenge-api
```

> **Nunca use `kubectl delete -k` como rollback** — ele apaga o namespace e o
> volume do banco.
