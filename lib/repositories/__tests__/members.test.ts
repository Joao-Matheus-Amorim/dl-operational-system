import { describe, it, expect } from "vitest";
import {
  getWorkspaceMembers,
  inviteMember,
  removeMember,
  updateMemberRole,
} from "@/lib/repositories/members";

// Sem env de Supabase nos testes, os repositorios operam no store mock mutavel.
describe("members repository (mock mode)", () => {
  it("lists the seeded members with one owner", async () => {
    const members = await getWorkspaceMembers();
    const owners = members.filter((member) => member.role === "owner");
    expect(owners.length).toBe(1);
  });

  it("invites a new member and lists it afterwards", async () => {
    const updated = await inviteMember({
      email: "nova@dental-lead.com.br",
      name: "Nova Pessoa",
      role: "operador",
    });

    expect(updated.some((member) => member.email === "nova@dental-lead.com.br")).toBe(true);
  });

  it("updates the role of a non-owner member", async () => {
    const before = await getWorkspaceMembers();
    const target = before.find((member) => member.role !== "owner");
    expect(target).toBeTruthy();

    const updated = await updateMemberRole(target!.id, "gestor");
    const changed = updated.find((member) => member.id === target!.id);
    expect(changed?.role).toBe("gestor");
  });

  it("rejects promoting a member to owner via updateMemberRole", async () => {
    const before = await getWorkspaceMembers();
    const target = before.find((member) => member.role !== "owner");
    expect(target).toBeTruthy();

    await expect(updateMemberRole(target!.id, "owner")).rejects.toThrow();
  });

  it("rejects demoting the sole owner", async () => {
    const before = await getWorkspaceMembers();
    const owner = before.find((member) => member.role === "owner");
    expect(owner).toBeTruthy();

    await expect(updateMemberRole(owner!.id, "admin")).rejects.toThrow();
  });

  it("rejects removing the sole owner", async () => {
    const before = await getWorkspaceMembers();
    const owner = before.find((member) => member.role === "owner");
    expect(owner).toBeTruthy();

    await expect(removeMember(owner!.id)).rejects.toThrow();
  });

  it("removes a non-owner member", async () => {
    const invited = await inviteMember({
      email: "temp@dental-lead.com.br",
      name: "Temp Pessoa",
      role: "operador",
    });
    const target = invited.find((member) => member.email === "temp@dental-lead.com.br");
    expect(target).toBeTruthy();

    const after = await removeMember(target!.id);
    expect(after.some((member) => member.id === target!.id)).toBe(false);
  });
});
