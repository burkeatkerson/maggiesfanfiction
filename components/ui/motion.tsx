"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createElement, type ReactNode } from "react";

/**
 * Shared motion vocabulary for the PUBLIC site — one easing, one feel.
 * Everything is a gentle fade + rise. Above-the-fold elements animate on
 * load (they're already in view); the rest animate as they scroll in.
 * Honors prefers-reduced-motion by rendering statically.
 *
 * Not used in the admin area.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const DISTANCE = 16;

/** A single element that fades + rises into view (load or scroll). */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "article" | "section";
}) {
  const reduce = useReducedMotion();
  if (reduce) return createElement(as, { className }, children);
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: DISTANCE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/**
 * Plain passthrough container for a staggered list. The cascade comes from
 * each <StaggerItem> revealing itself with an index-based delay — the same
 * robust whileInView-target pattern as <Reveal> (variant-label propagation
 * proved unreliable on first paint).
 */
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
      initial={{ opacity: 0, y: DISTANCE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.42), ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
