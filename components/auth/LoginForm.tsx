"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggleLink } from "@/components/theme/ThemeToggle";
import { api } from "@/components/admin/api";

const QUOTE = "Some stories are only told in the margins. This is where I keep mine.";

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
    </label>
  );
}

/** Login page — real Supabase Auth via POST /api/auth/login. */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || password.length < 1) {
      setError("Enter your email and password.");
      return;
    }
    setStatus("loading");
    try {
      await api.auth.login(email.trim(), password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Sign in failed.");
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1fr_1.1fr]">
      <aside className="texture hidden flex-col justify-between border-r border-line-soft bg-block p-[60px] md:flex">
        <div>
          <p className="kicker text-taupe">Writing Desk</p>
          <p className="mt-[22px] max-w-[420px] font-display text-[clamp(26px,3vw,36px)] font-normal italic leading-[1.32] text-ink text-balance">
            &ldquo;{QUOTE}&rdquo;
          </p>
        </div>
        <p className="meta text-[12.5px] text-ink-muted">
          The private desk where Maggie writes, edits, and publishes.
        </p>
      </aside>

      <main className="relative flex items-center justify-center p-[60px]">
        <div className="w-full max-w-[400px]">
          <form onSubmit={submit} noValidate>
            <p className="kicker">Author sign in</p>
            <h1 className="mb-9 mt-3.5 font-display text-[clamp(32px,4vw,42px)] font-medium leading-[1.16] tracking-[-0.015em] text-ink text-balance">
              Welcome back, Maggie.
            </h1>
            <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="username" />
            <Field
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              hint={showPw ? "Hide" : "Show"}
              onHint={() => setShowPw((s) => !s)}
            />
            {error ? <p className="mb-5 font-meta text-[13px] text-[#a8503f]">{error}</p> : null}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full cursor-pointer rounded border border-ink bg-ink py-3 font-meta text-[13px] font-semibold tracking-[0.03em] text-[var(--bg-body)] disabled:opacity-60"
            >
              {status === "loading" ? "One moment…" : "Sign in"}
            </button>
          </form>

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
