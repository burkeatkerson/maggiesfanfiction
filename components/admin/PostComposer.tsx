"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "./useAdminStore";
import { uid, type AdminPost } from "@/lib/mock/admin-defaults";
import { TipTapEditor } from "./TipTapEditor";
import { ImageUploader } from "./ImageUploader";
import {
  FieldGroup,
  GhostButton,
  Label,
  SelectInput,
  SolidButton,
  TextArea,
  TextInput,
} from "@/components/ui/form";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PostComposer({ postId }: { postId?: string }) {
  const { data, hydrated, savePost } = useAdminStore();
  const router = useRouter();
  const [draft, setDraft] = useState<AdminPost | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!hydrated || initRef.current) return;
    initRef.current = true;
    const existing = postId ? data.posts.find((p) => p.id === postId) : undefined;
    setDraft(
      existing
        ? { ...existing }
        : {
            id: uid(),
            title: "",
            category: data.categories[0]?.name ?? "",
            series: "",
            date: todayISO(),
            status: "Draft",
            excerpt: "",
            body: "",
            bodyFont: "Crimson Text",
            image: null,
          },
    );
  }, [hydrated, postId, data.posts, data.categories]);

  if (!draft) {
    return <p className="meta py-10">Loading composer…</p>;
  }

  const isNew = !postId;
  const set = <K extends keyof AdminPost>(key: K, val: AdminPost[K]) =>
    setDraft((d) => (d ? { ...d, [key]: val } : d));

  const catOptions = data.categories.map((c) => c.name);
  const seriesOptions = ["", ...data.series.map((s) => s.title)];

  function save(status: AdminPost["status"]) {
    if (!draft) return;
    savePost({ ...draft, status });
    router.push("/admin");
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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <FieldGroup label="Category">
          <SelectInput value={draft.category} options={catOptions} onChange={(v) => set("category", v)} />
        </FieldGroup>
        <FieldGroup label="Part of a series">
          <SelectInput value={draft.series} options={seriesOptions} onChange={(v) => set("series", v)} />
        </FieldGroup>
      </div>

      <FieldGroup label="Featured image" note="Drag & drop or click. Preview only until the database is wired.">
        <ImageUploader value={draft.image ?? null} onChange={(v) => set("image", v)} height={200} />
      </FieldGroup>

      <FieldGroup label="Excerpt" note="A one-line teaser shown in lists.">
        <TextArea value={draft.excerpt} rows={2} onChange={(v) => set("excerpt", v)} />
      </FieldGroup>

      <div className="mb-10">
        <Label>Body</Label>
        <TipTapEditor
          html={draft.body}
          font={draft.bodyFont}
          onHtml={(v) => set("body", v)}
          onFont={(v) => set("bodyFont", v)}
        />
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-3.5">
        <SolidButton onClick={() => save("Published")}>Publish</SolidButton>
        <GhostButton onClick={() => save("Draft")}>Save as draft</GhostButton>
        <span className="meta ml-auto">
          {draft.status === "Published" ? "Currently published" : "Currently a draft"}
        </span>
      </div>
    </div>
  );
}
