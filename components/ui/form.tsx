"use client";

import type { ReactNode } from "react";

/** Form control primitives — ported from admin-ui.jsx, as Tailwind + TS. */

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2.5 block font-meta text-[11px] font-semibold uppercase tracking-[0.16em] text-taupe"
    >
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  mono,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  id?: string;
}) {
  return (
    <input
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border-0 border-b border-line bg-transparent py-2 text-ink outline-none transition-colors focus:border-ink ${
        mono ? "font-meta text-[15px]" : "font-body text-[19px]"
      }`}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  serif = true,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  serif?: boolean;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full resize-y rounded border border-line bg-block px-4 py-3.5 leading-relaxed text-ink outline-none transition-colors focus:border-ink ${
        serif ? "font-body text-[18px]" : "font-meta text-[15px]"
      }`}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full cursor-pointer appearance-none border-0 border-b border-line bg-transparent py-2 font-meta text-[15px] text-ink outline-none transition-colors focus:border-ink"
    >
      {options.map((o) => (
        <option key={o} value={o} className="text-[#1a1a1a]">
          {o || "— None"}
        </option>
      ))}
    </select>
  );
}

export function GhostButton({
  children,
  onClick,
  danger,
  small,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  small?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`cursor-pointer rounded border bg-transparent font-meta font-semibold tracking-[0.03em] transition-colors ${
        small ? "px-3.5 py-[7px] text-[12px]" : "px-5 py-[11px] text-[13px]"
      } ${
        danger
          ? "border-line text-[#a8503f] hover:border-[#a8503f]"
          : "border-line text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function SolidButton({
  children,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer rounded border border-ink bg-ink px-[22px] py-3 font-meta text-[13px] font-semibold tracking-[0.03em] text-[var(--bg-body)] transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function FieldGroup({
  label,
  children,
  note,
}: {
  label: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <div className="mb-10">
      <Label>{label}</Label>
      {children}
      {note ? <p className="meta mt-2.5 text-[12.5px]" style={{ color: "var(--ink-faint)" }}>{note}</p> : null}
    </div>
  );
}
