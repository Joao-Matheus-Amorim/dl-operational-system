# Trello Sync - Boards

Este corte integra Trello -> DL e um envio controlado DL -> Trello de forma
server-side.

## O que faz

- Importa um board Trello para `boards`.
- Importa listas abertas para `board_columns`.
- Importa cards abertos para `board_cards`.
- Usa `external_id` para atualizar os mesmos registros em execucoes futuras.
- Envia para o Trello cards criados ou movidos dentro de listas que vieram do
  Trello.
- Respeita RLS usando a sessao Supabase do usuario logado.

## O que nao faz ainda

- Nao apaga no DL itens que foram apagados/arquivados no Trello.
- Nao cria boards/listas no Trello a partir de boards/listas locais do DL.
- Nao sincroniza labels, membros e checklists detalhados neste primeiro corte.

Esses pontos ficam explicitos para evitar sincronizacao destrutiva ou conflitos
sem politica definida.

## Exclusao de boards importados

Um board com `external_id` (importado do Trello) nao pode ser excluido pelo DL:
a UI esconde a acao de excluir e mostra um indicador de vinculo, e o
repositorio bloqueia a chamada (mock e Supabase) para evitar que o proximo
`/api/trello/sync` reimporte o board. Para remover de fato, arquive o board no
proprio Trello.

## Env vars

Configure no ambiente local/Vercel:

```bash
TRELLO_API_KEY=
TRELLO_API_TOKEN=
TRELLO_BOARD_ID=
```

As credenciais ficam somente no servidor. O client chama `/api/trello/sync` com
o token da sessao Supabase; a rota usa esse token para aplicar RLS no banco.

## Banco existente

Se o schema ja foi aplicado antes deste corte, rode uma vez:

```sql
-- database/trello-sync.sql
```

Esse SQL adiciona `external_id` em `boards`, `board_columns` e `board_cards`,
remove os indices globais antigos e cria indices unicos parciais com escopo por
workspace/board para sync idempotente em ambientes multi-workspace.

## Uso

1. Garanta que o usuario esta logado no app.
2. Acesse `/boards`.
3. Clique em `Atualizar do Trello`.
4. O app importa/atualiza o board configurado por `TRELLO_BOARD_ID`.
5. A partir de um board importado, criar ou mover cards no DL envia a alteracao
   correspondente para o Trello.
