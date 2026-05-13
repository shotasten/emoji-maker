import { createCanvas, registerFont } from "canvas";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, readFileSync } from "fs";
import { decompress } from "wawoff2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = (f) => join(__dirname, "..", "public", f);
const nm = (...parts) => join(__dirname, "..", "node_modules", ...parts);
const tmp = join(__dirname, "MPlusRounded1c-900.ttf");

// Convert woff2 → ttf so node-canvas can register it
const woff2Buf = readFileSync(
  nm("@fontsource", "m-plus-rounded-1c", "files", "m-plus-rounded-1c-105-900-normal.woff2")
);
const ttfBuf = await decompress(woff2Buf);
writeFileSync(tmp, ttfBuf);

registerFont(tmp, { family: "MPlusRounded1c", weight: "900" });

function drawIcon(size) {
  const cv = createCanvas(size, size);
  const ctx = cv.getContext("2d");

  ctx.fillStyle = "#FF2D78";
  ctx.fillRect(0, 0, size, size);

  const fontSize = Math.round(size * 0.72);
  ctx.font = `900 ${fontSize}px "MPlusRounded1c"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = Math.round(size * 0.065);
  ctx.lineJoin = "round";
  ctx.strokeText("絵", size / 2, size / 2);

  ctx.fillStyle = "white";
  ctx.fillText("絵", size / 2, size / 2);

  return cv.toBuffer("image/png");
}

const icons = [
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
];

for (const { file, size } of icons) {
  writeFileSync(pub(file), drawIcon(size));
  console.log(`✓ ${file}`);
}
