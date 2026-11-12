import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <p className="font-mono text-xs tracking-wider text-accent uppercase">404</p>
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        There’s nothing at this address.
      </h1>
      <p className="text-lg text-pretty text-muted">
        The page may have moved, or the link has a typo. Everything that exists is one of these:
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-lg">
        <li>
          <Link href="/" className="underline underline-offset-4">
            Home
          </Link>
        </li>
        <li>
          <Link href="/work" className="underline underline-offset-4">
            Case studies
          </Link>
        </li>
        <li>
          <Link href="/runs" className="underline underline-offset-4">
            Run explorer
          </Link>
        </li>
        <li>
          <Link href="/returns" className="underline underline-offset-4">
            Returns assistant
          </Link>
        </li>
        <li>
          <Link href="/tokens" className="underline underline-offset-4">
            Tokens
          </Link>
        </li>
      </ul>
    </div>
  );
}
