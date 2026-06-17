"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Campaign, CampaignStatus } from "@/lib/types";
import type { CampaignInput } from "@/lib/repositories/campaigns";

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: "ativa", label: "Ativa" },
  { value: "pausada", label: "Pausada" },
  { value: "encerrada", label: "Encerrada" },
];

export function CampaignModal({
  open,
  onOpenChange,
  campaign,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  onSubmit: (input: CampaignInput) => Promise<void>;
}) {
  const [status, setStatus] = React.useState<CampaignStatus>("pausada");
  const [balance, setBalance] = React.useState("0");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open || !campaign) return;
    setStatus(campaign.status);
    setBalance((campaign.balanceCents / 100).toFixed(2));
  }, [open, campaign]);

  const normalizedBalance = balance.trim().replace(",", ".");
  const parsedBalance = Number(normalizedBalance);
  const balanceValid =
    normalizedBalance !== "" &&
    Number.isFinite(parsedBalance) &&
    parsedBalance >= 0;

  async function submit() {
    if (submitting || !balanceValid) return;
    const balanceCents = Math.round(parsedBalance * 100);

    setSubmitting(true);
    try {
      await onSubmit({ status, balanceCents });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-content">
            Editar campanha
          </DialogTitle>
          <DialogDescription className="text-sm text-content-muted">
            {campaign
              ? `Ajuste status e saldo de ${campaign.clientName}. As métricas vêm do Meta Ads.`
              : "Ajuste status e saldo da campanha."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="campaign-status">Status</Label>
            <Select
              id="campaign-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as CampaignStatus)
              }
              disabled={submitting}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="campaign-balance">Saldo (R$)</Label>
            <Input
              id="campaign-balance"
              type="number"
              min="0"
              step="0.01"
              value={balance}
              onChange={(event) => setBalance(event.target.value)}
              disabled={submitting}
              aria-invalid={!balanceValid}
            />
            {!balanceValid && (
              <p className="mt-1 text-xs text-alert">
                Informe um saldo válido (R$ 0 ou maior).
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => void submit()}
            disabled={submitting || !balanceValid}
          >
            {submitting ? "Salvando..." : "Salvar campanha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
