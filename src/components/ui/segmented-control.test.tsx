import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SegmentedControl } from "./segmented-control";

const options = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
] as const;

function setup() {
  render(<SegmentedControl aria-label="View" options={options} defaultValue="week" />);
  return (name: string) => screen.getByRole("radio", { name });
}

describe("SegmentedControl", () => {
  it("is a labelled radio group with one Tab stop", () => {
    const radio = setup();
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    expect(radio("Week")).toHaveAttribute("tabindex", "0");
    expect(radio("Day")).toHaveAttribute("tabindex", "-1");
  });

  it("moves selection and focus with arrow keys, wrapping at the ends", async () => {
    const radio = setup();
    await userEvent.tab();
    expect(radio("Week")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(radio("Month")).toHaveFocus();
    expect(radio("Month")).toHaveAttribute("aria-checked", "true");

    await userEvent.keyboard("{ArrowRight}");
    expect(radio("Day")).toHaveFocus();

    await userEvent.keyboard("{End}");
    expect(radio("Month")).toHaveAttribute("aria-checked", "true");
  });
});
