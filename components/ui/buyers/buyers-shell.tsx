"use client";

import { useMemo, useState } from "react";
import { BUYERS as SEED, type Buyer } from "@/lib/mock/buyers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MappingDialog } from "./mapping-dialog";
import { TestDeliveryDialog } from "./test-delivery-dialog";
import { useRole } from "@/lib/use-role";
import { hasPermission } from "@/lib/rbac";

function capState(sentToday: number, dailyCap: number) {
  if (dailyCap <= 0) return { label: "No cap", tone: "outline" as const };
  const ratio = sentToday / dailyCap;
  if (ratio >= 1) return { label: "Cap reached", tone: "destructive" as const };
  if (ratio >= 0.8) return { label: "Near cap", tone: "secondary" as const };
  return { label: "OK", tone: "outline" as const };
}

export function BuyersShell() {
  const role = useRole();
  const canWrite = hasPermission(role, "buyers:write");

  const [buyers, setBuyers] = useState<Buyer[]>(SEED);
  const [q, setQ] = useState("");

  const [mappingBuyer, setMappingBuyer] = useState<Buyer | null>(null);
  const [testBuyer, setTestBuyer] = useState<Buyer | null>(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return buyers;
    return buyers.filter((b) => b.name.toLowerCase().includes(qq));
  }, [buyers, q]);

  const toggleActive = (id: string, active: boolean) => {
    if (!canWrite) return;
    setBuyers((prev) => prev.map((b) => (b.id === id ? { ...b, active } : b)));
  };

  const updateCap = (id: string, dailyCap: number) => {
    if (!canWrite) return;
    setBuyers((prev) => prev.map((b) => (b.id === id ? { ...b, dailyCap } : b)));
  };

  const saveMapping = (id: string, mapping: Buyer["mapping"]) => {
    if (!canWrite) return;
    setBuyers((prev) => prev.map((b) => (b.id === id ? { ...b, mapping } : b)));
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Buyers
            </CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              Enterprise routing destinations (endpoints)
            </div>
          </div>

          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search buyers…"
            className="md:w-70"
          />
        </CardHeader>

        <CardContent className="space-y-3">
          {filtered.map((b) => {
            const cap = capState(b.sentToday, b.dailyCap);

            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-lg border bg-white p-4",
                  !b.active && "opacity-80"
                )}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* LEFT SIDE */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold">
                        {b.name}
                      </div>
                      <Badge variant={cap.tone}>{cap.label}</Badge>
                    </div>

                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {b.endpoint}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Auth: {b.authType}</span>
                      <span>•</span>
                      <span>Timeout: {b.timeoutMs}ms</span>
                      <span>•</span>
                      <span>
                        Sent today:{" "}
                        <span className="font-medium text-foreground">
                          {b.sentToday}
                        </span>
                        /{b.dailyCap}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT ACTIONS */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Active toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Active
                      </span>
                      <Switch
                        checked={b.active}
                        onCheckedChange={(v) => toggleActive(b.id, v)}
                        disabled={!canWrite}
                      />
                    </div>

                    {/* Daily cap */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Daily cap
                      </span>
                      <Input
                        type="number"
                        className="w-27.5"
                        value={b.dailyCap}
                        onChange={(e) =>
                          updateCap(b.id, Number(e.target.value))
                        }
                        disabled={!canWrite}
                      />
                    </div>

                    {/* Field mapping */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMappingBuyer(b)}
                      disabled={!canWrite}
                    >
                      Field mapping
                    </Button>

                    {/* Test delivery */}
                    <Button
                      size="sm"
                      onClick={() => setTestBuyer(b)}
                      disabled={!b.active}
                    >
                      Test delivery
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No buyers found.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Mapping Dialog */}
      <MappingDialog
        buyer={mappingBuyer}
        onClose={() => setMappingBuyer(null)}
        onSave={(mapping) => {
          if (!mappingBuyer || !canWrite) return;
          saveMapping(mappingBuyer.id, mapping);
          setMappingBuyer(null);
        }}
      />

      {/* Test Delivery Dialog */}
      <TestDeliveryDialog
        buyer={testBuyer}
        onClose={() => setTestBuyer(null)}
      />
    </>
  );
}
