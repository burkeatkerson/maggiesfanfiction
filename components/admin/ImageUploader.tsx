"use client";

import { useRef, useState } from "react";
import { GhostButton } from "@/components/ui/form";

/**
 * Drag-and-drop image uploader with preview. Reads the file locally as a
 * data URL (no network) — wiring to /api/upload comes with the DB phase.
 */
export function ImageUploader({
  value,
  onChange,
  shape = "rect",
  height = 200,
  label = "Featured image",
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  shape?: "rect" | "circle";
  height?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function read(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
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
          read(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
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
            {dragging ? "Drop to upload" : "Drag & drop or click"}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => read(e.target.files?.[0])}
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
    </div>
  );
}
