"use client";

import type { Lead } from "@/lib/mock/data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "./status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function LeadDrawer({
  lead,
  onClose,
}: {
  lead: Lead | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!lead} onOpenChange={onClose}>
      <SheetContent className="w-120 sm:w-150">
        {lead && (
          <>
            <SheetHeader>
              <SheetTitle>{lead.name}</SheetTitle>
            </SheetHeader>

            <div className="mt-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="payload">Payload</TabsTrigger>
                  <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
                </TabsList>

                {/* DETAILS TAB */}
                <TabsContent value="details" className="mt-6 space-y-4 text-sm ml-8">
                  <div>
                    <div className="text-muted-foreground">Lead ID</div>
                    <div className="font-medium">{lead.id}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div>{lead.phone}</div>
                  </div>

                  {lead.email && (
                    <div>
                      <div className="text-muted-foreground">Email</div>
                      <div>{lead.email}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-muted-foreground">Source</div>
                    <div>{lead.source}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <StatusBadge status={lead.status} />
                  </div>

                  {lead.buyer && (
                    <div>
                      <div className="text-muted-foreground">Assigned buyer</div>
                      <div>{lead.buyer}</div>
                    </div>
                  )}
                </TabsContent>

                {/* PAYLOAD TAB */}
                <TabsContent value="payload" className="mt-6">
                  <div className="overflow-auto rounded-md bg-muted p-4 text-xs">
                    <pre>
                      {JSON.stringify(lead.payload || {}, null, 2)}
                    </pre>
                  </div>
                </TabsContent>

                {/* DELIVERY LOGS TAB */}
                <TabsContent value="logs" className="mt-6 space-y-4">
                  {lead.deliveryAttempts?.length ? (
                    lead.deliveryAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="rounded-md border p-4 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{attempt.buyer}</div>
                          <Badge
                            variant={
                              attempt.outcome === "success"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {attempt.outcome}
                          </Badge>
                        </div>

                        <div className="mt-2 text-muted-foreground text-xs">
                          Response: {attempt.responseCode} •{" "}
                          {attempt.latencyMs}ms
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(attempt.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No delivery attempts recorded.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
