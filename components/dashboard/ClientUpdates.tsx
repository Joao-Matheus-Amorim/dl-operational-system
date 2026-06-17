import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import type { Client } from "@/lib/types";

export function ClientUpdates({
  clients,
  loading = false,
}: {
  clients: Client[];
  loading?: boolean;
}) {
  const visibleClients = clients.slice(0, 7);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Atualizacao de clientes</CardTitle>
        <Link
          href={ROUTES.clientes}
          className="inline-flex items-center gap-1 text-xs text-neon-text hover:underline"
        >
          Ver carteira <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="py-4 text-center text-sm text-content-muted">
            Carregando clientes...
          </p>
        ) : visibleClients.length === 0 ? (
          <p className="py-4 text-center text-sm text-content-muted">
            Nenhum cliente encontrado.
          </p>
        ) : (
          visibleClients.map((client) => (
            <div
              key={client.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-content-muted">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-content">{client.name}</p>
                <p className="text-[11px] text-content-muted">
                  {client.plan} - {client.status}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
