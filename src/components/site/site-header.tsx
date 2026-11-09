import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="font-semibold">
            Playground
          </Link>
          <Link href="/tokens" className="text-muted transition-colors hover:text-foreground">
            Tokens
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
