"use client";

import { useMemo, useState } from "react";
import { BUYERS, RULES, type Rule } from "@/lib/mock/rules";
import { uid } from "@/lib/id";
import { useRole } from "@/lib/use-role";
import { hasPermission } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { RuleEditor } from "./rule-editor";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x));
}

export function RulesShell() {
  const role = useRole();
  const canWrite = hasPermission(role, "rules:write");

  const [rules, setRules] = useState<Rule[]>(
    [...RULES].sort((a, b) => a.priority - b.priority)
  );

  const [activeId, setActiveId] = useState(rules[0]?.id ?? "");
  const active = useMemo(
    () => rules.find((r) => r.id === activeId) ?? null,
    [rules, activeId]
  );

  // draft editing (enterprise UX: Save/Discard)
  const [draft, setDraft] = useState<Rule | null>(
    active ? clone(active) : null
  );

  const selectRule = (id: string) => {
    setActiveId(id);
    const r = rules.find((x) => x.id === id) ?? null;
    setDraft(r ? clone(r) : null);
  };

  const updateDraft = (next: Rule) => setDraft(next);

  const isDirty = useMemo(() => {
    if (!active || !draft) return false;
    return JSON.stringify(active) !== JSON.stringify(draft);
  }, [active, draft]);

  const save = () => {
    if (!draft || !canWrite) return;
    setRules((prev) =>
      prev
        .map((r) => (r.id === draft.id ? draft : r))
        .sort((a, b) => a.priority - b.priority)
    );
    setDraft(clone(draft));
  };

  const discard = () => {
    if (!active) return;
    setDraft(clone(active));
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    if (!canWrite) return;

    setRules((prev) =>
      prev
        .map((r) => (r.id === id ? { ...r, enabled } : r))
        .sort((a, b) => a.priority - b.priority)
    );

    // keep draft in sync if toggling active
    if (draft?.id === id) setDraft({ ...draft, enabled });
  };

  const createRule = () => {
    if (!canWrite) return;

    const next: Rule = {
      id: uid("rule"),
      name: "New rule",
      enabled: true,
      priority: Math.max(0, ...rules.map((r) => r.priority)) + 1,
      conditions: [{ field: "source", op: "contains", value: "" }],
      action: { type: "route", buyerId: BUYERS[0]?.id ?? "b1" },
      fallbackAction: { type: "route", buyerId: BUYERS[0]?.id ?? "b1" },
      updatedAt: new Date().toISOString(),
    };

    setRules((prev) => [...prev, next].sort((a, b) => a.priority - b.priority));
    setActiveId(next.id);
    setDraft(clone(next));
  };

  const deleteRule = (id: string) => {
    if (!canWrite) return;

    const remaining = rules
      .filter((r) => r.id !== id)
      .sort((a, b) => a.priority - b.priority);

    setRules(remaining);

    const nextId = remaining[0]?.id ?? "";
    setActiveId(nextId);
    setDraft(nextId ? clone(remaining[0]) : null);
  };

  const saveDisabled = !draft?.name?.trim();

  return (
    <div className="grid gap-6 xl:grid-cols-12">
      {/* Left: rules list */}
      <Card className="xl:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Rules
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={createRule}
            disabled={!canWrite}
          >
            New rule
          </Button>
        </CardHeader>

        <CardContent className="space-y-2">
          {rules.map((r) => {
            const isActive = r.id === activeId;

            return (
              <div
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => selectRule(r.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") selectRule(r.id);
                }}
                className={cn(
                  "w-full rounded-md border p-3 text-left transition-colors",
                  "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isActive && "border-muted-foreground/30 bg-muted"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Priority: {r.priority}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {r.enabled ? "On" : "Off"}
                    </span>

                    {/* ✅ disable switch when readonly */}
                    <Switch
                      checked={r.enabled}
                      disabled={!canWrite}
                      onCheckedChange={(v) => toggleEnabled(r.id, v)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {rules.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No rules yet. Create your first rule.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Right: editor */}
      <div className="relative xl:col-span-8">
        {draft ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {isDirty ? "Unsaved changes" : "All changes saved"}
              </div>

              <div className="flex items-center gap-2">
                {/* ✅ Delete (disabled trigger when readonly) */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={!canWrite}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete rule?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove the rule from the ruleset. (Demo UI)
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteRule(draft.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Save / Discard */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={discard}
                  disabled={!isDirty || !canWrite}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={save}
                  disabled={!isDirty || saveDisabled || !canWrite}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* ✅ pass readOnly to editor */}
            <RuleEditor
              rule={draft}
              buyers={BUYERS}
              onChange={updateDraft}
            />
          </>
        ) : (
          <Card>
            <CardContent className="py-10 text-sm text-muted-foreground">
              Select a rule to edit.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
