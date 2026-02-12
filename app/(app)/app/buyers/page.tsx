import { BuyersShell } from "@/components/ui/buyers/buyers-shell";

export default function BuyersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Buyers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage delivery endpoints, caps, and field mappings.
        </p>
      </div>

      <BuyersShell />
    </div>
  );
}
