import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ButtonVariant = "math" | "reading" | "games" | "success" | "neutral";

interface BigButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Hebrew aria-label for screen readers */
  ariaLabel?: string;
  className?: string;
  /** Full-width block button */
  block?: boolean;
}

// ─── Style map (CSS variables from globals.css) ───────────────────────────────

const VARIANTS: Record<ButtonVariant, { bg: string; active: string; text: string; shadow: string }> = {
  math:    { bg: "var(--color-math)",    active: "var(--color-math-dark)",    text: "#FFFFFF", shadow: "0 4px 16px rgba(124,111,235,0.4)" },
  reading: { bg: "var(--color-reading)", active: "var(--color-reading-dark)", text: "#FFFFFF", shadow: "0 4px 16px rgba(78,205,196,0.4)" },
  games:   { bg: "var(--color-games)",   active: "var(--color-games-dark)",   text: "#FFFFFF", shadow: "0 4px 16px rgba(255,179,71,0.4)" },
  success: { bg: "var(--color-success)", active: "#4CAF57",                   text: "#FFFFFF", shadow: "0 4px 16px rgba(107,203,119,0.4)" },
  neutral: { bg: "var(--bg-secondary)",  active: "#EDE8F5",                   text: "var(--text-primary)", shadow: "var(--shadow-sm)" },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BigButton — primary interactive element throughout the app.
 *
 * Dyspraxia adaptations:
 * - Min 80×80 px touch target (preferred per CLAUDE.md spec)
 * - 20px+ padding so off-center taps still register
 * - Spring press animation gives tactile feedback without jarring motion
 * - disabled state visually clear but never punitive
 */
export function BigButton({
  children,
  onClick,
  variant = "neutral",
  disabled = false,
  ariaLabel,
  className = "",
  block = false,
}: BigButtonProps) {
  const v = VARIANTS[variant];

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      // ── Dyspraxia press animation ──────────────────────────
      whileTap={disabled ? {} : { scale: 0.93 }}
      whileHover={disabled ? {} : { scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      // ── Styles ─────────────────────────────────────────────
      style={{
        // Enforce 80px minimum on both axes
        minHeight: "var(--touch-preferred)",   // 80px
        minWidth:  "var(--touch-preferred)",   // 80px
        padding: "1.25rem 2rem",               // 20px 32px
        backgroundColor: disabled ? "var(--border-default)" : v.bg,
        color: disabled ? "var(--text-secondary)" : v.text,
        boxShadow: disabled ? "none" : v.shadow,
        borderRadius: "var(--radius-md)",
        border: "none",
        fontFamily: "var(--font-primary)",
        fontSize: "var(--text-button)",
        fontWeight: "var(--font-semibold)",
        lineHeight: "var(--leading-button)",
        letterSpacing: "var(--tracking-wide)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: block ? "flex" : "inline-flex",
        width: block ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        // Smooth color transition on hover (not scale — handled by Framer)
        transition: "background-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)",
        opacity: disabled ? 0.55 : 1,
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
