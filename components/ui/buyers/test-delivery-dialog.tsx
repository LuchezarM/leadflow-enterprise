"use client";

import type { Buyer } from "@/lib/mock/buyers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/lib/use-role";
import { hasPermission } from "@/lib/rbac";

function simulate(b: Buyer) {
  // simple demo logic: if cap reached → fail; else random-ish success
  if (b.dailyCap > 0 && b.sentToday >= b.dailyCap) {
    return { ok: false, code: 429, latency: 1200, msg: "Daily cap reached" };
  }
  const ok = Math.random() > 0.2; // 80% success
  return ok
    ? {
        ok: true,
        code: 200,
        latency: 320 + Math.round(Math.random() * 300),
        msg: "Accepted",
      }
    : {
        ok: false,
        code: 500,
        latency: 700 + Math.round(Math.random() * 500),
        msg: "Buyer server error",
      };
}

export function TestDeliveryDialog({
  buyer,
  onClose,
}: {
  buyer: Buyer | null;
  onClose: () => void;
}) {
  const role = useRole();
  const canRead = hasPermission(role, "buyers:read");

  const [result, setResult] = useState<null | {
    ok: boolean;
    code: number;
    latency: number;
    msg: string;
  }>(null);

  const sample = useMemo(
    () => ({
      name: "Test Lead",
      phone: "+359 88 000 0000",
      email: "test@example.com",
      city: "Sofia",
      budget: 12000,
      source: "Simulation",
    }),
    [],
  );

  const payloadPreview = useMemo(() => {
    if (!buyer) return {};
    const out: Record<string, any> = {};
    for (const m of buyer.mapping) {
      out[m.to || m.from] = (sample as any)[m.from];
    }
    return out;
  }, [buyer, sample]);

  const run = () => {
    if (!buyer) return;
    if (!buyer.active) return;
    setResult(simulate(buyer));
  };

  const reset = () => setResult(null);

  return (
    <Dialog
      open={!!buyer}
      onOpenChange={() => {
        reset();
        onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test delivery — {buyer?.name}</DialogTitle>
        </DialogHeader>

        {!canRead ? (
          <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
            You don’t have access to view buyer delivery details.
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="mb-2 text-xs text-muted-foreground">
                  Request preview
                </div>
                <Textarea
                  readOnly
                  className="h-60 font-mono text-xs"
                  value={JSON.stringify(payloadPreview, null, 2)}
                />
                <div className="mt-2 text-xs text-muted-foreground">
                  Endpoint:{" "}
                  <span className="text-foreground">{buyer?.endpoint}</span>
                </div>
                {!buyer?.active ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    This buyer is currently{" "}
                    <span className="font-medium text-foreground">
                      inactive
                    </span>
                    . Test is disabled.
                  </div>
                ) : null}
              </div>

              <div>
                <div className="mb-2 text-xs text-muted-foreground">
                  Response
                </div>

                <div className="rounded-md border bg-muted/30 p-4">
                  {result ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {result.ok ? "Success" : "Failed"}
                        </div>
                        <Badge
                          variant={result.ok ? "secondary" : "destructive"}
                        >
                          {result.code}
                        </Badge>
                      </div>
                      <div className="text-sm">{result.msg}</div>
                      <div className="text-xs text-muted-foreground">
                        Latency: {result.latency}ms
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Click “Run test” to simulate delivery.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={run} disabled={!buyer?.active}>
                    Run test
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Reset
                  </Button>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Demo simulation only. No network requests are made.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
