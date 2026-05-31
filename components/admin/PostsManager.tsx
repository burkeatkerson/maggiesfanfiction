"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "./api";
import type { Category, Post, Series } from "@/lib/types";
import { GhostButton } from "@/components/ui/form";
import { Toast, useToast } from "@/components/ui/Toast";

function prettyDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function StatusDot({ status }: { status: Post["status"] }) {
  const published = status === "published";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full border"
        style={{
          background: published ? "var(--taupe)" : "transparent",
          borderColor: published ? "var(--taupe)" : "var(--ink-faint)",
        }}
      />
      <span className="meta text-[11.5px] uppercase tracking-[0.08em] text-ink-muted">
        {published ? "Published" : "Draft"}
      </span>
    </span>
  );
}

export function PostsManager() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [catMap, setCatMap] = useState<Record<string, string>>({});
  const [serMap, setSerMap] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const { message, flash } = useToast();

  const load = useCallback(async () => {
    try {
      const [p, cats, ser] = await Promise.all([api.posts.list(), api.categories.list(), api.series.list()]);
      setPosts(p);
      setCatMap(Object.fromEntries(cats.map((c: Category) => [c.id, c.name])));
      setSerMap(Object.fromEntries(ser.map((s: Series) => [s.id, s.title])));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load posts");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string, title: string) {
    if (!confirm(`Delete “${title || "Untitled"}”? This cannot be undone.`)) return;
    try {
      await api.posts.remove(id);
      setPosts((cur) => cur?.filter((p) => p.id !== id) ?? cur);
      flash("Post deleted");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const drafts = posts?.filter((p) => p.status === "draft").length ?? 0;

  return (
    <div className="pb-20">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="m-0 font-display text-[26px] font-medium tracking-[-0.01em] text-ink">Posts</h2>
          <span className="meta text-[12.5px] text-ink-muted">
            {posts ? `${posts.length} pieces · ${drafts} draft${drafts === 1 ? "" : "s"}` : "Loading…"}
          </span>
        </div>
        <Link href="/admin/create">
          <GhostButton small>+ Write new</GhostButton>
        </Link>
      </div>

      {error ? <p className="font-meta text-[13px] text-[#a8503f]">{error}</p> : null}
      {!posts && !error ? <p className="meta py-10">Loading your desk…</p> : null}

      {posts ? (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              className="group flex flex-col gap-3.5 border-t border-line py-5 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-6 lg:py-[22px] lg:transition-[padding] lg:duration-300 lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:hover:pl-3.5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3.5">
                  <span className="font-display text-[21px] font-medium leading-[1.25] text-ink">
                    {post.title || "Untitled"}
                  </span>
                  <StatusDot status={post.status} />
                </div>
                <div className="meta mt-2 flex flex-wrap items-center gap-2.5 text-[12.5px]">
                  <span className="tracking-[0.04em] text-taupe">
                    {post.category_id ? catMap[post.category_id] : "Uncategorized"}
                  </span>
                  {post.series_id ? (
                    <>
                      <span className="text-line">·</span>
                      <span className="italic text-ink-muted">{serMap[post.series_id]}</span>
                    </>
                  ) : null}
                  <span className="text-line">·</span>
                  <span>{prettyDate(post.published_at ?? post.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2.5 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                <Link href={`/admin/edit/${post.id}`}>
                  <GhostButton small>Edit</GhostButton>
                </Link>
                <GhostButton small danger onClick={() => remove(post.id, post.title)}>
                  Delete
                </GhostButton>
              </div>
            </div>
          ))}
          <div className="border-t border-line" />
          {posts.length === 0 ? <p className="meta py-10">No posts yet. Write your first piece.</p> : null}
        </div>
      ) : null}

      <Toast message={message} />
    </div>
  );
}
