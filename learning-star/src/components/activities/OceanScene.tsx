/**
 * OceanScene — Template A underwater background.
 *
 * Layers (back → front):
 *   1. Deep-to-shallow gradient
 *   2. Coral reef silhouette (bottom)
 *   3. Ambient bubble particles drifting upward
 *   4. Small fish swimming across
 */

import { motion } from "framer-motion";

// ── Fish ─────────────────────────────────────────────────────────────────────

function Fish({ y, delay, duration, flip }: {
  y: string; delay: number; duration: number; flip?: boolean;
}) {
  return (
    <motion.svg
      viewBox="0 0 40 20"
      width={28}
      height={14}
      aria-hidden
      style={{
        position: "absolute",
        top: y,
        [flip ? "right" : "left"]: "-40px",
        zIndex: 1,
        opacity: 0.18,
        transform: flip ? "scaleX(-1)" : undefined,
      }}
      animate={{
        x: flip ? [0, -(window.innerWidth + 80)] : [0, window.innerWidth + 80],
        y: [0, -8, 4, -6, 0],
      }}
      transition={{
        x: { duration, repeat: Infinity, ease: "linear", delay },
        y: { duration: duration / 3, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      <ellipse cx="18" cy="10" rx="14" ry="7" fill="white" />
      <polygon points="34,10 40,4 40,16" fill="white" />
      <circle cx="10" cy="8" r="1.5" fill="rgba(0,0,0,0.3)" />
    </motion.svg>
  );
}

// ── Bubble particle ──────────────────────────────────────────────────────────

function BubbleParticle({ x, size, delay, duration }: {
  x: string; size: number; delay: number; duration: number;
}) {
  return (
    <motion.div
      aria-hidden
      style={{
        position: "absolute",
        bottom: -10,
        left: x,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.22)",
        border: "1px solid rgba(255,255,255,0.15)",
        zIndex: 1,
        pointerEvents: "none",
      }}
      animate={{
        y: [0, -(window.innerHeight + 40)],
        x: [0, 12, -8, 10, 0],
      }}
      transition={{
        y: { duration, repeat: Infinity, ease: "linear", delay },
        x: { duration: duration / 2, repeat: Infinity, ease: "easeInOut", delay },
      }}
    />
  );
}

// ── Coral reef ───────────────────────────────────────────────────────────────

function CoralReef() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 70"
      preserveAspectRatio="none"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 65,
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.25,
      }}
    >
      {/* Coral shapes */}
      <ellipse cx="50"  cy="55" rx="30" ry="18" fill="#FEB2B2" />
      <ellipse cx="120" cy="50" rx="22" ry="22" fill="#FC8181" />
      <ellipse cx="180" cy="58" rx="26" ry="14" fill="#FEB2B2" />
      <ellipse cx="260" cy="52" rx="20" ry="20" fill="#68D391" />
      <ellipse cx="320" cy="56" rx="28" ry="16" fill="#FC8181" />
      <ellipse cx="370" cy="60" rx="18" ry="12" fill="#FEB2B2" />
      {/* Sand floor */}
      <rect x="0" y="60" width="400" height="10" fill="#F6E6C8" opacity="0.6" />
    </svg>
  );
}

// ── Main background ──────────────────────────────────────────────────────────

export function OceanScene() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: "linear-gradient(180deg, #2B6CB0 0%, #63B3ED 40%, #BEE3F8 75%, #F6E6C8 100%)",
      }}
    >
      {/* Fish */}
      <Fish y="18%" delay={0}   duration={18} />
      <Fish y="42%" delay={6}   duration={22} flip />
      <Fish y="60%" delay={12}  duration={16} />

      {/* Bubble particles */}
      <BubbleParticle x="12%" size={6}  delay={0}   duration={10} />
      <BubbleParticle x="35%" size={4}  delay={3}   duration={13} />
      <BubbleParticle x="55%" size={7}  delay={1.5} duration={11} />
      <BubbleParticle x="72%" size={5}  delay={5}   duration={14} />
      <BubbleParticle x="88%" size={6}  delay={8}   duration={9}  />

      {/* Coral */}
      <CoralReef />
    </div>
  );
}
