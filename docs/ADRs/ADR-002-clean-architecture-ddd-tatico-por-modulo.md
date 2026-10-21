# ADR 002: Adoção de Clean Architecture com DDD Tático por Módulo

* **Status**: Aceito
* **Data**: 2026-05-16
* **Hora**: 09:29
* **Autor**: Time de Engenharia
* **Revisores**: Time de Arquitetura
* **Stakeholders envolvidos**: Engenharia de Software, Produto, Plataforma/DevOps

---

## Contexto

Com a decisão prévia de estruturar o sistema como monolito modular por bounded context, surgiu a necessidade de definir um padrão interno para cada módulo que garantisse isolamento de regras de negócio, clareza de responsabilidades e maior longevidade da plataforma.

Os principais direcionadores foram:
- preservar o conhecimento prévio do time para acelerar entregas com qualidade;
- evitar acoplamento de regras de negócio a frameworks, bancos, protocolos e detalhes de infraestrutura;
- facilitar testes e evolução do domínio sem depender de mudanças tecnológicas;
- reduzir risco de degradação arquitetural comum em abordagens MVC e em camadas tradicionais.

Requisitos não funcionais mais impactados:
- **manutenibilidade**;
- **testabilidade**;
- **evolutividade**;
- **longevidade da plataforma**.

---

## Opções Consideradas

### Opção 1: MVC / Arquitetura em Camadas Tradicional
* **Descrição breve**: Estrutura clássica por controllers, services e repositories com dependências frequentemente apontando para detalhes de framework.
* **Prós**:
  * [✔️] Simplicidade inicial e ampla familiaridade de mercado.
  * [✔️] Menor esforço de desenho arquitetural no início.
* **Contras**:
  * [❌] Tendência de regras de negócio ficarem espalhadas entre camadas técnicas.
  * [❌] Maior acoplamento com framework e tecnologias específicas.
  * [❌] Evolução de domínio mais custosa ao longo do tempo.

### Opção 2: Clean Architecture com DDD Tático por Módulo
* **Descrição breve**: Organizar cada módulo com fronteiras arquiteturais claras e dependências apontando para dentro, adotando DDD tático no domínio.
* **Prós**:
  * [✔️] Isola regras de negócio e de aplicação de detalhes tecnológicos.
  * [✔️] Favorece testabilidade e evolução de domínio com baixo acoplamento.
  * [✔️] Alinha com o conhecimento prévio do time, reduzindo risco de adoção.
  * [✔️] Melhora a longevidade da base de código.
* **Contras**:
  * [❌] Exige disciplina na definição de contratos e fronteiras.
  * [❌] Introduz overhead inicial de organização e convenções.

### Opção 3: Arquitetura Hexagonal (Ports and Adapters) Estrita
* **Descrição breve**: Aplicar rigorosamente modelo de portas e adaptadores para todos os fluxos.
* **Prós**:
  * [✔️] Excelente desacoplamento de infraestrutura e domínio.
  * [✔️] Alta flexibilidade para troca de implementações.
* **Contras**:
  * [❌] Complexidade adicional para o contexto atual do projeto.
  * [❌] Custo de implementação e governança maior no curto prazo.
  * [❌] Benefício marginal considerando baixa frequência esperada de troca de implementações.

---

## Decisão

Adotar a **Opção 2 (Clean Architecture com DDD Tático por Módulo)**.

Cada módulo deverá seguir a estrutura:
- **/application**: camada de *Application Business Rules* (casos de uso, orquestração e contratos de entrada/saída).
- **/domain**: camada de *Enterprise Business Rules* com DDD tático (entidades, value objects, agregados, serviços de domínio, eventos de domínio, repositórios como abstrações).
- **/presentation**: camada de *Interface Adapters* (controllers, mapeadores, DTOs de entrada/saída, validação de borda).
- **/infra**: camada de *Frameworks and Drivers* (ORM, persistência, integrações externas, mensageria, detalhes de configuração e providers técnicos).

As dependências devem seguir a direção para o centro (regras de negócio), impedindo que domínio e aplicação dependam de framework.

---

## Justificativa

A escolha por Clean Architecture com DDD tático foi motivada principalmente por:
- **conhecimento prévio do time**, reduzindo curva de adoção e risco de execução;
- **foco em longevidade da plataforma**, com fronteiras que preservam o domínio ao longo do tempo;
- **equilíbrio entre desacoplamento e pragmatismo**, sem introduzir complexidade desnecessária.

A alternativa hexagonal estrita não foi escolhida porque, no cenário atual, a frequência de troca de implementações de tecnologia não é alta o suficiente para justificar o custo adicional de modelagem e governança.

Em relação ao MVC e à arquitetura em camadas tradicional, a opção escolhida oferece benefício principal de **isolar regras de negócio e de aplicação** de frameworks e tecnologias específicas, evitando que decisões técnicas contaminem o núcleo da lógica de negócio.

---

## Consequências

### Positivas

* [✔️] Regras de negócio mais protegidas contra mudanças tecnológicas.
* [✔️] Melhor testabilidade de domínio e casos de uso sem dependências de framework.
* [✔️] Estrutura padronizada por módulo, facilitando manutenção e onboarding.
* [✔️] Maior capacidade de evolução incremental da arquitetura.

### Negativas / Riscos

* [⚠️] Necessidade de disciplina contínua para manter direção correta das dependências.
* [⚠️] Risco de burocratização se abstrações forem criadas sem necessidade.
* [⚠️] Maior esforço inicial de organização comparado a MVC/camadas tradicionais.

---

## Ações Imediatas

* [ X ] Definir padrão de pastas e convenções por módulo com exemplos reais.
* [ X ] Formalizar regras de dependência entre `/presentation`, `/application`, `/domain` e `/infra`.
* [ X ] Criar templates de casos de uso, entidades, mapeadores e adapters.
* [ X ] Incluir checagens automatizadas de fronteira arquitetural no pipeline.
* [ X ] Capacitar o time com guia prático de DDD tático aplicado aos módulos.

---

## Lições Aprendidas

Decisões arquiteturais sustentáveis equilibram pureza técnica com contexto de time e produto. A melhor arquitetura é a que mantém o domínio protegido sem aumentar complexidade além do necessário.

---

## Referências

* Clean Architecture - Robert C. Martin
* Domain-Driven Design - Eric Evans
* Implementing Domain-Driven Design - Vaughn Vernon
* Ports and Adapters (Hexagonal Architecture)
