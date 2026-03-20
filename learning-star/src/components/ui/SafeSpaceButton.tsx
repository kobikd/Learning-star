import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SafeSpaceButtonProps {
  /** Called when the child presses the button — navigate to safe space */
  onPress: () => void;
  /** Override the fixed corner position (default: bottom-inline-end) */
  position?: "bottom-end" | "bottom-start" | "top-end" | "top-start";
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="tooltip"
          initial={{ opacity: 0, scale: 0.85, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 4 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{
            position: "absolute",
            // Tooltip floats above the button
            bottom: "calc(100% + 10px)",
            insetInlineEnd: 0,
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontSize: "var(--text-label)",
            fontWeight: "var(--font-medium)",
            fontFamily: "var(--font-primary)",
            lineHeight: 1.4,
            padding: "0.5rem 0.85rem",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-md)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            // RTL arrow pointing down-end
            borderBottom: "2px solid var(--border-default)",
          }}
        >
          ☁️ מקום שקט
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Corner position helpers ──────────────────────────────────────────────────

const POSITION_STYLES: Record<NonNullable<SafeSpaceButtonProps["position"]>, React.CSSProperties> = {
  "bottom-end":   { bottom: "1.5rem", insetInlineEnd:   "1.5rem" },
  "bottom-start": { bottom: "1.5rem", insetInlineStart: "1.5rem" },
  "top-end":      { top:    "1.5rem", insetInlineEnd:   "1.5rem" },
  "top-start":    { top:    "1.5rem", insetInlineStart: "1.5rem" },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SafeSpaceButton — the child's escape hatch when overwhelmed.
 *
 * Per CLAUDE.md autism / sensory adaptations:
 * - "Exit option: 'Break' button always available — never trap the child"
 * - Always visible, fixed corner position
 * - Cloud emoji — universally calming, no text needed
 * - Gentle pulsing so the child always knows it's there
 * - Pressing stops all activity and navigates to the safe space screen
 */
export function SafeSpaceButton({ onPress, position = "bottom-end" }: SafeSpaceButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    setPressed(true);
    // Brief visual confirmation before navigation
    setTimeout(() => {
      setPressed(false);
      onPress();
    }, 180);
  };

  return (
    <div
      style={{
        position: "fixed",
        zIndex: "var(--z-modal)",
        ...POSITION_STYLES[position],
      }}
    >
      <Tooltip visible={hovered && !pressed} />

      <motion.button
        onClick={handlePress}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        aria-label="מקום שקט — לחצי להפסקה"
        // ── Ambient pulse (very gentle, always-on) ─────────────
        animate={pressed ? { scale: 0.88 } : { scale: [1, 1.06, 1] }}
        transition={
          pressed
            ? { type: "spring", stiffness: 500, damping: 20 }
            : { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
        }
        whileHover={{ scale: 1.14 }}
        whileTap={{ scale: 0.88 }}
        style={{
          // Square 80×80 — mandatory minimum for dyspraxia
          width:  "var(--touch-preferred)",  // 80px
          height: "var(--touch-preferred)",  // 80px
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed ? "var(--color-reading-light)" : "var(--bg-surface)",
          border: `3px solid ${pressed ? "var(--color-reading)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-full)",
          boxShadow: hovered
            ? "0 6px 20px rgba(78,205,196,0.35)"
            : "var(--shadow-md)",
          cursor: "pointer",
          fontSize: "2rem",
          lineHeight: 1,
          transition: "background-color var(--duration-fast), border-color var(--duration-fast), box-shadow var(--duration-fast)",
          WebkitTapHighlightColor: "transparent",
          // Extended hit area via outline trick — helps dyspraxia
          outline: "12px solid transparent",
          outlineOffset: "0px",
        }}
      >
        ☁️
      </motion.button>
    </div>
  );
}
