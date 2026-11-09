import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 in-[body:has([data-wide])]:max-w-[1440px] sm:px-6">
        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          {/* On phones the wordmark becomes a mark, so three links and the theme switcher fit. */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-md bg-foreground font-mono text-[11px] text-background sm:hidden"
            >
              DE
            </span>
            <span className="sr-only sm:not-sr-only">Playground</span>
          </Link>
          <Link href="/work" className="text-muted transition-colors hover:text-foreground">
            Work
          </Link>
          <Link href="/runs" className="text-muted transition-colors hover:text-foreground">
            Runs
          </Link>
          <Link href="/returns" className="text-muted transition-colors hover:text-foreground">
            Assistant
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
