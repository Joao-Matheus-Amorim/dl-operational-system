# Supabase Setup - Fase 2

Este repo agora tem o fluxo local da Fase 2 preparado: Supabase Auth no login,
guard de sessao nas rotas internas, schema/RLS e seed inicial. A criacao do
projeto Supabase e a aplicacao dos SQLs continuam sendo passos externos.

## 1. Criar o projeto

1. Crie um projeto no Supabase.
2. Em `Project Settings > API`, copie:
   - `Project URL`
   - `anon public key`
3. Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Sem essas envs o app continua no modo mock e o `/login` aceita entrada simbolica.

## 2. Aplicar banco

Execute nesta ordem no SQL editor do Supabase:

```sql
-- 1. Estrutura
-- database/schema.sql

-- 2. RLS + funcoes
-- database/rls-policies.sql
```

Ambos sao idempotentes e reexecutaveis. Sempre que o repo adicionar colunas,
policies ou funcoes (ex.: `workspaces_admin_update`, formulario publico de
briefing), reexecute os dois arquivos para o banco refletir as mudancas.

Depois crie o primeiro usuario em `Authentication > Users`.

## 3. Aplicar seed

Edite `database/seed.sql` e troque:

```sql
owner_email text := 'danyel@dental-lead.com.br';
```

Use o mesmo e-mail do usuario criado no Auth. Depois execute `database/seed.sql`
no SQL editor. O seed e idempotente e cria o workspace, o owner e dados iniciais
baseados em `lib/mock-data.ts`.

## 4. Validar Auth

1. Rode `npm run dev`.
2. Acesse `/login`.
3. Entre com o e-mail/senha do usuario Supabase.
4. Confirme que `/dashboard` abre e que o botao de sair volta para `/login`.

## Observacoes

- A Fase 2 ativa identidade e isolamento por RLS.
- Fase 3 operacional concluida: CRUD real de clientes, calendario, campanhas,
  boards/cards e tarefas; briefing mensal e formularios publicos de briefing
  (link `/b/[token]` via funcoes `anon`); salvar workspace em Configuracoes
  (owner/admin). Drive, Documentos, Planilhas e Inbox leem dados persistidos.
- Sem as envs, o app segue em modo mock com fallback local.
- Convites, RBAC refinado e auditoria operacional continuam na Fase 6.
