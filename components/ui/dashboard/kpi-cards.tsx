import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type KPI = {
  title: string;
  value: string;
  hint?: string;
};

export function KpiCards({ items }: { items: KPI[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {kpi.value}
            </div>
            {kpi.hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
