import type { Metadata } from "next";
import { colorTokens, durations, springs } from "@/tokens/tokens";

export const metadata: Metadata = { title: "Tokens" };

export default function TokensPage() {
  return (
    <div className="flex flex-col gap-14">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Tokens</h1>
        <p className="text-muted">
          Components use these semantic names and never raw values. That is why the whole site
          changes theme by swapping one set of CSS variables. Toggle the theme to see each swatch
          change.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold">Colour</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((token) => (
            <li
              key={token.name}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-3"
            >
              <span
                className="size-12 shrink-0 rounded-lg border border-border"
                style={{ background: `var(--${token.name})` }}
              />
              <span className="flex min-w-0 flex-col">
                <code className="font-mono text-sm">{token.name}</code>
                <span className="truncate text-sm text-muted">{token.role}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold">Motion</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <TokenTable
            caption="Durations"
            rows={Object.entries(durations).map(([name, s]) => [name, `${s * 1000}ms`])}
          />
          <TokenTable
            caption="Springs"
            rows={Object.entries(springs).map(([name, s]) => [
              name,
              `stiffness ${s.stiffness} · damping ${s.damping}`,
            ])}
          />
        </div>
      </section>
    </div>
  );
}

function TokenTable({ caption, rows }: { caption: string; rows: [string, string][] }) {
  return (
    <table className="w-full overflow-hidden rounded-xl border border-border bg-surface text-sm">
      <caption className="mb-2 text-left text-sm text-muted">{caption}</caption>
      <tbody>
        {rows.map(([name, value]) => (
          <tr key={name} className="border-t border-border first:border-t-0">
            <th scope="row" className="px-4 py-3 text-left font-mono font-normal">
              {name}
            </th>
            <td className="px-4 py-3 text-right font-mono text-muted">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
