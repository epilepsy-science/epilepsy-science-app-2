import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { Markdown, TextViewer, CSVViewer } from "@pennsieve-viz/core";

/**
 * Tests that the pennsieve-viz components used in pages/package/[id].vue
 * mount correctly with the same props the app passes.
 */
describe("Markdown component", () => {
  it("mounts with markdownText and disabled props", () => {
    const wrapper = mount(Markdown, {
      props: {
        markdownText: "# Hello World\n\nSome **bold** text.",
        disabled: true,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("mounts with empty markdown", () => {
    const wrapper = mount(Markdown, {
      props: {
        markdownText: "",
        disabled: true,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("renders markdown content", () => {
    const wrapper = mount(Markdown, {
      props: {
        markdownText: "# Test Heading",
        disabled: true,
      },
    });
    expect(wrapper.text()).toContain("Test Heading");
  });

  it("accepts edit and preview modes", () => {
    const wrapper = mount(Markdown, {
      props: {
        markdownText: "Some text",
        mode: "preview",
        disabled: true,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});

describe("TextViewer component", () => {
  it("mounts with content and fileType props", () => {
    const wrapper = mount(TextViewer, {
      props: {
        content: '{"key": "value"}',
        fileType: "json",
        showLineNumbers: true,
        maxHeight: "70vh",
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("mounts with plain text content", () => {
    const wrapper = mount(TextViewer, {
      props: {
        content: "Line 1\nLine 2\nLine 3",
        fileType: "txt",
        showLineNumbers: true,
        maxHeight: "70vh",
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("renders the provided text content", () => {
    const wrapper = mount(TextViewer, {
      props: {
        content: "Hello from the text viewer",
        fileType: "txt",
      },
    });
    expect(wrapper.text()).toContain("Hello from the text viewer");
  });

  it("mounts with empty content", () => {
    const wrapper = mount(TextViewer, {
      props: {
        content: "",
        fileType: "txt",
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});

describe("CSVViewer component", () => {
  it("mounts with srcUrl and fileType props", () => {
    const wrapper = mount(CSVViewer, {
      props: {
        srcUrl: "https://example.com/data.csv",
        fileType: "CSV",
        rowsPerPage: 25,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("mounts with TSV fileType", () => {
    const wrapper = mount(CSVViewer, {
      props: {
        srcUrl: "https://example.com/data.tsv",
        fileType: "TSV",
        rowsPerPage: 25,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
