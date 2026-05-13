"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { hexToHsv, hsvToHex } from "@/lib/color";

interface Props {
  value: string;
  onChange: (hex: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  const [h, setH] = useState(0);
  const [s, setS] = useState(1);
  const [v, setV] = useState(1);
  const [hexInput, setHexInput] = useState("");

  const hRef = useRef(0);
  const sRef = useRef(1);
  const vRef = useRef(1);
  const skipSync = useRef(false);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => { hRef.current = h; }, [h]);
  useEffect(() => { sRef.current = s; }, [s]);
  useEffect(() => { vRef.current = v; }, [v]);

  // Sync from external value change
  useEffect(() => {
    if (skipSync.current) { skipSync.current = false; return; }
    if (!value) { setHexInput(""); return; }
    const [nh, ns, nv] = hexToHsv(value);
    setH(nh); setS(ns); setV(nv);
    setHexInput(value.toUpperCase());
  }, [value]);

  const emit = useCallback((nh: number, ns: number, nv: number) => {
    skipSync.current = true;
    setH(nh); setS(ns); setV(nv);
    const hex = hsvToHex(nh, ns, nv);
    setHexInput(hex.toUpperCase());
    onChangeRef.current(hex);
  }, []);

  // SV gradient drag
  const onSvDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!svRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = svRef.current.getBoundingClientRect();
    emit(
      hRef.current,
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)),
    );
  }, [emit]);

  const onSvMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.buttons & 1) || !svRef.current) return;
    const rect = svRef.current.getBoundingClientRect();
    emit(
      hRef.current,
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)),
    );
  }, [emit]);

  // Hue slider drag
  const onHueDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!hueRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = hueRef.current.getBoundingClientRect();
    emit(
      Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)),
      sRef.current,
      vRef.current,
    );
  }, [emit]);

  const onHueMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!(e.buttons & 1) || !hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    emit(
      Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360)),
      sRef.current,
      vRef.current,
    );
  }, [emit]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      const [nh, ns, nv] = hexToHsv(val);
      emit(nh, ns, nv);
    }
  };

  const handleHexBlur = () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hexInput)) {
      setHexInput(value ? value.toUpperCase() : "");
    }
  };

  return (
    <div className="space-y-3">
      {/* SV gradient */}
      <div
        ref={svRef}
        className="relative rounded-lg overflow-hidden cursor-crosshair select-none touch-none"
        style={{
          height: 160,
          background: [
            "linear-gradient(to bottom, transparent 0%, #000 100%)",
            `linear-gradient(to right, #fff 0%, hsl(${h}, 100%, 50%) 100%)`,
          ].join(", "),
        }}
        onPointerDown={onSvDown}
        onPointerMove={onSvMove}
      >
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white"
          style={{
            width: 14,
            height: 14,
            left: `${s * 100}%`,
            top: `${(1 - v) * 100}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 1.5px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        className="relative rounded-full cursor-pointer select-none touch-none"
        style={{
          height: 12,
          background:
            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
        }}
        onPointerDown={onHueDown}
        onPointerMove={onHueMove}
      >
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white"
          style={{
            width: 20,
            height: 20,
            left: `${(h / 360) * 100}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: `hsl(${h}, 100%, 50%)`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        />
      </div>

      {/* Preview swatch + hex input */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-md border border-gray-200 flex-shrink-0"
          style={
            value
              ? { backgroundColor: value }
              : {
                  backgroundImage:
                    "repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)",
                  backgroundSize: "8px 8px",
                }
          }
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          maxLength={7}
          spellCheck={false}
          placeholder="#000000"
          className="flex-1 min-w-0 font-mono text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition"
        />
      </div>
    </div>
  );
}
