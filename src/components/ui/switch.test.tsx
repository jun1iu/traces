import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("toggles when the label is clicked and reports the change", async () => {
    const onChange = vi.fn();
    render(<Switch label="Notifications" onCheckedChange={onChange} />);
    const toggle = screen.getByRole("switch", { name: "Notifications" });

    expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.click(screen.getByText("Notifications"));
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles with Space from the keyboard", async () => {
    render(<Switch label="Beta" />);
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(screen.getByRole("switch", { name: "Beta" })).toHaveAttribute("aria-checked", "true");
  });

  it("stays put when controlled and the parent does not update", async () => {
    render(<Switch label="Locked" checked={false} onCheckedChange={() => {}} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("links the description for screen readers", () => {
    render(<Switch label="Email" description="Weekly summary" />);
    expect(screen.getByRole("switch", { name: "Email" })).toHaveAccessibleDescription(
      "Weekly summary",
    );
  });
});
