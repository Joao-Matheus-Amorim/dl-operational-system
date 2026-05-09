# Abas criadas no Google Sheets

O agente trabalha com abas automáticas separadas por unidade.

## Ótica 1

- `Ótica 1 - Dashboard`
- `Ótica 1 - Campanhas`
- `Ótica 1 - Conjuntos`
- `Ótica 1 - Criativos`
- `Ótica 1 - Campanhas Análise`
- `Ótica 1 - Criativos Análise`
- `Ótica 1 - Alertas`

## Ótica 2

- `Ótica 2 - Dashboard`
- `Ótica 2 - Campanhas`
- `Ótica 2 - Conjuntos`
- `Ótica 2 - Criativos`
- `Ótica 2 - Campanhas Análise`
- `Ótica 2 - Criativos Análise`
- `Ótica 2 - Alertas`

## Colunas principais

- cliente
- unidade
- campanha
- conjunto
- criativo
- gasto
- leads
- cpl
- ctr
- valor_total_estimado
- roi_percentual
- status_analise
- acao_sugerida
- motivo

Caso você queira preencher uma aba antiga exatamente célula por célula, edite `src/services/googleSheets.js` ou crie um mapeamento fixo por coluna em `src/config/clients.js`.
