"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_DEFAULTS,
  ADMIN_STORAGE_KEY,
  type AdminData,
  type AdminPost,
} from "@/lib/mock/admin-defaults";
import { headlineCss } from "@/lib/fonts";

function load(): AdminData {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return structuredClone(ADMIN_DEFAULTS);
    const saved = JSON.parse(raw) as Partial<AdminData>;
    return {
      site: { ...ADMIN_DEFAULTS.site, ...(saved.site || {}) },
      categories: saved.categories || structuredClone(ADMIN_DEFAULTS.categories),
      series: saved.series || structuredClone(ADMIN_DEFAULTS.series),
      posts: saved.posts || structuredClone(ADMIN_DEFAULTS.posts),
    };
  } catch {
    return structuredClone(ADMIN_DEFAULTS);
  }
}

/**
 * Shared admin state backed by localStorage (mirrors admin-shell.jsx).
 * Initialises to deterministic defaults for SSR, then hydrates from
 * localStorage on mount to avoid hydration mismatch.
 */
export function useAdminStore() {
  const [data, setData] = useState<AdminData>(ADMIN_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(load());
    setHydrated(true);
  }, []);

  // Persist after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [data, hydrated]);

  // Apply the saved headline font site-wide within admin.
  useEffect(() => {
    document.documentElement.style.setProperty("--ff-display", headlineCss(data.site.headlineFont));
  }, [data.site.headlineFont]);

  const savePost = useCallback((p: AdminPost) => {
    setData((d) => {
      const exists = d.posts.some((x) => x.id === p.id);
      const posts = exists ? d.posts.map((x) => (x.id === p.id ? p : x)) : [p, ...d.posts];
      return { ...d, posts };
    });
  }, []);

  const deletePost = useCallback((id: string) => {
    setData((d) => ({ ...d, posts: d.posts.filter((x) => x.id !== id) }));
  }, []);

  const commitSite = useCallback(
    (draft: Pick<AdminData, "site" | "categories" | "series">) => {
      setData((d) => ({ ...d, site: draft.site, categories: draft.categories, series: draft.series }));
    },
    [],
  );

  return { data, hydrated, savePost, deletePost, commitSite };
}
