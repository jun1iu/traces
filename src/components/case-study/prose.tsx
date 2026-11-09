import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Long-form building blocks for case studies: readable measure, clear hierarchy. */

export function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t border-border pt-10"
    >
      <p className="font-mono text-xs tracking-wider text-accent uppercase">{kicker}</p>
      <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold tracking-tight text-balance">
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("max-w-[68ch] text-[16px] leading-relaxed text-pretty", className)}>
      {children}
    </p>
  );
}

/**
 * One design decision, always in the same shape: what I chose, what I didn't,
 * why, and what it cost. The cost line is the point: every choice gives something up.
 */
export function Decision({
  title,
  chose,
  rejected,
  because,
  cost,
  children,
}: {
  title: string;
  chose: ReactNode;
  rejected: ReactNode;
  because: ReactNode;
  cost: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <dl className="grid max-w-[68ch] gap-x-6 gap-y-3 text-[15px] leading-relaxed sm:grid-cols-[7.5rem_1fr]">
        <dt className="font-medium text-muted">Chose</dt>
        <dd>{chose}</dd>
        <dt className="font-medium text-muted">Instead of</dt>
        <dd>{rejected}</dd>
        <dt className="font-medium text-muted">Because</dt>
        <dd>{because}</dd>
        <dt className="font-medium text-muted">Trade-off</dt>
        <dd>{cost}</dd>
      </dl>
      {children}
    </article>
  );
}

export function Figure({
  caption,
  children,
  className,
}: {
  caption: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-xl border border-border bg-surface", className)}>
      {children}
      <figcaption className="border-t border-border px-4 py-3 text-sm text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

export function Metrics({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className="bg-surface px-4 py-3">
          <dd className="text-2xl font-semibold tracking-tight tabular-nums">{m.value}</dd>
          <dt className="mt-1 text-xs text-muted">{m.label}</dt>
        </div>
      ))}
    </dl>
  );
}
