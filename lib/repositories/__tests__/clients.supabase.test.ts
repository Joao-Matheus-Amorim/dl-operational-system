import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSupabase } from "@/lib/supabase";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { deleteClient, listClients } from "@/lib/repositories/clients";

vi.mock("@/lib/supabase", () => ({ getSupabase: vi.fn() }));
vi.mock("@/lib/repositories/workspace", () => ({
  getCurrentWorkspaceId: vi.fn(),
}));

// Builder encadeavel que registra cada .eq() e resolve para um PostgrestResponse.
function makeBuilder(result: unknown) {
  const eqCalls: Array<[string, unknown]> = [];
  const builder: Record<string, unknown> = {
    eqCalls,
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    order: () => builder,
    eq: (column: string, value: unknown) => {
      eqCalls.push([column, value]);
      return builder;
    },
    single: () => Promise.resolve(result),
    maybeSingle: () => Promise.resolve(result),
    then: (onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(onFulfilled, onRejected),
  };
  return builder;
}

describe("clients repository (supabase mode) enforces workspace filter", () => {
  beforeEach(() => {
    vi.mocked(getCurrentWorkspaceId).mockResolvedValue("ws-123");
  });

  it("scopes listClients by workspace_id", async () => {
    const builder = makeBuilder({ data: [], error: null });
    vi.mocked(getSupabase).mockReturnValue({
      from: () => builder,
    } as never);

    await listClients();

    expect(builder.eqCalls).toContainEqual(["workspace_id", "ws-123"]);
  });

  it("scopes deleteClient by workspace_id and id", async () => {
    const builder = makeBuilder({ error: null });
    vi.mocked(getSupabase).mockReturnValue({
      from: () => builder,
    } as never);

    await deleteClient("client-9");

    expect(builder.eqCalls).toContainEqual(["workspace_id", "ws-123"]);
    expect(builder.eqCalls).toContainEqual(["id", "client-9"]);
  });
});
