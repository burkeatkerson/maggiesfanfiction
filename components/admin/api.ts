"use client";

import type { Category, Post, Series, SiteSettings, UploadBucket } from "@/lib/types";

/**
 * Thin client for the app's API routes. Unwraps the { data } / { error }
 * envelope and throws on error (with the server message). Cookies (the
 * Supabase session) are sent automatically same-origin.
 */
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || res.statusText || "Request failed");
  }
  return json.data as T;
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

export const api = {
  posts: {
    list: (status?: "draft" | "published") =>
      req<Post[]>(`/api/posts?limit=500${status ? `&status=${status}` : ""}`),
    get: (id: string) => req<Post>(`/api/posts/${id}`),
    create: (body: Record<string, unknown>) => req<Post>("/api/posts", jsonInit("POST", body)),
    update: (id: string, body: Record<string, unknown>) =>
      req<Post>(`/api/posts/${id}`, jsonInit("PATCH", body)),
    remove: (id: string) => req<{ id: string }>(`/api/posts/${id}`, { method: "DELETE" }),
  },
  categories: {
    list: () => req<Category[]>("/api/categories"),
    create: (body: Record<string, unknown>) => req<Category>("/api/categories", jsonInit("POST", body)),
    update: (id: string, body: Record<string, unknown>) =>
      req<Category>(`/api/categories/${id}`, jsonInit("PATCH", body)),
    remove: (id: string) => req<{ id: string }>(`/api/categories/${id}`, { method: "DELETE" }),
  },
  series: {
    list: () => req<(Series & { parts: number })[]>("/api/series"),
    create: (body: Record<string, unknown>) => req<Series>("/api/series", jsonInit("POST", body)),
    update: (id: string, body: Record<string, unknown>) =>
      req<Series>(`/api/series/${id}`, jsonInit("PATCH", body)),
    remove: (id: string) => req<{ id: string }>(`/api/series/${id}`, { method: "DELETE" }),
  },
  site: {
    get: () => req<SiteSettings>("/api/site-settings"),
    update: (body: Record<string, unknown>) => req<SiteSettings>("/api/site-settings", jsonInit("PATCH", body)),
  },
  upload: async (file: File, bucket: UploadBucket) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", bucket);
    return req<{ url: string }>("/api/upload", { method: "POST", body: fd });
  },
  auth: {
    login: (email: string, password: string) =>
      req<{ user: { id: string; email: string } }>("/api/auth/login", jsonInit("POST", { email, password })),
    logout: () => req<{ signedOut: boolean }>("/api/auth/logout", { method: "POST" }),
  },
};
