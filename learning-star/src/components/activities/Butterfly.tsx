import { motion } from "framer-motion";

interface ButterflyProps {
  /** Triggers a new flight each time this increments */
  triggerCount: number;
}

/**
 * Butterfly — a colorful butterfly that flies across the screen
 * as a streak-of-3 reward animation.
 *
 * Autism: motion is smooth and predictable (one linear path, no sudden turns).
 * The butterfly disappears after crossing so there's no lingering distraction.
 */
export function Butterfly({ triggerCount }: ButterflyProps) {
  if (triggerCount === 0) return null;

  // Alternate entry direction on each trigger for variety
  const fromRight = triggerCount % 2 === 0;

  // Arc path: starts offscreen, rises gently to center, exits other side
  const startX  = fromRight ? "110vw" : "-180px";
  const endX    = fromRight ? "-180px" : "110vw";
  // Gentle sine-like vertical path via keyframes
  const yFrames = fromRight
    ? ["60vh", "40vh", "50vh", "35vh", "55vh"]
    : ["35vh", "55vh", "40vh", "60vh", "45vh"];

  return (
    <motion.div
      key={triggerCount}           // remount on each trigger
      aria-hidden
      initial={{ x: startX, y: yFrames[0], scale: 0 }}
      animate={{
        x: endX,
        y: yFrames,
        scale: [0, 1.2, 1, 1, 1, 0.8],
        rotate: [0, 8, -8, 6, -6, 0],
      }}
      transition={{
        duration: 4.5,
        ease: "easeInOut",
        times: [0, 0.08, 0.3, 0.5, 0.75, 1],
      }}
      style={{
        position: "fixed",
        zIndex: 50,
        pointerEvents: "none",
        fontSize: "4rem",
        filter: "drop-shadow(0 4px 12px rgba(255,180,0,0.5))",
      }}
    >
      🦋
    </motion.div>
  );
}

/**
 * StreakBanner — "3 ברצף! 🎉" message that fades in/out with the butterfly.
 */
export function StreakBanner({ triggerCount }: { triggerCount: number }) {
  if (triggerCount === 0) return null;

  return (
    <motion.div
      key={`banner-${triggerCount}`}
      initial={{ opacity: 0, scale: 0.7, y: -20 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.1, 1, 0.9], y: [-20, 0, 0, -10] }}
      transition={{ duration: 3.5, times: [0, 0.15, 0.75, 1] }}
      aria-live="polite"
      dir="rtl"
      lang="he"
      style={{
        position: "fixed",
        top: "18%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 51,
        backgroundColor: "#FFD700",
        color: "#2D3748",
        fontFamily: "var(--font-primary)",
        fontSize: "var(--text-instruction)",
        fontWeight: "var(--font-bold)",
        padding: "0.75rem 2rem",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 8px 32px rgba(255,215,0,0.55)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        lineHeight: 1.4,
      }}
    >
      🎉 !שלוש ברצף — מדהים
    </motion.div>
  );
}
