"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { ImageUploader } from "./ImageUploader";
import { FieldGroup, GhostButton, Label, SolidButton, TextArea, TextInput } from "@/components/ui/form";
import { Toast, useToast } from "@/components/ui/Toast";
import { HEADLINE_FONTS, headlineCss } from "@/lib/fonts";
import type { Category, Series, SiteSettings } from "@/lib/types";

type SiteFields = Pick<SiteSettings, "intro" | "statement" | "quote" | "bio" | "photo_url" | "headline_font">;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="m-0 mb-7 border-b border-line pb-4 font-display text-[26px] font-medium tracking-[-0.01em] text-ink">
      {children}
    </h2>
  );
}

export function SiteDetails() {
  const { message, flash } = useToast();
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [draft, setDraft] = useState<SiteFields | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [series, setSeries] = useState<(Series & { parts: number })[]>([]);
  const [saving, setSaving] = useState(false);

  async function reloadTaxonomy() {
    const [cats, ser] = await Promise.all([api.categories.list(), api.series.list()]);
    setCategories(cats);
    setSeries(ser);
  }

  useEffect(() => {
    (async () => {
      const s = await api.site.get();
      setSite(s);
      setDraft({
        intro: s?.intro ?? "",
        statement: s?.statement ?? "",
        quote: s?.quote ?? "",
        bio: s?.bio ?? "",
        photo_url: s?.photo_url ?? null,
        headline_font: s?.headline_font ?? "EB Garamond",
      });
      await reloadTaxonomy();
    })().catch((e) => flash(e instanceof Error ? e.message : "Load failed"));
  }, [flash]);

  // Live-preview the headline font; restore the saved value on unmount.
  useEffect(() => {
    if (!draft) return;
    document.documentElement.style.setProperty("--ff-display", headlineCss(draft.headline_font));
    return () => {
      document.documentElement.style.setProperty("--ff-display", headlineCss(site?.headline_font ?? "EB Garamond"));
    };
  }, [draft, site?.headline_font]);

  if (!draft) return <p className="meta py-10">Loading site details…</p>;

  const dirty =
    !!site &&
    JSON.stringify(draft) !==
      JSON.stringify({
        intro: site.intro ?? "",
        statement: site.statement ?? "",
        quote: site.quote ?? "",
        bio: site.bio ?? "",
        photo_url: site.photo_url ?? null,
        headline_font: site.headline_font ?? "EB Garamond",
      });

  const setField = (key: keyof SiteFields, val: string | null) =>
    setDraft((d) => (d ? { ...d, [key]: val } : d));

  async function saveSite() {
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await api.site.update(draft);
      setSite(updated);
      flash("Site details saved");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // ---- categories ----
  async function addCategory() {
    try {
      await api.categories.create({ name: "New category", note: "" });
      await reloadTaxonomy();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Add failed");
    }
  }
  async function updateCategory(id: string, patch: Record<string, unknown>) {
    try {
      await api.categories.update(id, patch);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Update failed");
    }
  }
  async function removeCategory(id: string) {
    try {
      await api.categories.remove(id);
      setCategories((c) => c.filter((x) => x.id !== id));
    } catch (e) {
      flash(e instanceof Error ? e.message : "Delete failed");
    }
  }

  // ---- series ----
  async function addSeries() {
    try {
      await api.series.create({ title: "New series", fandom: "" });
      await reloadTaxonomy();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Add failed");
    }
  }
  async function updateSeries(id: string, patch: Record<string, unknown>) {
    try {
      await api.series.update(id, patch);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Update failed");
    }
  }
  async function removeSeries(id: string) {
    try {
      await api.series.remove(id);
      setSeries((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      flash(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="pb-32">
      <SectionHeading>Identity</SectionHeading>

      <FieldGroup label="Author photo" note="Shown on the About panel. Uploaded to Supabase Storage.">
        <ImageUploader
          value={draft.photo_url}
          onChange={(v) => setField("photo_url", v)}
          bucket="avatars"
          shape="circle"
          label="Author photo"
        />
      </FieldGroup>
      <FieldGroup label="Intro line" note="The small kicker above the homepage statement.">
        <TextInput value={draft.intro ?? ""} mono onChange={(v) => setField("intro", v)} />
      </FieldGroup>
      <FieldGroup label="Homepage statement" note="The large serif line that opens the site.">
        <TextArea value={draft.statement ?? ""} rows={3} onChange={(v) => setField("statement", v)} />
      </FieldGroup>
      <FieldGroup label="Favorite quote" note="Appears on the sign-in desk and elsewhere.">
        <TextArea value={draft.quote ?? ""} rows={2} onChange={(v) => setField("quote", v)} />
      </FieldGroup>
      <FieldGroup label="Author bio" note="Your About-the-author paragraph.">
        <TextArea value={draft.bio ?? ""} rows={5} onChange={(v) => setField("bio", v)} />
      </FieldGroup>

      <div className="mt-14">
        <SectionHeading>Appearance</SectionHeading>
        <FieldGroup label="Headline font" note="Sets every headline across the whole site.">
          <div className="flex flex-wrap gap-3">
            {HEADLINE_FONTS.map((f) => {
              const active = draft.headline_font === f.name;
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setField("headline_font", f.name)}
                  className={`flex-1 basis-[180px] cursor-pointer rounded-md border px-[18px] py-4 text-left transition-colors ${
                    active ? "border-ink bg-block" : "border-line"
                  }`}
                >
                  <span className="block text-[30px] leading-[1.05] tracking-[-0.01em] text-ink" style={{ fontFamily: f.css }}>
                    Aa
                  </span>
                  <span className="mt-2.5 flex items-center gap-2">
                    <span className={`font-meta text-[12px] font-semibold ${active ? "text-ink" : "text-ink-muted"}`}>{f.name}</span>
                    {active ? <span className="text-[12px] text-taupe">✓</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </FieldGroup>
      </div>

      <div className="mt-14">
        <SectionHeading>Writing categories</SectionHeading>
        {categories.map((c) => (
          <div key={c.id} className="grid grid-cols-1 items-center gap-5 border-t border-line py-4 md:grid-cols-[200px_1fr_auto]">
            <TextInput value={c.name} placeholder="Category name" onChange={(v) => setCategories((arr) => arr.map((x) => (x.id === c.id ? { ...x, name: v } : x)))} />
            <input
              value={c.note ?? ""}
              placeholder="Short description"
              onChange={(e) => setCategories((arr) => arr.map((x) => (x.id === c.id ? { ...x, note: e.target.value } : x)))}
              onBlur={() => updateCategory(c.id, { name: c.name, note: c.note })}
              className="w-full border-0 border-b border-line bg-transparent py-2 font-meta text-[15px] text-ink outline-none focus:border-ink"
            />
            <GhostButton small danger onClick={() => removeCategory(c.id)}>Remove</GhostButton>
          </div>
        ))}
        <div className="border-t border-line pt-5">
          <GhostButton small onClick={addCategory}>+ Add category</GhostButton>
        </div>
      </div>

      <div className="mt-14">
        <SectionHeading>Series</SectionHeading>
        {series.map((s) => (
          <div key={s.id} className="border-t border-line py-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>Fandom</Label>
                <input
                  value={s.fandom ?? ""}
                  placeholder="e.g. Harry Potter"
                  onChange={(e) => setSeries((arr) => arr.map((x) => (x.id === s.id ? { ...x, fandom: e.target.value } : x)))}
                  onBlur={() => updateSeries(s.id, { fandom: s.fandom, title: s.title })}
                  className="w-full border-0 border-b border-line bg-transparent py-2 font-meta text-[15px] text-ink outline-none focus:border-ink"
                />
              </div>
              <div>
                <Label>Series title</Label>
                <input
                  value={s.title}
                  placeholder="Series title"
                  onChange={(e) => setSeries((arr) => arr.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)))}
                  onBlur={() => updateSeries(s.id, { fandom: s.fandom, title: s.title })}
                  className="w-full border-0 border-b border-line bg-transparent py-2 font-body text-[19px] text-ink outline-none focus:border-ink"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-7">
              <span className="inline-flex items-baseline gap-2">
                <span className="font-display text-[22px] font-medium text-ink">{s.parts}</span>
                <span className="meta text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  {s.parts === 1 ? "part" : "parts"} · counted from posts
                </span>
              </span>
              <div className="ml-auto">
                <GhostButton small danger onClick={() => removeSeries(s.id)}>Remove series</GhostButton>
              </div>
            </div>
          </div>
        ))}
        <div className="border-t border-line pt-5">
          <GhostButton small onClick={addSeries}>+ Add series</GhostButton>
        </div>
      </div>

      <div
        className="sticky bottom-0 mt-12 flex items-center justify-between gap-4 border-t border-line bg-canvas py-4 transition-opacity"
        style={{ opacity: dirty ? 1 : 0.55, pointerEvents: dirty ? "auto" : "none" }}
      >
        <span className="meta text-[13px]" style={{ color: dirty ? "var(--ink-soft)" : "var(--ink-faint)" }}>
          {dirty ? "You have unsaved identity/appearance changes." : "All changes saved."}
        </span>
        <SolidButton onClick={saveSite} disabled={saving || !dirty}>
          {saving ? "Saving…" : "Save changes"}
        </SolidButton>
      </div>

      <Toast message={message} />
    </div>
  );
}
