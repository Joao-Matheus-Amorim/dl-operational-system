# Plano de Gerenciamento do Projeto — Tráfego Automator

> Referência de organização: boas práticas inspiradas no PMI/PMBOK, adaptadas para um produto de automação, Meta Ads, Google Sheets, WhatsApp API e gestão multi-cliente.

---

## 1. Termo de Abertura do Projeto

### 1.1 Nome do projeto

**Tráfego Automator — Plataforma Multi-cliente de Gestão, Métricas e Automação de Tráfego Pago**

### 1.2 Objetivo do projeto

Construir uma plataforma capaz de organizar clientes por grupos, regiões e segmentos, puxar métricas reais do Meta Ads, preencher modelos de planilhas automaticamente, enviar mensagens via WhatsApp API e disponibilizar módulos avançados para clientes com pacote maior.

### 1.3 Justificativa

O processo atual de acompanhamento de campanhas, criativos, CPL, gasto, leads e alertas depende de conferência manual, planilhas atualizadas à mão e decisões tardias. O projeto busca reduzir trabalho operacional, aumentar segurança, padronizar acompanhamento de aproximadamente 153 clientes e permitir evolução modular por tipo de cliente.

### 1.4 Produto esperado

Uma plataforma composta por:

- cadastro e organização de clientes;
- separação por grupos **Admin** e **Serviços**;
- organização por região e segmento;
- leitura de campanhas, conjuntos e criativos do Meta Ads;
- preenchimento automático de planilhas Google Sheets;
- envio de mensagens pela WhatsApp API;
- painel administrativo para módulos, regras e usuários;
- contas secundárias de clientes com somente leitura;
- logs, auditoria e controles de segurança;
- arquitetura evolutiva para módulos avançados.

### 1.5 Premissas

- As campanhas, conjuntos e criativos já existem no Meta Ads.
- O sistema deve puxar dados reais da Meta Ads API, sem cadastrar manualmente campanhas/criativos.
- Cada cliente terá pelo menos uma conta de anúncio `act_...`.
- Cada cliente terá uma planilha ou modelo de planilha associado.
- O WhatsApp será usado para mensagens operacionais, alertas e relatórios.
- Clientes do grupo **Admin** podem ter mais módulos.
- Clientes do grupo **Serviços** podem ter menos módulos.
- Usuários secundários de clientes terão acesso restrito e somente leitura.

### 1.6 Restrições

- Ações perigosas, como pausar anúncio, subir criativo ou criar campanha, devem exigir módulo habilitado, permissão do usuário e confirmação quando aplicável.
- Clientes do grupo Serviços não devem executar módulos avançados se eles não estiverem contratados/habilitados.
- A plataforma deve suportar alto volume de clientes sem disparar chamadas excessivas simultâneas para APIs externas.
- Credenciais sensíveis devem permanecer fora do código-fonte.

### 1.7 Critérios de sucesso

O projeto será considerado bem-sucedido quando:

- conseguir processar clientes por grupo, região e segmento;
- puxar campanhas, conjuntos e criativos do Meta Ads;
- preencher planilhas com métricas por campanha/conjunto/criativo;
- enviar mensagens pela WhatsApp API conforme módulos habilitados;
- bloquear ações não permitidas por módulo ou tipo de usuário;
- registrar logs de execução, erros e ações;
- permitir operação escalável para aproximadamente 153 clientes.

---

## 2. Estrutura Analítica do Projeto — EAP/WBS

```text
1. Gestão do Projeto
   1.1 Termo de abertura
   1.2 Plano de gerenciamento
   1.3 Cronograma
   1.4 Riscos
   1.5 Critérios de aceite

2. Fundação Técnica
   2.1 Estrutura de configuração multi-cliente
   2.2 Loader de clientes por grupo/região/segmento
   2.3 Sistema de módulos por cliente
   2.4 Sistema de usuários e permissões
   2.5 Logs e auditoria

3. Integração Meta Ads
   3.1 Validação de token
   3.2 Leitura de contas de anúncio
   3.3 Leitura de campanhas
   3.4 Leitura de conjuntos
   3.5 Leitura de criativos/anúncios
   3.6 Normalização de métricas
   3.7 Tratamento de paginação e erros

4. Google Sheets
   4.1 Modelo padrão de planilha
   4.2 Preenchimento por campanhas
   4.3 Preenchimento por conjuntos
   4.4 Preenchimento por criativos
   4.5 Logs de atualização
   4.6 Execução em lote

5. WhatsApp API
   5.1 Serviço de envio
   5.2 Templates de mensagem
   5.3 Alertas de CPL
   5.4 Alertas de saldo
   5.5 Relatórios diários/semanais
   5.6 Webhook de respostas futuras

6. Painel Admin
   6.1 Login
   6.2 Gestão de clientes
   6.3 Gestão de módulos
   6.4 Gestão de regras
   6.5 Gestão de usuários secundários
   6.6 Visualização de execuções

7. Painel Cliente Somente Leitura
   7.1 Dashboard
   7.2 Campanhas
   7.3 Conjuntos
   7.4 Criativos
   7.5 Alertas
   7.6 Relatórios

8. Segurança
   8.1 RBAC — controle por papel
   8.2 ABAC simples — controle por escopo
   8.3 Verificação módulo + permissão
   8.4 Proteção de credenciais
   8.5 Auditoria de ações

9. Implantação
   9.1 Ambiente local
   9.2 Ambiente homologação
   9.3 Produção
   9.4 Variáveis de ambiente
   9.5 Monitoramento
```

---

## 3. Escopo do Projeto

### 3.1 Incluído no escopo

- Organização de clientes em **Admin** e **Serviços**.
- Organização por região, como SP, Bahia e futuras regiões.
- Organização por segmento, como Clínicas, Óticas e Odontologia.
- Módulos habilitáveis por cliente.
- Usuários com papéis e permissões.
- Leitura real de métricas do Meta Ads.
- Preenchimento automático de planilhas.
- Envio de mensagens via WhatsApp API.
- Dashboard administrativo.
- Dashboard somente leitura para clientes.
- Logs e auditoria.

### 3.2 Fora do escopo inicial

- Criação automática irrestrita de campanhas sem aprovação.
- Pausa automática irrestrita de anúncios.
- Subida de criativos sem controle de permissões.
- Cobrança financeira/assinaturas.
- CRM completo.
- BI avançado com data warehouse.

---

## 4. Partes Interessadas

| Parte interessada | Interesse principal |
|---|---|
| Dono/operador do sistema | Gerenciar todos os clientes, módulos e execuções |
| Cliente Admin | Receber mais funções e operação avançada |
| Cliente Serviços | Receber métricas, planilhas e relatórios básicos |
| Usuário secundário do cliente | Visualizar dados sem editar |
| Gestor de tráfego | Acompanhar campanhas, criativos e alertas |
| Desenvolvedor | Manter arquitetura segura e escalável |

---

## 5. Governança do Projeto

### 5.1 Papéis

| Papel | Responsabilidade |
|---|---|
| Product Owner | Define escopo, prioridades e regras de negócio |
| Gerente do Projeto | Controla entregas, riscos e cronograma |
| Arquiteto de Software | Define módulos, integrações e segurança |
| Desenvolvedor Backend | Implementa APIs, integrações e jobs |
| Desenvolvedor Frontend | Implementa painéis e interfaces |
| Operador Admin | Configura clientes, planilhas e módulos |
| Cliente Viewer | Acompanha dados em modo leitura |

### 5.2 Processo de decisão

- Mudanças críticas devem ser registradas como item de backlog.
- Módulos avançados devem exigir análise de segurança.
- Integrações reais devem ser testadas primeiro em ambiente controlado.
- Ações em Meta Ads devem ter logs obrigatórios.

---

## 6. Plano de Gerenciamento de Escopo

### 6.1 Controle de escopo

Cada nova função deve ser classificada como:

```text
Módulo Básico
Módulo Admin
Módulo Serviços
Módulo Global
Módulo Futuro
```

### 6.2 Critério para aceitar nova função

Uma função só entra no projeto se tiver:

- objetivo claro;
- tipo de cliente impactado;
- permissões necessárias;
- impacto em segurança;
- impacto em Meta Ads, Sheets ou WhatsApp;
- critério de aceite.

---

## 7. Plano de Cronograma por Fases

### Fase 1 — Fundação multi-cliente

Entregas:

- loader de clientes por arquivos;
- estrutura Admin/Serviços;
- módulos por cliente;
- filtros por grupo, região e segmento;
- execução por escopo.

### Fase 2 — Métricas Meta Ads e planilhas

Entregas:

- puxar campanhas;
- puxar conjuntos;
- puxar criativos;
- normalizar métricas;
- preencher planilha modelo;
- logs por cliente.

### Fase 3 — WhatsApp API

Entregas:

- serviço de envio;
- templates de mensagens;
- alertas por regra;
- resumo diário/semanal;
- controle por módulo.

### Fase 4 — Segurança e usuários

Entregas:

- login;
- papéis de usuário;
- contas secundárias somente leitura;
- permissões por ação;
- auditoria.

### Fase 5 — Painel administrativo

Entregas:

- tela de clientes;
- tela de módulos;
- tela de regras;
- tela de usuários;
- tela de execuções.

### Fase 6 — Módulos avançados Admin

Entregas:

- upload de criativo;
- criação de campanha;
- criação de conjunto;
- pausa de anúncio;
- aprovação de ação;
- logs detalhados.

---

## 8. Plano de Qualidade

### 8.1 Critérios mínimos

- Nenhum cliente deve executar módulo desabilitado.
- Nenhum usuário deve executar ação sem permissão.
- Erro em um cliente não pode parar a execução de todos.
- Todas as integrações externas devem ter retry controlado.
- Logs devem registrar sucesso, falha e motivo.
- Dados sensíveis não devem aparecer em logs públicos.

### 8.2 Validações obrigatórias

- Token Meta Ads válido.
- Conta `act_...` válida.
- Planilha acessível pela Service Account.
- WhatsApp de destino válido.
- Cliente habilitado.
- Módulo habilitado.
- Permissão de usuário habilitada.

---

## 9. Plano de Riscos

| Risco | Impacto | Mitigação |
|---|---:|---|
| Token Meta inválido | Alto | Validação antes dos jobs |
| Rate limit da Meta Ads API | Alto | Execução em lote, pausa e retry |
| Planilha sem permissão | Médio | Validação da Service Account |
| Cliente mal configurado | Médio | Schema/validação de configuração |
| Ação indevida em anúncio | Alto | Módulo + permissão + aprovação + log |
| Perda de histórico | Alto | Persistência em banco |
| WhatsApp bloqueado/erro API | Médio | Fallback para log e retry |
| 153 clientes em execução simultânea | Alto | Fila, batch e limite de concorrência |

---

## 10. Plano de Comunicação

| Evento | Canal | Frequência |
|---|---|---|
| Execução de métricas | Log interno | Por execução |
| Erro por cliente | Painel/Admin WhatsApp | Imediato |
| Resumo de cliente | WhatsApp/Planilha | Diário ou semanal |
| Mudança de módulo | Log de auditoria | Sempre |
| Ação avançada | Log + confirmação | Sempre |

---

## 11. Plano de Segurança

### 11.1 Princípios

- Menor privilégio possível.
- Separação entre módulo do cliente e permissão do usuário.
- Ação real sempre auditada.
- Credenciais protegidas por `.env` ou secret manager.
- Usuário secundário de cliente sempre começa como somente leitura.

### 11.2 Regra de autorização

Uma ação só pode ser executada quando:

```text
cliente.enabled = true
cliente.modules[action] = true
user.active = true
user.permissions[action] = true
user.scope inclui o cliente
```

---

## 12. Critérios de Aceite do MVP Operacional

- Rodar processamento para um grupo inteiro, como `Serviços/SP/Clínicas`.
- Puxar campanhas, conjuntos e criativos reais do Meta Ads.
- Escrever dados no modelo de planilha.
- Enviar mensagem WhatsApp por cliente habilitado.
- Bloquear módulos não habilitados.
- Bloquear usuário somente leitura em ações de edição.
- Gerar log de execução por cliente.
- Continuar processando mesmo se um cliente falhar.

---

## 13. Backlog Macro

### Alta prioridade

- Client Loader multi-arquivo.
- Módulos por cliente.
- Escopo por grupo/região/segmento.
- Job Meta Ads -> Sheets.
- WhatsApp API service.
- Logs de execução.
- Segurança básica por papéis.

### Média prioridade

- Painel Admin.
- Contas secundárias de cliente.
- Webhook WhatsApp.
- Banco de dados.
- Auditoria detalhada.

### Baixa prioridade inicial

- Upload de criativos.
- Criação de campanhas.
- Pausa automática.
- Relatórios avançados.
- BI histórico.

---

## 14. Definição de Pronto

Uma funcionalidade é considerada pronta quando:

- possui regra de negócio documentada;
- possui validação de entrada;
- respeita módulo do cliente;
- respeita permissão do usuário;
- registra log;
- trata erro sem derrubar execução global;
- foi testada em dry-run;
- foi testada em cenário real controlado quando envolve API externa.
