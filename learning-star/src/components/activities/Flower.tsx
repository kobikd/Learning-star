import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// ─── Flower color palettes ────────────────────────────────────────────────────

const PALETTES = [
  { petals: "#FF9EC5", center: "#FFD700", stem: "#4CAF50" }, // pink
  { petals: "#FFB347", center: "#FFFDE7", stem: "#388E3C" }, // orange
  { petals: "#B39DDB", center: "#FFD700", stem: "#4CAF50" }, // lavender
  { petals: "#F7E05E", center: "#FF9EC5", stem: "#2E7D32" }, // yellow
  { petals: "#4DD0C4", center: "#FFFDE7", stem: "#388E3C" }, // teal
  { petals: "#EF9A9A", center: "#FFD700", stem: "#4CAF50" }, // red
  { petals: "#A5D6A7", center: "#FF9EC5", stem: "#2E7D32" }, // mint
  { petals: "#FFE082", center: "#FF6B35", stem: "#4CAF50" }, // amber
  { petals: "#80DEEA", center: "#7C6FEB", stem: "#388E3C" }, // sky
  { petals: "#F48FB1", center: "#4ECDC4", stem: "#2E7D32" }, // rose
] as const;

// ─── Petal path generator ─────────────────────────────────────────────────────

function Petal({ angle, color, counted }: { angle: number; color: string; counted: boolean }) {
  const rad = (angle * Math.PI) / 180;
  const cx  = 30 + 18 * Math.cos(rad);
  const cy  = 30 + 18 * Math.sin(rad);
  return (
    <motion.ellipse
      cx={cx} cy={cy}
      rx={10} ry={7}
      fill={color}
      transform={`rotate(${angle} ${cx} ${cy})`}
      animate={counted ? { rx: 12, ry: 9 } : { rx: 10, ry: 7 }}
      transition={{ type: "spring", stiffness: 200, damping: 16 }}
    />
  );
}

// ─── Flower SVG ───────────────────────────────────────────────────────────────

interface FlowerProps {
  index: number;
  /** Count order in which this flower was tapped (0 = not yet tapped) */
  tapOrder: number;
  /** Demo mode: show an animated ring around this flower */
  isDemo: boolean;
  onTap: (index: number) => void;
  size?: number;
}

export function Flower({ index, tapOrder, isDemo, onTap, size = 90 }: FlowerProps) {
  const [wobble, setWobble] = useState(false);
  const palette = PALETTES[index % PALETTES.length];
  const counted = tapOrder > 0;

  const handleTap = () => {
    if (counted) return; // already tapped — ignore
    setWobble(true);
    setTimeout(() => setWobble(false), 400);
    onTap(index);
  };

  return (
    <motion.div
      style={{
        position: "relative",
        width: size,
        height: size + 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: counted ? "default" : "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Demo ring indicator */}
      <AnimatePresence>
        {isDemo && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "4px solid #FFD700",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        )}
      </AnimatePresence>

      {/* Flower button area (enlarged hit target) */}
      <motion.button
        onClick={handleTap}
        aria-label={counted ? `פרח ${tapOrder} — נספר` : `לחצי לספור פרח ${index + 1}`}
        animate={wobble ? { rotate: [-10, 10, -7, 7, 0] } : { rotate: 0 }}
        transition={wobble
          ? { duration: 0.35, ease: "easeOut" }
          : { type: "spring", stiffness: 260, damping: 22 }
        }
        style={{
          background: "none",
          border: "none",
          // Extended hit area — larger padding for dyspraxia tolerance
          padding: "10px",
          margin: "-10px",
          cursor: counted ? "default" : "pointer",
          transformOrigin: "center bottom",
        }}
      >
        <svg
          viewBox="0 0 60 80"
          width={size * 0.9}
          height={(size * 0.9 * 80) / 60}
          overflow="visible"
        >
          {/* Stem */}
          <motion.line
            x1={30} y1={80} x2={30} y2={52}
            stroke={palette.stem}
            strokeWidth={4}
            strokeLinecap="round"
            animate={counted ? { strokeWidth: 5 } : { strokeWidth: 4 }}
          />
          {/* Leaves */}
          <ellipse cx={20} cy={68} rx={9} ry={5} fill={palette.stem} opacity={0.75} transform="rotate(-30 20 68)" />
          <ellipse cx={40} cy={62} rx={9} ry={5} fill={palette.stem} opacity={0.75} transform="rotate(30 40 62)" />

          {/* Petals (6 × 60°) */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <Petal key={angle} angle={angle} color={palette.petals} counted={counted} />
          ))}

          {/* Center */}
          <motion.circle
            cx={30} cy={30} r={10}
            fill={palette.center}
            stroke={palette.petals}
            strokeWidth={1.5}
            animate={counted ? { r: 12 } : { r: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
          />

          {/* Count badge on center when tapped */}
          <AnimatePresence>
            {counted && (
              <motion.text
                x={30} y={35}
                textAnchor="middle"
                fontSize={13}
                fontWeight="bold"
                fill="#2D3748"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                style={{ fontFamily: "var(--font-primary)" }}
              >
                {tapOrder}
              </motion.text>
            )}
          </AnimatePresence>

          {/* Checkmark ring when counted */}
          {counted && (
            <circle cx={30} cy={30} r={28} fill="none" stroke={palette.petals} strokeWidth={2} opacity={0.4} />
          )}
        </svg>
      </motion.button>

      {/* Floating count number above the flower */}
      <AnimatePresence>
        {wobble && tapOrder > 0 && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: -55, scale: 1.4 }}
            exit={{}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "var(--font-primary)",
              fontSize: "2rem",
              fontWeight: "bold",
              color: "var(--color-math)",
              pointerEvents: "none",
              zIndex: 10,
              textShadow: "0 2px 6px rgba(124,111,235,0.5)",
            }}
          >
            {tapOrder}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Bloom burst (correct answer → all flowers bloom) ────────────────────────

export function BloomBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      {["🌸","🌺","✨","🌼","⭐","💛","🌸","✨"].map((emoji, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: 0,
            x: Math.cos((i * 45 * Math.PI) / 180) * (60 + Math.random() * 50),
            y: Math.sin((i * 45 * Math.PI) / 180) * (60 + Math.random() * 50) - 30,
            scale: 1.8,
          }}
          transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.05 }}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            margin: "auto",
            width: "fit-content",
            height: "fit-content",
            fontSize: "1.8rem",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </>
  );
}
