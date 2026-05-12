# Tráfego Automator

Plataforma de automação operacional para gestão de tráfego pago, com foco inicial no caso **Dental Leads**: empresa odontológica com clínicas em múltiplos estados, uma conta Meta Ads central e uma planilha literal que precisa ser preenchida diariamente para prestação do serviço.

---

## Gate atual de qualidade

Antes de conectar Meta Ads, Google Sheets e WhatsApp em produção, o projeto deve concluir Q1 e Q2.

- **Q1 — Fundação de Qualidade, Segurança e Testes**: implementado parcialmente e validado localmente.
- **Q2 — Persistência Local**: implementação inicial adicionada com SQLite local e fallback seguro.

Enquanto Q1/Q2 não forem validados também em CI/deploy, integrações reais devem ser tratadas como **staging/controladas**, não produção.

---

## Q1 implementado

- Token Meta migrado para header `Authorization: Bearer <token>`.
- Retry controlado para Meta API em 408, 429, 5xx e timeouts.
- Jest adicionado com `npm test`.
- Testes unitários para `metrics.js`.
- Testes unitários para `analyzer.js`.
- Testes para segurança do `MetaAdsClient`.
- Testes para validação/rate limit HTTP.
- GitHub Actions CI com `npm run check` e `npm test`.
- Headers de segurança no servidor HTTP e na função serverless.
- Rate limit básico para APIs públicas e operacionais.
- Token operacional obrigatório para POSTs sensíveis.
- Validação de payloads em `/api/tasks/run`, `/api/alerts/send-demo` e ações simuladas.

---

## Q2 implementado inicialmente

- Dependência `better-sqlite3` adicionada.
- Fundação SQLite em `src/database/db.js`.
- Repositórios em `src/database/repositories.js`.
- Tabelas criadas automaticamente:
  - `notifications`
  - `whatsapp_replies`
  - `job_runs`
  - `job_run_steps`
  - `unit_run_results`
- `notificationCenter.js` agora persiste notificações e respostas WhatsApp quando SQLite está disponível.
- `taskRunner.js` agora persiste execuções e etapas quando SQLite está disponível.
- `dentalSheetFill.js` agora persiste resultados por clínica/unidade quando SQLite está disponível.
- Banco local ignorado pelo Git em `/data/local/` e arquivos `*.db`, `*.db-wal`, `*.db-shm`.
- Testes de repositórios SQLite adicionados.

### Configuração SQLite

Por padrão, o SQLite usa:

```text
data/local/app.db
```

Para alterar:

```env
SQLITE_PATH=E:/danz/data/local/app.db
```

Para desativar a persistência local:

```env
SQLITE_ENABLED=false
```

Se o ambiente não suportar `better-sqlite3`, o sistema não deve quebrar: ele registra aviso e usa fallback em memória.

---

## Decisão arquitetural atual

A planilha **Dental Leads** é o contrato principal da automação.

O sistema deve se adaptar ao layout da planilha, sem destruir formatação, fórmulas, totais, cabeçalhos ou organização visual do cliente.

No caso Dental atual, a estrutura correta é:

```text
Dental Leads
  -> uma conta Meta Ads central
  -> campanhas representam clínicas/unidades
  -> cada clínica é identificada por filtro de campanha
  -> Leads e Valor são escritos na coluna correta da planilha
```

Uma clínica não precisa ter uma conta de anúncio própria. Ela pode ser uma unidade operacional dentro da mesma conta Meta, identificada por nome ou ID de campanha.

---

## Estado atual

### Implementado

- Dashboard demo e API mock.
- Cliente Meta Ads estruturado para insights reais com autenticação Bearer segura.
- Cliente Google Sheets estruturado para escrita em planilhas.
- Empresa `Dental Leads` em `data/companies/dental-leads.json`.
- Clínicas SP e Bahia em:
  - `data/clients/servicos/odontologia/sp/dental-leads-sp.json`
  - `data/clients/servicos/odontologia/ba/dental-leads-ba.json`
- M1 Registry funcional via CLI.
- M2 Dental Sheet funcional via CLI/dry-run.
- Q1 segurança/testes implementado parcialmente.
- Q2 persistência local implementado inicialmente.

### Pendente para produção

- Validar CI remoto após Q2.
- Validar comportamento do SQLite no ambiente de deploy.
- Informar o `act_...` real da conta Meta central.
- Configurar `META_ACCESS_TOKEN`.
- Configurar Service Account Google Sheets.
- Validar leitura real do Meta Ads em staging.
- Validar escrita real na planilha em staging.
- Criar WhatsApp API real.
- Criar login, painel Admin e contas somente leitura.
- Definir banco cloud definitivo para produção se Vercel serverless não atender persistência local.

---

## Comandos principais

Instalar dependências:

```bash
npm install
```

Validar sintaxe:

```bash
npm run check
```

Rodar testes:

```bash
npm test
```

Rodar dashboard demo:

```bash
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

Em desenvolvimento, é possível liberar temporariamente sem token com:

```env
ALLOW_UNAUTHENTICATED_DEV_TASKS=true
```

Não use isso em produção.

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

Dry-run geral:

```bash
npm run dental:fill:dry -- --since 2026-05-01 --until 2026-05-11
```

Dry-run por estado:

```bash
npm run dental:fill:dry -- --state SP --since 2026-05-01 --until 2026-05-11
npm run dental:fill:dry -- --state BA --since 2026-05-01 --until 2026-05-11
```

Execução real controlada:

```bash
npm run dental:fill -- --state SP --since 2026-05-01 --until 2026-05-11
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
  local/                 # ignorado pelo Git, usado pelo SQLite local

docs/
  PMBOK_PROJECT_MANAGEMENT_PLAN.md
  FUNCTIONAL_REQUIREMENTS.md
  SYSTEM_ARCHITECTURE_UML.md
  ROADMAP.md
  DENTAL_SHARED_META_UML.md
  M1_CLIENT_REGISTRY_MODULE.md
  M2_DENTAL_SHEET_AUTOMATION_SPEC.md

src/
  config/
  database/
    db.js
    repositories.js
    __tests__/
  domain/
  jobs/
  security/
  services/
  utils/
.github/
  workflows/
    ci.yml
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
3. **M1 Registry** — funcional via JSON/CLI.
4. **M2 Dental Sheet literal** — funcional via JSON/CLI e dry-run.
5. **M3 Métricas detalhadas** — próximo após validação Q2.
6. **M4 WhatsApp API** — após Q2 validado.
7. **M5 Painel Admin/Cliente**.
8. **M6 Módulos Admin avançados**.
