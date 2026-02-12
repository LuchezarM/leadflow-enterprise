import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/mock/data";

const MAP: Record<
  LeadStatus,
  { label: string; variant?: "default" | "secondary" | "destructive" | "outline" }
> = {
  delivered: { label: "Delivered", variant: "default" },
  accepted: { label: "Accepted", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
  duplicate: { label: "Duplicate", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = MAP[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
