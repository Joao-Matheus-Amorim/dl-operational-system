# Tráfego Automator

Web service responsivo para gestão e automação de tráfego pago com foco inicial em **Dental Lead** e **Óticas do Tiago**.

O projeto nasceu como automação de planilha/Meta Ads, mas evoluiu para um MVP de produto: dashboard mobile-first, API interna, métricas por cliente, campanhas, conjuntos, criativos, alertas e notificações WhatsApp em modo mock. As integrações reais com Meta Ads, Google Sheets e Z-API ficam isoladas para serem plugadas por último, quando as credenciais estiverem disponíveis.

---

## Visão do produto

O sistema foi desenhado para resolver uma dor clara de gestão de tráfego:

- planilhas manuais;
- saldo de conta acabando sem aviso;
- CPL alto percebido tarde;
- criativos gastando sem gerar leads;
- falta de visão consolidada por cliente/campanha;
- demora para decidir se pausa, mantém ou testa um criativo isolado.

A proposta é transformar isso em um painel e automação operacional:

1. Coletar métricas da Meta Ads.
2. Preencher planilhas quando necessário.
3. Exibir dashboard por cliente.
4. Classificar campanhas/conjuntos/criativos.
5. Gerar alertas em tempo real.
6. Enviar WhatsApp para o gestor/cliente.
7. Permitir decisão: pausar, criar campanha teste isolada ou manter rodando.

---

## Estado atual

### Já funciona agora, sem API real

- Web dashboard responsivo em `http://localhost:3000`.
- API interna com dados demo.
- Clientes mockados:
  - Dental Lead;
  - Ótica 1;
  - Ótica 2;
  - visão consolidada.
- KPIs no painel:
  - gasto;
  - leads;
  - CPL;
  - CTR;
  - ROI;
  - valor total.
- Listagem de campanhas.
- Listagem de conjuntos.
- Listagem de criativos.
- Alertas ativos.
- Simulação de WhatsApp em tempo real.
- Registro de notificações em memória.
- Botões de ação simulados:
  - pausar criativo;
  - criar campanha teste isolada;
  - enviar alerta demo.
- Jobs CLI em modo `dry-run`, sem chamar Meta API real.

### Parcialmente pronto

- Cliente Meta Ads (`MetaAdsClient`) já estruturado para buscar insights reais.
- Cliente Google Sheets (`GoogleSheetsClient`) já estruturado para escrever planilhas.
- Motor de análise de criativos/campanhas já estruturado.
- Regras de CPL, saldo, CTR, gasto mínimo e destaque já configuráveis.
- Scheduler já criado para rotinas automáticas.
- Dental Lead em modo `sheet_only`, preparado para preencher planilha sem mexer em dashboard completo.
- Ótica 1 e Ótica 2 em modo `meta_full`, preparados para fluxo completo.

### Ainda não faz em produção

- Não busca dados reais da Meta no dashboard web ainda.
- Não envia WhatsApp real enquanto Z-API não for configurada.
- Não pausa anúncios reais ainda pelo dashboard.
- Não cria campanha real isolada ainda pelo dashboard.
- Não tem banco de dados persistente.
- Não tem login/autenticação.
- Não tem painel visual para cadastrar novas empresas/regras.
- Não tem webhook real de resposta do WhatsApp.
- Não está deployado em produção.

---

## Como rodar

Instale dependências:

```bash
npm install
```

Valide sintaxe dos arquivos principais:

```bash
npm run check
```

Suba o dashboard web:

```bash
npm start
```

ou:

```bash
npm run web
```

Abra:

```text
http://localhost:3000
```

---

## Comandos principais

### Web service

```bash
npm start       # sobe o dashboard web
npm run web     # alias do dashboard web
npm run web:dev # alias de desenvolvimento
```

### Jobs e automações

```bash
npm run dry             # roda fluxo completo em dry-run
npm run job:run         # roda fluxo real, exige .env real
npm run sync            # sincroniza Meta Ads -> Sheets para clientes meta
npm run dashboard       # gera dashboard no Sheets para clientes meta
npm run analyze         # analisa campanhas/criativos
npm run criativos       # alias de análise de criativos
npm run criativos:dry   # análise em dry-run
npm run alerts          # verifica alertas
npm run alertas         # alias em português
```

### Preenchimento de planilhas

```bash
npm run fill:dental # Dental Lead em modo sheet_only
npm run fill:oticas # Ótica 1 e Ótica 2
npm run fill:todos  # todos os clientes
```

### Scheduler

```bash
npm run scheduler
npm run schedule
```

---

## API interna atual

### Health

```http
GET /api/health
```

### Clientes

```http
GET /api/clients
```

### Dashboard

```http
GET /api/dashboard?client=all
GET /api/dashboard?client=dental
GET /api/dashboard?client=otica1
GET /api/dashboard?client=otica2
```

### Campanhas, conjuntos e criativos

```http
GET /api/campaigns?client=all
GET /api/adsets?client=all
GET /api/creatives?client=all
```

### Alertas

```http
GET /api/alerts?client=all
GET /api/notifications
```

### Simulação de alerta WhatsApp

```http
POST /api/alerts/send-demo
```

Exemplo PowerShell:

```powershell
curl.exe -X POST "http://localhost:3000/api/alerts/send-demo" -H "Content-Type: application/json" -d '{"client":"Ótica 2","message":"Criativo gastou R$140 sem gerar leads. Recomenda-se pausar."}'
```

### Ações simuladas

```http
POST /api/actions/pause-creative
POST /api/actions/test-campaign
```

Hoje essas ações registram notificação e simulam o fluxo. No futuro, elas chamarão a Meta Ads API.

---

## Estrutura do projeto

```txt
trafego-automator/
├─ public/
│  └─ index.html                  # dashboard responsivo/mobile-first
├─ src/
│  ├─ config/
│  │  ├─ clients.js               # clientes base + extra clients via JSON
│  │  └─ rules.js                 # regras de CPL, saldo, CTR, gasto etc.
│  ├─ domain/
│  │  ├─ analyzer.js              # classificação de campanhas/criativos
│  │  └─ metrics.js               # normalização e cálculo de métricas
│  ├─ jobs/
│  │  ├─ analyzeCampaigns.js      # análise + alertas + ações opcionais
│  │  ├─ buildDashboard.js        # geração de KPIs no Sheets
│  │  ├─ checkAlerts.js           # saldo/status de conta
│  │  ├─ fillSheetOnly.js         # preenchimento de planilha Dental/sheet_only
│  │  └─ syncSheets.js            # Meta Ads -> Sheets
│  ├─ services/
│  │  ├─ alerts.js                # alertas legados/WhatsApp opcional
│  │  ├─ googleSheets.js          # integração Google Sheets
│  │  ├─ metaActions.js           # pausa/campanha teste via Meta
│  │  ├─ metaAds.js               # leitura Meta Ads API
│  │  └─ notificationCenter.js    # notificações mock/WhatsApp mock
│  ├─ utils/
│  │  ├─ cli.js
│  │  ├─ date.js
│  │  └─ logger.js
│  ├─ web/
│  │  ├─ mockData.js              # dados demo do dashboard
│  │  └─ server.js                # servidor HTTP/API
│  └─ index.js                    # CLI/jobs
├─ docs/
│  └─ ARCHITECTURE_UML.md         # UML, arquitetura e roadmap
├─ scheduler.js
├─ package.json
└─ README.md
```

---

## Configuração futura via `.env`

As variáveis reais ficam para a última fase.

### Meta Ads

```env
META_ACCESS_TOKEN=EAAB...
META_API_VERSION=v19.0
OTICA1_AD_ACCOUNT_ID=act_123456789012345
OTICA2_AD_ACCOUNT_ID=act_987654321098765
```

### Google Sheets

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID_TIAGO=1xglEDDEf7ZIwx_dFnHuL_i9ZPC15vpXAz9Tlscsz3V0
```

### Dental Lead

```env
DENTAL_SHEET_ID=1xglEDDEf7ZIwx_dFnHuL_i9ZPC15vpXAz9Tlscsz3V0
DENTAL_SHEET_GID=498302069
DENTAL_WRITE_CPL=false
DENTAL_AD_ACCOUNTS_JSON={"Pimentas":"act_123456789012345","Guarulhos Nazaré":"act_987654321098765"}
```

### WhatsApp/Z-API

```env
WHATSAPP_PROVIDER=zapi
ZAPI_INSTANCE_ID=...
ZAPI_TOKEN=...
ZAPI_CLIENT_TOKEN=...
WHATSAPP_TO=5521999999999
```

Enquanto essas variáveis não existirem, o sistema continua apresentável via mock.

---

## Regras de análise

Configuráveis no `.env`:

```env
ALERT_BALANCE_MIN_BRL=50
ALERT_CPL_MAX_BRL=30
MIN_SPEND_TO_EVALUATE_BRL=20
MAX_SPEND_WITHOUT_LEAD_BRL=40
MIN_IMPRESSIONS_TO_EVALUATE=500
MIN_CTR_GOOD=1.0
MIN_LEADS_FOR_WINNER=5
GOOD_CPL_BRL=20
```

O motor classifica criativos/campanhas em estados como:

- `OK`;
- `DESTAQUE`;
- `CPL_ALTO`;
- `CTR_BAIXO`;
- `SEM_GASTO`;
- `SEM_LEAD_COM_GASTO`.

---

## Segurança das automações

Por padrão, o sistema deve operar em modo seguro:

```env
ACTION_MODE=notify
AUTO_PAUSE_ENABLED=false
```

Para permitir pausa automática real no futuro:

```env
ACTION_MODE=auto_pause
AUTO_PAUSE_ENABLED=true
```

Mesmo assim, a recomendação é manter logs, confirmação e auditoria antes de executar ações reais em contas de anúncio.

---

## UML e roadmap

Veja o arquivo:

```text
docs/ARCHITECTURE_UML.md
```

Ele contém:

- arquitetura atual do MVP;
- arquitetura alvo de produção;
- sequência de alerta mock;
- sequência futura com WhatsApp real;
- modelo conceitual de domínio;
- roadmap técnico.

---

## Roadmap sugerido

1. Finalizar demo visual e fluxo mock.
2. Adicionar persistência local/banco para métricas e notificações.
3. Conectar dashboard aos jobs internos, ainda sem Meta real.
4. Plugar Meta Ads API real.
5. Plugar Google Sheets real.
6. Plugar WhatsApp/Z-API real.
7. Criar webhook de resposta do WhatsApp.
8. Transformar botões simulados em ações reais com confirmação.
9. Adicionar login e multiusuário.
10. Fazer deploy em produção.

---

## Status resumido

```txt
MVP visual: pronto
API mock: pronta
Alertas mock: prontos
WhatsApp mock: pronto
Jobs Meta/Sheets: base pronta
Integrações reais: pendentes por falta de credenciais
Banco/login/deploy: próximos passos
```
