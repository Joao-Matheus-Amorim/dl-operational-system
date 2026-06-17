import { describe, it, expect } from "vitest";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendarEvents,
  updateCalendarEvent,
} from "@/lib/repositories/calendar";

describe("calendar repository (mock mode)", () => {
  it("creates an event with an owner and no time when blank", async () => {
    const created = await createCalendarEvent({
      title: " Reuniao ",
      type: "reuniao",
      date: "2026-06-20",
      time: "",
    });

    expect(created.title).toBe("Reuniao");
    expect(created.time).toBeUndefined();
    expect(created.ownerId).toBeTruthy();

    const list = await listCalendarEvents();
    expect(list.some((event) => event.id === created.id)).toBe(true);
  });

  it("rejects an empty title", async () => {
    await expect(
      createCalendarEvent({ title: "  ", type: "tarefa", date: "2026-06-20" })
    ).rejects.toThrow();
  });

  it("updates fields and clears the time when blank", async () => {
    const created = await createCalendarEvent({
      title: "X",
      type: "tarefa",
      date: "2026-06-20",
      time: "09:00",
    });

    const updated = await updateCalendarEvent(created.id, {
      title: "X2",
      type: "conteudo",
      date: "2026-06-21",
      time: "",
    });

    expect(updated.title).toBe("X2");
    expect(updated.type).toBe("conteudo");
    expect(updated.date).toBe("2026-06-21");
    expect(updated.time).toBeUndefined();
  });

  it("deletes an event", async () => {
    const created = await createCalendarEvent({
      title: "tmp",
      type: "tarefa",
      date: "2026-06-20",
    });

    await deleteCalendarEvent(created.id);

    const list = await listCalendarEvents();
    expect(list.some((event) => event.id === created.id)).toBe(false);
  });
});
