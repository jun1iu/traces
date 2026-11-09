# Run explorer in Figma

The Run explorer screen exported for Figma by `scripts/figma-export.cjs`.

Files:

- `run-explorer-light.svg`, `run-explorer-dark.svg`: the live screen at 1440 px, as editable layers
- `run-explorer-light.png`, `run-explorer-dark.png`: screenshots to check against

## 1. Import (5 minutes)

1. Open figma.com in a browser and create a design file named **Run explorer**.
2. Install the **Geist** and **Geist Mono** fonts on the Mac (free from vercel.com/font). Otherwise Figma swaps in another font.
3. Drag both SVGs onto the canvas. Each arrives as a frame whose layers are named after the real interface: `h1: Run explorer`, `input: Search…`, `radiogroup: Filter by status`, `run: Support triage`, and so on.
4. Put a PNG next to each frame and compare them. Text is live: double-click any label to edit it.

The import is a faithful **picture** made of rectangles and text. The next steps turn it into a **Figma-native design**, which is the skill interviewers mean when they ask about Figma.

## 2. Colour variables (20 minutes)

Open **Local variables** (right panel, with nothing selected), make a collection named **Color** with two modes, **Light** and **Dark**, and add:

| Variable          | Light   | Dark    | Use                     |
| ----------------- | ------- | ------- | ----------------------- |
| background        | #fafafa | #09090b | Page canvas             |
| surface           | #ffffff | #131316 | Cards, inputs           |
| surface-hover     | #f2f2f3 | #1c1c21 | Hover, selected segment |
| border            | #e4e4e7 | #2a2a30 | Hairlines               |
| foreground        | #18181b | #f4f4f5 | Primary text            |
| muted             | #71717a | #a1a1aa | Secondary text          |
| accent            | #4f46e5 | #818cf8 | Selected states, links  |
| accent-foreground | #ffffff | #0b0b1a | Text on accent          |
| danger            | #dc2626 | #f87171 | Errors, failed spans    |
| success           | #0ca30c | #0ca30c | Passed icon             |
| span-llm          | #2a78d6 | #3987e5 | Model call bars         |
| span-tool         | #eb6834 | #d95926 | Tool call bars          |
| span-retrieval    | #1baf7a | #199e70 | Retrieval bars          |

Then select the light frame and use **Selection colors** (right panel) to swap each raw hex for its variable. Finally, switch the frame's mode to **Dark** and check it matches the dark SVG. One frame, two themes: delete the dark import once it does.

## 3. Rebuild three components with Auto Layout (1–2 hours)

Rebuild these from scratch beside the import rather than converting the imported layers. Turn each into a component (⌥⌘K):

1. **Segmented control** (`radiogroup: Filter by status`): a horizontal Auto Layout with 4 px padding, holding a **Segment** component with a `selected` boolean property. Make the frame hug its contents so adding a fifth option just works.
2. **Run row** (`run: Support triage`): status icon, a title and meta stack, and a right-aligned duration and model column. Give it a `status` variant (Passed / Failed eval / Errored) and a `selected` state with the accent left border and tint.
3. **Trace step** (one row of the timeline): indent, kind swatch, name, kind label and a bar. Make the kind a variant (LLM / Tool / Retrieval / Agent) bound to the span colour variables.

Then rebuild the left list using 10 Run row instances in a vertical Auto Layout, and check it resizes when you drag the frame wider.

## 4. What to say about it

"The Run explorer was designed in code first. I rebuilt it in Figma with variables for both themes and components with variants for the parts that repeat, so a designer could change it without me." Link the Figma file (Share → anyone with the link can view) from the case study.
