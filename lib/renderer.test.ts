import { describe, expect, it, vi } from "vitest";
import { renderEmoji } from "./renderer";

function canvasContext() {
  const calls: string[] = [];
  const ctx = {
    calls,
    clearRect: vi.fn(() => calls.push("clear")),
    fillRect: vi.fn(() => calls.push("fillRect")),
    measureText: vi.fn(() => ({
      width: 40,
      actualBoundingBoxLeft: 18,
      actualBoundingBoxRight: 22,
      actualBoundingBoxAscent: 30,
      actualBoundingBoxDescent: 10,
    })),
    save: vi.fn(() => calls.push("save")),
    restore: vi.fn(() => calls.push("restore")),
    translate: vi.fn(),
    scale: vi.fn(),
    strokeText: vi.fn(() => calls.push("stroke")),
    fillText: vi.fn(() => calls.push("text")),
    font: "",
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    lineJoin: "",
    textAlign: "",
    textBaseline: "",
  } as unknown as CanvasRenderingContext2D & { calls: string[] };
  return ctx;
}

function canvas(ctx: CanvasRenderingContext2D) {
  return { width: 0, height: 0, getContext: () => ctx } as unknown as HTMLCanvasElement;
}

describe("renderEmoji", () => {
  it("clears and paints the background without drawing blank text", async () => {
    const ctx = canvasContext();
    vi.stubGlobal("document", { fonts: { check: vi.fn(() => true), load: vi.fn() } });
    const cv = canvas(ctx);

    await renderEmoji(cv, {
      text: "  \n ", fontFamily: "sans-serif", fontWeight: "normal",
      bgColor: "#fff", textColor: "#000", strokeWidth: 0, strokeColor: "",
    });

    expect(cv.width).toBe(180);
    expect(cv.height).toBe(180);
    expect(ctx.calls).toEqual(["clear", "fillRect"]);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it("renders each non-empty line and strokes only when configured", async () => {
    const ctx = canvasContext();
    vi.stubGlobal("document", { fonts: { check: vi.fn(() => true), load: vi.fn() } });

    await renderEmoji(canvas(ctx), {
      text: "A\n\nB", fontFamily: "sans-serif", fontWeight: "normal",
      bgColor: "", textColor: "#fff", strokeWidth: 4, strokeColor: "#000",
    });

    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    expect(ctx.strokeText).toHaveBeenCalledTimes(2);
    expect(ctx.save).toHaveBeenCalledTimes(2);
    expect(ctx.restore).toHaveBeenCalledTimes(2);
  });
});
