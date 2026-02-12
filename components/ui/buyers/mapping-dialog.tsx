"use client";

import type { Buyer, FieldMapRow } from "@/lib/mock/buyers";
import { INTERNAL_FIELDS } from "@/lib/mock/buyers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SAMPLE_LEAD = {
  name: "Test Lead",
  phone: "+359 88 000 0000",
  email: "test@example.com",
  city: "Sofia",
  budget: 12000,
  source: "Simulation",
  status: "delivered",
};

export function MappingDialog({
  buyer,
  onClose,
  onSave,
}: {
  buyer: Buyer | null;
  onClose: () => void;
  onSave: (mapping: FieldMapRow[]) => void;
}) {
  const [rows, setRows] = useState<FieldMapRow[]>([]);

  useEffect(() => {
    if (buyer) setRows(buyer.mapping);
  }, [buyer]);

  const addRow = () =>
    setRows((p) => [...p, { from: INTERNAL_FIELDS[0], to: "" }]);

  const updateRow = (i: number, patch: Partial<FieldMapRow>) => {
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  const removeRow = (i: number) =>
    setRows((p) => p.filter((_, idx) => idx !== i));

  // 🔥 Validation logic
  const duplicateBuyerFields = useMemo(() => {
    const counts: Record<string, number> = {};
    rows.forEach((r) => {
      if (!r.to) return;
      counts[r.to] = (counts[r.to] || 0) + 1;
    });
    return new Set(
      Object.entries(counts)
        .filter(([_, count]) => count > 1)
        .map(([field]) => field)
    );
  }, [rows]);

  const hasErrors = rows.some(
    (r) => !r.to.trim() || duplicateBuyerFields.has(r.to)
  );

  // 🔥 Live preview
  const payloadPreview = useMemo(() => {
    const out: Record<string, any> = {};
    rows.forEach((r) => {
      if (!r.to) return;
      out[r.to] = (SAMPLE_LEAD as any)[r.from];
    });
    return out;
  }, [rows]);

  return (
    <Dialog open={!!buyer} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Field mapping — {buyer?.name}</DialogTitle>
        </DialogHeader>

        <div className="text-xs text-muted-foreground">
          Map internal lead fields to the buyer’s API payload structure.
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* LEFT: MAPPING */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground">
              <div className="col-span-5">Internal field</div>
              <div className="col-span-6">Buyer field</div>
              <div className="col-span-1" />
            </div>

            {rows.map((r, i) => {
              const duplicate = duplicateBuyerFields.has(r.to);

              return (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  {/* FROM */}
                  <div className="col-span-5">
                    <Select
                      value={r.from}
                      onValueChange={(v) =>
                        updateRow(i, { from: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERNAL_FIELDS.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* TO */}
                  <div className="col-span-6">
                    <Input
                      value={r.to}
                      onChange={(e) =>
                        updateRow(i, { to: e.target.value })
                      }
                      className={
                        duplicate || !r.to.trim()
                          ? "border-red-500"
                          : ""
                      }
                      placeholder="buyer_field_name"
                    />
                    {duplicate ? (
                      <div className="text-xs text-red-500 mt-1">
                        Duplicate field name
                      </div>
                    ) : !r.to.trim() ? (
                      <div className="text-xs text-red-500 mt-1">
                        Required
                      </div>
                    ) : null}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add mapping row
            </Button>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Payload preview
              </div>
              {hasErrors ? (
                <Badge variant="destructive">Invalid mapping</Badge>
              ) : (
                <Badge variant="secondary">Valid</Badge>
              )}
            </div>

            <div className="rounded-md border bg-muted/30 p-4 text-xs font-mono overflow-auto h-75">
              <pre>{JSON.stringify(payloadPreview, null, 2)}</pre>
            </div>

            <div className="text-xs text-muted-foreground">
              Preview generated using sample lead data.
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={hasErrors}
            onClick={() => onSave(rows)}
          >
            Save mapping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
