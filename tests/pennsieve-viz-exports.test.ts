import { describe, it, expect } from "vitest";

/**
 * Verifies that all expected exports from @pennsieve-viz/core are available.
 * If an import fails or a named export is missing, this catches breaking changes
 * from a library update before they hit runtime.
 */
describe("@pennsieve-viz/core exports", () => {
  it("exports Markdown component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.Markdown).toBeDefined();
    expect(typeof mod.Markdown).toBe("object"); // Vue component
  });

  it("exports TextViewer component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.TextViewer).toBeDefined();
    expect(typeof mod.TextViewer).toBe("object");
  });

  it("exports CSVViewer component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.CSVViewer).toBeDefined();
    expect(typeof mod.CSVViewer).toBe("object");
  });

  it("exports CSVViewerLazy component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.CSVViewerLazy).toBeDefined();
  });

  it("exports MarkdownLazy component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.MarkdownLazy).toBeDefined();
  });

  it("exports TextViewerLazy component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.TextViewerLazy).toBeDefined();
  });

  it("exports DataExplorerLazy component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.DataExplorerLazy).toBeDefined();
  });

  it("exports UMAPLazy component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.UMAPLazy).toBeDefined();
  });

  it("exports useViewerStyle composable", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.useViewerStyle).toBeDefined();
    expect(typeof mod.useViewerStyle).toBe("function");
  });

  it("exports OrthogonalFrame component", async () => {
    const mod = await import("@pennsieve-viz/core");
    expect(mod.OrthogonalFrame).toBeDefined();
  });
});
