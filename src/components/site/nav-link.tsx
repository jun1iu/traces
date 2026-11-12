"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A header link that marks the section you're in, for sighted and screen-reader users alike. */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "relative py-1 transition-colors",
        current ? "text-foreground" : "text-muted hover:text-foreground",
        // A short ink rule under the current section, sitting on the header's bottom edge.
        "after:absolute after:inset-x-0 after:-bottom-[17px] after:h-px after:bg-foreground after:opacity-0",
        current && "after:opacity-100",
      )}
    >
      {children}
    </Link>
  );
}
