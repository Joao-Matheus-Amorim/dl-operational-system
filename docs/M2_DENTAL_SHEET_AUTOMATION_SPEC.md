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

A automação deve preencher, preferencialmente, apenas os campos de entrada operacional:

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

## 8. Totais

A planilha deve manter totais por:

- clínica no mês;
- dia consolidado;
- estado no mês.

Sempre que possível, os totais devem permanecer como fórmulas da planilha para evitar sobrescrever regras visuais e cálculos do cliente.

A automação deve focar em preencher os dados brutos diários:

```text
Leads por dia
Valor por dia
```

---

## 9. Mapeamento obrigatório por clínica

Para preencher a planilha, cada clínica precisa ter um mapeamento entre:

```text
Clínica
Estado
Aba da planilha
Conta de anúncio Meta Ads
Coluna de Leads
Coluna de CPL
Coluna de Valor
Linha inicial dos dias
```

Exemplo:

```json
{
  "key": "pimentas",
  "name": "Pimentas",
  "state": "SP",
  "city": "Guarulhos",
  "sheetName": "SP · MAIO",
  "adAccountId": "act_123456789012345",
  "columns": {
    "leads": "C",
    "cpl": "D",
    "value": "E"
  },
  "rowOffset": 2
}
```

---

## 10. Modelo de configuração recomendado

A empresa odontológica deve possuir uma configuração de unidades/clínicas.

Exemplo:

```json
{
  "companyId": "cmp_dental_leads",
  "companyName": "Dental Leads",
  "segment": "odontologia",
  "states": ["SP", "BA"],
  "spreadsheetId": "1xglEDDEf7ZIwx_dFnHuL_i9ZPC15vpXAz9Tlscsz3V0",
  "units": [
    {
      "key": "pimentas",
      "name": "Pimentas",
      "state": "SP",
      "sheetName": "SP · MAIO",
      "adAccountId": "act_PREENCHER",
      "columns": {
        "leads": "C",
        "cpl": "D",
        "value": "E"
      }
    },
    {
      "key": "guarulhos_nazare",
      "name": "Guarulhos Nazaré",
      "state": "SP",
      "sheetName": "SP · MAIO",
      "adAccountId": "act_PREENCHER",
      "columns": {
        "leads": "F",
        "cpl": "G",
        "value": "H"
      }
    }
  ]
}
```

---

## 11. Fonte dos dados

A fonte de dados deve ser o Meta Ads.

A automação deve puxar dados por conta de anúncio ou unidade configurada.

Para a planilha diária, o nível principal de leitura pode ser:

```text
level=account
```

ou, quando necessário:

```text
level=campaign
level=adset
level=ad
```

A planilha canônica exige o resumo diário por clínica, mas o sistema também pode guardar detalhes por campanha, conjunto e criativo em abas auxiliares.

---

## 12. Fluxo de preenchimento

```text
1. Carregar empresa Dental Leads
2. Carregar unidades/clínicas do estado e mês
3. Para cada clínica:
   3.1 Validar adAccountId
   3.2 Buscar métricas do Meta Ads por dia
   3.3 Somar leads do dia
   3.4 Somar gasto do dia
   3.5 Localizar linha do dia
   3.6 Escrever Leads
   3.7 Escrever Valor
   3.8 Preservar fórmula de CPL
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
- conta Meta Ads válida;
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

Responsável por cadastrar empresa, estados, clínicas, contas Meta Ads, planilhas e colunas.

### M2 — Preenchimento da Planilha Dental Leads

Responsável por pegar dados da Meta Ads e preencher a planilha literal.

### M3 — Detalhamento por Campanha, Conjunto e Criativo

Responsável por criar abas auxiliares e análises mais profundas.

---

## 19. Decisão arquitetural

A planilha Dental Leads deve ser tratada como contrato de integração.

Isso significa que o sistema deve se adaptar ao layout dela, e não obrigar o cliente a mudar o layout para se adaptar ao sistema.
