import Link from "next/link";
import { ArrowRight, KanbanSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";
import type { Board } from "@/lib/types";

export function BoardsPreview({
  boards,
  loading = false,
}: {
  boards: Board[];
  loading?: boolean;
}) {
  const visibleBoards = boards.slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Boards</CardTitle>
        <Link
          href={ROUTES.boards}
          className="inline-flex items-center gap-1 text-xs text-neon-text hover:underline"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {loading ? (
          <p className="col-span-full py-4 text-center text-sm text-content-muted">
            Carregando boards...
          </p>
        ) : visibleBoards.length === 0 ? (
          <p className="col-span-full py-4 text-center text-sm text-content-muted">
            Nenhum board encontrado.
          </p>
        ) : (
          visibleBoards.map((board) => (
            <Link
              key={board.id}
              href={ROUTES.boards}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3 transition-colors hover:border-neon-border"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neon-border bg-neon/[0.08] text-neon-text">
                <KanbanSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-content">{board.title}</p>
                <p className="text-[11px] text-content-muted">
                  {board.columnsCount} listas - {board.cardsCount} cards
                </p>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
