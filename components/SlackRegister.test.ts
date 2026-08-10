import { describe, expect, it, vi } from "vitest";
import { isSupportedBrowser, sanitizeName } from "./SlackRegister";

describe("Slack registration helpers", () => {
  it.each([
    ["Hello World\n!", "helloworld"],
    ["___絵文字___", ""],
    ["Release_2026-08", "release_2026-08"],
  ])("sanitizes %s to %s", (input, expected) => {
    expect(sanitizeName(input)).toBe(expected);
  });

  it("accepts desktop Chrome and rejects mobile or non-Chromium browsers", () => {
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 Chrome/140.0.0.0 Safari/537.36" });
    expect(isSupportedBrowser()).toBe(true);
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 (iPhone) Chrome/140.0.0.0" });
    expect(isSupportedBrowser()).toBe(false);
    vi.stubGlobal("navigator", { userAgent: "Mozilla/5.0 Firefox/141.0" });
    expect(isSupportedBrowser()).toBe(false);
  });
});
