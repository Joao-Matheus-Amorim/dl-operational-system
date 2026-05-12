# Tráfego Automator

Plataforma de automação operacional para gestão de tráfego pago, com foco inicial no caso **Dental Leads**: empresa odontológica com clínicas em múltiplos estados, uma conta Meta Ads central e uma planilha literal que precisa ser preenchida diariamente para prestação do serviço.

---

## Gate atual de qualidade

Antes de conectar Meta Ads, Google Sheets e WhatsApp em produção, o projeto deve concluir Q1 e Q2.

- **Q1 — Fundação de Qualidade, Segurança e Testes**: implementado parcialmente e validado localmente.
- **Q2 — Persistência Local**: implementação inicial adicionada com SQLite local e fallback seguro.
- **Fases Operacionais 1 e 2**: resolução de período e aba por data/estado implementadas inicialmente.
- **Data operacional do cliente**: o período padrão usa o fuso configurado da empresa, não o fuso do servidor.

Enquanto Q1/Q2 não forem validados também em CI/deploy, integrações reais devem ser tratadas como **staging/controladas**, não produção.

---

## Q1 implementado

- Token Meta migrado para header `Authorization: Bearer <token>`.
- Retry controlado para Meta API em 408, 429, 5xx e timeouts.
- Jest adicionado com `npm test`.
- Testes unitários para `metrics.js` e `analyzer.js`.
- Testes para segurança do `MetaAdsClient` e HTTP.
- GitHub Actions CI com `npm run check` e `npm test`.
- Headers de segurança, rate limit e token operacional para POSTs sensíveis.

---

## Q2 implementado inicialmente

- SQLite local com `better-sqlite3`.
- Fundação em `src/database/db.js`.
- Repositórios em `src/database/repositories.js`.
- Tabelas: `notifications`, `whatsapp_replies`, `job_runs`, `job_run_steps`, `unit_run_results`.
- Notificações, task runs e resultados do Dental Fill persistem quando SQLite está disponível.
- Banco local ignorado pelo Git em `/data/local/` e arquivos `*.db`, `*.db-wal`, `*.db-shm`.

### Configuração SQLite

```env
SQLITE_PATH=E:/danz/data/local/app.db
SQLITE_ENABLED=true
```

Se o ambiente não suportar `better-sqlite3`, o sistema não deve quebrar: ele registra aviso e usa fallback em memória.

---

## Data operacional do cliente

Cada empresa pode ter fuso e modo padrão de data:

```json
{
  "timeZone": "America/Sao_Paulo",
  "defaultDateMode": "month-to-date"
}
```

Isso significa que, se o operador não passar data, o sistema usa a data real do cliente naquele fuso e busca o mês inteiro até essa data.

Exemplo: se a data real do cliente for `2026-05-12`, o padrão é:

```text
2026-05-01 até 2026-05-12
```

O operador ainda pode personalizar quando quiser:

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10
npm run dental:fill:dry -- --state SP --since 2026-05-01 --until 2026-05-06
npm run dental:fill:dry -- --state SP --pending-month
npm run dental:fill:dry -- --state SP --month-to-date
npm run dental:fill:dry -- --state SP --time-zone America/Sao_Paulo
```

---

## Decisão arquitetural atual

A planilha **Dental Leads** é o contrato principal da automação.

```text
Dental Leads
  -> uma conta Meta Ads central
  -> campanhas representam clínicas/unidades
  -> cada clínica é identificada por filtro de campanha
  -> Leads e Valor são escritos na coluna correta da planilha
```

A planilha possui múltiplas abas por estado/mês. O sistema deve resolver a aba correta pela data e pelo estado.

---

## Comandos principais

```bash
npm install
npm run check
npm test
npm start
```

---

## Segurança operacional HTTP

POSTs sensíveis exigem token operacional:

```env
OPERATIONAL_API_TOKEN=troque-este-token
```

Uso:

```bash
curl -X POST http://localhost:3000/api/tasks/run \
  -H "Authorization: Bearer $OPERATIONAL_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskKey":"full_cycle","real":false}'
```

---

## M1 — Registry de empresas e clínicas

```bash
npm run registry:list
npm run registry:list -- --state SP
npm run registry:list -- --state BA
npm run registry:validate
```

---

## M2 — Preenchimento literal Dental

### Modos de período

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10
npm run dental:fill:dry -- --state SP --today
npm run dental:fill:dry -- --state SP --pending-month
npm run dental:fill:dry -- --state SP --month-to-date
npm run dental:fill:dry -- --state SP --since 2026-05-01 --until 2026-05-11
```

### Campos personalizáveis

Padrão seguro:

```bash
--fields leads,value
```

Exemplos:

```bash
npm run dental:fill:dry -- --state SP --day 2026-05-10 --fields leads
npm run dental:fill:dry -- --state SP --day 2026-05-10 --fields leads,value
npm run dental:fill:dry -- --state SP --day 2026-05-10 --fields leads,value,cpl
```

O campo `cpl` só deve ser preenchido se for explicitamente solicitado, para preservar fórmulas da planilha.

### Modo de entrega

```bash
--delivery none
--delivery log
--delivery notify
--delivery approval
```

Por enquanto, o padrão operacional é:

```bash
--delivery none
```

---

## Conta Meta central compartilhada

Nos arquivos Dental, o estado usa uma conta central:

```json
{
  "meta": {
    "mode": "shared_ad_account",
    "adAccountId": "act_PREENCHER_CONTA_CENTRAL",
    "insightLevel": "campaign",
    "unitMatchField": "campaign_name"
  }
}
```

Cada clínica define como encontrar suas campanhas:

```json
{
  "key": "pimentas",
  "name": "Pimentas",
  "campaignMatch": {
    "contains": ["Pimentas"]
  }
}
```

---

## Estrutura atual

```text
data/
  companies/
    dental-leads.json
  clients/
    servicos/
      odontologia/
        sp/dental-leads-sp.json
        ba/dental-leads-ba.json
  local/

docs/
  ROADMAP.md
  OPERATIONAL_IMPLEMENTATION_PHASES.md
  DENTAL_SHARED_META_UML.md
  M1_CLIENT_REGISTRY_MODULE.md
  M2_DENTAL_SHEET_AUTOMATION_SPEC.md

src/
  config/
  database/
  domain/
    dateRangeResolver.js
    sheetResolver.js
  jobs/
  security/
  services/
  utils/
.github/
  workflows/ci.yml
```

---

## Governança documental

Cada bloco completo de construção deve atualizar:

1. `README.md`;
2. documento funcional/técnico correspondente em `docs/`;
3. UML específico quando houver mudança arquitetural;
4. `docs/ROADMAP.md`.

---

## Roadmap atualizado

1. **Q1 Fundação de Qualidade** — segurança e testes implementados parcialmente.
2. **Q2 Persistência Local** — implementação SQLite inicial adicionada.
3. **Fase 1/2 Operacional** — resolução de aba, período e fuso do cliente implementada inicialmente.
4. **Fase 3** — campos personalizáveis iniciados com `--fields`.
5. **Fase 5.2** — diagnóstico agrupado da conta central implementado.
6. **Fase 6** — endpoints de histórico.
7. **Fase 7** — teste real controlado.
