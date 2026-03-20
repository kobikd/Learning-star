import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSafeSpaceMusic } from "../hooks/useSafeSpaceMusic";
import { useSafeSpaceSfx } from "../hooks/useSafeSpaceSfx";

// ─── Pre-computed star positions (golden-ratio distribution, stable) ─────────

const BG_STARS = Array.from({ length: 34 }, (_, i) => {
  const g = (i * 1.6180339887) % 1;
  return {
    id:  i,
    x:   ((g * 93  + 3.5) % 93) + 3.5,       // 3.5 – 96.5 %
    y:   ((g * 62  + 2)   % 62) + 2,           // 2 – 64 %
    r:   1.1 + (i % 5) * 0.38,
    dur: 3.8 + (i % 6) * 0.55,
    del: (i * 0.41) % 4.2,
    col: i % 5 === 0 ? '#C8DFFF'
       : i % 7 === 0 ? '#FFF0AA'
       : 'rgba(255,255,255,0.88)',
  };
});

// 9 larger interactive "wish" stars
const WISH_STARS = [
  { id: 'w0', x: 9,  y: 10, r: 5.5, col: '#FFEAA0' },
  { id: 'w1', x: 24, y: 5,  r: 4.5, col: '#C8E6FF' },
  { id: 'w2', x: 42, y: 14, r: 5,   col: '#FFE8D0' },
  { id: 'w3', x: 63, y: 7,  r: 4.5, col: '#C8E6FF' },
  { id: 'w4', x: 79, y: 17, r: 5,   col: '#FFEAA0' },
  { id: 'w5', x: 91, y: 9,  r: 4,   col: '#FFE8D0' },
  { id: 'w6', x: 33, y: 28, r: 4,   col: '#C8DFFF' },
  { id: 'w7', x: 56, y: 32, r: 4.5, col: '#FFEAA0' },
  { id: 'w8', x: 14, y: 42, r: 3.5, col: '#C8E6FF' },
];

const RETURN_DELAY_MS = 120_000;  // 2 minutes idle → show return prompt

// ─── Night sky background ─────────────────────────────────────────────────────

function NightSkyBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse at 55% 30%, rgba(80,60,140,0.18) 0%, transparent 55%),
          radial-gradient(ellipse at 20% 60%, rgba(40,60,120,0.12) 0%, transparent 45%),
          linear-gradient(180deg,
            #060A12 0%,
            #0C1828 28%,
            #141E3C 58%,
            #1A1230 85%,
            #1C0E2A 100%)
        `,
      }}
    >
      {/* Static twinkling background stars */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {BG_STARS.map(s => (
          <motion.circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill={s.col}
            animate={{ opacity: [0.25, 0.9, 0.25], r: [s.r, s.r * 1.35, s.r] }}
            transition={{ duration: s.dur, delay: s.del, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* Subtle milky-way streak */}
      <div style={{
        position: "absolute",
        top: "10%", left: "15%",
        width: "70%", height: "50%",
        background: "radial-gradient(ellipse at 50% 50%, rgba(120,140,200,0.055) 0%, transparent 70%)",
        transform: "rotate(-22deg)",
        pointerEvents: "none",
        borderRadius: "50%",
      }} />
    </div>
  );
}

// ─── Star sparkle burst on tap ────────────────────────────────────────────────

interface SparkleEvent { id: number; x: number; y: number; col: string; }

function StarSparkle({ x, y, col }: Omit<SparkleEvent, 'id'>) {
  const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <>
      {ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: `${x}vw`, y: `${y}vh`, scale: 0.3 }}
            animate={{
              opacity: [1, 0.8, 0],
              x: `calc(${x}vw + ${Math.cos(rad) * 42}px)`,
              y: `calc(${y}vh + ${Math.sin(rad) * 42}px)`,
              scale: [0.3, 1.1, 0],
            }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            style={{
              position: "fixed",
              width: "8px", height: "8px",
              borderRadius: "50%",
              backgroundColor: col,
              pointerEvents: "none",
              zIndex: 6,
              boxShadow: `0 0 6px ${col}`,
              marginTop: "-4px",
              marginLeft: "-4px",
            }}
          />
        );
      })}
      {/* Central flash */}
      <motion.div
        initial={{ opacity: 1, scale: 0.5, x: `${x}vw`, y: `${y}vh` }}
        animate={{ opacity: 0, scale: 3.5 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{
          position: "fixed",
          width: "18px", height: "18px",
          borderRadius: "50%",
          backgroundColor: col,
          filter: `blur(3px)`,
          pointerEvents: "none",
          zIndex: 6,
          marginTop: "-9px",
          marginLeft: "-9px",
        }}
      />
    </>
  );
}

// ─── Interactive wish stars ───────────────────────────────────────────────────

function WishStars({
  onTap,
}: {
  onTap: (x: number, y: number, col: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleTap = useCallback(
    (star: (typeof WISH_STARS)[0]) => {
      setActiveId(star.id);
      setTimeout(() => setActiveId(null), 800);
      onTap(star.x, star.y, star.col);
    },
    [onTap]
  );

  return (
    <svg
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 3, pointerEvents: "none" }}
    >
      {WISH_STARS.map(star => (
        <g key={star.id}>
          {/* Invisible large tap target */}
          <circle
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r="28"
            fill="transparent"
            style={{ cursor: "pointer", pointerEvents: "all" }}
            onPointerDown={() => handleTap(star)}
          />
          {/* Visible star */}
          <motion.circle
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.r}
            fill={star.col}
            animate={
              activeId === star.id
                ? { r: [star.r, star.r * 3.5, star.r], opacity: [1, 0.6, 1] }
                : { opacity: [0.6, 1, 0.6], r: [star.r, star.r * 1.2, star.r] }
            }
            transition={
              activeId === star.id
                ? { duration: 0.7, ease: "easeOut" }
                : { duration: 3 + star.r, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ filter: `drop-shadow(0 0 4px ${star.col})`, pointerEvents: "none" }}
          />
          {/* Cross / sparkle shape */}
          {[0, 45].map(angle => (
            <motion.line
              key={angle}
              x1={`calc(${star.x}% - ${star.r * 2}px)`}
              y1={`${star.y}%`}
              x2={`calc(${star.x}% + ${star.r * 2}px)`}
              y2={`${star.y}%`}
              stroke={star.col}
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity={0.6}
              transform={`rotate(${angle}, 0, 0)`}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: angle * 0.05 }}
              style={{ pointerEvents: "none" }}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

// ─── Sleeping cat ──────────────────────────────────────────────────────────────

function Zzz() {
  return (
    <div style={{ position: "absolute", top: "-8px", right: "-24px" }}>
      {([
        { char: "Z", size: "1.3rem", dx: 0,  dy: 0,  delay: 0    },
        { char: "z", size: "1.0rem", dx: 14, dy: -22, delay: 1.0 },
        { char: "z", size: "0.75rem",dx: 24, dy: -42, delay: 2.0 },
      ] as const).map((z, i) => (
        <motion.span
          key={i}
          style={{
            position: "absolute",
            left: z.dx,
            top: z.dy,
            fontSize: z.size,
            color: "rgba(160,190,240,0.75)",
            fontWeight: "bold",
            fontFamily: "var(--font-primary)",
            userSelect: "none",
          }}
          animate={{ opacity: [0, 0.8, 0.8, 0], y: [0, -28, -50] }}
          transition={{ duration: 3.8, delay: z.delay, repeat: Infinity, ease: "easeOut" }}
        >
          {z.char}
        </motion.span>
      ))}
    </div>
  );
}

function SleepingCat({ onTap }: { onTap: () => void }) {
  const ctrl = useAnimation();

  const handleTap = useCallback(async () => {
    onTap();
    await ctrl.start({ y: [-4, 0], transition: { duration: 0.4, ease: "easeOut" } });
  }, [ctrl, onTap]);

  return (
    <div
      style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
      onPointerDown={handleTap}
      aria-label="החתול הישן"
      role="img"
    >
      {/* ZZZ particles */}
      <Zzz />

      {/* Main body — breathing */}
      <motion.div
        animate={{ scaleY: [1, 1.025, 1], y: [0, -3, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "bottom center" }}
      >
        <motion.div animate={ctrl}>
          <svg viewBox="0 0 220 230" width="200" height="210" aria-hidden>
            {/* Moon glow underneath */}
            <ellipse cx="110" cy="215" rx="78" ry="18"
              fill="rgba(160,180,255,0.12)" />

            {/* Body — curled-up blob */}
            <ellipse cx="108" cy="172" rx="65" ry="45"
              fill="#C9A87A" />

            {/* Tail curled around */}
            <path d="M 158,185 Q 192,165 186,135 Q 180,112 164,118"
              stroke="#C9A87A" strokeWidth="15" fill="none"
              strokeLinecap="round" />
            <path d="M 158,185 Q 192,165 186,135 Q 180,112 164,118"
              stroke="#B8956A" strokeWidth="4" fill="none"
              strokeLinecap="round" strokeDasharray="8 6" opacity="0.35" />

            {/* Head */}
            <circle cx="105" cy="108" r="54" fill="#C9A87A" />

            {/* Ears */}
            <polygon points="72,65 56,36 90,60" fill="#C9A87A" />
            <polygon points="138,65 154,36 120,60" fill="#C9A87A" />
            <polygon points="74,63 61,42 88,60" fill="#E8A8A8" opacity="0.65" />
            <polygon points="136,63 149,44 122,60" fill="#E8A8A8" opacity="0.65" />

            {/* Closed eyes — happy crescents */}
            <path d="M 78,104 Q 88,96 98,104"
              stroke="#6B4A30" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 112,104 Q 122,96 132,104"
              stroke="#6B4A30" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Rosy cheeks */}
            <ellipse cx="84"  cy="116" rx="10" ry="7" fill="rgba(230,140,130,0.25)" />
            <ellipse cx="126" cy="116" rx="10" ry="7" fill="rgba(230,140,130,0.25)" />

            {/* Nose */}
            <ellipse cx="105" cy="118" rx="5" ry="3.5" fill="#E8A8A8" />

            {/* Mouth */}
            <path d="M 98,126 Q 105,132 112,126"
              stroke="#6B4A30" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Whiskers */}
            {[
              ["62,112", "92,116"],
              ["64,121", "92,122"],
              ["118,116", "148,112"],
              ["118,122", "148,121"],
            ].map(([p1, p2], i) => (
              <line key={i}
                x1={p1.split(",")[0]} y1={p1.split(",")[1]}
                x2={p2.split(",")[0]} y2={p2.split(",")[1]}
                stroke="#6B4A30" strokeWidth="1.5" opacity="0.4"
              />
            ))}

            {/* Tucked paws */}
            <ellipse cx="92"  cy="196" rx="20" ry="11" fill="#B8956A" />
            <ellipse cx="118" cy="200" rx="20" ry="11" fill="#B8956A" />

            {/* Paw toe lines */}
            {[-5, 0, 5].map(dx => (
              <line key={dx}
                x1={90 + dx} y1="200" x2={90 + dx} y2="205"
                stroke="#A07850" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
              />
            ))}
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Virtual water ─────────────────────────────────────────────────────────────

interface Ripple { id: number; x: number; y: number; }

function VirtualWater({ onTap }: { onTap: () => void }) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef          = useRef<HTMLDivElement>(null);

  const handlePointer = useCallback((e: React.PointerEvent) => {
    onTap();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    const id = Date.now() + Math.random();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(p => p.id !== id)), 2800);
  }, [onTap]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointer}
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: "22%",
        cursor: "crosshair",
        zIndex: 2,
        overflow: "hidden",
      }}
      aria-label="מים — לגעת כדי לראות גלים"
      role="button"
    >
      {/* Water gradient fill */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 0%, rgba(8,28,65,0.55) 35%, rgba(5,15,45,0.85) 100%)",
      }} />

      {/* Animated waves */}
      <svg
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        {/* Deep wave */}
        <motion.path
          d="M0,40 Q50,25 100,40 Q150,55 200,40 Q250,25 300,40 Q350,55 400,40 L400,80 L0,80 Z"
          fill="rgba(20,50,110,0.45)"
          animate={{ d: [
            "M0,40 Q50,25 100,40 Q150,55 200,40 Q250,25 300,40 Q350,55 400,40 L400,80 L0,80 Z",
            "M0,42 Q50,57 100,42 Q150,27 200,42 Q250,57 300,42 Q350,27 400,42 L400,80 L0,80 Z",
            "M0,40 Q50,25 100,40 Q150,55 200,40 Q250,25 300,40 Q350,55 400,40 L400,80 L0,80 Z",
          ]}}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Mid wave */}
        <motion.path
          d="M0,50 Q60,38 120,50 Q180,62 240,50 Q300,38 360,50 Q380,55 400,50 L400,80 L0,80 Z"
          fill="rgba(15,35,85,0.5)"
          animate={{ d: [
            "M0,50 Q60,38 120,50 Q180,62 240,50 Q300,38 360,50 Q380,55 400,50 L400,80 L0,80 Z",
            "M0,52 Q60,64 120,52 Q180,40 240,52 Q300,64 360,52 Q380,50 400,52 L400,80 L0,80 Z",
            "M0,50 Q60,38 120,50 Q180,62 240,50 Q300,38 360,50 Q380,55 400,50 L400,80 L0,80 Z",
          ]}}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        {/* Surface highlight */}
        <motion.path
          d="M0,36 Q80,28 160,36 Q240,44 320,36 Q360,30 400,36"
          fill="none"
          stroke="rgba(120,160,220,0.12)"
          strokeWidth="2"
          animate={{ d: [
            "M0,36 Q80,28 160,36 Q240,44 320,36 Q360,30 400,36",
            "M0,38 Q80,46 160,38 Q240,30 320,38 Q360,44 400,38",
            "M0,36 Q80,28 160,36 Q240,44 320,36 Q360,30 400,36",
          ]}}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />

        {/* Ripples */}
        {ripples.map(rip => (
          <g key={rip.id}>
            {[0, 0.3, 0.6].map(delay => (
              <motion.ellipse
                key={delay}
                cx={`${rip.x}%`}
                cy={`${rip.y}%`}
                rx={2} ry={1}
                fill="none"
                stroke="rgba(160,200,240,0.6)"
                strokeWidth="1.2"
                initial={{ rx: 2, ry: 1, opacity: 0.7 }}
                animate={{ rx: 90, ry: 28, opacity: 0 }}
                transition={{ duration: 2.2, delay, ease: "easeOut" }}
              />
            ))}
          </g>
        ))}
      </svg>

      {/* Star reflections in water (static) */}
      {[15, 35, 55, 72, 88].map((x, i) => (
        <motion.div
          key={i}
          aria-hidden
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: `${15 + (i % 3) * 20}%`,
            left: `${x}%`,
            width: "3px", height: "8px",
            background: "rgba(200,220,255,0.5)",
            borderRadius: "50%",
            filter: "blur(1px)",
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Sound toggle (minimal, top-left) ────────────────────────────────────────

function SoundToggle({ soundOn, onToggle }: { soundOn: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.88 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.55 }}
      whileHover={{ opacity: 0.9 }}
      transition={{ delay: 1.5 }}
      data-sound-toggle="true"
      aria-label={soundOn ? "כבה מוזיקה" : "הדלק מוזיקה"}
      style={{
        position: "fixed",
        top: "1rem",
        insetInlineEnd: "1rem",   // right in RTL (physical left)
        zIndex: 20,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "50%",
        width: "44px", height: "44px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.3rem",
        cursor: "pointer",
        backdropFilter: "blur(4px)",
      }}
    >
      {soundOn ? "🔊" : "🔇"}
    </motion.button>
  );
}

// ─── Return prompt (appears after 2 min idle) ─────────────────────────────────

function ReturnPrompt({
  visible,
  onReturn,
}: {
  visible:  boolean;
  onReturn: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="return-prompt"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 2.5, ease: "easeOut" }}  // very slow fade-in
          style={{
            position: "fixed",
            bottom: "26%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            textAlign: "center",
          }}
        >
          <p
            lang="he" dir="rtl"
            style={{
              margin: 0,
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-instruction)",
              fontWeight: "var(--font-semibold)",
              color: "rgba(200,220,255,0.75)",
              lineHeight: "var(--leading-nikud)",
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}
          >
            מוּכָנָה לַחֲזוֹר?
          </p>
          <motion.button
            onClick={onReturn}
            whileTap={{ scale: 0.94 }}
            whileHover={{ opacity: 1 }}
            style={{
              background: "rgba(160,190,240,0.18)",
              border: "1px solid rgba(160,190,240,0.35)",
              borderRadius: "var(--radius-xl)",
              padding: "0.85rem 2.2rem",
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-button)",
              fontWeight: "var(--font-semibold)",
              color: "rgba(200,225,255,0.85)",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              minHeight: "var(--touch-preferred)",
              letterSpacing: "0.02em",
            }}
            lang="he" dir="rtl"
          >
            כֵּן, בּוֹאִי נַחֲזוֹר 🌙
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Moon decoration ──────────────────────────────────────────────────────────

function Moon({ onTap }: { onTap?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
      aria-hidden
      style={{
        position: "fixed",
        top: "8%",
        insetInlineStart: "12%",   // left in RTL (physical right)
        zIndex: 1,
        pointerEvents: onTap ? "auto" : "none",
        cursor: onTap ? "pointer" : "default",
      }}
      onPointerDown={onTap}
      role={onTap ? "button" : undefined}
      aria-label={onTap ? "ירח" : undefined}
    >
      <motion.svg
        viewBox="0 0 80 80"
        width="72"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Crescent */}
        <path
          d="M55,15 A30,30 0 1,0 55,65 A20,20 0 1,1 55,15 Z"
          fill="rgba(240,230,180,0.88)"
          filter="url(#moonGlow)"
        />
        <defs>
          <filter id="moonGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </motion.svg>
    </motion.div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

interface SafeSpaceProps {
  onBack: () => void;
}

export function SafeSpace({ onBack }: SafeSpaceProps) {
  const [sparkles,    setSparkles]    = useState<SparkleEvent[]>([]);
  const [showReturn,  setShowReturn]  = useState(false);
  const idleTimerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { on: soundOn, toggle: toggleSound } = useSafeSpaceMusic();
  const { play: playSfx } = useSafeSpaceSfx();

  // ── Reset idle timer on any interaction ──────────────────────────────────
  const resetIdle = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setShowReturn(false);
    idleTimerRef.current = setTimeout(() => setShowReturn(true), RETURN_DELAY_MS);
  }, []);

  // Start idle timer on mount
  useEffect(() => {
    resetIdle();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [resetIdle]);

  // ── Star tap → sparkle burst ─────────────────────────────────────────────
  const handleWishStar = useCallback((x: number, y: number, col: string) => {
    resetIdle();
    playSfx("star");
    const id = Date.now() + Math.random();
    setSparkles(s => [...s, { id, x, y, col }]);
    setTimeout(() => setSparkles(s => s.filter(p => p.id !== id)), 900);
  }, [resetIdle]);

  // ── Cat tap → gentle nudge (already inside SleepingCat) ─────────────────
  const handleCatTap = useCallback(() => {
    resetIdle();
    playSfx("cat");
  }, [resetIdle, playSfx]);

  // ── Water tap → resetIdle (ripple handled inside VirtualWater) ───────────
  const handleWaterTap = useCallback(() => {
    resetIdle();
    playSfx("water");
  }, [resetIdle, playSfx]);

  // ── Return ────────────────────────────────────────────────────────────────
  const handleReturn = useCallback(() => {
    setShowReturn(false);
    onBack();
  }, [onBack]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    >
      {/* Layers */}
      <NightSkyBackground />
      <Moon onTap={() => { resetIdle(); playSfx("moon"); }} />

      {/* Interactive stars */}
      <WishStars onTap={handleWishStar} />

      {/* Sparkle bursts */}
      {sparkles.map(s => (
        <StarSparkle key={s.id} x={s.x} y={s.y} col={s.col} />
      ))}

      {/* Sleeping cat — centered, above water */}
      <div
        style={{
          position: "fixed",
          bottom: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 4,
        }}
      >
        <SleepingCat onTap={handleCatTap} />
      </div>

      {/* Virtual water */}
      <VirtualWater onTap={handleWaterTap} />

      {/* Controls */}
      <SoundToggle soundOn={soundOn} onToggle={toggleSound} />

      {/* Gentle return prompt */}
      <ReturnPrompt visible={showReturn} onReturn={handleReturn} />
    </motion.div>
  );
}
