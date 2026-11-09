import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { colorTokens } from "./tokens";

const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8");

/** Returns the body of the first CSS block whose selector contains `selector`. */
function block(selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

describe("design tokens", () => {
  const themes = {
    light: block('[data-theme="light"]'),
    "dark (system)": block(':root:not([data-theme="light"])'),
    "dark (explicit)": block('[data-theme="dark"] {'),
  };

  for (const [theme, body] of Object.entries(themes)) {
    it.each(colorTokens.map((t) => t.name))(`defines --%s in ${theme}`, (name) => {
      expect(body).toMatch(new RegExp(`--${name}:\\s*[^;]+;`));
    });
  }

  it("exposes every token to Tailwind", () => {
    const theme = block("@theme inline");
    for (const { name } of colorTokens) {
      expect(theme).toContain(`--color-${name}: var(--${name});`);
    }
  });

  it("keeps system dark and explicit dark in sync", () => {
    const norm = (s: string) =>
      s
        .split(";")
        .map((l) => l.trim())
        .filter(Boolean)
        .sort();
    expect(norm(themes["dark (system)"])).toEqual(norm(themes["dark (explicit)"]));
  });
});
