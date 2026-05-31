"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createElement, type ReactNode } from "react";

/**
 * Motion vocabulary for the PUBLIC site — elegant, layered, consistent.
 * One easing throughout. Blocks fade + rise + un-blur; headlines rise
 * word-by-word from a mask; featured images wipe + settle from a scale.
 * Above-the-fold elements animate on load; the rest on scroll. Honors
 * prefers-reduced-motion. Not used in the admin area.
 *
 * All animations use the whileInView-target pattern (reliable on first
 * paint) rather than variant-label propagation.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const DISTANCE = 26;

type BlockTag = "div" | "article" | "section";

/** A block that fades, rises, and un-blurs into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: BlockTag;
}) {
  const reduce = useReducedMotion();
  if (reduce) return createElement(as, { className }, children);
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: DISTANCE, filter: "blur(7px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

type TextTag = "h1" | "h2" | "h3" | "p" | "span";

/**
 * Headline reveal: each word rises from behind a mask, lightly staggered.
 * Renders the real text for screen readers + no-JS, with per-word spans
 * marked aria-hidden.
 */
export function RevealText({
  text,
  className,
  as = "span",
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  as?: TextTag;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce || !text) return createElement(as, { className }, text);
  const words = text.split(" ");
  // Animate on mount (not on intersection): a masked word can't reliably
  // trigger its own whileInView, and headlines must always become visible.
  return createElement(
    as,
    { className, "aria-label": text },
    words.map((word, i) => (
      <span
        key={i}
        aria-hidden
        className="inline-block overflow-hidden align-top"
        style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}
      >
        <motion.span
          className="inline-block will-change-transform"
          initial={{ y: "115%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.85, delay: delay + i * stagger, ease: EASE }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      </span>
    )),
  );
}

/**
 * Featured-image reveal: fades + rises, with the image settling from a slight
 * zoom inside a clipped frame. (Avoids animating clip-path, which framer can
 * mis-interpolate.)
 */
export function RevealImage({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: DISTANCE, filter: "blur(7px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Plain passthrough container for a staggered list (cascade lives on the items). */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

/** A single staggered child; `index` drives its delay within the list. */
export function StaggerItem({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: DISTANCE, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.08, 0.5), ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
