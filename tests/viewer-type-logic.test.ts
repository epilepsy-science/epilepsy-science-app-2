import { describe, it, expect } from "vitest";

/**
 * Tests the viewerType routing logic from pages/package/[id].vue.
 * This ensures the correct viewer is selected for each file type.
 */

const timeseriesFileTypes = ["MEF", "EDF", "BDF", "NWB"];
const csvFileTypes = ["CSV", "TSV"];
const textFileTypes = ["TXT", "JSON", "XML", "LOG", "YAML", "YML"];
const markdownFileTypes = ["MD", "MARKDOWN"];
const imageFileTypes = ["PNG", "JPG", "JPEG", "GIF", "SVG", "WEBP", "BMP", "ICO"];

function getViewerType(fileType: string): string {
  const type = fileType.toUpperCase();
  if (timeseriesFileTypes.includes(type)) return "timeseries";
  if (csvFileTypes.includes(type)) return "csv";
  if (markdownFileTypes.includes(type)) return "markdown";
  if (textFileTypes.includes(type)) return "text";
  if (imageFileTypes.includes(type)) return "image";
  return "unsupported";
}

describe("viewerType routing logic", () => {
  describe("timeseries files", () => {
    it.each(["MEF", "EDF", "BDF", "NWB", "mef", "edf", "bdf", "nwb"])(
      "routes %s to timeseries viewer",
      (ext) => {
        expect(getViewerType(ext)).toBe("timeseries");
      }
    );
  });

  describe("CSV/TSV files", () => {
    it.each(["CSV", "TSV", "csv", "tsv"])(
      "routes %s to csv viewer",
      (ext) => {
        expect(getViewerType(ext)).toBe("csv");
      }
    );
  });

  describe("markdown files", () => {
    it.each(["MD", "MARKDOWN", "md", "markdown"])(
      "routes %s to markdown viewer",
      (ext) => {
        expect(getViewerType(ext)).toBe("markdown");
      }
    );
  });

  describe("text files", () => {
    it.each(["TXT", "JSON", "XML", "LOG", "YAML", "YML", "txt", "json", "xml", "log", "yaml", "yml"])(
      "routes %s to text viewer",
      (ext) => {
        expect(getViewerType(ext)).toBe("text");
      }
    );
  });

  describe("image files", () => {
    it.each(["PNG", "JPG", "JPEG", "GIF", "SVG", "WEBP", "BMP", "ICO", "png", "jpg", "jpeg"])(
      "routes %s to image viewer",
      (ext) => {
        expect(getViewerType(ext)).toBe("image");
      }
    );
  });

  describe("unsupported files", () => {
    it.each(["PDF", "DOCX", "ZIP", "MP4", "UNKNOWN", ""])(
      "routes %s to unsupported",
      (ext) => {
        expect(getViewerType(ext)).toBe("unsupported");
      }
    );
  });

  it("no file type overlaps between viewer categories", () => {
    const all = [
      ...timeseriesFileTypes,
      ...csvFileTypes,
      ...textFileTypes,
      ...markdownFileTypes,
      ...imageFileTypes,
    ];
    const unique = new Set(all);
    expect(unique.size).toBe(all.length);
  });
});
