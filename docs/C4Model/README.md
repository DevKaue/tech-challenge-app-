# C4 Model - Sistema da Oficina Mecânica

Este documento reúne os diagramas C4 em Mermaid para visualização direta no GitHub.

Arquivos-fonte:

- [context.mmd](context.mmd)
- [api-oficina-container.mmd](api-oficina-container.mmd)
- [api-oficina-components.mmd](api-oficina-components.mmd)

## Nível 1 - Contexto

```mermaid
graph TD
    %% Estilos das Classes
    classDef person fill:#084298,stroke:#052c65,stroke-width:2px,color:#ffffff,rx:10px,ry:10px;
    classDef system fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;
    classDef extSystem fill:#999999,stroke:#666666,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;

    %% Atores (Personas)
    C["👤 <b>Cliente</b><br/><i>[Person]</i><br/>Solicita serviços, aprova orçamentos e acompanha o veículo"]:::person
    A["👤 <b>Atendente</b><br/><i>[Person]</i><br/>Recepção, abertura de O.S. e geração de orçamentos"]:::person
    M["👤 <b>Mecânico</b><br/><i>[Person]</i><br/>Executa manutenções, diagnostica e requisita peças"]:::person
    E["👤 <b>Estoquista</b><br/><i>[Person]</i><br/>Gerencia estoque e registra entrada/saída de materiais"]:::person

    %% Sistemas
    S["🏢 <b>Sistema da Oficina Mecânica</b><br/><i>[Software System]</i><br/>Gerencia O.S., agendamentos, estoque e financeiro"]:::system
    F["🏭 <b>Sistema do Fornecedor</b><br/><i>[Software System]</i><br/>Consulta de catálogo, cotação e compra de peças"]:::extSystem

    %% Relacionamentos
    C -->|"Consulta status do serviço e aprova orçamentos"| S
    A -->|"Abre ordens de serviço e emite orçamentos"| S
    M -->|"Consulta diagnósticos e registra peças utilizadas"| S
    E -->|"Controla itens em estoque e dá saída em peças"| S

    S -->|"Envia pedidos de compra e consulta estoque"| F
```

## Nível 2 - Container

```mermaid
graph TD
    %% Estilos das Classes (mantendo identidade visual do diagrama de contexto)
    classDef person fill:#084298,stroke:#052c65,stroke-width:2px,color:#ffffff,rx:10px,ry:10px;
    classDef systemBoundary fill:#e7f1ff,stroke:#0b4884,stroke-width:2px,color:#052c65,rx:10px,ry:10px;
    classDef container fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;
    classDef database fill:#0b4884,stroke:#052c65,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;
    classDef extSystem fill:#999999,stroke:#666666,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;

    %% Atores (Personas)
    C["👤 <b>Cliente</b><br/><i>[Person]</i><br/>Consulta status do serviço e aprova orçamentos"]:::person
    A["👤 <b>Atendente</b><br/><i>[Person]</i><br/>Abre O.S., registra orçamento e acompanha execução"]:::person
    M["👤 <b>Mecânico</b><br/><i>[Person]</i><br/>Registra diagnósticos e peças utilizadas"]:::person
    E["👤 <b>Estoquista</b><br/><i>[Person]</i><br/>Controla entrada, saída e saldo de materiais"]:::person

    %% Sistema Externo
    F["🏭 <b>Sistema do Fornecedor</b><br/><i>[Software System]</i><br/>Catálogo, cotação e compra de peças"]:::extSystem

    %% Fronteira do Sistema
    subgraph SB["🏢 Sistema da Oficina Mecânica"]
        direction TB
        API["⚙️ <b>API Oficina</b><br/><i>[Container: Backend Application]</i><br/><b>Tecnologias:</b> Node.js, TypeScript, NestJS, Prisma ORM<br/>Expõe APIs para O.S., clientes, materiais, catálogos e pedidos"]:::container
        DB[("🗄️ <b>Banco de Dados</b><br/><i>[Container: Database]</i><br/><b>Tecnologias:</b> PostgreSQL<br/>Armazena dados de clientes, ordens, materiais, serviços e identidade")]:::database
    end
    class SB systemBoundary

    %% Relacionamentos das Personas com o Container de Aplicação
    C -->|"HTTPS + REST/JSON (Web/App)"| API
    A -->|"HTTPS + REST/JSON (Web)"| API
    M -->|"HTTPS + REST/JSON (Web)"| API
    E -->|"HTTPS + REST/JSON (Web)"| API

    %% Relacionamentos entre Containers e Sistemas Externos
    API -->|"Prisma ORM -> SQL/TCP 5432 (PostgreSQL)"| DB
    API -->|"HTTPS + REST/JSON"| F
```

## Nível 3 - Components

```mermaid
graph TD
    %% Estilos visuais
    classDef person fill:#084298,stroke:#052c65,stroke-width:2px,color:#ffffff,rx:10px,ry:10px;
    classDef systemBoundary fill:#e7f1ff,stroke:#0b4884,stroke-width:2px,color:#052c65,rx:10px,ry:10px;
    classDef container fill:#1168bd,stroke:#0b4884,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;
    classDef component fill:#1f78d1,stroke:#0b4884,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;
    classDef sharedKernel fill:#0d5ca6,stroke:#083b6c,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;
    classDef infra fill:#0a4f92,stroke:#063867,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;
    classDef database fill:#0b4884,stroke:#052c65,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;
    classDef extSystem fill:#999999,stroke:#666666,stroke-width:2px,color:#ffffff,rx:8px,ry:8px;

    %% Personas
    C["👤 <b>Cliente</b><br/><i>[Person]</i>"]:::person
    A["👤 <b>Atendente</b><br/><i>[Person]</i>"]:::person
    M["👤 <b>Mecânico</b><br/><i>[Person]</i>"]:::person
    E["👤 <b>Estoquista</b><br/><i>[Person]</i>"]:::person

    %% Sistemas externos e persistência
    F["🏭 <b>Sistema do Fornecedor</b><br/><i>[Software System]</i><br/>Catálogo, cotação e compra de peças"]:::extSystem
    DB[("🗄️ <b>PostgreSQL</b><br/><i>[Container: Database]</i><br/>Persistência transacional dos contextos")]:::database

    %% Fronteira do sistema e container em foco
    subgraph SB["🏢 Sistema da Oficina Mecânica"]
        direction TB
        subgraph APIB["⚙️ API Oficina [Container: Node.js + TypeScript + NestJS]"]
            direction TB

            AI["🔐 <b>access-identity</b><br/><i>[Component / Feature Module]</i><br/>Autenticação, autorização e identidade"]:::component
            CM["👥 <b>customer-management</b><br/><i>[Component / Feature Module]</i><br/>Cadastro e gestão de clientes"]:::component
            MT["📦 <b>materials</b><br/><i>[Component / Feature Module]</i><br/>Estoque, itens e movimentações"]:::component
            SO["🧾 <b>service-orders</b><br/><i>[Component / Feature Module]</i><br/>Ordem de serviço, diagnóstico e execução"]:::component

            SK["🧩 <b>common</b><br/><i>[Shared Kernel Component]</i><br/>Contratos, utilitários, cross-cutting e padrões comuns"]:::sharedKernel
            PM["🛠️ <b>Prisma Module</b><br/><i>[Infrastructure Component]</i><br/>Acesso a dados via Prisma ORM"]:::infra
        end
    end
    class SB systemBoundary
    class APIB container

    %% Entrada dos usuários no container
    C -->|"HTTPS + REST/JSON"| SO
    A -->|"HTTPS + REST/JSON"| SO
    M -->|"HTTPS + REST/JSON"| SO
    E -->|"HTTPS + REST/JSON"| MT

    %% Relações diretas entre módulos funcionais
    CM -. "In-process call" .-> AI
    MT -. "In-process call" .-> AI
    SO -. "In-process call" .-> AI
    SO -. "In-process call" .-> CM
    SO -. "In-process call" .-> MT

    %% Dependência do Shared Kernel (common)
    AI -->|"In-process (imports/contracts)"| SK
    CM -->|"In-process (imports/contracts)"| SK
    MT -->|"In-process (imports/contracts)"| SK
    SO -->|"In-process (imports/contracts)"| SK

    %% Acesso a dados (Prisma Module)
    AI -->|"Prisma Client (in-process)"| PM
    CM -->|"Prisma Client (in-process)"| PM
    MT -->|"Prisma Client (in-process)"| PM
    SO -->|"Prisma Client (in-process)"| PM
    PM -->|"SQL/TCP 5432 (PostgreSQL)"| DB

    %% Integração Externa (Apenas materials)
    MT -->|"HTTPS + REST/JSON"| F
```