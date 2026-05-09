# Óticas do Tiago — Meta Ads + Google Sheets Agent

Repo pronto para preencher automaticamente a planilha do Google Sheets com dados da Meta Ads das unidades **Ótica 1** e **Ótica 2**, gerar dashboard separado por cliente/campanha, calcular métricas e enviar alertas de performance.

Planilha alvo configurada por padrão:

`1xglEDDEf7ZIwx_dFnHuL_i9ZPC15vpXAz9Tlscsz3V0`

## O que ele faz

- Preenche abas automáticas no Google Sheets por unidade:
  - `Ótica 1 - Dashboard`
  - `Ótica 1 - Campanhas`
  - `Ótica 1 - Conjuntos`
  - `Ótica 1 - Criativos`
  - `Ótica 1 - Alertas`
  - o mesmo para `Ótica 2`
- Calcula **ROI**, **CPL**, **CTR**, **valor gasto**, **valor total estimado**, leads, impressões e cliques.
- Analisa Meta Ads em 3 níveis:
  - campanha
  - conjunto
  - criativo/anúncio
- Detecta automaticamente:
  - saldo finalizando
  - CPL alto
  - criativo sem gasto
  - criativo com gasto e sem lead
  - campanha/conjunto desperdiçando verba
  - criativo destaque para possível escala
- Por segurança, o padrão é **só alertar**. Para pausar anúncios automaticamente, precisa ativar no `.env`.

## Estrutura

```txt
oticas-tiago-meta-agent/
├─ src/
│  ├─ config/
│  │  ├─ clients.js
│  │  └─ rules.js
│  ├─ domain/
│  │  ├─ analyzer.js
│  │  └─ metrics.js
│  ├─ jobs/
│  │  ├─ analyzeCampaigns.js
│  │  ├─ buildDashboard.js
│  │  ├─ checkAlerts.js
│  │  └─ syncSheets.js
│  ├─ services/
│  │  ├─ alerts.js
│  │  ├─ googleSheets.js
│  │  ├─ metaActions.js
│  │  └─ metaAds.js
│  ├─ utils/
│  │  ├─ cli.js
│  │  ├─ date.js
│  │  └─ logger.js
│  └─ index.js
├─ docs/
├─ scripts/
├─ scheduler.js
├─ package.json
└─ .env.example
```

## Instalação

```bash
npm install
cp .env.example .env
```

No Windows PowerShell:

```powershell
copy .env.example .env
```

Depois preencha no `.env`:

```env
META_ACCESS_TOKEN=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
OTICA1_AD_ACCOUNT_ID=act_123
OTICA2_AD_ACCOUNT_ID=act_456
```

A planilha precisa estar compartilhada com o e-mail da Service Account como **Editor**.

## Comandos

```bash
npm run validate       # testa Meta API e Google Sheets
npm run dry            # simula tudo sem escrever/pausar nada
npm run sync           # coleta campanhas/conjuntos/criativos e grava no Sheets
npm run dashboard      # reconstrói dashboard no Sheets
npm run analyze        # analisa performance e gera alertas/recomendações
npm run alerts         # verifica saldo e CPL alto
npm start              # sync + dashboard + análise + alertas
npm run scheduler      # agenda execuções automáticas
```

Executar só uma unidade:

```bash
npm run otica1
npm run otica2
```

Executar período específico:

```bash
node src/index.js run --client otica1 --since 2026-05-01 --until 2026-05-09
```

## Automação de pausa de criativos

Por padrão, o sistema **não pausa nada**. Ele apenas gera alerta.

Para permitir pausa automática quando o criativo gastar muito sem lead ou tiver CPL alto:

```env
ACTION_MODE=auto_pause
AUTO_PAUSE_ENABLED=true
```

Mesmo assim, a pausa só acontece para anúncios classificados como:

- `SEM_LEAD_COM_GASTO`
- `CPL_ALTO`

Criativo sem gasto recebe alerta, mas não é pausado automaticamente.

## Regras principais

Configure no `.env`:

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

## Publicar no GitHub

Com GitHub CLI instalado:

```bash
gh auth login
gh repo create Joao-Matheus-Amorim/oticas-tiago-meta-agent --private --source . --remote origin --push
```

Ou use o script:

```powershell
./scripts/publish-to-github.ps1 -Owner Joao-Matheus-Amorim -Repo oticas-tiago-meta-agent -Private
```

## Observação importante sobre ROI

A Meta Ads normalmente traz custo, cliques e leads. ROI real exige receita/venda. Este repo calcula:

- `valor_gasto`: gasto real da Meta
- `valor_total_estimado`: `leads × LEAD_VALUE`, se você definir `OTICA1_LEAD_VALUE` e `OTICA2_LEAD_VALUE`
- `roi_percentual`: baseado no valor estimado

Se você integrar vendas reais depois, basta substituir `leadValue` por receita real vinda do CRM/planilha.
