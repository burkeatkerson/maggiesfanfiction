"use client";

import { useEffect, useRef, useState } from "react";
import { BODY_FONTS, bodyCss } from "@/lib/fonts";

/** Body-font dropdown (12 fonts) — ported from admin-richtext.jsx. */
export function FontPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-w-[180px] cursor-pointer items-center gap-2.5 rounded border border-line bg-canvas px-3 py-[7px]"
      >
        <span className="flex-1 text-left text-[16px] text-ink" style={{ fontFamily: bodyCss(value) }}>
          {value}
        </span>
        <span className="font-meta text-[10px] text-ink-muted">{open ? "▲" : "▼"}</span>
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-[300px] w-[240px] overflow-y-auto rounded-md border border-line bg-canvas p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
          {BODY_FONTS.map((f) => {
            const active = f.name === value;
            return (
              <button
                key={f.name}
                type="button"
                onClick={() => {
                  onChange(f.name);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2.5 rounded px-3 py-2.5 text-left ${
                  active ? "bg-block" : "bg-transparent"
                }`}
              >
                <span className="text-[17px] text-ink" style={{ fontFamily: f.css }}>
                  {f.name}
                </span>
                {active ? <span className="text-[13px] text-taupe">✓</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
