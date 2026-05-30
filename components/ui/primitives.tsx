import type { CSSProperties, ReactNode } from "react";

/** Uppercase taupe kicker label. */
export function Kicker({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <p className={`kicker ${className}`} style={style}>
      {children}
    </p>
  );
}

/** Warm circular avatar placeholder (no image needed). */
export function Avatar({ size = 32, label }: { size?: number; label?: string }) {
  return (
    <span
      aria-hidden
      title={label}
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(120% 120% at 30% 25%, #e4d8cb 0%, var(--beige) 55%, #c7b6a6 100%)",
        boxShadow: "inset 0 0 0 1px rgba(139,115,85,0.18)",
      }}
    />
  );
}

/** Small bordered genre/category tag. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-line bg-tag px-2.5 py-[5px] font-meta text-[11px] tracking-[0.04em] text-taupe">
      {children}
    </span>
  );
}

/**
 * Gradient/texture featured-image placeholder (from blocks.jsx). When a real
 * `src` is provided it renders the image instead.
 */
export function ImagePlaceholder({
  height = 360,
  caption,
  label = "Featured Image",
  src,
}: {
  height?: number;
  caption?: string | null;
  label?: string;
  src?: string | null;
}) {
  return (
    <figure className="m-0">
      <div
        className="texture relative grid place-items-center overflow-hidden border border-line"
        style={{
          height,
          width: "100%",
          background: src
            ? undefined
            : "linear-gradient(135deg, var(--beige-2) 0%, var(--beige-3) 60%, #d2c5b6 100%)",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={caption ?? ""} className="h-full w-full object-cover" />
        ) : (
          <span className="font-meta text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: "#9a8a72" }}>
            {label}
          </span>
        )}
      </div>
      {caption ? (
        <figcaption className="meta mt-3 italic" style={{ color: "var(--ink-faint)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
