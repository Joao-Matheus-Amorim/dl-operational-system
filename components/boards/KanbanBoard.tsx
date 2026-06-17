"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/boards/KanbanColumn";
import { KanbanCard } from "@/components/boards/KanbanCard";
import type { BoardCard, BoardColumn } from "@/lib/types";

/**
 * Quadro kanban com drag and drop (dnd-kit) entre colunas.
 * Estado local (mock) — a persistência da nova ordem/coluna chega na Fase 3.
 */
export function KanbanBoard({
  columns,
  initialCards,
}: {
  columns: BoardColumn[];
  initialCards: BoardCard[];
}) {
  const [cards, setCards] = React.useState<BoardCard[]>(initialCards);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const cardsOf = (columnId: string) =>
    cards
      .filter((c) => c.columnId === columnId)
      .sort((a, b) => a.order - b.order);

  const findColumnId = (id: string): string | undefined => {
    if (columns.some((c) => c.id === id)) return id;
    return cards.find((c) => c.id === id)?.columnId;
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeCol = findColumnId(activeId);
    const overCol = findColumnId(overId);
    if (!activeCol || !overCol) return;
    if (activeId === overId) return;

    setCards((prev) => {
      const activeCard = prev.find((c) => c.id === activeId);
      if (!activeCard) return prev;

      // Cards da coluna de destino, ordenados e sem o card sendo movido.
      const destCards = prev
        .filter((c) => c.columnId === overCol && c.id !== activeId)
        .sort((a, b) => a.order - b.order);

      // Índice de inserção: se soltou sobre um card, antes dele; se soltou na
      // área da coluna (overId === coluna), vai para o fim.
      const overIndex = destCards.findIndex((c) => c.id === overId);
      const insertIndex = overIndex === -1 ? destCards.length : overIndex;

      destCards.splice(insertIndex, 0, { ...activeCard, columnId: overCol });

      // Recalcula `order` sequencial na coluna de destino (sem duplicatas).
      const reorderedDest = destCards.map((c, i) => ({ ...c, order: i }));
      let result = prev.map((c) => reorderedDest.find((r) => r.id === c.id) ?? c);

      // Em movimento entre colunas, recompacta também a coluna de origem.
      if (activeCol !== overCol) {
        const reorderedSrc = result
          .filter((c) => c.columnId === activeCol)
          .sort((a, b) => a.order - b.order)
          .map((c, i) => ({ ...c, order: i }));
        result = result.map((c) => reorderedSrc.find((r) => r.id === c.id) ?? c);
      }

      return result;
    });
  };

  const activeCard = cards.find((c) => c.id === activeId) ?? null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn key={col.id} column={col} cards={cardsOf(col.id)} />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <KanbanCard card={activeCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
