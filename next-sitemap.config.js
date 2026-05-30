/* ============================================================
 * next-sitemap configuration — STUB (SEO phase).
 *
 * Intentionally inert during the backend pass. The `next-sitemap`
 * package is NOT installed yet; when the frontend/SEO phase begins,
 * `npm i -D next-sitemap` and add a "postbuild": "next-sitemap" script.
 * Values here are placeholders so wiring is a drop-in later.
 * ============================================================ */
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  exclude: ["/admin", "/admin/*", "/api/*"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/api"] },
    ],
  },
};
