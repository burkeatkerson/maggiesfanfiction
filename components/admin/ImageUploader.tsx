"use client";

import { useRef, useState } from "react";
import { GhostButton } from "@/components/ui/form";
import { api } from "./api";
import type { UploadBucket } from "@/lib/types";

/**
 * Drag-and-drop image uploader. Uploads the file to Supabase Storage via
 * POST /api/upload and reports back the public URL.
 */
export function ImageUploader({
  value,
  onChange,
  bucket,
  shape = "rect",
  height = 200,
  label = "Featured image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  bucket: UploadBucket;
  shape?: "rect" | "circle";
  height?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    setError("");
    setBusy(true);
    try {
      const { url } = await api.upload(file, bucket);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const circle = shape === "circle";

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        className={`texture grid cursor-pointer place-items-center overflow-hidden border transition-colors ${
          dragging ? "border-ink" : "border-line"
        } ${circle ? "rounded-full" : "rounded"}`}
        style={{
          width: circle ? 96 : 280,
          height: circle ? 96 : height,
          background: value
            ? "transparent"
            : "linear-gradient(135deg, #e4d8cb 0%, var(--beige) 60%, #c7b6a6 100%)",
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span
            className="px-3 text-center font-meta text-[10.5px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "#8a7763" }}
          >
            {busy ? "Uploading…" : dragging ? "Drop to upload" : "Drag & drop or click"}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handle(e.target.files?.[0])}
          />
          <GhostButton small onClick={() => inputRef.current?.click()}>
            {value ? "Replace" : "Upload"}
          </GhostButton>
          {value ? (
            <GhostButton small danger onClick={() => onChange(null)}>
              Remove
            </GhostButton>
          ) : null}
        </div>
        {error ? <span className="font-meta text-[12px] text-[#a8503f]">{error}</span> : null}
      </div>
    </div>
  );
}
