import { describe, it, expect } from "vitest";
import {
  getCurrentWorkspace,
  getCurrentWorkspaceId,
  updateCurrentWorkspace,
} from "@/lib/repositories/workspace";

describe("workspace repository (mock mode)", () => {
  it("has no workspace id without Supabase", async () => {
    expect(await getCurrentWorkspaceId()).toBeNull();
  });

  it("returns the mock workspace", async () => {
    const ws = await getCurrentWorkspace();
    expect(ws).not.toBeNull();
    expect(ws?.name).toBeTruthy();
  });

  it("updates name/role and reflects it in later reads", async () => {
    const updated = await updateCurrentWorkspace({
      name: "  Nova DL  ",
      role: " Growth ",
    });

    expect(updated.name).toBe("Nova DL");
    expect(updated.role).toBe("Growth");

    const ws = await getCurrentWorkspace();
    expect(ws?.name).toBe("Nova DL");
    expect(ws?.role).toBe("Growth");
  });

  it("rejects an empty name", async () => {
    await expect(
      updateCurrentWorkspace({ name: "  ", role: "x" })
    ).rejects.toThrow();
  });
});
