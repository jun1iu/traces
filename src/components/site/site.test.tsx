import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { featuredRun, spanDepths } from "@/lib/runs/feature";
import { studies } from "@/lib/work";
import { HeroTrace } from "./hero-trace";
import { NavLink } from "./nav-link";
import { StudyList } from "./study-list";

vi.mock("next/navigation", () => ({ usePathname: () => "/work/run-explorer" }));

describe("featuredRun", () => {
  it("picks the same representative run every time", () => {
    const run = featuredRun();
    expect(run).toEqual(featuredRun());
    expect(run.status).toBe("passed");
    const kinds = new Set(run.spans.map((s) => s.kind));
    expect([...kinds]).toEqual(expect.arrayContaining(["llm", "tool", "retrieval"]));
    expect(Math.max(...spanDepths(run.spans).values())).toBeGreaterThanOrEqual(2);
  });
});

describe("HeroTrace", () => {
  const run = featuredRun();
  const depths = spanDepths(run.spans);
  const spans = run.spans.map((s) => ({ ...s, depth: depths.get(s.id) ?? 0 }));

  it("lists every step with its kind and timing for screen readers", () => {
    render(<HeroTrace runId={run.id} task={run.task} duration={run.duration} spans={spans} />);
    const steps = within(screen.getByRole("figure")).getAllByRole("listitem");
    // One item per step, plus the three entries in the key.
    expect(steps).toHaveLength(run.spans.length + 3);
    expect(screen.getAllByText(/Model call, starts at/).length).toBeGreaterThan(0);
  });

  it("links to the same run in the explorer", () => {
    render(<HeroTrace runId={run.id} task={run.task} duration={run.duration} spans={spans} />);
    expect(screen.getByRole("link", { name: "Open it in the run explorer" })).toHaveAttribute(
      "href",
      `/runs?run=${run.id}`,
    );
  });
});

describe("StudyList", () => {
  it("names each link by the study's title", () => {
    render(<StudyList />);
    for (const s of studies) {
      expect(screen.getByRole("link", { name: s.title })).toHaveAttribute("href", s.href);
    }
  });
});

describe("NavLink", () => {
  it("marks the section you are in, including its sub-pages", () => {
    render(
      <nav>
        <NavLink href="/work">Work</NavLink>
        <NavLink href="/runs">Runs</NavLink>
      </nav>,
    );
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Runs" })).not.toHaveAttribute("aria-current");
  });
});
