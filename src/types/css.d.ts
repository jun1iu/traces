import "react";

// Allow CSS custom properties (style={{ "--delay": "0.2s" }}) on any element.
declare module "react" {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
