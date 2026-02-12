import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Lead } from "@/lib/mock/data";
import { StatusBadge } from "@/components/ui/leads/status-badge";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.max(1, Math.round(diff / 60000));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return `${h}h ago`;
}

export function RecentLeads({ leads }: { leads: Lead[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((l) => (
                <TableRow key={l.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{l.id}</TableCell>
                  <TableCell>
                    <div className="leading-tight">
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.source}</TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {timeAgo(l.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
