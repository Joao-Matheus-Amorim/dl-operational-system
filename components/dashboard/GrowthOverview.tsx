import { DollarSign, UserPlus, Users, Megaphone, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import type { DashboardMetric } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  g_mrr: DollarSign,
  g_novos: UserPlus,
  g_ativos: Users,
  g_campanhas: Megaphone,
};

export function GrowthOverview({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento da empresa</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 gap-4 p-5 pt-0 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} icon={ICONS[metric.id] ?? Users} />
        ))}
      </div>
    </Card>
  );
}
