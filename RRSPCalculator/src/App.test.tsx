import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";

describe("RRSPCalculator App render", () => {
  it("renders the full app HTML without throwing", () => {
    const html = renderToString(<App />);
    expect(html).toContain("Canadian Retirement Strategy Simulator");
    expect(html).toContain("results-container");
    expect(html).toContain("home-link");
  });
});
