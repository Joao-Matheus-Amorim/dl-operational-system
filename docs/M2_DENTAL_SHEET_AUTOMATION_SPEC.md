# M2 — Especificação da Planilha Ideal Dental Leads

## 1. Objetivo

Este documento define a planilha Dental Leads como modelo operacional canônico para o serviço inicial.

A planilha não é apenas um relatório. Ela é o modelo literal que o cliente precisa preencher para prestar o serviço de acompanhamento de tráfego pago.

A automação deve preservar esse formato e preencher automaticamente os campos necessários a partir dos dados reais do Meta Ads.

---

## 2. Papel da planilha no produto

A planilha representa o produto operacional entregue ao cliente.

Ela deve funcionar como:

- controle diário de desempenho;
- visão por estado;
- visão por mês;
- visão por clínica/unidade;
- resumo de leads;
- resumo de gasto;
- cálculo de CPL;
- base para prestação de serviço;
- base para conferência rápida pelo cliente.

---

## 3. Estrutura geral

A planilha é organizada por abas de estado e mês.

Exemplos:

```text
SP · Abril
Bahia · Abril
SP · MAIO
Bahia · MAIO
```

Cada aba representa:

```text
Estado + Mês de referência
```

---

## 4. Estrutura por clínica

Cada clínica/unidade ocupa 3 colunas fixas:

```text
Leads | CPL (R$) | Valor (R$)
```

Exemplo:

```text
Pimentas
  Leads
  CPL (R$)
  Valor (R$)

Guarulhos Nazaré
  Leads
  CPL (R$)
  Valor (R$)
```

---

## 5. Campos que a automação deve preencher

A automação deve preencher apenas os campos de entrada operacional:

```text
Leads
Valor (R$)
```

O campo `CPL (R$)` deve ser mantido como fórmula da própria planilha quando possível.

Fórmula recomendada:

```excel
=SEERRO(Valor/Leads;"")
```

ou, dependendo do idioma da planilha:

```excel
=IFERROR(Valor/Leads,"")
```

---

## 6. Cálculo do CPL

O CPL representa:

```text
CPL = Valor gasto / Leads
```

Onde:

- `Valor (R$)` = gasto do Meta Ads no dia para a clínica/unidade;
- `Leads` = quantidade de leads capturados no dia;
- `CPL (R$)` = custo por lead.

---

## 7. Estrutura diária

Cada linha de dados representa um dia do mês.

Exemplo:

```text
Dia 01
Dia 02
Dia 03
...
Dia 30/31
TOTAL MÊS
```

A automação deve localizar a linha do dia correspondente e preencher as colunas da clínica correta.

---

## 8. Fonte dos dados — conta Meta central compartilhada

No caso Dental Leads, a fonte de dados é uma **conta Meta Ads central** que administra as campanhas de todas as clínicas.

Portanto, o modelo correto não é:

```text
uma clínica = uma conta de anúncio
```

O modelo correto é:

```text
uma empresa Dental Leads
  -> uma conta Meta Ads central
      -> campanhas representam clínicas/unidades
          -> cada clínica possui filtro campaignMatch
```

A leitura principal para a planilha diária deve usar:

```text
level=campaign
```

Depois da coleta, o sistema filtra as campanhas de cada clínica e soma:

```text
Leads do dia
Valor gasto do dia
```

---

## 9. Mapeamento obrigatório por clínica

Para preencher a planilha, cada clínica precisa ter um mapeamento entre:

```text
Clínica
Estado
Aba da planilha
Conta Meta Ads central
Filtro de campanha da clínica
Coluna de Leads
Coluna de CPL
Coluna de Valor
Linha inicial dos dias
```

Exemplo de configuração do estado:

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

Exemplo de unidade por nome de campanha:

```json
{
  "key": "pimentas",
  "name": "Pimentas",
  "campaignMatch": {
    "contains": ["Pimentas"]
  }
}
```

Exemplo de unidade por IDs de campanha:

```json
{
  "key": "pimentas",
  "name": "Pimentas",
  "campaignMatch": {
    "ids": ["1234567890", "9876543210"]
  }
}
```

---

## 10. Regra de correspondência por campanha

O sistema deve aceitar três formas de correspondência:

### 10.1 Por ID

Usar quando a campanha precisa ser mapeada com precisão máxima.

```json
{
  "campaignMatch": {
    "ids": ["1234567890"]
  }
}
```

### 10.2 Por nome exato

Usar quando o nome da campanha é padronizado.

```json
{
  "campaignMatch": {
    "exact": ["Dental Leads | SP | Pimentas | Leads"]
  }
}
```

### 10.3 Por contém

Usar na fase inicial, quando o nome da unidade aparece dentro do nome da campanha.

```json
{
  "campaignMatch": {
    "contains": ["Pimentas"]
  }
}
```

---

## 11. Modelo de configuração recomendado

```json
{
  "companyId": "cmp_dental_leads",
  "companyName": "Dental Leads",
  "group": "servicos",
  "segment": "odontologia",
  "state": "SP",
  "spreadsheetId": "1xglEDDEf7ZIwx_dFnHuL_i9ZPC15vpXAz9Tlscsz3V0",
  "sheetName": "SP · MAIO",
  "rowOffset": 2,
  "meta": {
    "mode": "shared_ad_account",
    "adAccountId": "act_PREENCHER_CONTA_CENTRAL",
    "insightLevel": "campaign"
  },
  "columnLayout": {
    "firstColumn": "C",
    "unitWidth": 3,
    "fields": ["leads", "cpl", "value"]
  },
  "units": [
    {
      "key": "pimentas",
      "name": "Pimentas",
      "campaignMatch": {
        "contains": ["Pimentas"]
      }
    },
    {
      "key": "guarulhos_nazare",
      "name": "Guarulhos Nazaré",
      "campaignMatch": {
        "contains": ["Guarulhos Nazaré", "Nazare"]
      }
    }
  ]
}
```

---

## 12. Fluxo de preenchimento

```text
1. Carregar empresa Dental Leads
2. Carregar unidades/clínicas do estado e mês
3. Para cada clínica:
   3.1 Herdar conta Meta Ads central
   3.2 Validar adAccountId central
   3.3 Buscar insights level=campaign por dia
   3.4 Filtrar campanhas pelo campaignMatch da clínica
   3.5 Somar leads do dia
   3.6 Somar gasto do dia
   3.7 Localizar linha do dia
   3.8 Escrever Leads
   3.9 Escrever Valor
   3.10 Preservar fórmula de CPL
4. Atualizar log de execução
5. Gerar resumo de sucesso/falha
```

---

## 13. Regra para não destruir a planilha

A automação não deve reformatar a planilha inteira.

Ela deve fazer atualizações cirúrgicas usando ranges específicos:

```text
C3 = leads de Pimentas no dia 01
E3 = valor de Pimentas no dia 01
F3 = leads de Guarulhos Nazaré no dia 01
H3 = valor de Guarulhos Nazaré no dia 01
```

O sistema deve evitar sobrescrever:

- nomes de clínicas;
- cabeçalhos;
- fórmulas de CPL;
- totais do mês;
- totais do dia;
- formatação;
- cores;
- bordas;
- filtros;
- observações manuais.

---

## 14. Abas auxiliares futuras

A planilha literal do cliente deve ser preservada como visão principal.

Para detalhamento técnico, o sistema pode criar abas auxiliares:

```text
Campanhas
Conjuntos
Criativos
Alertas
Log Execuções
Config
```

Essas abas não substituem a planilha original. Elas servem para auditoria, conferência e evolução do produto.

---

## 15. Validações necessárias

Antes de preencher, o sistema deve validar:

- spreadsheetId configurado;
- sheetName existente;
- clínica ativa;
- coluna de Leads configurada;
- coluna de Valor configurada;
- conta Meta Ads central válida;
- filtro `campaignMatch` configurado;
- período válido;
- linha do dia encontrada;
- Service Account com acesso à planilha;
- Meta Ads retornando dados ou zero legítimo.

---

## 16. Tratamento de zero

Se a Meta Ads retornar zero leads e zero gasto, o sistema pode preencher `0` ou deixar vazio, conforme configuração do cliente.

Configuração sugerida:

```json
{
  "emptyMode": "zero"
}
```

Valores possíveis:

```text
zero  = escreve 0
blank = deixa célula vazia
```

---

## 17. Critérios de aceite

O módulo de preenchimento da planilha estará pronto quando:

- conseguir mapear cada clínica para suas 3 colunas;
- conseguir identificar a aba correta por estado e mês;
- conseguir usar uma conta Meta central compartilhada;
- conseguir filtrar campanhas por clínica;
- conseguir preencher Leads e Valor por dia;
- conseguir preservar fórmulas de CPL;
- conseguir preservar totais e formatação;
- conseguir processar múltiplas clínicas;
- conseguir registrar falhas por clínica sem parar tudo;
- conseguir rodar em dry-run mostrando os ranges que seriam preenchidos;
- conseguir rodar real atualizando a planilha.

---

## 18. Relação com M1 e M3

### M1 — Cadastro e Importação de Clientes

Responsável por cadastrar empresa, estados, clínicas, conta Meta central, planilha, colunas e filtros de campanha.

### M2 — Preenchimento da Planilha Dental Leads

Responsável por pegar dados da Meta Ads e preencher a planilha literal.

### M3 — Detalhamento por Campanha, Conjunto e Criativo

Responsável por criar abas auxiliares e análises mais profundas.

---

## 19. Decisão arquitetural

A planilha Dental Leads deve ser tratada como contrato de integração.

Isso significa que o sistema deve se adaptar ao layout dela, e não obrigar o cliente a mudar o layout para se adaptar ao sistema.

A conta Meta central compartilhada é parte do contrato operacional do caso Dental Leads.
