import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ReturnsAssistant } from "./returns-assistant";

const instant = { step: 0, word: 0 };
const slow = { step: 200, word: 50 };

function setup(pace = instant) {
  const user = userEvent.setup();
  render(<ReturnsAssistant pace={pace} />);
  return { user, input: screen.getByRole("textbox", { name: "Message" }) };
}

const lastReply = () => screen.getAllByRole("article", { name: "Assistant reply" }).at(-1)!;

describe("ReturnsAssistant", () => {
  it("offers example requests when the conversation is empty", async () => {
    const { user } = setup();
    const examples = screen.getByRole("list", { name: "Example requests" });
    await user.click(within(examples).getByRole("button", { name: "Damaged headphones" }));

    await waitFor(() =>
      expect(within(lastReply()).getByText("Needs human review")).toBeInTheDocument(),
    );
    expect(screen.queryByRole("list", { name: "Example requests" })).not.toBeInTheDocument();
  });

  it("streams the reply, folds the steps away and shows the refund draft", async () => {
    const { user, input } = setup();
    await user.type(input, "My headphones arrived damaged. Refund RX-104?{Enter}");

    expect(screen.getByText("My headphones arrived damaged. Refund RX-104?")).toBeInTheDocument();
    await waitFor(() =>
      expect(within(lastReply()).getByText(/qualifies for a \$129\.00 refund/)).toBeInTheDocument(),
    );

    const reply = lastReply();
    const summary = within(reply).getByRole("button", { name: /Checked · 5 steps/ });
    expect(summary).toHaveAttribute("aria-expanded", "false");
    await user.click(summary);
    expect(
      within(reply).getByText("Studio headphones, bought 8 days ago, $129.00"),
    ).toBeInTheDocument();
    expect(within(reply).getByText("Refund draft")).toBeInTheDocument();
    expect(within(reply).getByText("Awaiting human approval")).toBeInTheDocument();
  });

  it("uses Shift+Enter for a new line and clears the box after sending", async () => {
    const { user, input } = setup();
    await user.type(input, "Line one{Shift>}{Enter}{/Shift}RX-209");
    expect(input).toHaveValue("Line one\nRX-209");
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("");
    await waitFor(() => expect(within(lastReply()).getByText("Not eligible")).toBeInTheDocument());
  });

  it("can be stopped mid-reply with Esc", async () => {
    const { user, input } = setup(slow);
    await user.type(input, "Refund RX-104{Enter}");
    expect(screen.getByRole("button", { name: /Stop/ })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(within(lastReply()).getByText(/Stopped\./)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("explains an outage and offers a retry", async () => {
    const { user, input } = setup();
    await user.type(input, "Can I get a refund for order RX-503?{Enter}");
    await waitFor(() =>
      expect(within(lastReply()).getByText("Couldn’t verify")).toBeInTheDocument(),
    );

    await user.click(within(lastReply()).getByRole("button", { name: "Try again" }));
    // Retrying reruns the same request in place rather than adding a new message.
    await waitFor(() =>
      expect(within(lastReply()).getByText("Couldn’t verify")).toBeInTheDocument(),
    );
    expect(screen.getAllByRole("article", { name: "Assistant reply" })).toHaveLength(1);
  });

  it("announces each finished reply once for screen readers", async () => {
    const { user, input } = setup();
    await user.type(input, "Please refund it.{Enter}");
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Please share your order ID (for example, RX-104)",
      ),
    );
  });
});
