"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { useControllableState } from "@/hooks/use-controllable-state";
import { cn } from "@/lib/cn";
import { springs } from "@/tokens/tokens";

export interface SwitchProps {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  className,
}: SwitchProps) {
  const [isOn, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div className={cn("flex items-center justify-between gap-6", className)}>
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description && (
          <span id={descriptionId} className="text-sm text-muted">
            {description}
          </span>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => setOn(!isOn)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5",
          "transition-colors duration-200 ease-snappy",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOn ? "bg-accent" : "bg-border",
        )}
      >
        <motion.span
          aria-hidden
          className={cn(
            "size-5 rounded-full shadow-sm transition-colors duration-200",
            // On, the track is ink, which is light in dark mode, so the thumb takes the contrasting colour.
            isOn ? "bg-accent-foreground" : "bg-white",
          )}
          initial={false}
          animate={{ x: isOn ? 20 : 0 }}
          transition={springs.snappy}
        />
      </button>
    </div>
  );
}
