import { motion } from "framer-motion";

// ─── Wave strip ───────────────────────────────────────────────────────────────

function WaveStrip({
  yFromBottom,
  opacity,
  speed,
  delay,
  color,
}: {
  yFromBottom: number;
  opacity: number;
  speed: number;
  delay: number;
  color: string;
}) {
  return (
    <motion.div
      aria-hidden
      animate={{ x: ["0%", "-50%", "0%"] }}
      transition={{ duration: speed, repeat: Infinity, ease: "easeInOut", delay }}
      style={{
        position: "absolute",
        bottom: yFromBottom,
        left: 0,
        width: "200%",        // double width so the loop is seamless
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: 56 }}
      >
        {/* Two identical wave cycles side-by-side for seamless loop */}
        <path
          d="
            M0,28 C90,8 180,48 270,28 C360,8 450,48 540,28
            C630,8 720,48 810,28 C900,8 990,48 1080,28
            C1170,8 1260,48 1350,28 C1440,8 1440,28 1440,28
            L1440,56 L0,56 Z
          "
          fill={color}
          opacity={opacity}
        />
      </svg>
    </motion.div>
  );
}

// ─── Floating treasure dot decoration ────────────────────────────────────────

function FloatDot({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <motion.div
      aria-hidden
      animate={{ y: [-4, 4, -4] }}
      transition={{ repeat: Infinity, duration: 3 + delay * 0.5, ease: "easeInOut", delay }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "rgba(255,255,255,0.45)",
        pointerEvents: "none",
      }}
    />
  );
}

const DOTS = [
  { x: "8%",  y: "20%", size: 12, delay: 0   },
  { x: "18%", y: "55%", size: 8,  delay: 1.2 },
  { x: "78%", y: "25%", size: 14, delay: 0.6 },
  { x: "88%", y: "60%", size: 9,  delay: 2.0 },
  { x: "45%", y: "15%", size: 7,  delay: 1.5 },
  { x: "62%", y: "70%", size: 11, delay: 0.3 },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * OceanBackground — tropical adventure-map ocean.
 * Layers (back → front):
 *   1. Deep gradient sky-to-ocean
 *   2. Faint grid lines (treasure-map texture)
 *   3. Three wave strips at different depths/speeds
 *   4. Small floating dots (sea sparkle)
 */
export function OceanBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        // Top: soft sky; middle: warm shallow water; bottom: turquoise shallows
        background:
          "linear-gradient(175deg, #C8E8F8 0%, #A2D5EC 20%, #7EC8D8 50%, #A8E8E0 75%, #C8F4EE 100%)",
      }}
    >
      {/* Parchment grid — treasure-map texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Wave strips (back → front) */}
      <WaveStrip yFromBottom={-8}  opacity={0.30} speed={14} delay={0}   color="#4ECDC4" />
      <WaveStrip yFromBottom={-20} opacity={0.22} speed={10} delay={3}   color="#2BA89F" />
      <WaveStrip yFromBottom={-4}  opacity={0.18} speed={18} delay={1.5} color="#89DDD6" />

      {/* Floating sparkle dots */}
      {DOTS.map((d, i) => (
        <FloatDot key={i} x={d.x} y={d.y} size={d.size} delay={d.delay} />
      ))}

      {/* Bottom fade to the app background color */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "18%",
          background: "linear-gradient(to top, rgba(240,244,255,0.55) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
