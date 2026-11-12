/** Site-wide facts shared by metadata, the share image, robots.txt and the sitemap. */
export const site = {
  name: "Design Engineering Playground",
  url: "https://playground.jun-liu.net",
  description: "Interface components built with care for motion, accessibility and design tokens.",
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
