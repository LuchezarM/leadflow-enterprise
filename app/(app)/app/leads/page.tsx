import { LEADS_RECENT } from "@/lib/mock/data";
import { LeadsTable } from "@/components/ui/leads/leads-table";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage intake, routing status and delivery attempts.
        </p>
      </div>

      <LeadsTable data={LEADS_RECENT} />
    </div>
  );
}
