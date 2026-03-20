import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { ButtonVariant } from "./BigButton";

// ─── Types ───────────────────────────────────────────────────────────────────

type CardVariant = ButtonVariant | "default";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  /** Make the card clickable (e.g. world-map island) */
  onClick?: () => void;
  /** Hebrew aria-label, required when onClick is provided */
  ariaLabel?: string;
  className?: string;
  /** Highlight left (end in RTL = visual left) border accent */
  accent?: boolean;
  /** Remove default padding */
  noPadding?: boolean;
}

// ─── Color map ────────────────────────────────────────────────────────────────

const ACCENT_COLORS: Record<CardVariant, string> = {
  math:    "var(--color-math)",
  reading: "var(--color-reading)",
  games:   "var(--color-games)",
  success: "var(--color-success)",
  neutral: "var(--border-default)",
  default: "var(--border-default)",
};

const LIGHT_COLORS: Record<CardVariant, string> = {
  math:    "var(--color-math-light)",
  reading: "var(--color-reading-light)",
  games:   "var(--color-games-light)",
  success: "var(--color-success-light)",
  neutral: "var(--bg-secondary)",
  default: "var(--bg-surface)",
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Card — container for activity tiles, info panels, etc.
 * When onClick is provided it becomes an interactive tile with hover/tap animation.
 */
export function Card({
  children,
  variant = "default",
  onClick,
  ariaLabel,
  className = "",
  accent = false,
  noPadding = false,
}: CardProps) {
  const isInteractive = Boolean(onClick);

  return (
    <motion.div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={isInteractive ? (e) => (e.key === "Enter" || e.key === " ") && onClick?.() : undefined}
      // ── Animations (only for interactive cards) ────────────
      whileHover={isInteractive ? { y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } : {}}
      whileTap={isInteractive ? { scale: 0.97 } : {}}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      style={{
        backgroundColor: LIGHT_COLORS[variant],
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
        padding: noPadding ? 0 : "1.5rem",
        // RTL-safe accent border on the end side (visual left in Hebrew)
        borderInlineEnd: accent ? `4px solid ${ACCENT_COLORS[variant]}` : "none",
        cursor: isInteractive ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
      }}
      className={className}
    >
      {/* Decorative top accent line for colored variants */}
      {variant !== "default" && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            insetInlineStart: 0,
            insetInlineEnd: 0,
            top: 0,
            height: "4px",
            backgroundColor: ACCENT_COLORS[variant],
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
