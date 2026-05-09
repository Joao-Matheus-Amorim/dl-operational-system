# Arquitetura UML — Tráfego Automator

Este documento mostra o estado atual do projeto e o caminho de evolução para produto real com Meta Ads, Google Sheets, WhatsApp e dashboard em tempo real.

## 1. Estado atual — MVP demonstrável sem APIs reais

```mermaid
flowchart TD
  User[Gestor / Cliente] --> Browser[Dashboard Web Mobile-first]
  Browser --> Server[Node HTTP Server\nsrc/web/server.js]

  Server --> MockData[mockData.js\nDados demo]
  Server --> NotificationCenter[notificationCenter.js\nNotificações em memória]

  Server --> APIClients[GET /api/clients]
  Server --> APIDashboard[GET /api/dashboard]
  Server --> APICampaigns[GET /api/campaigns]
  Server --> APIAdsets[GET /api/adsets]
  Server --> APICreatives[GET /api/creatives]
  Server --> APIAlerts[GET /api/alerts]
  Server --> APINotifications[GET /api/notifications]

  Browser --> SendDemo[POST /api/alerts/send-demo]
  SendDemo --> NotificationCenter
  NotificationCenter --> MockWhatsApp[WhatsApp Mock\nprovider=mock]
  NotificationCenter --> APINotifications

  CLI[Jobs CLI\nsrc/index.js] --> MetaAdsClient[MetaAdsClient\ndry-run seguro]
  CLI --> GoogleSheetsClient[GoogleSheetsClient]
  CLI --> Analyzer[Analyzer\nCPL, CTR, ROI, status]
```

## 2. Arquitetura alvo — produto completo em produção

```mermaid
flowchart TD
  subgraph Frontend
    WebApp[Dashboard responsivo\nMobile + Desktop]
    ClientConfig[Tela de configuração\nclientes, limites, regras]
  end

  subgraph Backend
    Api[API HTTP/REST]
    Auth[Autenticação e permissões]
    Scheduler[Scheduler / Worker]
    Analyzer[Motor de análise]
    NotificationService[Serviço de notificações]
    ActionService[Serviço de ações Meta]
  end

  subgraph Data
    DB[(Banco de dados\nclientes, métricas, alertas, decisões)]
    Sheets[(Google Sheets\nplanilhas do cliente)]
    Logs[(Logs e auditoria)]
  end

  subgraph Integrations
    Meta[Meta Ads API]
    WhatsApp[Z-API / WhatsApp]
  end

  WebApp --> Api
  ClientConfig --> Api
  Api --> Auth
  Api --> DB
  Api --> Analyzer
  Api --> NotificationService
  Api --> ActionService

  Scheduler --> Meta
  Scheduler --> Analyzer
  Analyzer --> DB
  Analyzer --> Sheets
  Analyzer --> NotificationService
  NotificationService --> WhatsApp
  WhatsApp --> Api
  ActionService --> Meta
  Api --> Logs
```

## 3. Sequência atual — alerta em tempo real mock

```mermaid
sequenceDiagram
  participant U as Usuário
  participant W as Dashboard Web
  participant A as API Node
  participant N as NotificationCenter
  participant M as WhatsApp Mock

  U->>W: Clica em Enviar alerta
  W->>A: POST /api/alerts/send-demo
  A->>N: createNotification()
  N->>M: dispatchWhatsapp(provider=mock)
  M-->>N: mock_sent
  N-->>A: notification + delivery
  A-->>W: JSON de confirmação
  W->>A: GET /api/notifications
  A-->>W: lista de notificações
  W-->>U: Mostra alerta na tela
```

## 4. Sequência futura — alerta real + decisão pelo WhatsApp

```mermaid
sequenceDiagram
  participant S as Scheduler
  participant Meta as Meta Ads API
  participant An as Analyzer
  participant DB as Banco de dados
  participant N as NotificationService
  participant WA as WhatsApp / Z-API
  participant User as Gestor
  participant Act as MetaActions

  S->>Meta: Buscar insights campanhas/conjuntos/criativos
  Meta-->>S: métricas reais
  S->>An: Analisar CPL, CTR, gasto, leads, ROI
  An->>DB: Salvar snapshot e diagnóstico
  An->>N: Criar alerta crítico
  N->>WA: Enviar mensagem com opções 1/2/3
  WA->>User: Entrega alerta no WhatsApp
  User->>WA: Responde 1, 2 ou 3
  WA->>N: Webhook de resposta
  N->>DB: Salvar decisão

  alt Resposta 1 - pausar
    N->>Act: Pausar criativo
    Act->>Meta: status=PAUSED
  else Resposta 2 - testar isolado
    N->>Act: Criar campanha isolada pausada
    Act->>Meta: create campaign/copy adset
  else Resposta 3 - manter
    N->>DB: Marcar como manter rodando
  end
```

## 5. Modelo conceitual de domínio

```mermaid
classDiagram
  class Client {
    +key
    +name
    +mode
    +spreadsheetId
    +adAccountId
    +rules
  }

  class Campaign {
    +id
    +name
    +objective
    +spend
    +leads
    +cpl
    +ctr
    +roi
    +status
  }

  class AdSet {
    +id
    +campaignId
    +name
    +spend
    +leads
    +cpl
    +ctr
    +status
  }

  class Creative {
    +id
    +adSetId
    +name
    +spend
    +leads
    +cpl
    +ctr
    +statusAnalise
    +recommendation
  }

  class Alert {
    +id
    +clientId
    +type
    +severity
    +message
    +action
    +status
  }

  class Notification {
    +id
    +channel
    +provider
    +status
    +sentAt
    +message
  }

  class Decision {
    +id
    +notificationId
    +reply
    +interpretedAction
    +createdAt
  }

  Client "1" --> "many" Campaign
  Campaign "1" --> "many" AdSet
  AdSet "1" --> "many" Creative
  Creative "1" --> "many" Alert
  Alert "1" --> "many" Notification
  Notification "1" --> "0..1" Decision
```

## 6. Roadmap técnico

```mermaid
flowchart LR
  A[Atual\nDashboard mock + endpoints + alertas mock] --> B[Integrar dados reais Meta Ads]
  B --> C[Persistir histórico em banco]
  C --> D[WhatsApp real via Z-API]
  D --> E[Webhook de resposta 1/2/3]
  E --> F[Ações reais Meta\npausar/criar campanha]
  F --> G[Login, permissões e multiempresa]
  G --> H[Deploy produção]
```

## 7. Priorização sugerida

1. Manter demo/mock funcionando para apresentação.
2. Ligar dashboard aos jobs internos, ainda sem banco.
3. Criar camada de persistência simples.
4. Plugar Meta Ads API real.
5. Plugar Z-API real.
6. Criar webhook de resposta do WhatsApp.
7. Ativar ações reais apenas com confirmação e logs.
