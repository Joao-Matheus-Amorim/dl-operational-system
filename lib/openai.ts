/**
 * Camada de IA do Dogtooth — preparada para a Fase 4, sem chamada real no MVP.
 *
 * IMPORTANTE (dívida técnica registrada em docs/technical-debt-log.md):
 * No MVP o Dogtooth NÃO chama a OpenAI. Este módulo define o contrato que será
 * implementado depois, via rota server-side (App Router /api), para que a
 * OPENAI_API_KEY nunca seja exposta no client.
 *
 * As "ações" descrevem o que o Dogtooth poderá executar no sistema
 * (criar cliente, criar tarefa, gerar copy, etc.). No MVP elas servem como
 * catálogo de capacidades e base para a UI de sugestões.
 */

import type { DogtoothAction } from "@/lib/types";

export const isOpenAIConfigured = Boolean(process.env.OPENAI_API_KEY);

export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/** Catálogo de ações que o Dogtooth expõe (estrutura pronta p/ Fase 4). */
export const DOGTOOTH_ACTIONS: DogtoothAction[] = [
  {
    type: "criar-cliente",
    label: "Criar cliente",
    description: "Cadastra um novo cliente a partir de linguagem natural.",
  },
  {
    type: "criar-tarefa",
    label: "Criar tarefa",
    description: "Cria uma tarefa atribuída a um responsável.",
  },
  {
    type: "gerar-copy",
    label: "Gerar copy",
    description: "Produz textos de anúncio/post a partir de um contexto.",
  },
  {
    type: "resumir-cliente",
    label: "Resumir cliente",
    description: "Gera um resumo do histórico e status de um cliente.",
  },
  {
    type: "consultar-metricas",
    label: "Consultar métricas",
    description: "Responde perguntas sobre KPIs e performance.",
  },
  {
    type: "gerar-relatorio",
    label: "Gerar relatório",
    description: "Monta um relatório consolidado da operação.",
  },
];

export interface DogtoothReply {
  content: string;
  /** Ação detectada (quando aplicável). Sempre null no MVP. */
  action: DogtoothAction | null;
}

/**
 * Stub do MVP. NÃO chama a OpenAI — retorna uma resposta determinística que
 * deixa explícito que a execução real chegará na Fase 4. A assinatura já é a
 * definitiva, então a troca futura não altera os consumidores.
 */
export async function askDogtooth(prompt: string): Promise<DogtoothReply> {
  return {
    content:
      `Recebi: "${prompt}". No MVP eu ainda não executo ações nem chamo a IA. ` +
      `A integração com a OpenAI chega na Fase 4 — minha estrutura de ações já está pronta.`,
    action: null,
  };
}
