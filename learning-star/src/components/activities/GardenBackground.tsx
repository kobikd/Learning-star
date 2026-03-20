import { motion } from "framer-motion";

// ─── Drifting cloud ───────────────────────────────────────────────────────────

function Cloud({ top, startX, speed, scale, delay }: {
  top: string; startX: string; speed: number; scale: number; delay: number;
}) {
  return (
    <motion.div
      aria-hidden
      initial={{ x: startX }}
      animate={{ x: startX.startsWith("-") ? "110vw" : "-260px" }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear", delay }}
      style={{ position: "absolute", top, pointerEvents: "none" }}
    >
      <svg viewBox="0 0 160 64" width={160 * scale} height={64 * scale}>
        <ellipse cx="80"  cy="46" rx="68" ry="22" fill="white" opacity={0.90} />
        <ellipse cx="52"  cy="38" rx="34" ry="28" fill="white" opacity={0.90} />
        <ellipse cx="106" cy="36" rx="38" ry="30" fill="white" opacity={0.90} />
      </svg>
    </motion.div>
  );
}

// ─── Sun ─────────────────────────────────────────────────────────────────────

function Sun() {
  return (
    <motion.div
      aria-hidden
      animate={{ scale: [1, 1.04, 1] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      style={{ position: "absolute", top: "6%", insetInlineStart: "5%", zIndex: 1 }}
    >
      <svg viewBox="0 0 90 90" width={90} height={90}>
        {/* Glow */}
        <circle cx="45" cy="45" r="40" fill="#FFD70030" />
        {/* Rays */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={45 + 26 * Math.cos(angle)} y1={45 + 26 * Math.sin(angle)}
              x2={45 + 38 * Math.cos(angle)} y2={45 + 38 * Math.sin(angle)}
              stroke="#FFD700" strokeWidth={3.5} strokeLinecap="round"
            />
          );
        })}
        {/* Body */}
        <circle cx="45" cy="45" r="22" fill="#FFD700" />
        {/* Face */}
        <ellipse cx="38" cy="42" rx="3" ry="3.5" fill="#F5A000" />
        <ellipse cx="52" cy="42" rx="3" ry="3.5" fill="#F5A000" />
        <path d="M38,52 Q45,58 52,52" stroke="#F5A000" strokeWidth={2} fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

// ─── Butterflies in the distance (decorative, not the streak reward) ──────────

function TinyButterfly({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      aria-hidden
      animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
      transition={{ repeat: Infinity, duration: 3 + delay, ease: "easeInOut", delay }}
      style={{ position: "absolute", left: x, top: y, fontSize: "1rem", opacity: 0.45, pointerEvents: "none" }}
    >
      🦋
    </motion.div>
  );
}

// ─── GardenBackground ─────────────────────────────────────────────────────────

/**
 * Layered garden background:
 *   Sky (gradient) → Sun → Clouds → Horizon hill → Ground
 */
export function GardenBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        // Sky to ground gradient
        background:
          "linear-gradient(180deg," +
          "#87CEEB 0%, #B8E4F7 28%," +    // sky
          "#C8EFC0 52%," +                  // horizon
          "#5DB84A 68%, #3E8A2D 100%)",     // ground
      }}
    >
      <Sun />

      {/* Clouds */}
      <Cloud top="8%"  startX="110vw"  speed={55} scale={1.0} delay={0}  />
      <Cloud top="14%" startX="-240px" speed={70} scale={0.7} delay={25} />
      <Cloud top="5%"  startX="75vw"   speed={80} scale={0.85} delay={40} />

      {/* Decorative distant butterflies */}
      <TinyButterfly x="15%"  y="38%" delay={0}   />
      <TinyButterfly x="72%"  y="32%" delay={1.4} />
      <TinyButterfly x="88%"  y="40%" delay={0.7} />

      {/* Horizon grass strip */}
      <div style={{
        position: "absolute",
        top: "55%",
        left: 0,
        right: 0,
        height: "14%",
        background: "linear-gradient(to bottom, #7DC96A 0%, #5DB84A 100%)",
        borderRadius: "60% 60% 0 0 / 20% 20% 0 0",
      }} />

      {/* Flowers in the distance (non-interactive) */}
      {["12%","25%","55%","68%","80%","90%"].map((x, i) => (
        <motion.div
          key={i}
          aria-hidden
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: "easeInOut", delay: i * 0.2 }}
          style={{
            position: "absolute",
            left: x,
            top: "54%",
            fontSize: "1.4rem",
            opacity: 0.55,
            transformOrigin: "bottom center",
          }}
        >
          {["🌷","🌻","🌹","🌼","🌸","💐"][i]}
        </motion.div>
      ))}

      {/* Ground floor panel */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "38%",
        background: "linear-gradient(to top, #2E5E1E 0%, #4A8A30 60%, transparent 100%)",
      }} />
    </div>
  );
}
