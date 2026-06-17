import type { Workspace } from "@/lib/types";

/**
 * Evento de janela emitido quando o workspace atual e atualizado, para que
 * superficies persistentes (ex.: rodape da sidebar) reflitam o novo nome/segmento
 * sem depender de um reload completo.
 */
export const WORKSPACE_UPDATED_EVENT = "dl:workspace-updated";

export function emitWorkspaceUpdated(workspace: Workspace): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<Workspace>(WORKSPACE_UPDATED_EVENT, { detail: workspace })
  );
}
