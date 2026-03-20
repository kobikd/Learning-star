import { motion } from "framer-motion";

// ─── Single cloud shape ───────────────────────────────────────────────────────

function CloudShape({ opacity = 1, scale = 1 }: { opacity?: number; scale?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 180 80"
      width={180 * scale}
      height={80 * scale}
      style={{ display: "block" }}
    >
      <g opacity={opacity}>
        <ellipse cx="90"  cy="55" rx="75" ry="28" fill="white" />
        <ellipse cx="60"  cy="46" rx="38" ry="32" fill="white" />
        <ellipse cx="115" cy="42" rx="42" ry="34" fill="white" />
        <ellipse cx="140" cy="52" rx="28" ry="24" fill="white" />
        <ellipse cx="40"  cy="52" rx="26" ry="20" fill="white" />
      </g>
    </svg>
  );
}

// ─── Cloud config ─────────────────────────────────────────────────────────────

const CLOUDS = [
  // [initialX%, top%, duration(s), scale, opacity, delay(s)]
  { startX: "105vw",  endX: "-260px", top: "8%",  duration: 55, scale: 1.1, opacity: 0.92, delay: 0  },
  { startX: "85vw",   endX: "-320px", top: "18%", duration: 80, scale: 0.75, opacity: 0.70, delay: 20 },
  { startX: "-240px", endX: "110vw",  top: "5%",  duration: 70, scale: 0.9, opacity: 0.55, delay: 35 },
] as const;

// ─── Twinkling star ───────────────────────────────────────────────────────────

function Star({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      aria-hidden
      animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
      transition={{ repeat: Infinity, duration: 2.5 + delay * 0.4, delay, ease: "easeInOut" }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: "#FFD700",
        boxShadow: "0 0 6px 2px rgba(255,215,0,0.5)",
        pointerEvents: "none",
      }}
    />
  );
}

const STARS = [
  { x: "12%",  y: "10%", delay: 0    },
  { x: "28%",  y: "6%",  delay: 0.8  },
  { x: "75%",  y: "12%", delay: 1.4  },
  { x: "88%",  y: "7%",  delay: 0.3  },
  { x: "52%",  y: "4%",  delay: 2.1  },
  { x: "42%",  y: "15%", delay: 1.0  },
  { x: "65%",  y: "9%",  delay: 1.7  },
];

// ─── SkyBackground component ─────────────────────────────────────────────────

/**
 * SkyBackground — full-viewport soft sky with slowly drifting clouds.
 * All motion is very slow (55–80s per cycle) to avoid visual overwhelm.
 */
export function SkyBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        // Warm sky gradient: top is deeper blue, bottom fades to lavender
        background: "linear-gradient(175deg, #A8CBF0 0%, #C5DCF5 35%, #D8E9F8 65%, #E8F0FF 100%)",
        pointerEvents: "none",
      }}
    >
      {/* Twinkling stars */}
      {STARS.map((s, i) => (
        <Star key={i} x={s.x} y={s.y} delay={s.delay} />
      ))}

      {/* Drifting clouds */}
      {CLOUDS.map((c, i) => (
        <motion.div
          key={i}
          initial={{ x: c.startX }}
          animate={{ x: c.endX }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            ease: "linear",
            delay: c.delay,
            // Snap back to start without visible jump
            repeatType: "loop",
          }}
          style={{
            position: "absolute",
            top: c.top,
          }}
        >
          <CloudShape scale={c.scale} opacity={c.opacity} />
        </motion.div>
      ))}

      {/* Soft ground gradient at the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: "linear-gradient(to top, rgba(240,244,255,0.9) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
