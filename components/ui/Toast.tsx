"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

/** Transient confirmation toast (from admin-ui.jsx). */
export function Toast({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-7 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-ink px-[26px] py-[13px] font-meta text-[13px] font-semibold tracking-[0.02em] text-[var(--bg-body)] shadow-[0_6px_24px_rgba(0,0,0,0.18)]"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Small hook to drive a self-clearing toast. */
export function useToast(timeout = 2200) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback(
    (msg: string) => {
      setMessage(msg);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(""), timeout);
    },
    [timeout],
  );
  return { message, flash };
}
