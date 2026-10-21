# ADR 001: Adoção de Monolito Modular com Bounded Contexts e Shared Kernel

* **Status**: Aceito
* **Data**: 2026-05-15
* **Hora**: 09:13
* **Autor**: Time de Engenharia
* **Revisores**: Time de Arquitetura
* **Stakeholders envolvidos**: Engenharia de Software, Produto, Plataforma/DevOps

---

## Contexto

O projeto precisava de uma arquitetura que equilibrasse velocidade de entrega no curto prazo com flexibilidade para evolução no médio e longo prazo.

As principais necessidades identificadas foram:
- manter a base de código simples de operar e implantar no estágio atual do produto;
- reduzir acoplamento entre domínios de negócio para evitar efeito cascata em mudanças;
- permitir que funcionalidades evoluam de forma independente por domínio;
- preparar o sistema para uma futura migração incremental para microserviços, sem reescrita total.

Os requisitos não funcionais mais impactados pela decisão foram:
- **manutenibilidade** (separação clara de responsabilidades);
- **escalabilidade organizacional** (times atuando por domínio);
- **evolutividade arquitetural** (baixo custo para extração futura de serviços).

---

## Opções Consideradas

### Opção 1: Monolito Tradicional por Camadas
* **Descrição breve**: Estrutura única por camadas técnicas (controllers, services, repositories), compartilhando regras e dependências entre áreas de negócio.
* **Prós**:
  * [✔️] Menor curva inicial de implementação.
  * [✔️] Menos decisões arquiteturais no curto prazo.
* **Contras**:
  * [❌] Maior acoplamento entre domínios ao longo do tempo.
  * [❌] Dificulta extração futura para microserviços.
  * [❌] Tendência a concentração de regras em módulos genéricos.

### Opção 2: Monolito Modular com Bounded Contexts e Shared Kernel
* **Descrição breve**: Organizar o sistema em módulos de negócio desacoplados, cada um representando um bounded context, com integração por interfaces e uso de um shared kernel para componentes realmente comuns.
* **Prós**:
  * [✔️] Fronteiras explícitas de domínio e responsabilidades.
  * [✔️] Menor acoplamento e maior coesão interna por módulo.
  * [✔️] Facilita migração gradual para microserviços.
  * [✔️] Permite desenvolvimento no padrão feature module por contexto.
* **Contras**:
  * [❌] Exige disciplina arquitetural e governança de dependências.
  * [❌] Pode introduzir overhead inicial de desenho de contratos.

### Opção 3: Microserviços Desde o Início
* **Descrição breve**: Separar os domínios em serviços independentes já na fase atual, com comunicação via rede.
* **Prós**:
  * [✔️] Isolamento máximo de deploy e escalabilidade técnica.
  * [✔️] Alinhamento imediato ao destino arquitetural futuro.
* **Contras**:
  * [❌] Maior complexidade operacional (rede, observabilidade, resiliência distribuída).
  * [❌] Custo maior de desenvolvimento e manutenção no estágio atual.
  * [❌] Risco de desacelerar entregas iniciais de negócio.

---

## Decisão

Adotar a **Opção 2 (Monolito Modular com Bounded Contexts e Shared Kernel)**.

A estrutura de módulos definida é:
- **access-identity**
- **customer-management**
- **materials**
- **service-orders**
- **common** (shared kernel)

Cada módulo funciona no padrão **feature module**, com regras de negócio encapsuladas e comunicação entre contextos por **interfaces/contratos**, evitando dependência direta de implementação.

---

## Justificativa

A decisão foi tomada com base nos seguintes critérios:
- **tempo de entrega**: mantém simplicidade de operação de um monolito no momento atual;
- **risco arquitetural**: reduz risco de acoplamento excessivo por separar domínios desde já;
- **custo de evolução**: diminui esforço futuro para extração de microserviços, pois os contextos já nascem desacoplados;
- **alinhamento estratégico**: suporta crescimento do produto e da equipe sem exigir infraestrutura distribuída prematuramente.

Os contras da opção escolhida foram considerados aceitáveis porque a disciplina de contratos entre módulos pode ser tratada com padrões de projeto, code review e testes de integração entre contextos.

---

## Consequências

### Positivas

* [✔️] Fronteiras de domínio explícitas, com maior clareza de ownership.
* [✔️] Redução de acoplamento entre funcionalidades de contextos distintos.
* [✔️] Base preparada para migração incremental para microserviços.
* [✔️] Melhor organização do código por capacidade de negócio (feature module).

### Negativas / Riscos

* [⚠️] Risco de violação de fronteiras caso contratos não sejam respeitados.
* [⚠️] Necessidade de governança contínua para evitar crescimento indevido do shared kernel (`common`).
* [⚠️] Possível duplicação controlada entre contextos quando o compartilhamento não for adequado.

---

## Ações Imediatas

* [ X ] Definir e documentar contratos (interfaces) de integração entre os módulos.
* [ X ] Estabelecer regras de dependência arquitetural (quem pode depender de quem).
* [ X ] Criar testes de integração entre bounded contexts críticos.
* [ X ] Definir critérios para inclusão de componentes no shared kernel (`common`).
* [ X ] Adicionar validações arquiteturais no pipeline (lint/checagens de fronteira).

---

## Lições Aprendidas

A separação por domínio é mais efetiva quando acompanhada de contratos explícitos e revisão contínua de dependências. O shared kernel deve ser mínimo e evoluir com critérios claros para não virar um ponto de acoplamento global.

---

## Referências

* Domain-Driven Design (DDD) - Bounded Context
* Modular Monoliths
* Clean Architecture e Ports/Adapters
