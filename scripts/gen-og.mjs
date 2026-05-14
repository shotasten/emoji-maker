import { createCanvas, registerFont } from "canvas";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, readFileSync } from "fs";
import { decompress } from "wawoff2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = (f) => join(__dirname, "..", "public", f);
const nm = (...parts) => join(__dirname, "..", "node_modules", ...parts);
const tmp = join(__dirname, "MPlusRounded1c-900.ttf");

const woff2Buf = readFileSync(
  nm("@fontsource", "m-plus-rounded-1c", "files", "m-plus-rounded-1c-japanese-900-normal.woff2")
);
const ttfBuf = await decompress(woff2Buf);
writeFileSync(tmp, ttfBuf);
registerFont(tmp, { family: "MPlusRounded1c", weight: "900" });

const W = 1200;
const H = 630;
const cv = createCanvas(W, H);
const ctx = cv.getContext("2d");

// Background
ctx.fillStyle = "#F9FAFB";
ctx.fillRect(0, 0, W, H);

// Accent bar at top
const gradient = ctx.createLinearGradient(0, 0, W, 0);
gradient.addColorStop(0, "#FF2D78");
gradient.addColorStop(0.17, "#FF6B2D");
gradient.addColorStop(0.33, "#F59E0B");
gradient.addColorStop(0.5, "#22C55E");
gradient.addColorStop(0.67, "#06B6D4");
gradient.addColorStop(0.83, "#6366F1");
gradient.addColorStop(1, "#A855F7");
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, W, 8);

// Logo tiles
const CHARS = [
  { char: "絵", bg: "#FF2D78" },
  { char: "文", bg: "#FF6B2D" },
  { char: "字", bg: "#F59E0B" },
  { char: "メ", bg: "#22C55E" },
  { char: "ー", bg: "#06B6D4" },
  { char: "カ", bg: "#6366F1" },
  { char: "ー", bg: "#A855F7" },
];
const TILE = 96;
const GAP = 10;
const totalW = CHARS.length * TILE + (CHARS.length - 1) * GAP;
const startX = (W - totalW) / 2;
const taglineGap = 72;
const taglineH = 28;
const contentH = TILE + taglineGap + taglineH;
const tileY = Math.round((H - contentH) / 2);
const radius = 18;

for (let i = 0; i < CHARS.length; i++) {
  const x = startX + i * (TILE + GAP);
  ctx.beginPath();
  ctx.moveTo(x + radius, tileY);
  ctx.lineTo(x + TILE - radius, tileY);
  ctx.arcTo(x + TILE, tileY, x + TILE, tileY + radius, radius);
  ctx.lineTo(x + TILE, tileY + TILE - radius);
  ctx.arcTo(x + TILE, tileY + TILE, x + TILE - radius, tileY + TILE, radius);
  ctx.lineTo(x + radius, tileY + TILE);
  ctx.arcTo(x, tileY + TILE, x, tileY + TILE - radius, radius);
  ctx.lineTo(x, tileY + radius);
  ctx.arcTo(x, tileY, x + radius, tileY, radius);
  ctx.closePath();
  ctx.fillStyle = CHARS[i].bg;
  ctx.fill();

  const fontSize = Math.round(TILE * 0.72);
  ctx.font = `900 ${fontSize}px "MPlusRounded1c"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = Math.round(TILE * 0.065);
  ctx.lineJoin = "round";
  ctx.strokeText(CHARS[i].char, x + TILE / 2, tileY + TILE / 2);
  ctx.fillStyle = "white";
  ctx.fillText(CHARS[i].char, x + TILE / 2, tileY + TILE / 2);
}

// Tagline
ctx.font = `900 28px "MPlusRounded1c"`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillStyle = "#6B7280";
ctx.strokeStyle = "transparent";
ctx.lineWidth = 0;
ctx.fillText("Slack・Discord・Teams のカスタム絵文字を無料で簡単作成", W / 2, tileY + TILE + 72);

writeFileSync(pub("og-image.png"), cv.toBuffer("image/png"));
console.log("✓ og-image.png");
