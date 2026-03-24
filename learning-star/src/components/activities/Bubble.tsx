import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BubbleVariant = "operand" | "answer" | "question";

interface BubbleProps {
  value: number;
  variant: BubbleVariant;
  size?: number;
  showDots?: boolean;
  /** How many dots to reveal (for demo animation, 0 = none) */
  dotCount?: number;
  highlighted?: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  popped?: boolean;
  onClick?: () => void;
  /** Float delay offset in seconds (stagger floating bubbles) */
  floatDelay?: number;
}

// ─── Dot layouts (like dice faces) ────────────────────────────────────────────

function getDotPositions(count: number): { x: number; y: number }[] {
  // Positions as % offsets from center (-35 to +35 range)
  const layouts: Record<number, { x: number; y: number }[]> = {
    1: [{ x: 0, y: 0 }],
    2: [{ x: -14, y: 0 }, { x: 14, y: 0 }],
    3: [{ x: -14, y: -12 }, { x: 14, y: -12 }, { x: 0, y: 12 }],
    4: [{ x: -14, y: -14 }, { x: 14, y: -14 }, { x: -14, y: 14 }, { x: 14, y: 14 }],
    5: [{ x: -14, y: -14 }, { x: 14, y: -14 }, { x: 0, y: 0 }, { x: -14, y: 14 }, { x: 14, y: 14 }],
    6: [{ x: -14, y: -16 }, { x: 14, y: -16 }, { x: -14, y: 0 }, { x: 14, y: 0 }, { x: -14, y: 16 }, { x: 14, y: 16 }],
    7: [{ x: -14, y: -16 }, { x: 14, y: -16 }, { x: -14, y: 0 }, { x: 0, y: 0 }, { x: 14, y: 0 }, { x: -14, y: 16 }, { x: 14, y: 16 }],
    8: [{ x: -18, y: -16 }, { x: 0, y: -16 }, { x: 18, y: -16 }, { x: -18, y: 0 }, { x: 18, y: 0 }, { x: -18, y: 16 }, { x: 0, y: 16 }, { x: 18, y: 16 }],
    9: [{ x: -18, y: -16 }, { x: 0, y: -16 }, { x: 18, y: -16 }, { x: -18, y: 0 }, { x: 0, y: 0 }, { x: 18, y: 0 }, { x: -18, y: 16 }, { x: 0, y: 16 }, { x: 18, y: 16 }],
  };
  return layouts[count] ?? layouts[Math.min(count, 9)] ?? [];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Bubble({
  value,
  variant,
  size = 80,
  showDots = false,
  dotCount = 0,
  highlighted = false,
  dimmed = false,
  disabled = false,
  popped = false,
  onClick,
  floatDelay = 0,
}: BubbleProps) {
  const isClickable = variant === "answer" && !disabled && !dimmed && !popped;
  const dotRadius   = Math.max(4, size * 0.05);
  const allDots     = getDotPositions(value);
  const visibleDots = dotCount > 0 ? allDots.slice(0, Math.min(dotCount, allDots.length)) : allDots;

  return (
    <motion.button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      aria-label={variant === "question" ? "סִימַן שְׁאֵלָה" : `מִסְפָּר ${value}`}
      role={variant === "answer" ? "button" : "presentation"}
      tabIndex={isClickable ? 0 : -1}

      /* Floating animation */
      animate={popped
        ? { scale: [1, 1.3, 0], opacity: [1, 1, 0] }
        : { y: [0, -6, 0] }
      }
      transition={popped
        ? { duration: 0.5, ease: "easeOut" }
        : { duration: 3, repeat: Infinity, ease: "easeInOut", delay: floatDelay }
      }

      whileHover={isClickable ? { scale: 1.08 } : undefined}
      whileTap={isClickable ? { scale: 0.94 } : undefined}

      style={{
        /* Size */
        width: size,
        height: size,
        minWidth: "var(--touch-preferred, 80px)",
        minHeight: "var(--touch-preferred, 80px)",
        padding: 0,

        /* Shape */
        borderRadius: "50%",
        border: variant === "question"
          ? "3px dashed var(--color-math, #7C6FEB)"
          : highlighted
            ? "3px solid var(--color-stars, #FFD700)"
            : variant === "answer"
              ? "3px solid var(--color-math, #7C6FEB)"
              : "3px solid transparent",

        /* Colors */
        background: variant === "operand"
          ? "linear-gradient(135deg, #A594F9, #7C6FEB)"
          : variant === "question"
            ? "rgba(124, 111, 235, 0.1)"
            : highlighted
              ? "var(--color-highlight, #FFD54F)"
              : "rgba(255, 255, 255, 0.92)",

        /* Text */
        fontFamily: "var(--font-primary, 'Assistant', sans-serif)",
        fontSize: variant === "operand" ? "var(--text-number, 48px)" : "var(--text-instruction, 28px)",
        fontWeight: "var(--font-bold, 700)",
        color: variant === "operand" ? "white" : "var(--text-primary, #2D3748)",

        /* Interaction */
        cursor: isClickable ? "pointer" : "default",
        touchAction: "manipulation",
        userSelect: "none" as const,
        WebkitTapHighlightColor: "transparent",

        /* Layout */
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",

        /* Effects */
        opacity: dimmed ? 0.35 : 1,
        boxShadow: highlighted
          ? "0 0 20px rgba(255, 215, 0, 0.5)"
          : variant === "operand"
            ? "0 4px 16px rgba(124, 111, 235, 0.3)"
            : "var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.08))",
        transition: "opacity 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Number or question mark */}
      {!showDots && (
        <span style={{ position: "relative", zIndex: 2, lineHeight: 1, pointerEvents: "none" }}>
          {variant === "question" ? "?" : value}
        </span>
      )}

      {/* Dots (CRA concrete mode) */}
      {showDots && (
        <svg
          viewBox="-40 -30 80 60"
          width={size * 0.75}
          height={size * 0.6}
          style={{ position: "absolute", zIndex: 2, pointerEvents: "none" }}
        >
          {visibleDots.map((pos, i) => (
            <motion.circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={dotRadius}
              fill={variant === "operand" ? "white" : "var(--color-math, #7C6FEB)"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.08 }}
            />
          ))}
        </svg>
      )}

      {/* Highlight ring */}
      {highlighted && !popped && (
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: "absolute", inset: -4,
            borderRadius: "50%",
            border: "3px solid var(--color-stars, #FFD700)",
            pointerEvents: "none",
          }}
        />
      )}
    </motion.button>
  );
}

// ─── Merge burst (particles on correct answer) ───────────────────────────────

export function BubbleBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const rad   = (angle * Math.PI) / 180;
    return { x: Math.cos(rad) * 60, y: Math.sin(rad) * 60, color: i % 2 === 0 ? "#7C6FEB" : "#FFD700" };
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30 }}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 10, height: 10,
            borderRadius: "50%",
            background: p.color,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
