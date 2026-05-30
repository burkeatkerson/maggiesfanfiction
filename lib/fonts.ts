/**
 * Single source of truth for fonts, ported from the prototype
 * (admin-data.js HEADLINE_FONTS and admin-richtext.jsx EDITOR_FONTS).
 *
 * - Headline fonts: site-wide, chosen in Site Details (3 options).
 * - Body fonts: per-post, chosen in the editor (12 options).
 *
 * Shared by API validation now and the ported UI later.
 */

export interface FontDef {
  name: string;
  css: string;
}

export const HEADLINE_FONTS: FontDef[] = [
  { name: "EB Garamond", css: "'EB Garamond', Georgia, serif" },
  { name: "Playfair Display", css: "'Playfair Display', Georgia, serif" },
  { name: "Cormorant Garamond", css: "'Cormorant Garamond', Georgia, serif" },
];

export const BODY_FONTS: FontDef[] = [
  { name: "EB Garamond", css: "'EB Garamond', Georgia, serif" },
  { name: "Lora", css: "'Lora', Georgia, serif" },
  { name: "Cormorant Garamond", css: "'Cormorant Garamond', Georgia, serif" },
  { name: "Crimson Text", css: "'Crimson Text', Georgia, serif" },
  { name: "Playfair Display", css: "'Playfair Display', Georgia, serif" },
  { name: "Merriweather", css: "'Merriweather', Georgia, serif" },
  { name: "Libre Baskerville", css: "'Libre Baskerville', Georgia, serif" },
  { name: "Spectral", css: "'Spectral', Georgia, serif" },
  { name: "Source Serif 4", css: "'Source Serif 4', Georgia, serif" },
  { name: "Inter", css: "'Inter', system-ui, sans-serif" },
  { name: "Work Sans", css: "'Work Sans', system-ui, sans-serif" },
  { name: "Special Elite", css: "'Special Elite', 'Courier New', monospace" },
];

export const HEADLINE_FONT_NAMES = HEADLINE_FONTS.map((f) => f.name);
export const BODY_FONT_NAMES = BODY_FONTS.map((f) => f.name);

export const DEFAULT_HEADLINE_FONT = "EB Garamond";
export const DEFAULT_BODY_FONT = "Crimson Text";

/** CSS font stack for a headline font name (falls back to the default). */
export function headlineCss(name: string): string {
  return (HEADLINE_FONTS.find((f) => f.name === name) ?? HEADLINE_FONTS[0]).css;
}

/** CSS font stack for a body font name (falls back to Crimson Text). */
export function bodyCss(name: string): string {
  return (BODY_FONTS.find((f) => f.name === name) ?? BODY_FONTS[3]).css;
}
