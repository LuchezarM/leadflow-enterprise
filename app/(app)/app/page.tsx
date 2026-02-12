import { DASHBOARD_STATS, LEADS_7DAYS, LEADS_RECENT } from "@/lib/mock/data";
import { KpiCards } from "@/components/ui/dashboard/kpi-cards";
import { LeadsChart } from "@/components/ui/dashboard/leads-chart";
import { RecentLeads } from "@/components/ui/dashboard/recent-leads";

function fmtInt(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
function fmtPct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default function DashboardPage() {
  const s = DASHBOARD_STATS;

  const kpis = [
    { title: "Leads today", value: fmtInt(s.leadsToday), hint: "Total intake" },
    { title: "Delivered", value: fmtInt(s.deliveredToday), hint: "Successfully sent" },
    { title: "Rejected", value: fmtInt(s.rejectedToday), hint: "Invalid / blocked / rules" },
    { title: "Revenue (demo)", value: fmtMoney(s.revenueToday), hint: `Acceptance: ${fmtPct(s.acceptanceRate)}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of intake, routing and delivery health.
        </p>
      </div>

      <KpiCards items={kpis} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <LeadsChart data={LEADS_7DAYS} />
        </div>
        <RecentLeads leads={LEADS_RECENT} />
      </div>
    </div>
  );
}
