/** Site-wide facts shared by metadata, the share image, robots.txt and the sitemap. */
export const site = {
  name: "Traces",
  url: "https://traces.jun-liu.net",
  description:
    "Interfaces for AI tools, with the thinking shown: a run explorer, an AI returns assistant and the components underneath, by Jun Liu.",
} as const;

/** Every public route, in the order the sitemap lists them. */
export const routes = [
  "/",
  "/work",
  "/work/run-explorer",
  "/work/returns-assistant",
  "/work/design-system",
  "/runs",
  "/returns",
  "/tokens",
] as const;
