import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { SplitPane } from "@/components/ui/split-pane";
import { generateRuns } from "@/lib/runs/generate";
import { RunExplorer } from "./run-explorer";

const runs = generateRuns(300);

beforeEach(() => window.history.replaceState(null, "", "/runs"));

const list = () => screen.getByRole("listbox", { name: /^Runs,/ });
const selectedOption = () => within(list()).getByRole("option", { selected: true });

describe("RunExplorer", () => {
  it("virtualizes the list: 300 runs, only a screenful of rows in the DOM", () => {
    render(<RunExplorer runs={runs} />);
    expect(list()).toHaveAccessibleName("Runs, 300 shown");
    const rendered = within(list()).getAllByRole("option");
    expect(rendered.length).toBeLessThan(30);
    expect(rendered[0]).toHaveAttribute("aria-setsize", "300");
  });

  it("moves through runs with the keyboard and keeps the URL in sync", async () => {
    const user = userEvent.setup();
    render(<RunExplorer runs={runs} />);
    list().focus();
    expect(selectedOption()).toHaveAttribute("aria-posinset", "1");
    await user.keyboard("{ArrowDown}j");
    expect(selectedOption()).toHaveAttribute("aria-posinset", "3");
    expect(window.location.search).toBe(`?run=${runs[2].id}`);
    expect(list()).toHaveAttribute("aria-activedescendant", `run-option-${runs[2].id}`);
    await user.keyboard("{End}");
    expect(window.location.search).toBe(`?run=${runs[299].id}`);
  });

  it("filters by status and search, updating the stats", async () => {
    const user = userEvent.setup();
    render(<RunExplorer runs={runs} />);
    const errored = runs.filter((r) => r.status === "errored").length;
    await user.click(screen.getByRole("radio", { name: "Errored" }));
    expect(list()).toHaveAccessibleName(`Runs, ${errored} shown`);

    await user.click(screen.getByRole("radio", { name: "All" }));
    await user.type(screen.getByRole("searchbox", { name: "Search runs" }), "zzz-no-match");
    expect(await screen.findByText("No runs match these filters.")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(list()).toHaveAccessibleName("Runs, 300 shown");
  });

  it("focuses search with /", async () => {
    const user = userEvent.setup();
    render(<RunExplorer runs={runs} />);
    await user.keyboard("/");
    expect(screen.getByRole("searchbox", { name: "Search runs" })).toHaveFocus();
  });

  it("navigates the step tree and shows details for the selected step", async () => {
    const user = userEvent.setup();
    const run = runs.find((r) => r.spans.some((s) => s.parentId && s.parentId !== r.spans[0].id))!;
    window.history.replaceState(null, "", `/runs?run=${run.id}`);
    render(<RunExplorer runs={runs} />);

    const tree = screen.getByRole("tree", { name: `Steps in ${run.id}` });
    const root = within(tree).getAllByRole("treeitem")[0];
    expect(root).toHaveAttribute("aria-expanded", "true");
    expect(within(tree).getAllByRole("treeitem")).toHaveLength(run.spans.length);

    tree.focus();
    await user.keyboard("{ArrowLeft}"); // collapse the root
    expect(within(tree).getAllByRole("treeitem")).toHaveLength(1);
    await user.keyboard("{ArrowRight}{ArrowRight}"); // expand, then go to the first child
    const details = screen.getByRole("region", { name: "Step details" });
    expect(within(details).getByRole("heading", { name: "plan" })).toBeInTheDocument();
  });
});

describe("SplitPane", () => {
  it("resizes from the keyboard within its limits", async () => {
    const user = userEvent.setup();
    render(
      <SplitPane
        orientation="horizontal"
        defaultSize={40}
        min={20}
        max={60}
        label="Resize"
        first="A"
        second="B"
      />,
    );
    const divider = screen.getByRole("separator", { name: "Resize" });
    divider.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(divider).toHaveAttribute("aria-valuenow", "44");
    await user.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(divider).toHaveAttribute("aria-valuenow", "34");
    await user.keyboard("{End}");
    expect(divider).toHaveAttribute("aria-valuenow", "60");
  });
});
