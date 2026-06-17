import { Edit3, Trash2 } from "lucide-react";
import type { CalendarEvent as CalendarEventType } from "@/lib/types";
import { EVENT_TYPE_COLOR, EVENT_TYPE_LABEL } from "@/lib/constants";
import { getProfileById } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export function CalendarEvent({
  event,
  onEdit,
  onDelete,
  pending = false,
}: {
  event: CalendarEventType;
  onEdit?: (event: CalendarEventType) => void;
  onDelete?: (event: CalendarEventType) => void;
  pending?: boolean;
}) {
  const mockOwner = getProfileById(event.ownerId);
  const ownerName = event.ownerName ?? mockOwner?.name;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface-muted p-3">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: EVENT_TYPE_COLOR[event.type] }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-content">{event.title}</p>
        <p className="text-[11px] text-content-muted">
          {EVENT_TYPE_LABEL[event.type]}
          {event.time ? ` · ${event.time}` : ""}
          {ownerName ? ` · ${ownerName}` : ""}
        </p>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 gap-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onEdit(event)}
              aria-label="Editar evento"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="icon"
              onClick={() => onDelete(event)}
              disabled={pending}
              aria-label="Excluir evento"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
