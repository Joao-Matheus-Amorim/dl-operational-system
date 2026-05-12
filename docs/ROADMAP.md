# Roadmap de Implementação — Tráfego Automator

Este roadmap deve ser atualizado a cada bloco de construção completo.

---

## Regra de prioridade atual

Antes de conectar Meta Ads, Google Sheets e WhatsApp em produção, o projeto deve passar por:

1. **Q1 — Fundação de Qualidade, Segurança e Testes**.
2. **Q2 — Persistência Local e Histórico Operacional**.

Nenhuma integração real deve ser considerada produção enquanto os critérios de segurança, testes, CI/CD e persistência mínima não forem validados.

---

## Estado atual do roadmap

| Marco | Nome | Status | Objetivo |
|---|---|---|---|
| Q1 | Fundação de Qualidade, Segurança e Testes | Implementado parcialmente e validado localmente | Segurança, testes, CI/CD, validação e resiliência antes das APIs reais |
| Q2 | Persistência Local | Implementação inicial adicionada | Persistir notificações, execuções e resultados por unidade em SQLite |
| M1 | Registry de empresas e clínicas | Em construção funcional | Cadastrar/importar empresas, estados, clínicas, módulos e escopos |
| M2 | Planilha Dental literal | Em construção funcional | Preencher Leads e Valor na planilha real do cliente |
| M3 | Métricas detalhadas | Próximo após validação Q2 | Criar abas auxiliares de campanhas, conjuntos, criativos e logs |
| M4 | WhatsApp API | Após validação Q2 | Enviar mensagens e alertas conforme módulos habilitados |
| M5 | Painel Admin e Cliente | Pendente | Criar interface para gestão e contas somente leitura |
| M6 | Módulos Admin avançados | Pendente | Subir criativos, criar campanhas e pausar anúncios com aprovação |

---

## Q1 — Fundação de Qualidade, Segurança e Testes

### Status

Implementado parcialmente e validado localmente.

### Entregue

- `MetaAdsClient` usa `Authorization: Bearer <token>`.
- Retry controlado para Meta API.
- Jest configurado.
- `npm test` criado.
- Testes de `metrics.js`.
- Testes de `analyzer.js`.
- Testes do `MetaAdsClient`.
- Testes de validação/rate limit HTTP.
- GitHub Actions CI criado.
- Headers de segurança no servidor e na função serverless.
- Rate limiting básico.
- Proteção de endpoints operacionais por `OPERATIONAL_API_TOKEN`.
- Validação de payloads POST.

### Próximo refinamento Q1

- Confirmar CI remoto após Q2.
- Melhorar logging estruturado em jobs legados.

---

## Q2 — Persistência Local

### Status

Implementação inicial adicionada.

### Objetivo

Eliminar dependência exclusiva de memória para notificações, alertas e histórico de execuções.

### Entregue

- Dependência `better-sqlite3` adicionada.
- Fundação SQLite em `src/database/db.js`.
- Repositórios em `src/database/repositories.js`.
- Tabelas criadas automaticamente:
  - `notifications`;
  - `whatsapp_replies`;
  - `job_runs`;
  - `job_run_steps`;
  - `unit_run_results`.
- `notificationCenter.js` persiste notificações e respostas quando SQLite está disponível.
- `taskRunner.js` persiste execuções e steps quando SQLite está disponível.
- `dentalSheetFill.js` persiste resultados por clínica/unidade.
- `.gitignore` protege `/data/local/` e arquivos `.db`.
- Testes de repositório SQLite adicionados.

### Decisão técnica

A persistência local usa SQLite como primeira camada, com fallback seguro se o ambiente não suportar `better-sqlite3`.

### Próximos itens Q2

- Validar `npm install`, `npm run check` e `npm test` localmente após dependência nativa.
- Confirmar deploy/CI com `better-sqlite3`.
- Criar endpoint administrativo para consultar `unit_run_results`.
- Criar limpeza/rotação de histórico antigo.
- Avaliar banco cloud definitivo para produção em Vercel, como Supabase/Postgres.

---

## M1 — Registry de empresas e clínicas

### Status

Implementado parcialmente e funcional via CLI.

### Entregue

- Empresa `Dental Leads` em `data/companies/dental-leads.json`.
- Clínicas de SP em `data/clients/servicos/odontologia/sp/dental-leads-sp.json`.
- Clínicas da Bahia em `data/clients/servicos/odontologia/ba/dental-leads-ba.json`.
- Loader de empresas.
- Loader de clínicas.
- Filtro por empresa, grupo, segmento, estado, cidade e módulo.
- Validação de registry.
- Derivação automática de colunas da planilha.

### Próximos itens do M1

- Criar importação CSV/JSON em massa.
- Criar exportação do registry consolidado.
- Adicionar validação de duplicidade de `key`.
- Adicionar validação de conflito de colunas.
- Permitir herança da conta Meta central diretamente da empresa.

---

## M2 — Planilha Dental literal

### Status

Implementado parcialmente e funcional via CLI/dry-run.

### Entregue

- Job `src/jobs/dentalSheetFill.js`.
- Preenchimento cirúrgico de `Leads` e `Valor`.
- Preservação de `CPL`, totais, fórmulas e formatação.
- Suporte a dry-run.
- Suporte a conta Meta Ads central compartilhada.
- Filtro de campanhas por clínica via `campaignMatch`.
- Persistência de resultado por unidade em `unit_run_results`.

### Próximos itens do M2

- Substituir `act_PREENCHER_CONTA_CENTRAL` pelo ID real da conta central.
- Validar `META_ACCESS_TOKEN` real em staging.
- Validar Google Service Account real em staging.
- Rodar dry-run com uma data única.
- Rodar execução real controlada em uma ou duas clínicas.

---

## M3 — Métricas detalhadas

### Status

Próximo após validação Q2.

### Objetivo

Adicionar abas auxiliares sem alterar a planilha literal do cliente.

### Abas previstas

- `Campanhas`
- `Conjuntos`
- `Criativos`
- `Alertas`
- `Log Execuções`
- `Config`

---

## M4 — WhatsApp API

### Status

Após validação Q2.

### Objetivo

Enviar mensagens e alertas pelo WhatsApp conforme módulos habilitados.

### Mensagens iniciais

- Planilha atualizada.
- Erro de execução por clínica.
- Resumo diário.
- Resumo semanal.
- Alerta de CPL alto.
- Alerta de gasto sem lead.

---

## M5 — Painel Admin e Cliente

### Objetivo

Criar interface para gestão e visualização.

---

## M6 — Módulos Admin avançados

### Objetivo

Implementar ações operacionais avançadas para clientes com módulos habilitados.

---

## Regra de governança

Todo bloco completo deve atualizar:

1. `README.md`;
2. documento funcional/técnico em `docs/`;
3. documento UML/arquitetural quando houver mudança de fluxo ou entidade;
4. este `ROADMAP.md`.
