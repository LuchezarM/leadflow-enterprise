import { RulesShell } from "@/components/ui/rules/rules-shell";

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Rules</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build conditional routing logic for incoming leads.
        </p>
      </div>

      <RulesShell />
    </div>
  );
}
