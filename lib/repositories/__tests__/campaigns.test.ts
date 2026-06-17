import { describe, it, expect } from "vitest";
import {
  deleteCampaign,
  listCampaigns,
  updateCampaign,
} from "@/lib/repositories/campaigns";

describe("campaigns repository (mock mode)", () => {
  it("clamps a negative balance to zero", async () => {
    const [first] = await listCampaigns();
    const updated = await updateCampaign(first.id, {
      status: "ativa",
      balanceCents: -50.7,
    });

    expect(updated.status).toBe("ativa");
    expect(updated.balanceCents).toBe(0);
  });

  it("rounds fractional cents", async () => {
    const [first] = await listCampaigns();
    const updated = await updateCampaign(first.id, {
      status: "pausada",
      balanceCents: 1234.6,
    });

    expect(updated.balanceCents).toBe(1235);
  });

  it("throws for an unknown campaign", async () => {
    await expect(
      updateCampaign("does-not-exist", { status: "ativa", balanceCents: 0 })
    ).rejects.toThrow();
  });

  it("deletes a campaign", async () => {
    const list = await listCampaigns();
    const target = list[list.length - 1];

    await deleteCampaign(target.id);

    const after = await listCampaigns();
    expect(after.some((campaign) => campaign.id === target.id)).toBe(false);
  });
});
