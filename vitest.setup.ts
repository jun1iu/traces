import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

// jsdom has no layout engine, so it doesn't implement scrolling into view.
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
