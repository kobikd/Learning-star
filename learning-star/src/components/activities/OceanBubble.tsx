/**
 * OceanBubble — Template A translucent water bubble.
 *
 * Variants:
 *   operand  — shows a number in the equation (100px, non-interactive)
 *   answer   — tappable answer choice (90px)
 *   question — the "?" slot, jellyfish pulse (100px)
 */

import { motion } from "framer-motion";

type BubbleVariant = "operand" | "answer" | "question";

interface OceanBubbleProps {
  value: number | string;
  variant: BubbleVariant;
  highlighted?: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  floatDelay?: number;
}

const BUBBLE_GRADIENT =
  "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5) 0%, rgba(200,230,255,0.25) 40%, rgba(150,200,240,0.15) 100%)";

export function OceanBubble({
  value,
  variant,
  highlighted = false,
  dimmed = false,
  disabled = false,
  onClick,
  floatDelay = 0,
}: OceanBubbleProps) {
  const size = variant === "answer" ? 90 : 100;
  const isInteractive = variant === "answer" && !disabled;

  const borderColor = highlighted
    ? "#6BCB77"
    : "rgba(255,255,255,0.5)";

  const boxShadow = highlighted
    ? "inset 0 -4px 8px rgba(0,0,0,0.06), 0 0 20px rgba(107,203,119,0.4)"
    : "inset 0 -4px 8px rgba(0,0,0,0.06), 0 4px 12px rgba(43,108,176,0.15)";

  return (
    <motion.button
      onClick={isInteractive ? onClick : undefined}
      disabled={!isInteractive}
      whileTap={isInteractive ? { scale: 0.92 } : undefined}
      whileHover={isInteractive ? { scale: 1.06 } : undefined}
      animate={
        variant === "question"
          ? { scale: [1, 1.05, 1] }
          : { y: [-4, 4, -4] }
      }
      transition={
        variant === "question"
          ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
          : { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: floatDelay }
      }
      aria-label={`${variant === "question" ? "?" : value}`}
      style={{
        position: "relative",
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: "50%",
        background: BUBBLE_GRADIENT,
        border: `2px solid ${borderColor}`,
        boxShadow,
        cursor: isInteractive ? "pointer" : "default",
        opacity: dimmed ? 0.4 : 1,
        filter: dimmed ? "grayscale(0.3)" : "none",
        transition: "opacity 0.3s ease, filter 0.3s ease, border-color 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
        padding: 0,
        outline: "none",
      }}
    >
      {/* Sheen highlight (top-left) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "12%",
          left: "18%",
          width: "30%",
          height: "20%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.6)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />

      {/* Number */}
      <span
        style={{
          position: "relative",
          zIndex: 2,
          fontFamily: "var(--font-primary)",
          fontSize: "var(--text-number, 48px)",
          fontWeight: "var(--font-bold, 700)",
          color: "#2B6CB0",
          textShadow: "0 1px 2px rgba(255,255,255,0.5)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
    </motion.button>
  );
}

// ── Splash burst (on correct) ────────────────────────────────────────────────

export function SplashBurst({ active }: { active: boolean }) {
  if (!active) return null;

  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 60;
    const y = Math.sin(angle) * 60;
    return { x, y, delay: i * 0.03 };
  });

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      {/* Expanding ring */}
      <motion.div
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.5)",
        }}
      />
      {/* Sparkle particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: i % 2 === 0 ? "#6BCB77" : "#63B3ED",
          }}
        />
      ))}
    </div>
  );
}
