# ADR 005: Kong (Ingress Controller, DB-less) como API Gateway no EKS

* **Status**: Proposto
* **Data**: 2026-10-06
* **Hora**: 19:30
* **Autor**: Thiago Almeida
* **Revisores**: —
* **Stakeholders envolvidos**: Repositórios da aplicação, da Lambda de autenticação e de infraestrutura Kubernetes; avaliação do Tech Challenge Fase 3 (13SOAT)

---

## Contexto

A Fase 3 exige um **API Gateway** para controle e roteamento, com as rotas sensíveis protegidas por autenticação via CPF. Uma Function Serverless valida o CPF, consulta o cliente e devolve um JWT.

Até aqui a aplicação era exposta por um ALB (Ingress `alb`), sem gateway. O repositório da Lambda tinha planejado o AWS API Gateway com um Lambda Authorizer.

Requisitos que pesaram:
- validar JWT antes de o tráfego chegar à aplicação;
- rotear o login por CPF para a Lambda;
- rate limiting nas rotas de login, contra enumeração de CPF;
- correlation-id e métricas de latência por rota, insumo para a observabilidade;
- configuração versionada no Git e aplicada pelo CI/CD.

---

## Opções Consideradas

### Opção 1: AWS API Gateway + Lambda Authorizer
* **Descrição breve**: o HTTP API do API Gateway na frente do ALB, via VPC Link, com um Lambda Authorizer validando o token.
* **Prós**:
  * [✔️] Gerenciado, sem pods para operar.
  * [✔️] Encaixa no handler v2 já escrito na Lambda.
* **Contras**:
  * [❌] Exige VPC Link e NLB/ALB privado. São mais peças de rede no Terraform.
  * [❌] Um Authorizer a mais em cada requisição protegida, com cold start e custo por invocação.
  * [❌] Configuração fora do cluster, em outro ciclo de deploy.

### Opção 2: Kong Ingress Controller DB-less no EKS (escolhida)
* **Descrição breve**: o Kong roda em pods próprios no namespace `kong`, exposto por um NLB. A config vem de Ingress, KongPlugin e KongConsumer do overlay `aws`. O login por CPF usa o plugin `aws-lambda`, e as rotas protegidas usam o plugin `jwt`.
* **Prós**:
  * [✔️] O gateway escala com HPA, no mesmo cluster e com o mesmo fluxo de deploy da aplicação.
  * [✔️] A validação do JWT acontece no próprio gateway, sem invocar outra Lambda.
  * [✔️] Plugins prontos de rate-limiting, correlation-id e prometheus.
  * [✔️] O time já tem domínio da ferramenta, vista em aula.
* **Contras**:
  * [❌] Mais pods para operar, consumindo CPU e memória do node group.
  * [❌] O Kong Manager OSS não tem login e, em DB-less, fica só leitura.
  * [❌] O plugin `aws-lambda` envia o evento no formato REST (v1.0), e o handler da Lambda precisa aceitá-lo.

### Opção 3: Kong com banco (Postgres)
* **Descrição breve**: igual à opção 2, mas com estado no Postgres e o Kong Manager editável.
* **Prós**:
  * [✔️] UI editável.
* **Contras**:
  * [❌] Mudanças pela UI não ficam no Git e geram drift em relação ao IaC.
  * [❌] O gateway passa a depender do banco e de um job de migrations.

---

## Decisão

Adotar a **Opção 2**: Kong Ingress Controller com chart `kong/ingress` 0.24.0 (Kong 3.9), DB-less, instalado pelo `terraform/kong.tf` do repositório de infraestrutura Kubernetes. Rotas e plugins ficam em `k8s/overlays/aws/` deste repositório.

---

## Justificativa

- **Fonte da verdade no Git:** o DB-less mantém a config versionada e aplicada pelo mesmo `kubectl apply -k` do deploy. O que está no cluster é o que está no PR.
- **Validação mais barata:** o JWT HS256 é validado no gateway, sem a latência e o custo de um Authorizer por requisição.
- **Contras aceitos:**
  - Kong Manager só leitura: basta para inspeção e demonstração, por `port-forward`.
  - Formato v1.0 do evento: resolvido com um adaptador no handler da Lambda.

---

## Consequências

### Positivas

* [✔️] Rotas protegidas recusam token ausente, inválido ou expirado já no gateway (401).
* [✔️] Rate limit por IP no `/auth` e no `/api/auth/login`. O NLB preserva o IP do cliente.
* [✔️] `X-Correlation-ID` em toda resposta, e métricas de latência e status por rota (plugin prometheus).
* [✔️] O ALB da aplicação deixa de existir; um único NLB atende o Kong.

### Negativas / Riscos

* [⚠️] `rate-limiting` com `policy: local` conta por pod. Com N réplicas, o teto efetivo é N × limite.
* [⚠️] Um único segredo HS256 (SSM `/techchallenge/<env>/auth/jwt-secret`) é compartilhado por Lambda, aplicação e Kong. Rotacioná-lo exige redeploy dos três.
* [⚠️] Sem TLS até haver domínio e certificado ACM (mesma limitação do ALB anterior).

---

## Ações Imediatas

* [ ] Repositório de infraestrutura: aplicar `kong.tf` e o parâmetro SSM do segredo JWT.
* [ ] Repositório da Lambda: publicar `techchallenge-auth-<env>` sem API Gateway, aceitar o evento v1.0 e ler o segredo do SSM.
* [ ] Aplicação: aceitar token de cliente (`type: customer`) e definir quais rotas ele pode acessar.
* [ ] Observabilidade: coletar as métricas do plugin prometheus no Datadog ou New Relic.

---

## Referências

* [RFC-001: Estratégia de autenticação](../RFCs/RFC-001-estrategia-de-autenticacao.md)
* [Diagrama de componentes do gateway](../diagrams/08-api-gateway-kong.mmd)
* [Sequência: autenticação e abertura de OS](../diagrams/09-sequencia-autenticacao-os.mmd)
* Kong Ingress Controller: https://docs.konghq.com/kubernetes-ingress-controller/
