"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggleLink } from "@/components/theme/ThemeToggle";
import { getSiteSettings } from "@/lib/mock";

function Field({
  label,
  type,
  value,
  onChange,
  error,
  autoComplete,
  hint,
  onHint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  hint?: string;
  onHint?: () => void;
}) {
  return (
    <label className="mb-7 block">
      <span
        className={`mb-2 flex items-baseline justify-between font-meta text-[11px] font-semibold uppercase tracking-[0.16em] ${
          error ? "text-[#a8503f]" : "text-taupe"
        }`}
      >
        {label}
        {hint ? (
          <button type="button" onClick={onHint} className="font-meta text-[11px] font-medium normal-case tracking-[0.02em] text-ink-muted">
            {hint}
          </button>
        ) : null}
      </span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border-0 border-b bg-transparent py-2 font-body text-[19px] text-ink outline-none transition-colors ${
          error ? "border-[#a8503f]" : "border-line focus:border-ink"
        }`}
      />
      {error ? <span className="mt-2 block font-meta text-[12px] text-[#a8503f]">{error}</span> : null}
    </label>
  );
}

/** Login page (ported from login.jsx). Mock submit — no real auth yet. */
export function LoginForm() {
  const site = getSiteSettings();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [showPw, setShowPw] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: typeof errors = {};
    if (username.trim().length < 2) er.username = "Enter your username.";
    if (password.length < 8) er.password = "At least 8 characters.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus("loading");
    setTimeout(() => setStatus("done"), 900);
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1fr_1.1fr]">
      {/* literary panel */}
      <aside className="texture hidden flex-col justify-between border-r border-line-soft bg-block p-[60px] md:flex">
        <div>
          <p className="kicker text-taupe">Writing Desk</p>
          <p className="mt-[22px] max-w-[420px] font-display text-[clamp(26px,3vw,36px)] font-normal italic leading-[1.32] text-ink text-balance">
            &ldquo;{site.quote}&rdquo;
          </p>
        </div>
        <p className="meta text-[12.5px] text-ink-muted">
          The private desk where Maggie writes, edits, and publishes.
        </p>
      </aside>

      {/* form */}
      <main className="relative flex items-center justify-center p-[60px]">
        <div className="w-full max-w-[400px]">
          {status === "done" ? (
            <div>
              <p className="kicker">Welcome back</p>
              <h1 className="my-4 mb-[18px] font-display text-[38px] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
                Good to see you, Maggie.
              </h1>
              <p className="mb-8 font-body text-[18px] leading-[1.7] text-ink-soft">
                Your desk is exactly as you left it. Three drafts are waiting.
              </p>
              <button
                onClick={() => router.push("/admin")}
                className="cursor-pointer rounded border border-ink bg-ink px-7 py-3 font-meta text-[13px] font-semibold tracking-[0.03em] text-[var(--bg-body)]"
              >
                Enter your desk
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="kicker">Author sign in</p>
              <h1 className="mb-9 mt-3.5 font-display text-[clamp(32px,4vw,42px)] font-medium leading-[1.16] tracking-[-0.015em] text-ink text-balance">
                Welcome back, Maggie.
              </h1>
              <Field label="Username" type="text" value={username} onChange={setUsername} error={errors.username} autoComplete="username" />
              <Field
                label="Password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={setPassword}
                error={errors.password}
                autoComplete="current-password"
                hint={showPw ? "Hide" : "Show"}
                onHint={() => setShowPw((s) => !s)}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full cursor-pointer rounded border border-ink bg-ink py-3 font-meta text-[13px] font-semibold tracking-[0.03em] text-[var(--bg-body)] disabled:opacity-60"
              >
                {status === "loading" ? "One moment…" : "Sign in"}
              </button>
            </form>
          )}

          <div className="mt-12 flex justify-center">
            <ThemeToggleLink className="font-meta text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink-faint" />
          </div>
        </div>

        <Link
          href="/"
          className="absolute bottom-8 left-[60px] font-meta text-[12.5px] tracking-[0.02em] text-ink-muted no-underline"
        >
          ← Back to the journal
        </Link>
      </main>
    </div>
  );
}
