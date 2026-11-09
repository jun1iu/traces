"use client";

import { useState } from "react";
import { kindStyles } from "@/components/runs/span-tree";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/cn";
import { formatMs } from "@/lib/runs/stats";
import { ERRORED_RUN_ID, runById } from "./demo-runs";

const vision = [
  { value: "typical", label: "Typical" },
  { value: "deutan", label: "Deuteranopia" },
  { value: "protan", label: "Protanopia" },
] as const;

const encoding = [
  { value: "colour", label: "Colour only" },
  { value: "shipped", label: "Colour + stripes + label" },
] as const;

/**
 * Simulated colour vision (Machado et al. 2009, full severity) applied to a real
 * errored run. In "colour only", the failed tool call is told apart by red alone.
 */
export function CvdCompare() {
  const run = runById(ERRORED_RUN_ID);
  const [v, setV] = useState<(typeof vision)[number]["value"]>("deutan");
  const [e, setE] = useState<(typeof encoding)[number]["value"]>("colour");
  const steps = run.spans.slice(1);

  return (
    <div>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="cvd-deutan" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values="0.367 0.861 -0.228 0 0  0.280 0.673 0.047 0 0  -0.012 0.043 0.969 0 0  0 0 0 1 0"
          />
        </filter>
        <filter id="cvd-protan" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values="0.152 1.053 -0.205 0 0  0.115 0.786 0.099 0 0  -0.004 -0.048 1.052 0 0  0 0 0 1 0"
          />
        </filter>
      </svg>
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <SegmentedControl
          aria-label="Colour vision"
          size="sm"
          options={vision}
          value={v}
          onValueChange={setV}
        />
        <SegmentedControl
          aria-label="How failure is shown"
          size="sm"
          options={encoding}
          value={e}
          onValueChange={setE}
        />
      </div>
      <div
        className="flex flex-col gap-1.5 px-4 py-5"
        style={{ filter: v === "typical" ? undefined : `url(#cvd-${v})` }}
        data-testid="cvd-stage"
      >
        {steps.map((s) => {
          const failed = s.status === "error";
          return (
            <div
              key={s.id}
              className="grid grid-cols-[minmax(0,12rem)_1fr] items-center gap-3 text-sm"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate">{s.name}</span>
                {failed && e === "shipped" && (
                  <span className="shrink-0 text-xs font-medium text-danger">▲ Error</span>
                )}
              </span>
              <span className="relative h-5">
                <span
                  className={cn(
                    "absolute inset-y-1 rounded-[3px]",
                    failed ? "bg-danger" : kindStyles[s.kind].bar,
                  )}
                  style={{
                    left: `${(s.start / run.duration) * 100}%`,
                    width: `${Math.max(1, (s.duration / run.duration) * 100)}%`,
                    backgroundImage:
                      failed && e === "shipped"
                        ? "repeating-linear-gradient(135deg, transparent 0 4px, rgb(255 255 255 / .35) 4px 6px)"
                        : undefined,
                  }}
                  title={`${s.name}: ${formatMs(s.duration)}${failed ? ", failed" : ""}`}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
