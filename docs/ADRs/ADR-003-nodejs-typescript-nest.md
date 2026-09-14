# ADR 003: Adoção de Node.js com TypeScript e Framework Nest

* **Status**: Aceito
* **Data**: 2026-05-17
* **Hora**: 09:35
* **Autor**: Time de Engenharia
* **Revisores**: Time de Arquitetura
* **Stakeholders envolvidos**: Engenharia de Software, Produto, Plataforma/DevOps

---

## Contexto

Após definir a arquitetura de monolito modular e o padrão interno com Clean Architecture + DDD tático, foi necessário consolidar o stack principal de desenvolvimento da API para garantir produtividade, padronização e sustentabilidade técnica no longo prazo.

Os fatores mais relevantes para a decisão foram:
- acelerar entrega com base no conhecimento prévio do time;
- reduzir curva de aprendizado para onboarding e manutenção;
- aumentar segurança de desenvolvimento com tipagem estática;
- manter boa integração com práticas modernas de testes, injeção de dependência e modularização.

Requisitos não funcionais mais impactados:
- **produtividade do time**;
- **manutenibilidade**;
- **qualidade e segurança em tempo de desenvolvimento**;
- **longevidade da plataforma**.

---

## Opções Consideradas

### Opção 1: Node.js com JavaScript (sem TypeScript)
* **Descrição breve**: Uso de Node.js com JavaScript puro para construção da API.
* **Prós**:
  * [✔️] Menor configuração inicial.
  * [✔️] Velocidade de prototipação em cenários simples.
* **Contras**:
  * [❌] Ausência de tipagem estática nativa, aumentando risco de erros em runtime.
  * [❌] Menor suporte a refatorações seguras em bases maiores.

### Opção 2: Node.js com TypeScript e Nest
* **Descrição breve**: Plataforma Node.js usando TypeScript como linguagem e Nest como framework principal para estruturação modular, DI e organização de camadas.
* **Prós**:
  * [✔️] Alinhamento com o conhecimento prévio do time e baixa curva de aprendizado.
  * [✔️] Tipagem estática com TypeScript, aumentando segurança e previsibilidade do código.
  * [✔️] Estrutura robusta de módulos, providers e injeção de dependência no Nest.
  * [✔️] Melhor aderência ao padrão arquitetural adotado no projeto.
* **Contras**:
  * [❌] Overhead inicial de convenções do framework.
  * [❌] Necessidade de disciplina para evitar abstrações desnecessárias.

### Opção 3: Stack Alternativo (ex.: Java/Spring ou .NET)
* **Descrição breve**: Uso de ecossistema fora de Node.js para a API principal.
* **Prós**:
  * [✔️] Plataformas maduras com amplo suporte corporativo.
  * [✔️] Ecossistemas consolidados para aplicações enterprise.
* **Contras**:
  * [❌] Maior curva de aprendizado para o contexto atual da equipe.
  * [❌] Redução de velocidade de entrega no curto prazo.
  * [❌] Maior custo de transição técnica e operacional.

---

## Decisão

Adotar a **Opção 2 (Node.js com TypeScript e Nest)** como stack principal para desenvolvimento da aplicação.

Diretrizes da decisão:
- **Node.js** como runtime da aplicação;
- **TypeScript** como linguagem padrão do backend;
- **Nest** como framework para estrutura modular, DI e organização de componentes;
- uso consistente de contratos tipados entre camadas para reforçar segurança de compilação.

---

## Justificativa

A justificativa principal da escolha é o **conhecimento prévio do time**, que reduz risco de execução e mantém **baixa curva de aprendizado** para evolução contínua do projeto.

Além disso, a **tipagem garantida com TypeScript** traz benefícios objetivos para a qualidade do software:
- prevenção de classes inteiras de erro antes de produção;
- maior segurança em refatorações;
- melhor legibilidade e comunicação de contratos no código.

A escolha do Nest complementa a decisão por fornecer uma base estruturada e aderente ao modelo arquitetural definido, com foco em longevidade e manutenção da plataforma.

---

## Consequências

### Positivas

* [✔️] Aceleração de desenvolvimento com stack já dominado pela equipe.
* [✔️] Redução de erros por incompatibilidade de tipos em tempo de compilação.
* [✔️] Melhor organização do código com módulos e injeção de dependência.
* [✔️] Facilidade de manutenção e onboarding técnico.

### Negativas / Riscos

* [⚠️] Dependência maior de convenções do framework Nest.
* [⚠️] Risco de complexidade desnecessária se padrões forem aplicados sem critério.
* [⚠️] Necessidade de atualização contínua do ecossistema Node/Nest/TypeScript.

---

## Ações Imediatas

* [ X ] Formalizar guia técnico da stack (Node.js, TypeScript, Nest) no repositório.
* [ X ] Definir padrões de tipagem, DTOs, validação e tratamento de erros.
* [ X ] Estabelecer baseline de lint, testes unitários e testes de integração.
* [ X ] Padronizar templates de módulo, controller, use case e provider.
* [ X ] Capacitar novos membros com trilha de onboarding na stack adotada.

---

## Lições Aprendidas

Escolhas tecnológicas mais sustentáveis consideram não apenas capacidades técnicas da stack, mas também a maturidade do time para operar, evoluir e manter o sistema com qualidade ao longo do tempo.

---

## Referências

* Node.js Documentation
* TypeScript Handbook
* NestJS Documentation
* Domain-Driven Design e Clean Architecture
