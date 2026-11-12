import type { ReactNode } from "react";

/** One component on show: the live demo, then what it is and what's worth noticing. */
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
    <section className="flex flex-col bg-surface">
      <div className="flex min-h-52 items-center justify-center p-8">{children}</div>
      <div className="flex flex-1 flex-col gap-3 border-t border-border p-6">
        <h3 className="font-display text-xl">{title}</h3>
        <p className="text-sm text-pretty text-muted">{description}</p>
        <ul className="mt-auto flex flex-col gap-1 pt-2 text-sm">
          {notes.map((note) => (
            <li key={note} className="flex gap-2">
              <span aria-hidden className="text-muted">
                –
              </span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
