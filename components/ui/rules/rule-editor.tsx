"use client";

import { useMemo, useState } from "react";
import type {
  Buyer,
  Rule,
  Condition,
  Action,
  Operator,
} from "@/lib/mock/rules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Play } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const FIELDS: Condition["field"][] = ["source", "city", "budget", "status"];
const OPS: Operator[] = ["equals", "contains", "gt", "lt"];

function fieldLabel(f: Condition["field"]) {
  if (f === "source") return "Source";
  if (f === "city") return "City";
  if (f === "budget") return "Budget";
  return "Status";
}

export function RuleEditor({
  rule,
  buyers,
  onChange,
  readOnly = false,
}: {
  rule: Rule;
  buyers: Buyer[];
  onChange: (next: Rule) => void;
  readOnly?: boolean;
}) {
  const [testInput, setTestInput] = useState({
    source: "Meta Lead Ads",
    city: "Sofia",
    budget: 12000,
    status: "delivered",
  });

  // prevent accidental edits when readonly
  const update = (patch: Partial<Rule>) => {
    if (readOnly) return;
    onChange({ ...rule, ...patch });
  };

  const updateCondition = (idx: number, next: Condition) => {
    if (readOnly) return;
    const conditions = [...rule.conditions];
    conditions[idx] = next;
    update({ conditions });
  };

  const addCondition = () => {
    if (readOnly) return;
    update({
      conditions: [
        ...rule.conditions,
        { field: "source", op: "contains", value: "" },
      ],
    });
  };

  const removeCondition = (idx: number) => {
    if (readOnly) return;
    update({ conditions: rule.conditions.filter((_, i) => i !== idx) });
  };

  const actionUI = useMemo(() => {
    const a = rule.action;

    if (a.type === "route") {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Action</div>
            <Select
              value="route"
              onValueChange={() =>
                update({ action: { type: "route", buyerId: a.buyerId } })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="route">Route to buyer</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="tag">Tag</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="mb-1 text-xs text-muted-foreground">Buyer</div>
            <Select
              value={a.buyerId}
              onValueChange={(v) =>
                update({ action: { type: "route", buyerId: v } })
              }
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select buyer" />
              </SelectTrigger>
              <SelectContent>
                {buyers.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    if (a.type === "reject") {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Action</div>
            <Select
              value="reject"
              onValueChange={(v) => {
                const next: Action =
                  v === "route"
                    ? { type: "route", buyerId: buyers[0]?.id ?? "b1" }
                    : v === "tag"
                      ? { type: "tag", tag: "review" }
                      : { type: "reject", reason: a.reason };
                update({ action: next });
              }}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="route">Route to buyer</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="tag">Tag</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="mb-1 text-xs text-muted-foreground">Reason</div>
            <Input
              value={a.reason}
              onChange={(e) =>
                update({ action: { type: "reject", reason: e.target.value } })
              }
              placeholder="e.g. Duplicate lead"
              disabled={readOnly}
            />
          </div>
        </div>
      );
    }

    // tag
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Action</div>
          <Select
            value="tag"
            onValueChange={(v) => {
              const next: Action =
                v === "route"
                  ? { type: "route", buyerId: buyers[0]?.id ?? "b1" }
                  : v === "reject"
                    ? { type: "reject", reason: "Invalid lead" }
                    : { type: "tag", tag: (a as any).tag ?? "review" };
              update({ action: next });
            }}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="route">Route to buyer</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
              <SelectItem value="tag">Tag</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs text-muted-foreground">Tag</div>
          <Input
            value={(a as any).tag ?? ""}
            onChange={(e) =>
              update({ action: { type: "tag", tag: e.target.value } })
            }
            placeholder="e.g. needs_review"
            disabled={readOnly}
          />
        </div>
      </div>
    );
  }, [rule.action, buyers, readOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  const testResult = useMemo(() => {
    if (!rule.enabled) {
      return { matched: false, branch: "disabled", detail: "Rule is disabled" };
    }

    const checks = rule.conditions.map((c) => {
      const v =
        c.field === "budget"
          ? Number(testInput.budget)
          : String((testInput as any)[c.field] ?? "");

      const cv = c.field === "budget" ? Number(c.value) : c.value;

      let pass = false;

      if (c.op === "equals") pass = String(v) === String(cv);
      if (c.op === "contains") pass = String(v).includes(String(cv));
      if (c.op === "gt") pass = Number(v) > Number(cv);
      if (c.op === "lt") pass = Number(v) < Number(cv);

      return {
        field: c.field,
        op: c.op,
        expected: c.value,
        actual: v,
        pass,
      };
    });

    const allPass = checks.every((c) => c.pass);

    if (allPass) {
      return {
        matched: true,
        branch: "then",
        detail: rule.action,
        checks,
      };
    }

    return {
      matched: false,
      branch: "else",
      detail: rule.fallbackAction,
      checks,
    };
  }, [rule, testInput]);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">{rule.name}</CardTitle>
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(rule.updatedAt).toLocaleString()}
        </div>

        {/* small hint */}
        {readOnly ? (
          <div className="text-xs text-muted-foreground">
            Read-only mode (insufficient permissions)
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* meta */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-1 text-xs text-muted-foreground">Rule name</div>
            <Input
              value={rule.name}
              onChange={(e) => update({ name: e.target.value })}
              disabled={readOnly}
            />
          </div>
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Priority</div>
            <Input
              type="number"
              value={rule.priority}
              onChange={(e) => update({ priority: Number(e.target.value) })}
              disabled={readOnly}
            />
          </div>
        </div>

        <Separator />

        {/* conditions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">IF (all conditions match)</div>
            <Button
              variant="outline"
              size="sm"
              onClick={addCondition}
              disabled={readOnly}
            >
              Add condition
            </Button>
          </div>

          <div className="space-y-2">
            {rule.conditions.map((c, idx) => (
              <div
                key={idx}
                className="grid gap-2 rounded-md border bg-white p-3 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-4">
                  <div className="mb-1 text-xs text-muted-foreground">
                    Field
                  </div>
                  <Select
                    value={c.field}
                    onValueChange={(v) =>
                      updateCondition(idx, { ...c, field: v as any })
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELDS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {fieldLabel(f)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3">
                  <div className="mb-1 text-xs text-muted-foreground">
                    Operator
                  </div>
                  <Select
                    value={c.op}
                    onValueChange={(v) =>
                      updateCondition(idx, { ...c, op: v as any })
                    }
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPS.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-4">
                  <div className="mb-1 text-xs text-muted-foreground">
                    Value
                  </div>
                  <Input
                    value={c.value}
                    onChange={(e) =>
                      updateCondition(idx, { ...c, value: e.target.value })
                    }
                    placeholder="value…"
                    disabled={readOnly}
                  />
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCondition(idx)}
                    aria-label="Remove condition"
                    disabled={readOnly}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* action */}
        <div className="space-y-3">
          <div className="text-sm font-medium">THEN</div>
          {actionUI}
        </div>

        <Separator />

        {/* fallback */}
        <div className="space-y-3">
          <div className="text-sm font-medium">ELSE (fallback)</div>

          {rule.fallbackAction ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Action</div>
                <Select
                  value={rule.fallbackAction.type}
                  onValueChange={(v) => {
                    if (readOnly) return;

                    if (v === "route") {
                      update({
                        fallbackAction: {
                          type: "route",
                          buyerId: buyers[0]?.id ?? "b1",
                        },
                      });
                    } else if (v === "reject") {
                      update({
                        fallbackAction: {
                          type: "reject",
                          reason: "No rule matched",
                        },
                      });
                    }
                  }}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route">Route to buyer</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {rule.fallbackAction.type === "route" ? (
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">
                    Buyer
                  </div>
                  <Select
                    value={rule.fallbackAction.buyerId}
                    onValueChange={(v) => {
                      if (readOnly) return;
                      update({
                        fallbackAction: {
                          type: "route",
                          buyerId: v,
                        },
                      });
                    }}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buyers.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">
                    Reason
                  </div>
                  <Input
                    value={(rule.fallbackAction as any).reason ?? ""}
                    onChange={(e) => {
                      if (readOnly) return;
                      update({
                        fallbackAction: {
                          type: "reject",
                          reason: e.target.value,
                        },
                      });
                    }}
                    disabled={readOnly}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>

        <Separator />

        {/* test */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Test (simulation)</div>
            <Button variant="outline" size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Run
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Source</div>
              <Input
                value={testInput.source}
                onChange={(e) =>
                  setTestInput((p) => ({ ...p, source: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">City</div>
              <Input
                value={testInput.city}
                onChange={(e) =>
                  setTestInput((p) => ({ ...p, city: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Budget</div>
              <Input
                type="number"
                value={testInput.budget}
                onChange={(e) =>
                  setTestInput((p) => ({
                    ...p,
                    budget: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Status</div>
              <Input
                value={testInput.status}
                onChange={(e) =>
                  setTestInput((p) => ({ ...p, status: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 p-4 text-sm space-y-3">
            <div className="text-xs text-muted-foreground">Evaluation</div>

            {testResult.checks?.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div>
                  {c.field} {c.op} "{c.expected}"
                </div>
                <div
                  className={
                    c.pass
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {c.pass ? "PASS" : "FAIL"}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t text-sm font-medium">
              Decision:{" "}
              {testResult.branch === "then"
                ? "THEN branch"
                : testResult.branch === "else"
                  ? "ELSE branch"
                  : "Disabled"}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Demo evaluator checks all IF conditions against the sample input.
          </div>
        </div>

        {/* optional notes */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Notes</div>
          <Textarea
            placeholder="Optional internal notes…"
            disabled={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}
