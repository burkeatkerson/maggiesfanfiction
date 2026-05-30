"use client";

import Link from "next/link";
import { useAdminStore } from "./useAdminStore";
import { prettyDate, type AdminPost } from "@/lib/mock/admin-defaults";
import { GhostButton } from "@/components/ui/form";
import { Toast, useToast } from "@/components/ui/Toast";

function StatusDot({ status }: { status: AdminPost["status"] }) {
  const published = status === "Published";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-[7px] w-[7px] shrink-0 rounded-full border"
        style={{
          background: published ? "var(--taupe)" : "transparent",
          borderColor: published ? "var(--taupe)" : "var(--ink-faint)",
        }}
      />
      <span className="meta text-[11.5px] uppercase tracking-[0.08em] text-ink-muted">{status}</span>
    </span>
  );
}

function PostRow({ post, onDelete }: { post: AdminPost; onDelete: (id: string) => void }) {
  return (
    <div className="group grid grid-cols-[1fr_auto] items-center gap-6 border-t border-line py-[22px] transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:pl-3.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="font-display text-[21px] font-medium leading-[1.25] text-ink">
            {post.title || "Untitled"}
          </span>
          <StatusDot status={post.status} />
        </div>
        <div className="meta mt-2 flex flex-wrap items-center gap-2.5 text-[12.5px]">
          <span className="tracking-[0.04em] text-taupe">{post.category}</span>
          {post.series ? (
            <>
              <span className="text-line">·</span>
              <span className="italic text-ink-muted">{post.series}</span>
            </>
          ) : null}
          <span className="text-line">·</span>
          <span>{prettyDate(post.date)}</span>
        </div>
      </div>
      <div className="flex gap-2.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Link href={`/admin/edit/${post.id}`}>
          <GhostButton small>Edit</GhostButton>
        </Link>
        <GhostButton small danger onClick={() => onDelete(post.id)}>
          Delete
        </GhostButton>
      </div>
    </div>
  );
}

export function PostsManager() {
  const { data, hydrated, deletePost } = useAdminStore();
  const { message, flash } = useToast();
  const drafts = data.posts.filter((p) => p.status === "Draft").length;

  return (
    <div className="pb-20">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="m-0 font-display text-[26px] font-medium tracking-[-0.01em] text-ink">Posts</h2>
          <span className="meta text-[12.5px] text-ink-muted">
            {data.posts.length} pieces · {drafts} draft{drafts === 1 ? "" : "s"}
          </span>
        </div>
        <Link href="/admin/create">
          <GhostButton small>+ Write new</GhostButton>
        </Link>
      </div>

      {!hydrated ? (
        <p className="meta py-10">Loading your desk…</p>
      ) : (
        <div>
          {data.posts.map((p) => (
            <PostRow
              key={p.id}
              post={p}
              onDelete={(id) => {
                deletePost(id);
                flash("Post deleted");
              }}
            />
          ))}
          <div className="border-t border-line" />
        </div>
      )}

      <Toast message={message} />
    </div>
  );
}
