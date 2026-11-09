import type { ReactNode } from "react";

/** A framed showcase for one component: the live demo plus the details behind it. */
export function Specimen({
  title,
  description,
  notes,
  children,
}: {
  title: string;
  description: string;
  notes: string[];
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex min-h-48 items-center justify-center border-b border-border bg-background/60 p-8">
        {children}
      </div>
      <div className="flex flex-col gap-3 p-6">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <ul className="flex flex-wrap gap-2 text-xs text-muted">
          {notes.map((note) => (
            <li key={note} className="rounded-full border border-border px-2.5 py-1">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
