import Link from "next/link";
import { studies } from "@/lib/work";

/**
 * The case studies as a list, not cards: the title is the link, and the project's
 * name sits in the margin so the eye can scan what each one is about.
 */
export function StudyList({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <ol className="border-t border-border">
      {studies.map((s) => (
        <li
          key={s.href}
          className="group relative grid gap-x-10 gap-y-2 border-b border-border py-7 sm:grid-cols-[11rem_1fr]"
        >
          <p className="text-sm text-muted sm:pt-1.5">{s.project}</p>
          <div className="flex max-w-[62ch] flex-col gap-2">
            <Heading className="font-display text-[1.75rem] sm:text-[2rem]">
              {/* The whole row is the target; the title carries the link's name. */}
              <Link
                href={s.href}
                className="decoration-border underline-offset-[6px] group-hover:underline after:absolute after:inset-0"
              >
                {s.title}
              </Link>
            </Heading>
            <p className="text-pretty text-muted">{s.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
