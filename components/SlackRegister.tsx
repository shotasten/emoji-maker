"use client";

import { useState, useEffect } from "react";

type Workspace = { id: string; name: string; domain: string };
type Status = { type: "success" | "error"; message: string };

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  defaultName?: string;
};

function sendToExt<T>(request: object, responseType: string): Promise<T> {
  return new Promise((resolve) => {
    const requestId = Math.random().toString(36).slice(2);
    const handler = (event: MessageEvent) => {
      if (
        event.data?.source === "emoji-maker-ext" &&
        event.data?.type === responseType &&
        event.data?.requestId === requestId
      ) {
        window.removeEventListener("message", handler);
        resolve(event.data);
      }
    };
    window.addEventListener("message", handler);
    window.postMessage({ source: "emoji-maker-page", requestId, ...request }, "*");
  });
}

function sanitizeName(raw: string): string {
  const result = raw
    .replace(/\n/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/^[-_]+|[-_]+$/g, "")
    .toLowerCase()
    .slice(0, 100);
  return /[a-z0-9]/.test(result) ? result : "";
}

export default function SlackRegister({ canvasRef, defaultName = "" }: Props) {
  const [supported, setSupported] = useState(false);
  const [extInstalled, setExtInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [emojiName, setEmojiName] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const isChromium = /Chrome\//.test(ua);
    if (isMobile || !isChromium) return;
    setSupported(true);

    if (document.documentElement.getAttribute("data-emoji-maker-ext") === "1") {
      setExtInstalled(true);
    }
    const handler = (event: MessageEvent) => {
      if (event.data?.source === "emoji-maker-ext" && event.data?.type === "READY") {
        setExtInstalled(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    setEmojiName(sanitizeName(defaultName));
  }, [defaultName]);

  const handleToggle = async () => {
    if (!extInstalled) return;
    const next = !open;
    setOpen(next);
    if (!next) return;

    setStatus(null);
    setLoading(true);
    const res = await sendToExt<{ workspaces: Workspace[] }>({ type: "GET_WORKSPACES" }, "WORKSPACES");
    setWorkspaces(res.workspaces ?? []);
    if (res.workspaces?.length > 0) setSelectedId(res.workspaces[0].id);
    setLoading(false);
  };

  const canSubmit = emojiName.trim().length > 0 && /[a-z0-9]/.test(emojiName);

  const handleUpload = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedId || !canSubmit) return;

    setUploading(true);
    setStatus(null);

    const imageBase64 = canvas.toDataURL("image/png").split(",")[1];
    const res = await sendToExt<{ ok: boolean; error?: string }>(
      { type: "UPLOAD_EMOJI", workspaceId: selectedId, name: emojiName, imageBase64, mimeType: "image/png" },
      "UPLOAD_RESULT"
    );

    setUploading(false);
    setStatus(
      res.ok
        ? { type: "success", message: `✓ :${emojiName}: として登録しました！` }
        : { type: "error", message: res.error || "登録に失敗しました" }
    );
  };

  if (!supported) return null;

  return (
    <div className="w-full flex flex-col gap-2">
      <button
        onClick={handleToggle}
        className={`w-full font-semibold text-sm py-2.5 rounded-xl transition shadow-sm ${
          extInstalled
            ? "bg-[#FF2D78] hover:bg-[#e0205f] active:bg-[#c91a52] text-white"
            : "bg-gray-100 text-gray-400 cursor-default"
        }`}
      >
        Slack に登録
      </button>

      {!extInstalled && (
        <p className="text-[11px] text-gray-400 text-center leading-snug">
          <a
            href="https://github.com/shotasten/emoji-maker-chrome-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Chrome 拡張機能
          </a>
          を入れると Slack に直接登録できます
        </p>
      )}

      {extInstalled && open && (
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              ワークスペース
            </label>
            {loading ? (
              <p className="text-xs text-gray-400 py-1">読み込み中...</p>
            ) : workspaces.length > 0 ? (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full max-w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name || ws.domain}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gray-400 py-1">Slack にログインしてください</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1">
              絵文字の名前
              <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 font-bold text-sm select-none">:</span>
              <input
                type="text"
                value={emojiName}
                onChange={(e) =>
                  setEmojiName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
                }
                placeholder="emoji-name"
                className={`flex-1 text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                  emojiName && !canSubmit ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              />
              <span className="text-gray-400 font-bold text-sm select-none">:</span>
            </div>
            {emojiName && !canSubmit && (
              <p className="text-[11px] text-red-500 mt-1">
                英小文字か数字を1文字以上含めてください
              </p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !canSubmit || !selectedId}
            className="w-full bg-[#FF2D78] hover:bg-[#e0205f] text-white font-semibold text-sm py-2 rounded-lg transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? "登録中..." : "登録する"}
          </button>

          {status && (
            <p className={`text-xs text-center font-medium ${status.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {status.message}
            </p>
          )}

          <div className="flex flex-col gap-0.5 pt-1 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 leading-snug">
              Slack にログイン済みのワークスペースが表示されます
            </p>
            <p className="text-[11px] text-gray-400 leading-snug">
              チームが表示されない場合は{" "}
              <a href="https://slack.com/signin" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                Slack にログイン
              </a>{" "}
              してください
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
