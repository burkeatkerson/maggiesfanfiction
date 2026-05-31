"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import type { Category, Post, PostStatus, Series } from "@/lib/types";
import { TipTapEditor } from "./TipTapEditor";
import { ImageUploader } from "./ImageUploader";
import { FieldGroup, GhostButton, Label, SolidButton, TextArea, TextInput } from "@/components/ui/form";
import { Toast, useToast } from "@/components/ui/Toast";

interface Draft {
  title: string;
  headline: string;
  category_id: string;
  series_id: string;
  series_part: string; // numeric text input
  excerpt: string;
  content: string;
  body_font: string;
  featured_image_url: string | null;
  featured_image_caption: string;
  seo_description: string;
  tags: string; // comma-separated input
  status: PostStatus;
}

const EMPTY: Draft = {
  title: "",
  headline: "",
  category_id: "",
  series_id: "",
  series_part: "",
  excerpt: "",
  content: "",
  body_font: "Crimson Text",
  featured_image_url: null,
  featured_image_caption: "",
  seo_description: "",
  tags: "",
  status: "draft",
};

/** Styled native select with value/label pairs (ids). */
function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full cursor-pointer appearance-none border-0 border-b border-line bg-transparent py-2 font-meta text-[15px] text-ink outline-none transition-colors focus:border-ink"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-[#1a1a1a]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function PostComposer({ postId }: { postId?: string }) {
  const router = useRouter();
  const { message, flash } = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cats, ser] = await Promise.all([api.categories.list(), api.series.list()]);
        setCategories(cats);
        setSeries(ser);
        if (postId) {
          const post: Post = await api.posts.get(postId);
          setDraft({
            title: post.title,
            headline: post.headline ?? "",
            category_id: post.category_id ?? cats[0]?.id ?? "",
            series_id: post.series_id ?? "",
            series_part: post.series_part != null ? String(post.series_part) : "",
            excerpt: post.excerpt ?? "",
            content: post.content ?? "",
            body_font: post.body_font,
            featured_image_url: post.featured_image_url,
            featured_image_caption: post.featured_image_caption ?? "",
            seo_description: post.seo_description ?? "",
            tags: (post.tags ?? []).join(", "),
            status: post.status,
          });
        } else {
          setDraft({ ...EMPTY, category_id: cats[0]?.id ?? "" });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load the composer");
      }
    })();
  }, [postId]);

  if (error) return <p className="font-meta text-[13px] text-[#a8503f]">{error}</p>;
  if (!draft) return <p className="meta py-10">Loading composer…</p>;

  const isNew = !postId;
  const set = <K extends keyof Draft>(key: K, val: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: val } : d));

  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const serOptions = [{ value: "", label: "— None" }, ...series.map((s) => ({ value: s.id, label: s.title }))];

  async function save(status: PostStatus) {
    if (!draft) return;
    if (!draft.title.trim()) {
      flash("Give it a title first.");
      return;
    }
    setSaving(true);
    const partNum = Number.parseInt(draft.series_part, 10);
    const body = {
      title: draft.title,
      headline: draft.headline.trim() || null,
      category_id: draft.category_id || null,
      series_id: draft.series_id || null,
      series_part: draft.series_id && Number.isFinite(partNum) ? partNum : null,
      excerpt: draft.excerpt || null,
      content: draft.content || null,
      body_font: draft.body_font,
      featured_image_url: draft.featured_image_url,
      featured_image_caption: draft.featured_image_caption.trim() || null,
      seo_description: draft.seo_description.trim() || null,
      tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
    };
    try {
      if (isNew) await api.posts.create(body);
      else await api.posts.update(postId!, body);
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setSaving(false);
      flash(e instanceof Error ? e.message : "Save failed");
    }
  }

  return (
    <div className="pb-20">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <h2 className="m-0 font-display text-[26px] font-medium tracking-[-0.01em] text-ink">
          {isNew ? "Write something new" : "Edit post"}
        </h2>
        <GhostButton small onClick={() => router.push("/admin")}>
          ← Back to posts
        </GhostButton>
      </div>

      <FieldGroup label="Title">
        <TextInput value={draft.title} placeholder="Give it a title…" onChange={(v) => set("title", v)} />
      </FieldGroup>

      <FieldGroup label="Display headline" note="Optional. The large title shown on the story page — defaults to the title above.">
        <TextInput value={draft.headline} placeholder="Leave blank to use the title" onChange={(v) => set("headline", v)} />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <FieldGroup label="Category">
          <Select value={draft.category_id} options={catOptions} onChange={(v) => set("category_id", v)} />
        </FieldGroup>
        <FieldGroup label="Part of a series">
          <Select value={draft.series_id} options={serOptions} onChange={(v) => set("series_id", v)} />
        </FieldGroup>
      </div>

      {draft.series_id ? (
        <FieldGroup label="Part number" note="Orders this piece within the series navigation.">
          <TextInput
            value={draft.series_part}
            placeholder="e.g. 3"
            mono
            onChange={(v) => set("series_part", v.replace(/[^0-9]/g, ""))}
          />
        </FieldGroup>
      ) : null}

      <FieldGroup label="Featured image" note="Drag & drop or click — uploaded to Supabase Storage.">
        <ImageUploader
          value={draft.featured_image_url}
          onChange={(v) => set("featured_image_url", v)}
          bucket="post-images"
          height={200}
        />
      </FieldGroup>

      <FieldGroup label="Featured image caption" note="Shown beneath the image on the story page.">
        <TextInput value={draft.featured_image_caption} placeholder="e.g. The meeting point, after midnight" onChange={(v) => set("featured_image_caption", v)} />
      </FieldGroup>

      <FieldGroup label="Excerpt" note="A one-line teaser shown in lists.">
        <TextArea value={draft.excerpt} rows={2} onChange={(v) => set("excerpt", v)} />
      </FieldGroup>

      <FieldGroup label="Tags" note="Comma-separated genre tags shown on the story page (e.g. Slow Burn, Romance).">
        <TextInput value={draft.tags} placeholder="Slow Burn, Romance, Series" mono onChange={(v) => set("tags", v)} />
      </FieldGroup>

      <FieldGroup label="SEO description" note="Meta description for search engines & link previews. Defaults to the excerpt if blank.">
        <TextArea value={draft.seo_description} rows={2} serif={false} onChange={(v) => set("seo_description", v)} />
      </FieldGroup>

      <div className="mb-10">
        <Label>Body</Label>
        <TipTapEditor
          html={draft.content}
          font={draft.body_font}
          onHtml={(v) => set("content", v)}
          onFont={(v) => set("body_font", v)}
        />
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-3.5">
        <SolidButton onClick={() => save("published")} disabled={saving}>
          {saving ? "Saving…" : "Publish"}
        </SolidButton>
        <GhostButton onClick={() => save("draft")}>Save as draft</GhostButton>
        <span className="meta ml-auto">
          {draft.status === "published" ? "Currently published" : "Currently a draft"}
        </span>
      </div>

      <Toast message={message} />
    </div>
  );
}
