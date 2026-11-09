import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CvdCompare } from "./cvd-compare";
import { ERRORED_RUN_ID, NESTED_RUN_ID, runById } from "./demo-runs";
import { LayoutCompare } from "./layout-compare";
import { VirtualCounter } from "./virtual-counter";

describe("demo runs", () => {
  it("still show what the case study claims", () => {
    const nested = runById(NESTED_RUN_ID);
    const root = nested.spans[0].id;
    expect(nested.spans.some((s) => s.parentId && s.parentId !== root)).toBe(true);
    const tools = nested.spans.filter((s) => s.kind === "tool");
    expect(
      tools.some((a, i) => tools.slice(i + 1).some((b) => b.start < a.start + a.duration)),
    ).toBe(true);

    const errored = runById(ERRORED_RUN_ID);
    expect(errored.status).toBe("errored");
    expect(
      errored.spans.filter((s) => s.status === "error" && s.kind === "tool").length,
    ).toBeGreaterThanOrEqual(2);
  });
});

describe("LayoutCompare", () => {
  it("switches between the shipped tree and the rejected flame graph", async () => {
    const user = userEvent.setup();
    render(<LayoutCompare />);
    expect(screen.getByRole("tree")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Flame graph" }));
    expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Flame graph of the same run/ })).toBeInTheDocument();
  });
});

describe("CvdCompare", () => {
  it("applies the simulated vision filter and only labels failures in the shipped encoding", async () => {
    const user = userEvent.setup();
    render(<CvdCompare />);
    const stage = screen.getByTestId("cvd-stage");
    expect(stage.style.filter).toMatch(/^url\("?#cvd-deutan"?\)$/);
    expect(within(stage).queryByText(/Error/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Colour + stripes + label" }));
    expect(within(stage).getAllByText(/Error/).length).toBeGreaterThanOrEqual(2);

    await user.click(screen.getByRole("radio", { name: "Typical" }));
    expect(stage.style.filter).toBe("");
  });
});

describe("VirtualCounter", () => {
  it("renders the full list virtually", () => {
    render(<VirtualCounter />);
    const list = screen.getByRole("listbox");
    expect(list).toHaveAccessibleName("Runs, 5,000 shown");
    expect(within(list).getAllByRole("option").length).toBeLessThan(30);
  });
});
