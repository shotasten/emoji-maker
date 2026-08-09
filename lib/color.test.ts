import { describe, expect, it } from "vitest";
import { hexToHsv, hsvToHex } from "./color";

describe("color conversion", () => {
  it.each([
    [0, 1, 1, "#ff0000"],
    [120, 1, 1, "#00ff00"],
    [240, 1, 1, "#0000ff"],
    [60, 1, 0.5, "#808000"],
    [0, 0, 0.5, "#808080"],
  ])("converts HSV %j to %s", (h, s, v, expected) => {
    expect(hsvToHex(h, s, v)).toBe(expected);
  });

  it.each(["", "#fff", "red", "#12345g"])(
    "returns black for invalid HEX %s",
    (hex) => {
      expect(hexToHsv(hex)).toEqual([0, 0, 0]);
    },
  );

  it.each(["#06b6d4", "#EC4899", "#000000", "#ffffff"])(
    "round-trips %s within 8-bit precision",
    (hex) => {
      const [h, s, v] = hexToHsv(hex);
      expect(hsvToHex(h, s, v)).toBe(hex.toLowerCase());
    },
  );
});
