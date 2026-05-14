"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { renderEmoji, CANVAS_SIZE } from "@/lib/renderer";
import ColorPicker from "@/components/ColorPicker";
import SlackRegister from "@/components/SlackRegister";

const FONTS = [
  { id: "rounded", name: "丸ゴシック体", subname: "M PLUS Rounded 1c", css: "M PLUS Rounded 1c", ctxWeight: "900", recommended: true },
  { id: "mincho", name: "明朝体", subname: "Shippori Mincho B1", css: "Shippori Mincho B1", ctxWeight: "800" },
  { id: "block", name: "ブロック体", subname: "Dela Gothic One", css: "Dela Gothic One", ctxWeight: "400" },
  { id: "tanuki", name: "たぬき油性マジック", css: "TanukiMagic", ctxWeight: "normal" },
] as const;

type FontId = (typeof FONTS)[number]["id"];
type ColorTarget = "text" | "bg" | "stroke";

function ChatMockup({ url, theme }: { url: string; theme: "light" | "dark" }) {
  const dark = theme === "dark";
  const border = dark ? "1px solid #1E1F22" : "1px solid #E8E8E8";
  const reactionBg = dark ? "#2B2D31" : "#F0F0F0";
  const reactionBorder = dark ? "1px solid #4F545C" : "1px solid #D1D1D1";
  const reactionText = dark ? "#DCDDDE" : "#444444";

  return (
    <div style={{ border, background: dark ? "#313338" : "#FFFFFF", borderRadius: 8, padding: "8px 10px" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div
          style={{
            width: 32, height: 32,
            borderRadius: dark ? "50%" : 6,
            background: dark ? "#5865F2" : "#4A154B",
            flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "white", fontFamily: "sans-serif",
          }}
        >
          U
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
            <span style={{ color: dark ? "#FFFFFF" : "#1264A3", fontWeight: 700, fontSize: 13, fontFamily: "sans-serif" }}>
              ユーザー
            </span>
            <span className="hidden lg:inline" style={{ color: dark ? "#949BA4" : "#616061", fontSize: 11, fontFamily: "sans-serif" }}>
              12:34
            </span>
          </div>
          <div style={{ color: dark ? "#DCDDDE" : "#1D1C1D", fontSize: 14, lineHeight: "20px", fontFamily: "sans-serif", marginBottom: 6 }}>
            デプロイ完了！
          </div>
          {url && (
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: reactionBg, border: reactionBorder,
                borderRadius: dark ? 8 : 4,
                padding: "2px 7px 2px 5px",
                cursor: "default",
              }}
            >
              <img src={url} width={18} height={18} style={{ display: "block" }} alt="" />
              <span style={{ fontSize: 12, fontWeight: 600, color: reactionText, fontFamily: "sans-serif", lineHeight: 1 }}>1</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Header logo ──────────────────────────────────────────────
const LOGO_CHARS = [
  { char: "絵", bg: "#FF2D78" },
  { char: "文", bg: "#FF6B2D" },
  { char: "字", bg: "#F59E0B" },
  { char: "メ", bg: "#10B981" },
  { char: "ー", bg: "#0EA5E9" },
  { char: "カ", bg: "#6366F1" },
  { char: "ー", bg: "#A855F7" },
] as const;

const TILE = 32;
const GAP = 3;
const LOGO_W = LOGO_CHARS.length * TILE + (LOGO_CHARS.length - 1) * GAP;

function Logo() {
  return (
    <svg
      width={LOGO_W}
      height={TILE}
      viewBox={`0 0 ${LOGO_W} ${TILE}`}
      aria-label="絵文字メーカー"
      role="img"
      style={{ display: "block" }}
    >
      {LOGO_CHARS.map(({ char, bg }, i) => (
        <g key={i}>
          <rect
            x={i * (TILE + GAP)} y={0}
            width={TILE} height={TILE}
            rx={6} fill={bg}
          />
          <text
            x={i * (TILE + GAP) + TILE / 2}
            y={TILE / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'M PLUS Rounded 1c', sans-serif"
            fontWeight={900}
            fontSize={TILE * 0.72}
            fill="white"
            stroke="#1a1a2e"
            strokeWidth={2.5}
            strokeLinejoin="round"
            paintOrder="stroke fill"
          >
            {char}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Template colors ───────────────────────────────────────────
const TEMPLATE_COLORS = [
  { name: "赤", value: "#EF4444" },
  { name: "オレンジ", value: "#F97316" },
  { name: "アンバー", value: "#F59E0B" },
  { name: "緑", value: "#22C55E" },
  { name: "シアン", value: "#06B6D4" },
  { name: "青", value: "#3B82F6" },
  { name: "バイオレット", value: "#8B5CF6" },
  { name: "ピンク", value: "#EC4899" },
  { name: "白", value: "#FFFFFF" },
  { name: "黒", value: "#111827" },
];

export default function EmojiMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [text, setText] = useState("絵文字\nメーカー");
  const [fontId, setFontId] = useState<FontId>("rounded");
  const [textColor, setTextColor] = useState("#06B6D4");
  const [bgColor, setBgColor] = useState("");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");

  const [colorTarget, setColorTarget] = useState<ColorTarget>("text");

  const selectedFont = FONTS.find((f) => f.id === fontId)!;
  const fontFamily = selectedFont.css;
  const fontWeight = selectedFont.ctxWeight;

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await renderEmoji(canvas, {
      text, fontFamily, fontWeight, bgColor, textColor, strokeWidth, strokeColor,
    });
    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [text, fontFamily, fontWeight, bgColor, textColor, strokeWidth, strokeColor]);

  useEffect(() => {
    document.fonts.ready.then(render);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamic favicon — generated with canvas after fonts load for correct rendering
  useEffect(() => {
    document.fonts.ready.then(() => {
      const SZ = 64;
      const cv = document.createElement("canvas");
      cv.width = SZ;
      cv.height = SZ;
      const ctx = cv.getContext("2d")!;

      // Hot-pink rounded rect
      const r = 13;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(SZ - r, 0);
      ctx.arcTo(SZ, 0, SZ, r, r);
      ctx.lineTo(SZ, SZ - r);
      ctx.arcTo(SZ, SZ, SZ - r, SZ, r);
      ctx.lineTo(r, SZ);
      ctx.arcTo(0, SZ, 0, SZ - r, r);
      ctx.lineTo(0, r);
      ctx.arcTo(0, 0, r, 0, r);
      ctx.closePath();
      ctx.fillStyle = "#FF2D78";
      ctx.fill();

      const fontSize = 44;
      ctx.font = `900 ${fontSize}px "M PLUS Rounded 1c"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.strokeText("絵", SZ / 2, SZ / 2);
      ctx.fillStyle = "white";
      ctx.fillText("絵", SZ / 2, SZ / 2);

      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = cv.toDataURL("image/png");
      link.type = "image/png";
    });
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(render, 150);
    return () => clearTimeout(timerRef.current);
  }, [render]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const filename = text.replace(/\n/g, "_").trim() || "emoji";
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const applyColor = (value: string) => {
    if (colorTarget === "text") setTextColor(value);
    else if (colorTarget === "bg") setBgColor(value);
    else setStrokeColor(value);
  };

  const currentTargetColor =
    colorTarget === "text" ? textColor : colorTarget === "bg" ? bgColor : strokeColor;

  const COLOR_TABS: { id: ColorTarget; label: string }[] = [
    { id: "text", label: "文字色" },
    { id: "bg", label: "背景色" },
    { id: "stroke", label: "縁色" },
  ];

  const colorForTab = (t: ColorTarget) =>
    t === "text" ? textColor : t === "bg" ? bgColor : strokeColor;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1>
          <Logo />
        </h1>
        <p className="sr-only">
          Slack・Discord・Teams などのSNS用カスタム絵文字を無料で簡単作成 / emoji maker
        </p>
        <p className="sr-only">
          Slack・Discord・Teams などのSNS用カスタム絵文字を無料で簡単作成
        </p>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-5xl mx-auto w-full">

        {/* モバイル: 横並び / デスクトップ: contents で左右カラムに分散 */}
        <div className="flex gap-3 lg:contents">

          {/* 左: プレビュー (desktop sticky) */}
          <aside className="flex-1 min-w-0 lg:w-56 lg:flex-none lg:order-1 overflow-hidden">
            <div className="lg:sticky lg:top-6 flex flex-col gap-3 w-full">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center gap-3 w-full overflow-hidden">
                <p className="text-sm font-semibold text-gray-700 self-start">プレビュー</p>
                <div
                  className="w-full aspect-square rounded-xl overflow-hidden shadow-inner"
                  style={{
                    backgroundImage: "repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)",
                    backgroundSize: "16px 16px",
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="block w-full h-full"
                  />
                </div>
                <div className="text-center leading-tight">
                  <p className="text-xs text-gray-400">フォント：<span className="whitespace-nowrap">{selectedFont.name}</span></p>
                  {"subname" in selectedFont && (
                    <p className="text-xs text-gray-400 whitespace-nowrap">（{selectedFont.subname}）</p>
                  )}
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-xl transition shadow-sm"
                >
                  ダウンロード
                </button>
                <SlackRegister canvasRef={canvasRef} defaultName={text} />
              </div>
            </div>
          </aside>

          {/* 右: 使用イメージ (desktop sticky) */}
          <aside className="flex-1 min-w-0 lg:w-56 lg:flex-none lg:order-3 overflow-hidden">
            <div className="lg:sticky lg:top-6 w-full">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">使用イメージ</p>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-gray-400 font-medium">ライト</p>
                  <ChatMockup url={previewUrl} theme="light" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] text-gray-400 font-medium">ダーク</p>
                  <ChatMockup url={previewUrl} theme="dark" />
                </div>
              </div>
            </div>
          </aside>

        </div>

        {/* 中央: コントロール */}
        <section className="flex-1 flex flex-col gap-5 lg:order-2">
          {/* Text input */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              テキスト
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="絵文字にする文字を入力..."
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
            />
          </div>

          {/* Font */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">フォント</p>
            <div className="flex flex-col gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontId(f.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-left ${
                    fontId === f.id
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span
                    className="text-2xl leading-none"
                    style={{ fontFamily: f.css, fontWeight: f.ctxWeight }}
                  >
                    あA
                  </span>
                  <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                    {f.name}
                    {"recommended" in f && f.recommended && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                        おすすめ
                      </span>
                    )}
                  </span>
                  {fontId === f.id && (
                    <span className="ml-auto text-indigo-500 text-xs font-semibold flex-shrink-0">
                      選択中
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">カラー</p>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
              {COLOR_TABS.map(({ id, label }) => {
                const color = colorForTab(id);
                return (
                  <button
                    key={id}
                    onClick={() => setColorTarget(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                      colorTarget === id
                        ? "bg-white text-gray-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                      style={
                        color
                          ? { backgroundColor: color }
                          : {
                              backgroundImage:
                                "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)",
                              backgroundSize: "6px 6px",
                            }
                      }
                    />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Template swatches */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {TEMPLATE_COLORS.map((c) => {
                const isSelected = currentTargetColor === c.value;
                return (
                  <button
                    key={c.value}
                    title={c.name}
                    onClick={() => applyColor(c.value)}
                    className={`aspect-square rounded-xl border-2 transition shadow-sm ${
                      isSelected
                        ? "border-indigo-500 scale-110 shadow-md"
                        : "border-gray-200 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                );
              })}
            </div>

            {/* HSV color picker */}
            <ColorPicker value={currentTargetColor} onChange={applyColor} />

            {/* Transparent (bg only) */}
            {colorTarget === "bg" && (
              <button
                onClick={() => applyColor("")}
                className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  bgColor === ""
                    ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span
                  className="inline-block w-3.5 h-3.5 rounded-sm border border-gray-300"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)",
                    backgroundSize: "6px 6px",
                  }}
                />
                透明
              </button>
            )}
          </div>

          {/* Stroke */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">縁取り</p>
              <span className="text-sm text-gray-500 font-medium">
                {strokeWidth === 0 ? "なし" : `${strokeWidth} px`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-2">
              縁の色は上の「縁色」タブで設定
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        © 2026 絵文字メーカー
      </footer>
    </div>
  );
}
