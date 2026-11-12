/** The case studies, shared by the home page and /work. */
export const studies = [
  {
    href: "/work/run-explorer",
    project: "Run explorer",
    title: "Finding the one bad run in five thousand",
    summary:
      "Designing a tool for inspecting AI agent runs: aligning steps with their timing, failure that survives colour blindness, and a list that keeps under 30 rows in the page for 5,000 runs.",
    demo: "/runs",
  },
  {
    href: "/work/returns-assistant",
    project: "Returns assistant",
    title: "Designing for an agent you can’t fully predict",
    summary:
      "Steps that appear live then fold away, a person approves the money, failure you can act on, and one screen-reader announcement per reply instead of 25.",
    demo: "/returns",
  },
  {
    href: "/work/design-system",
    project: "Design system",
    title: "Tokens as data, components with no surprises",
    summary:
      "Semantic tokens enforced by a test, a theme that never flashes, and a loading button that keeps its name for screen readers.",
    demo: "/tokens",
  },
] as const;
