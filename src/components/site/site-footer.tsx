import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted in-[body:has([data-wide])]:max-w-[1440px] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Designed and built by Jun Liu in Hong Kong. Set in Instrument Sans and IBM Plex Mono.</p>
        <nav aria-label="Elsewhere" className="flex gap-5">
          <Link href="/tokens" className="hover:text-foreground">
            Tokens
          </Link>
          <a href="https://github.com/jun1iu/typescript-project" className="hover:text-foreground">
            Source on GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
