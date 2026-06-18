# Registro de Dívidas Técnicas — DL Operational System

> Toda escolha temporária do MVP está aqui. Nada de dívida silenciosa.
> Campos: Descrição · Motivo · Impacto · Prioridade · Plano de resolução · Fase.

---

### TD01 — Dados mockados em `lib/mock-data.ts`
- **Descrição:** parte do domínio ainda vem de constantes mockadas.
- **Motivo:** MVP foca em navegação/UX antes do banco.
- **Impacto:** clientes, boards, calendario, briefing mensal, campanhas,
  Drive/Documentos/Planilhas, Inbox e tarefas do Meu Painel ja persistem no
  Supabase; superficies auxiliares de tarefas/calendario/briefing ainda
  dependem de mock/fallback. O Dashboard e o Meu Painel consomem dados reais
  das superficies migradas.
- **Prioridade:** Alta.
- **Plano:** continuar a camada de repositórios sobre Supabase, mantendo fallback
  mock apenas durante a transicao de cada superficie. Leituras reais ja aplicam
  filtro explicito de workspace em complemento ao RLS.
- **Fase:** 2–3.

### TD02 — Autenticação simbólica (`/login`)
- **Descrição:** qualquer submit leva ao dashboard; sem sessão real.
- **Motivo:** Supabase Auth fora do escopo do MVP.
- **Impacto:** sem proteção de rotas nem identidade real.
- **Prioridade:** Alta.
- **Plano:** Supabase Auth client-side + guard de sessão foram implementados na
  Fase 2. Middleware/SSR pode entrar depois com `@supabase/ssr`.
- **Fase:** 2.

### TD03 — Dogtooth não chama a OpenAI (`lib/openai.ts`)
- **Descrição:** `askDogtooth` é um stub determinístico; ações não executam.
- **Motivo:** evitar chave/custos no MVP; manter contrato pronto.
- **Impacto:** chat não é inteligente; Construtor é catálogo visual.
- **Prioridade:** Média.
- **Plano:** rota server-side com `OPENAI_API_KEY` + execução das ações.
- **Fase:** 4.

### TD04 - Drive/Docs/Sheets sem integracao Google
- **Descricao:** listagens internas leem metadados do Supabase, mas editores
  ainda sao placeholders e dependem de fallback mock quando Supabase nao existe.
- **Motivo:** integracao Google (OAuth/embed) e grande e fora do MVP.
- **Impacto:** sem sincronizacao direta com Google nem edicao real embutida.
- **Prioridade:** Media.
- **Plano:** OAuth Google + APIs Drive/Docs/Sheets + embed.
- **Fase:** 5.

### TD05 - Inbox WhatsApp sem provedor real
- **Descricao:** conversas e mensagens leem Supabase, mas conexao por QR,
  webhooks e envio ainda sao simulados.
- **Motivo:** depende de provedor externo homologado.
- **Impacto:** nao envia nem recebe mensagens reais do WhatsApp.
- **Prioridade:** Media.
- **Plano:** Evolution API / Z-API / Baileys com abstracao de provider + webhooks.
- **Fase:** 5.

### TD06 - Meta Ads sem integracao real
- **Descricao:** metricas e tabela leem campanhas persistidas no Supabase; rota
  `app/api/meta/insights` ja existe e chama a Graph API real, mas falta plugar
  na UI (botao em Campanhas) e persistir o retorno via repositorio.
- **Motivo:** depende do `META_ACCESS_TOKEN`/conta de anuncio do cliente, que
  ainda nao foi recebido.
- **Impacto:** sem dados externos reais de performance ate ter o token; quando
  tiver, falta so ligar o botao e salvar o resultado.
- **Prioridade:** Media.
- **Plano:** configurar `META_ACCESS_TOKEN` (prod), chamar `POST
  /api/meta/insights` a partir de Campanhas e persistir via
  `lib/repositories/campaigns.ts`.
- **Fase:** 5.

### TD07 — Estado local volátil (modais, DnD, checklists)
- **Descrição:** algumas marcações de card ainda vivem só em estado React/mock.
- **Motivo:** sem persistência no MVP.
- **Impacto:** já persistem em Supabase: CRUD de clientes, tarefas do workspace,
  eventos de calendário (criar/editar/excluir), campanhas (status/saldo + excluir),
  quadros (criar/excluir) e cards (criar/editar título-descrição/excluir), ordem
  dos cards (DnD) e checklist mensal de briefing. Ainda não são duráveis: checklist,
  labels e responsável (assignee) de cards.
- **Prioridade:** Média.
- **Plano:** persistir os campos restantes do card (checklist/labels/assignee) via
  repositório quando entrarem em escopo.
- **Fase:** 3.

### TD08 — Trello não sincroniza
- **Descrição:** Trello -> DL ja importa board/listas/cards; DL -> Trello ja
  envia criacao/movimentacao de cards em listas importadas. Ainda nao ha criacao
  de boards/listas no Trello, webhooks, labels, membros e checklists completos.
- **Motivo:** fora do escopo do MVP.
- **Impacto:** o app consegue importar o board configurado e enviar alteracoes
  basicas de cards; detalhes avancados ainda ficam fora da sincronizacao.
- **Prioridade:** Baixa.
- **Plano:** completar API Trello com criacao de boards/listas, webhooks e
  mapeamento de labels/membros/checklists.
- **Fase:** 5.

### TD09 — Integrações reais portadas, falta ligar à UI (concluído nesta parte)
- **Descrição:** `lib/integrations/meta-ads.ts` e `google-sheets.ts` (portados de
  `danz`/legado) chamam as APIs reais (Graph API e Sheets v4) e são expostos via
  `app/api/meta/insights` e `app/api/sheets/export`, com validação de sessão e
  workspace igual ao padrão do Trello. Sem os tokens configurados, as rotas
  respondem `400` explicando o que falta — não quebram build/lint/typecheck.
- **Motivo:** as credenciais reais (Meta Ads, Google service account) dependem
  do cliente, que ainda não foi obtido; o código fica pronto para plugar.
- **Impacto:** nenhuma tela chama essas rotas ainda — falta o passo de UI
  (botão em Campanhas/Planilhas) e persistência do resultado via repositório.
- **Prioridade:** Baixa (infra pronta; só falta credencial + UI).
- **Plano:** quando tiver o token/service account do cliente, configurar as
  envs e ligar o botão na UI. Ver `lib/integrations/README.md`.
- **Fase:** 5.

### TD10 — Funcionalidades de topbar (busca global, notificações, tema)
- **Descrição:** acionam toast "integração futura".
- **Motivo:** fora do escopo do MVP.
- **Impacto:** funcionalidades auxiliares ausentes.
- **Prioridade:** Baixa.
- **Plano:** busca (Supabase/embeddings), notificações (`notifications`), tema.
- **Fase:** 6.

### TD11 — Permissões por papel (RBAC) — concluído nos domínios principais
- **Descrição:** RLS por papel aplicada em clientes, boards/colunas/cards,
  tarefas, campanhas, calendário e briefing/briefing_items: `select` para
  qualquer membro do workspace (`is_workspace_member`), `insert`/`update` para
  owner/admin/gestor (`is_workspace_editor`) e `delete` restrito a owner/admin
  (`is_workspace_admin`). Operador é somente-leitura nessas superfícies,
  inclusive em ações de "marcar como concluído" (tarefas, Meu Painel,
  checklist de briefing), pois são updates. A UI usa `useRole()`
  (`lib/role/RoleContext.tsx`) para esconder/desabilitar criar, editar, excluir
  e drag-and-drop de acordo com o papel, e o RLS garante o mesmo limite mesmo
  em chamadas diretas ao Supabase. Workspace e membros já tinham guard
  (`workspaces_admin_update`, `members_admin_update`/`members_admin_delete`).
- **Motivo:** RBAC completo fora do MVP original; agora cobre os domínios
  operacionais principais.
- **Impacto:** nenhum — knowingly trade-off: operador não marca a própria
  tarefa como concluída (mesma regra de só-leitura aplicada uniformemente).
  Reavaliar se isso for um problema real de uso.
- **Prioridade:** Baixa (resolvida; só falta granularidade fina, ex.: permitir
  operador concluir a própria tarefa).
- **Plano:** Drive/Documentos/Inbox/Chat continuam com policy única
  `_member_all` (todos os membros podem tudo) — fora do escopo desta rodada;
  avaliar se precisam do mesmo padrão quando ganharem escrita real. `sheets` já
  recebeu RBAC restrito a admin (`sheets_admin_insert/update/delete`), pois
  `app/api/sheets/export` (TD09) usa `external_id` dessa tabela para validar
  ownership antes de escrever — sem essa restrição, qualquer membro podia
  "plantar" o `external_id` de uma planilha de outro workspace e burlar aquela
  checagem.
- **Fase:** 6.
