export interface RenderConfig {
  text: string;
  fontFamily: string;
  fontWeight: string; // "900" for M PLUS Rounded 1c, "normal" for TanukiMagic
  bgColor: string;
  textColor: string;
  strokeWidth: number; // canvas px, 0 = no stroke
  strokeColor: string;
}

export const CANVAS_SIZE = 180;

async function ensureFontLoaded(
  fontFamily: string,
  fontWeight: string,
  text: string
): Promise<void> {
  const descriptor = `${fontWeight} 16px "${fontFamily}"`;
  // Pass the actual text so Google Fonts downloads the correct unicode-range
  // subsets (e.g. CJK files separate from Latin files)
  if (!document.fonts.check(descriptor, text)) {
    try {
      await document.fonts.load(descriptor, text);
    } catch {
      // fall through with fallback font
    }
  }
}

export async function renderEmoji(
  canvas: HTMLCanvasElement,
  config: RenderConfig
): Promise<void> {
  const { text, fontFamily, fontWeight, bgColor, textColor, strokeWidth, strokeColor } = config;

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  const trimmed = text.trim();
  if (!trimmed) return;

  const lines = trimmed
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return;

  await ensureFontLoaded(fontFamily, fontWeight, trimmed);

  // Base 2% padding + half stroke width so the outline never clips at the edge
  const pad = Math.round(CANVAS_SIZE * 0.02) + Math.ceil(strokeWidth / 2);
  const aw = CANVAS_SIZE - pad * 2;
  const ah = CANVAS_SIZE - pad * 2;

  const n = lines.length;
  const rowH = ah / n;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = textColor;

  const cx = CANVAS_SIZE / 2;

  for (let i = 0; i < n; i++) {
    const line = lines[i];

    // Binary search: largest font size where advance width fits aw
    let lo = 4;
    let hi = aw;
    let size = lo;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      ctx.font = `${fontWeight} ${mid}px "${fontFamily}"`;
      if (ctx.measureText(line).width <= aw) {
        size = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    ctx.font = `${fontWeight} ${size}px "${fontFamily}"`;

    // Measure ACTUAL rendered bounds (not em box — removes internal font padding)
    const m = ctx.measureText(line);
    const actualW =
      m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const actualH =
      m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;

    if (actualW <= 0 || actualH <= 0) continue;

    // Scale to fill (aw × rowH) using actual bounds
    const scaleX = aw / actualW;
    const scaleY = rowH / actualH;

    // Row vertical center in canvas pixels
    const rowCenterY = pad + i * rowH + rowH / 2;

    // Baseline Y such that the actual visual is vertically centered in the row.
    // visual_top   = ty - actualAscent  * scaleY
    // visual_bottom= ty + actualDescent * scaleY
    // visual_center= ty + (actualDescent - actualAscent) * scaleY / 2 = rowCenterY
    // → ty = rowCenterY + (actualAscent - actualDescent) * scaleY / 2
    const ty =
      rowCenterY +
      ((m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) * scaleY) / 2;

    // X offset to center actual bbox (not advance center) horizontally.
    // With textAlign='center', advance center is at x=0 in local space.
    // Actual visual center = (actualRight - actualLeft) / 2 offset from advance center.
    // To put actual visual center at x=0: draw at dx = -(actualRight - actualLeft) / 2
    const dx =
      -(m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;

    ctx.save();
    ctx.translate(cx, ty);
    ctx.scale(scaleX, scaleY);

    if (strokeWidth > 0 && strokeColor) {
      ctx.strokeStyle = strokeColor;
      // lineWidth in local coords: stroke appears ≈strokeWidth px on canvas
      ctx.lineWidth = strokeWidth / Math.sqrt(scaleX * scaleY);
      ctx.lineJoin = "round";
      ctx.strokeText(line, dx, 0);
    }

    ctx.fillText(line, dx, 0);
    ctx.restore();
  }
}
