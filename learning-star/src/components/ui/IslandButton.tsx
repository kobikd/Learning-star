import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type IslandSubject = "math" | "addition" | "reading";

interface IslandButtonProps {
  subject: IslandSubject;
  /** Hebrew name with nikud */
  name: string;
  /** Large decorative emoji shown on the island */
  icon: string;
  /** Number of available activities */
  activityCount: number;
  /** Glow/badge on the recommended island */
  recommended?: boolean;
  /** Disabled while a session is loading */
  disabled?: boolean;
  onClick: () => void;
}

// ─── Theme per subject ────────────────────────────────────────────────────────

const THEME = {
  math: {
    bg:         "#7C6FEB",
    bgLight:    "#EDE9FF",
    bgDark:     "#5A4DC8",
    shadow:     "0 12px 36px rgba(124,111,235,0.45)",
    shadowHover:"0 20px 48px rgba(124,111,235,0.55)",
    glow:       "0 0 0 6px rgba(124,111,235,0.20)",
    sandTop:    "#E8D5A3",
    sandBot:    "#D4B87A",
    treeTrunk:  "#8B6340",
  },
  addition: {
    bg:         "#FF8C69",
    bgLight:    "#FFF0E8",
    bgDark:     "#E06B48",
    shadow:     "0 12px 36px rgba(255,140,105,0.45)",
    shadowHover:"0 20px 48px rgba(255,140,105,0.55)",
    glow:       "0 0 0 6px rgba(255,140,105,0.20)",
    sandTop:    "#E8D5A3",
    sandBot:    "#D4B87A",
    treeTrunk:  "#8B6340",
  },
  reading: {
    bg:         "#4ECDC4",
    bgLight:    "#E0F7F6",
    bgDark:     "#2FA89F",
    shadow:     "0 12px 36px rgba(78,205,196,0.45)",
    shadowHover:"0 20px 48px rgba(78,205,196,0.55)",
    glow:       "0 0 0 6px rgba(78,205,196,0.20)",
    sandTop:    "#E8D5A3",
    sandBot:    "#D4B87A",
    treeTrunk:  "#8B6340",
  },
} as const;

// Organic blob shapes — two keyframe states for gentle morphing
const BLOB_A = "58% 42% 46% 54% / 52% 48% 58% 42%";
const BLOB_B = "42% 58% 54% 46% / 48% 52% 42% 58%";

// ─── Mini palm tree (SVG) ─────────────────────────────────────────────────────

function PalmTree({ x, flip = false, color }: { x: number; flip?: boolean; color: string }) {
  return (
    <g transform={`translate(${x}, 0) scale(${flip ? -1 : 1}, 1)`}>
      {/* Trunk */}
      <path d="M0,0 Q3,-20 6,-40" stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M6,-40 Q-8,-52 -14,-44" stroke="#4CAF50" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M6,-40 Q18,-54 20,-46" stroke="#4CAF50" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M6,-40 Q2,-56 8,-58" stroke="#66BB6A" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* Coconut */}
      <circle cx={6} cy={-37} r={3} fill="#8B6340" />
    </g>
  );
}

// ─── Recommended badge ────────────────────────────────────────────────────────

function RecommendedBadge() {
  return (
    <motion.div
      animate={{ y: [-3, 3, -3] }}
      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      style={{
        position: "absolute",
        top: -18,
        insetInlineStart: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#FFD700",
        color: "#2D3748",
        fontSize: "0.7rem",
        fontWeight: 700,
        fontFamily: "var(--font-primary)",
        padding: "3px 10px",
        borderRadius: "var(--radius-full)",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        zIndex: 2,
        direction: "rtl",
      }}
    >
      ✨ מומלץ עכשיו
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * IslandButton — a large adventure-map island the child taps to enter a subject.
 *
 * Dyspraxia / accessibility:
 * - 220×220 px minimum touch target
 * - Organic floating motion signals "tappable" without text instructions
 * - Press animation is immediate spring (no lag)
 *
 * Autism:
 * - Float animation is slow (3–4s cycle), never jarring
 * - Recommended badge bobs gently — no flash or rapid blinking
 */
export function IslandButton({
  subject,
  name,
  icon,
  activityCount,
  recommended = false,
  disabled = false,
  onClick,
}: IslandButtonProps) {
  const t = THEME[subject];
  const floatControls = useAnimationControls();

  // Start idle float
  useEffect(() => {
    floatControls.start({
      y: [0, -12, 0],
      transition: {
        repeat: Infinity,
        duration: subject === "math" ? 3.2 : subject === "addition" ? 3.6 : 4.0,
        ease: "easeInOut",
      },
    });
  }, [floatControls, subject]);

  const handlePress = () => {
    if (disabled) return;
    onClick();
  };

  return (
    <motion.div style={{ position: "relative" }}>
      {recommended && <RecommendedBadge />}

      {/* Float wrapper */}
      <motion.div animate={floatControls}>
        {/* Press wrapper */}
        <motion.button
          onClick={handlePress}
          aria-label={`${name} — ${activityCount} פעילויות`}
          aria-disabled={disabled}
          whileTap={disabled ? {} : { scale: 0.91 }}
          whileHover={disabled ? {} : {
            scale: 1.05,
            boxShadow: t.shadowHover,
            transition: { type: "spring", stiffness: 340, damping: 22 },
          }}
          transition={{ type: "spring", stiffness: 440, damping: 22 }}
          style={{
            // ── Size — large enough for dyspraxia ───────────────
            width: 220,
            height: 220,
            minWidth: 220,
            minHeight: 220,
            padding: 0,
            // ── Organic blob shape ───────────────────────────────
            borderRadius: BLOB_A,
            // Animate between two blob shapes
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: disabled ? "var(--border-default)" : t.bg,
            boxShadow: `${t.shadow}${recommended ? `, ${t.glow}` : ""}`,
            opacity: disabled ? 0.6 : 1,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Blob morph animation via keyframes on borderRadius */}
          <motion.div
            aria-hidden
            animate={{ borderRadius: [BLOB_A, BLOB_B, BLOB_A] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: t.bgDark,
              opacity: 0.18,
            }}
          />

          {/* Sandy island ground at bottom of the blob */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "42%",
              background: `linear-gradient(to top, ${t.sandBot}, ${t.sandTop})`,
              borderRadius: "0 0 60% 60%",
              opacity: 0.55,
            }}
          />

          {/* Palm trees (SVG) */}
          <svg
            aria-hidden
            viewBox="-20 -60 180 65"
            width={140}
            height={55}
            style={{ position: "absolute", bottom: "38%", left: 0, right: 0, margin: "0 auto" }}
            overflow="visible"
          >
            <PalmTree x={25}  flip={false} color={t.treeTrunk} />
            <PalmTree x={115} flip={true}  color={t.treeTrunk} />
          </svg>

          {/* Subject icon */}
          <motion.span
            aria-hidden
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            style={{
              fontSize: "3.5rem",
              lineHeight: 1,
              position: "relative",
              zIndex: 1,
              filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.20))",
            }}
          >
            {icon}
          </motion.span>

          {/* Island name */}
          <span
            dir="rtl"
            lang="he"
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-content)",
              fontWeight: "var(--font-bold)",
              color: "white",
              lineHeight: 1.4,
              position: "relative",
              zIndex: 1,
              textShadow: "0 2px 6px rgba(0,0,0,0.30)",
              textAlign: "center",
              padding: "0 1rem",
            }}
          >
            {name}
          </span>

          {/* Activity count badge */}
          <span
            style={{
              position: "relative",
              zIndex: 1,
              backgroundColor: "rgba(255,255,255,0.30)",
              color: "white",
              fontSize: "var(--text-label)",
              fontFamily: "var(--font-primary)",
              fontWeight: "var(--font-semibold)",
              padding: "2px 12px",
              borderRadius: "var(--radius-full)",
              direction: "rtl",
            }}
          >
            {activityCount} פעילויות
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
