# ADR 004: Adoção do PostgreSQL como Banco de Dados Principal

* **Status**: Aceito
* **Data**: 2026-05-18
* **Hora**: 09:38
* **Autor**: Time de Engenharia
* **Revisores**: Time de Arquitetura
* **Stakeholders envolvidos**: Engenharia de Software, Produto, Plataforma/DevOps

---

## Contexto

Com a definição de monolito modular por bounded context e organização interna com Clean Architecture + DDD tático, tornou-se necessário formalizar a decisão sobre o banco de dados relacional principal da plataforma.

O domínio da aplicação possui entidades com relacionamentos consistentes, regras transacionais e necessidade de integridade forte entre dados de diferentes contextos de negócio.

Os principais direcionadores foram:
- garantir consistência e integridade dos dados com suporte robusto a transações ACID;
- manter produtividade do time com uma tecnologia madura e amplamente conhecida;
- suportar evolução futura para cenários de maior escala sem ruptura da modelagem;
- alinhar com o stack atual de backend em Node.js, TypeScript e Nest.

Requisitos não funcionais mais impactados:
- **confiabilidade**;
- **manutenibilidade**;
- **performance transacional**;
- **longevidade da plataforma**.

---

## Opções Consideradas

### Opção 1: Banco NoSQL como principal (ex.: MongoDB)
* **Descrição breve**: Utilizar banco orientado a documentos como datastore principal para os módulos da aplicação.
* **Prós**:
  * [✔️] Alta flexibilidade de esquema em cenários com dados semiestruturados.
  * [✔️] Boa velocidade para alguns padrões de leitura/escrita.
* **Contras**:
  * [❌] Maior complexidade para garantir consistência forte em regras transacionais complexas.
  * [❌] Desalinhamento com parte relevante do modelo de domínio relacional do projeto.

### Opção 2: PostgreSQL como banco relacional principal
* **Descrição breve**: Adotar PostgreSQL como SGBD principal para persistência transacional dos módulos de negócio.
* **Prós**:
  * [✔️] Forte suporte a ACID, constraints e integridade referencial.
  * [✔️] Tecnologia madura, estável e amplamente adotada em produção.
  * [✔️] Ecossistema sólido para observabilidade, backup, migração e operação.
  * [✔️] Boa aderência ao conhecimento prévio do time e curva de aprendizado controlada.
* **Contras**:
  * [❌] Exige maior disciplina de modelagem e versionamento de schema.
  * [❌] Escalabilidade horizontal requer estratégia planejada (replicação, particionamento, tuning).

### Opção 3: Outro banco relacional como principal (ex.: MySQL)
* **Descrição breve**: Adotar outro SGBD relacional para atender requisitos transacionais.
* **Prós**:
  * [✔️] Também atende parte relevante dos requisitos relacionais.
  * [✔️] Ecossistema maduro e conhecido no mercado.
* **Contras**:
  * [❌] Menor alinhamento com padrões e práticas já consolidadas no projeto.
  * [❌] Menor benefício incremental frente ao PostgreSQL no contexto atual.

---

## Decisão

Adotar a **Opção 2 (PostgreSQL como banco relacional principal)** para persistência da aplicação.

Diretrizes da decisão:
- PostgreSQL será a base transacional dos módulos de negócio;
- modelagem priorizará integridade referencial e consistência de domínio;
- migrações de schema serão versionadas e automatizadas no pipeline;
- estratégias de leitura/escrita e índices serão orientadas por métricas de uso real.

---

## Justificativa

A decisão se encaixa com as ADRs anteriores por reforçar os mesmos princípios de **longevidade, manutenção e evolução incremental**.

O PostgreSQL oferece equilíbrio entre robustez transacional e flexibilidade de evolução, sustentando bem um monolito modular com fronteiras de domínio claras.

Também há alinhamento com o **conhecimento prévio do time**, reduzindo risco operacional e acelerando entregas com menor curva de aprendizado.

Em comparação com NoSQL como banco principal, o PostgreSQL atende melhor as necessidades de consistência forte e relacionamento entre entidades do domínio. Em comparação com outros relacionais, apresenta melhor aderência ao contexto técnico atual e ao ecossistema já utilizado no projeto.

---

## Consequências

### Positivas

* [✔️] Maior segurança de dados por integridade referencial e transações ACID.
* [✔️] Redução de risco em fluxos críticos com múltiplas entidades relacionadas.
* [✔️] Base estável para evolução de funcionalidades e crescimento da plataforma.
* [✔️] Melhor previsibilidade operacional em backup, restore e observabilidade.

### Negativas / Riscos

* [⚠️] Necessidade de governança contínua de índices e desempenho de consultas.
* [⚠️] Risco de degradação de performance sem estratégia de tuning e monitoramento.
* [⚠️] Evolução de schema exige disciplina para evitar migrações arriscadas.

---

## Ações Imediatas

* [ X ] Formalizar padrões de modelagem relacional e convenções de nomenclatura.
* [ X ] Definir estratégia de migrações, rollback e versionamento de schema.
* [ X ] Estabelecer baseline de monitoramento (latência, locks, planos e uso de índices).
* [ X ] Criar rotina de backup/restore com testes periódicos de recuperação.
* [ X ] Documentar diretrizes de performance para consultas críticas por módulo.

---

## Lições Aprendidas

A decisão de banco de dados deve refletir o comportamento do domínio e os objetivos de longo prazo da plataforma. Consistência e previsibilidade operacional tendem a superar ganhos de curto prazo quando a base de dados é central para regras de negócio.

---

## Referências

* PostgreSQL Documentation
* ACID Transactions and Relational Modeling
* Domain-Driven Design - Persistence Patterns
