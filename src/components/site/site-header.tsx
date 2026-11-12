import Link from "next/link";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 in-[body:has([data-wide])]:max-w-[1440px] sm:px-6">
        <nav aria-label="Main" className="flex items-center gap-4 text-sm sm:gap-6">
          <Link href="/" className="mr-1 flex items-baseline gap-2 sm:mr-3">
            <span className="font-display text-[17px] leading-none tracking-tight">Jun Liu</span>
            <span className="hidden text-muted md:inline">Design engineer</span>
          </Link>
          <NavLink href="/work">Work</NavLink>
          <NavLink href="/runs">Runs</NavLink>
          <NavLink href="/returns">Assistant</NavLink>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
