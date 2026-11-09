"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";

export function ButtonDemo() {
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => setSaving(false), 1600);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button loading={saving} onClick={save}>
        Save changes
      </Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="danger">Delete</Button>
    </div>
  );
}

export function SwitchDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <Switch label="Email notifications" description="A summary every Monday." defaultChecked />
      <Switch label="Product updates" />
      <Switch label="Beta features" description="Managed by your organisation." disabled />
    </div>
  );
}

const views = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const;

export function SegmentedControlDemo() {
  const [view, setView] = useState<(typeof views)[number]["value"]>("week");
  return (
    <div className="flex flex-col items-center gap-4">
      <SegmentedControl
        aria-label="Calendar view"
        options={views}
        value={view}
        onValueChange={setView}
      />
      <p className="text-sm text-muted" aria-live="polite">
        Showing the <span className="font-medium text-foreground">{view}</span> view
      </p>
    </div>
  );
}
