import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StarCounterProps {
  count: number;
  /** Show bonus burst animation (called on streak-of-3) */
  showBonus?: boolean;
  /** Compact mode for embedding in headers */
  compact?: boolean;
}

// ─── Individual floating star (earned animation) ──────────────────────────────

function FloatingStar({ id, onDone }: { id: number; onDone: (id: number) => void }) {
  return (
    <motion.span
      key={id}
      aria-hidden
      initial={{ opacity: 1, y: 0, scale: 0.6, x: 0 }}
      animate={{ opacity: 0, y: -60, scale: 1.4, x: (Math.random() - 0.5) * 40 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      onAnimationComplete={() => onDone(id)}
      style={{
        position: "absolute",
        pointerEvents: "none",
        fontSize: "1.5rem",
        top: 0,
        insetInlineStart: "50%",
        transform: "translateX(-50%)",
      }}
    >
      ⭐
    </motion.span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StarCounter — displays the child's accumulated stars.
 *
 * On each new star:
 *   1. The number bounces with a spring animation
 *   2. A floating ⭐ rises and fades away
 *
 * On streak bonus (showBonus=true):
 *   3. A burst of 3 stars radiates outward
 */
export function StarCounter({ count, showBonus = false, compact = false }: StarCounterProps) {
  const prevCount = useRef(count);
  const [floatingStars, setFloatingStars] = useState<number[]>([]);
  const [burst, setBurst] = useState(false);
  const nextId = useRef(0);

  // Trigger floating star when count increases
  useEffect(() => {
    if (count > prevCount.current) {
      const newId = nextId.current++;
      setFloatingStars((prev) => [...prev, newId]);
    }
    prevCount.current = count;
  }, [count]);

  // Trigger bonus burst
  useEffect(() => {
    if (showBonus) {
      setBurst(true);
      const t = setTimeout(() => setBurst(false), 800);
      return () => clearTimeout(t);
    }
  }, [showBonus]);

  const removeFloatingStar = (id: number) =>
    setFloatingStars((prev) => prev.filter((s) => s !== id));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${count} כוכבים`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? "0.35rem" : "0.5rem",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Bonus burst ring */}
      <AnimatePresence>
        {burst && (
          <motion.div
            aria-hidden
            initial={{ scale: 0.5, opacity: 0.9 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: "var(--color-stars-glow)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Star icon */}
      <motion.span
        animate={burst ? { rotate: [0, 20, -20, 0], scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.5 }}
        style={{ fontSize: compact ? "1.4rem" : "2rem", lineHeight: 1 }}
        aria-hidden
      >
        ⭐
      </motion.span>

      {/* Count — bounces on change */}
      <motion.span
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        style={{
          fontSize: compact ? "var(--text-content)" : "var(--text-instruction)",
          fontWeight: "var(--font-bold)",
          color: "var(--color-stars)",
          lineHeight: 1,
          minWidth: compact ? "1.5ch" : "2ch",
          textAlign: "center",
          // Text shadow gives a gold shimmer effect
          textShadow: "0 1px 4px rgba(180,130,0,0.4)",
        }}
      >
        {count}
      </motion.span>

      {/* Floating stars layer */}
      <AnimatePresence>
        {floatingStars.map((id) => (
          <FloatingStar key={id} id={id} onDone={removeFloatingStar} />
        ))}
      </AnimatePresence>
    </div>
  );
}
