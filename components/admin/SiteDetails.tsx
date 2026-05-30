"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "./useAdminStore";
import { ImageUploader } from "./ImageUploader";
import {
  FieldGroup,
  GhostButton,
  Label,
  SolidButton,
  TextArea,
  TextInput,
} from "@/components/ui/form";
import { Toast, useToast } from "@/components/ui/Toast";
import { HEADLINE_FONTS, headlineCss } from "@/lib/fonts";
import {
  uid,
  type AdminCategory,
  type AdminData,
  type AdminSeries,
} from "@/lib/mock/admin-defaults";

type Draft = Pick<AdminData, "site" | "categories" | "series">;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="m-0 mb-7 border-b border-line pb-4 font-display text-[26px] font-medium tracking-[-0.01em] text-ink">
      {children}
    </h2>
  );
}

function CategoriesEditor({ items, onChange }: { items: AdminCategory[]; onChange: (i: AdminCategory[]) => void }) {
  const update = (id: string, key: keyof AdminCategory, val: string) =>
    onChange(items.map((c) => (c.id === id ? { ...c, [key]: val } : c)));
  return (
    <div>
      {items.map((c) => (
        <div key={c.id} className="grid grid-cols-1 items-center gap-5 border-t border-line py-4 md:grid-cols-[200px_1fr_auto]">
          <TextInput value={c.name} placeholder="Category name" onChange={(v) => update(c.id, "name", v)} />
          <TextInput value={c.note} placeholder="Short description" mono onChange={(v) => update(c.id, "note", v)} />
          <GhostButton small danger onClick={() => onChange(items.filter((x) => x.id !== c.id))}>
            Remove
          </GhostButton>
        </div>
      ))}
      <div className="border-t border-line pt-5">
        <GhostButton small onClick={() => onChange([...items, { id: uid(), name: "", note: "" }])}>
          + Add category
        </GhostButton>
      </div>
    </div>
  );
}

function SeriesEditor({
  items,
  postsForCount,
  onChange,
}: {
  items: AdminSeries[];
  postsForCount: { series: string }[];
  onChange: (i: AdminSeries[]) => void;
}) {
  const update = (id: string, key: keyof AdminSeries, val: string) =>
    onChange(items.map((s) => (s.id === id ? { ...s, [key]: val } : s)));
  const partsFor = (title: string) =>
    title.trim() ? postsForCount.filter((p) => p.series.trim() === title.trim()).length : 0;

  return (
    <div>
      {items.map((s) => {
        const count = partsFor(s.title);
        return (
          <div key={s.id} className="border-t border-line py-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>Fandom</Label>
                <TextInput value={s.fandom} placeholder="e.g. Harry Potter" mono onChange={(v) => update(s.id, "fandom", v)} />
              </div>
              <div>
                <Label>Series title</Label>
                <TextInput value={s.title} placeholder="Series title" onChange={(v) => update(s.id, "title", v)} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-7">
              <span className="inline-flex items-baseline gap-2">
                <span className="font-display text-[22px] font-medium text-ink">{count}</span>
                <span className="meta text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                  {count === 1 ? "part" : "parts"} · counted from posts
                </span>
              </span>
              <div className="ml-auto">
                <GhostButton small danger onClick={() => onChange(items.filter((x) => x.id !== s.id))}>
                  Remove series
                </GhostButton>
              </div>
            </div>
          </div>
        );
      })}
      <div className="border-t border-line pt-5">
        <GhostButton small onClick={() => onChange([...items, { id: uid(), fandom: "", title: "" }])}>
          + Add series
        </GhostButton>
      </div>
    </div>
  );
}

export function SiteDetails() {
  const { data, hydrated, commitSite } = useAdminStore();
  const { message, flash } = useToast();
  const [draft, setDraft] = useState<Draft>({ site: data.site, categories: data.categories, series: data.series });

  // Re-sync the working draft whenever committed data changes.
  useEffect(() => {
    setDraft({ site: data.site, categories: data.categories, series: data.series });
  }, [data]);

  // Live-preview the headline font; restore committed value on unmount.
  useEffect(() => {
    document.documentElement.style.setProperty("--ff-display", headlineCss(draft.site.headlineFont));
    return () => {
      document.documentElement.style.setProperty("--ff-display", headlineCss(data.site.headlineFont));
    };
  }, [draft.site.headlineFont, data.site.headlineFont]);

  const dirty =
    JSON.stringify(draft) !== JSON.stringify({ site: data.site, categories: data.categories, series: data.series });

  const setSite = (key: keyof Draft["site"], val: string | null) =>
    setDraft((d) => ({ ...d, site: { ...d.site, [key]: val } }));

  if (!hydrated) return <p className="meta py-10">Loading site details…</p>;

  return (
    <div className="pb-32">
      <SectionHeading>Identity</SectionHeading>

      <FieldGroup label="Author photo" note="Shown on the About panel. Square or portrait works best.">
        <ImageUploader value={draft.site.photo} onChange={(v) => setSite("photo", v)} shape="circle" label="Author photo" />
      </FieldGroup>
      <FieldGroup label="Intro line" note="The small kicker above the homepage statement.">
        <TextInput value={draft.site.intro} mono onChange={(v) => setSite("intro", v)} />
      </FieldGroup>
      <FieldGroup label="Homepage statement" note="The large serif line that opens the site.">
        <TextArea value={draft.site.statement} rows={3} onChange={(v) => setSite("statement", v)} />
      </FieldGroup>
      <FieldGroup label="Favorite quote" note="Appears on the sign-in desk and elsewhere.">
        <TextArea value={draft.site.quote} rows={2} onChange={(v) => setSite("quote", v)} />
      </FieldGroup>
      <FieldGroup label="Author bio" note="Your About-the-author paragraph.">
        <TextArea value={draft.site.bio} rows={5} onChange={(v) => setSite("bio", v)} />
      </FieldGroup>

      <div className="mt-14">
        <SectionHeading>Appearance</SectionHeading>
        <FieldGroup label="Headline font" note="Sets every headline across the whole site. Body text and metadata are unaffected.">
          <div className="flex flex-wrap gap-3">
            {HEADLINE_FONTS.map((f) => {
              const active = draft.site.headlineFont === f.name;
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => setSite("headlineFont", f.name)}
                  className={`flex-1 basis-[180px] cursor-pointer rounded-md border px-[18px] py-4 text-left transition-colors ${
                    active ? "border-ink bg-block" : "border-line"
                  }`}
                >
                  <span className="block text-[30px] leading-[1.05] tracking-[-0.01em] text-ink" style={{ fontFamily: f.css }}>
                    Aa
                  </span>
                  <span className="mt-2.5 flex items-center gap-2">
                    <span className={`font-meta text-[12px] font-semibold tracking-[0.02em] ${active ? "text-ink" : "text-ink-muted"}`}>
                      {f.name}
                    </span>
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
        <CategoriesEditor items={draft.categories} onChange={(items) => setDraft((d) => ({ ...d, categories: items }))} />
      </div>

      <div className="mt-14">
        <SectionHeading>Series</SectionHeading>
        <SeriesEditor
          items={draft.series}
          postsForCount={data.posts}
          onChange={(items) => setDraft((d) => ({ ...d, series: items }))}
        />
      </div>

      <div
        className="sticky bottom-0 mt-12 flex items-center justify-between gap-4 border-t border-line bg-canvas py-4 transition-opacity"
        style={{ opacity: dirty ? 1 : 0.55, pointerEvents: dirty ? "auto" : "none" }}
      >
        <span className="meta text-[13px]" style={{ color: dirty ? "var(--ink-soft)" : "var(--ink-faint)" }}>
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </span>
        <div className="flex gap-3">
          <GhostButton small onClick={() => setDraft({ site: data.site, categories: data.categories, series: data.series })}>
            Discard
          </GhostButton>
          <SolidButton
            onClick={() => {
              commitSite(draft);
              flash("Site details saved");
            }}
          >
            Save changes
          </SolidButton>
        </div>
      </div>

      <Toast message={message} />
    </div>
  );
}
