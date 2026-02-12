"use client";

import { useMemo, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/mock/data";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "./status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadDrawer } from "./lead-drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey = "newest" | "oldest" | "name_asc" | "name_desc";

function includes(hay: string | undefined, needle: string) {
  if (!hay) return false;
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export function LeadsTable({ data }: { data: Lead[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [source, setSource] = useState<string | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selected, setSelected] = useState<Lead | null>(null);

  const sources = useMemo(() => {
    const s = Array.from(new Set(data.map((d) => d.source))).sort();
    return s;
  }, [data]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    let rows = data.filter((lead) => {
      const matchesQuery =
        !qq ||
        includes(lead.id, qq) ||
        includes(lead.name, qq) ||
        includes(lead.phone, qq) ||
        includes(lead.email, qq);

      const matchesStatus = status === "all" ? true : lead.status === status;
      const matchesSource = source === "all" ? true : lead.source === source;

      return matchesQuery && matchesStatus && matchesSource;
    });

    rows = rows.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();

      if (sort === "newest") return tb - ta;
      if (sort === "oldest") return ta - tb;
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "name_desc") return b.name.localeCompare(a.name);
      return 0;
    });

    return rows;
  }, [data, q, status, source, sort]);

  const hasFilters = q.trim() || status !== "all" || source !== "all" || sort !== "newest";

  const clearFilters = () => {
    setQ("");
    setStatus("all");
    setSource("all");
    setSort("newest");
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Search by name, phone, email or ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="md:w-90"
          />

          <div className="flex flex-wrap gap-3">
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={source} onValueChange={(v) => setSource(v as any)}>
              <SelectTrigger className="w-50">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {sources.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name_asc">Name A–Z</SelectItem>
                <SelectItem value="name_desc">Name Z–A</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters ? (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-35">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((lead) => (
              <TableRow
                key={lead.id}
                onClick={() => setSelected(lead)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">{lead.id}</TableCell>
                <TableCell>
                  <div className="leading-tight">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {lead.phone}
                      {lead.email ? ` • ${lead.email}` : ""}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{lead.buyer || "—"}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No leads match your filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <LeadDrawer lead={selected} onClose={() => setSelected(null)} />
    </>
  );
}
