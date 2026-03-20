import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { TraceDot } from "../../content/letters";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TracingDotsProps {
  dots: TraceDot[];
  letterChar: string;          // faint background letter
  onComplete: () => void;
  resetKey?: number;           // change to reset state
}

// Distance between two points
function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

// Convert SVG-local coords from a pointer event
function svgPoint(
  e: React.PointerEvent<SVGSVGElement>,
  svg: SVGSVGElement
): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  const scaleX = 200 / rect.width;
  const scaleY = 220 / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TracingDots({ dots, letterChar, onComplete, resetKey = 0 }: TracingDotsProps) {
  const [completed, setCompleted] = useState<number[]>([]);   // dot ids in order
  const [wrongId,   setWrongId]   = useState<number | null>(null);
  const shakeCtrl = useAnimation();

  // Reset when resetKey changes
  useEffect(() => {
    setCompleted([]);
    setWrongId(null);
  }, [resetKey]);

  const handleSvgPointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const { x, y } = svgPoint(e, svg);

      const TOLERANCE = 44; // px in SVG space — wide for dyspraxia

      // Find closest dot within tolerance
      let closestDot: TraceDot | null = null;
      let closestDist = Infinity;
      for (const dot of dots) {
        const d = dist(x, y, dot.x, dot.y);
        if (d < TOLERANCE && d < closestDist) {
          closestDist = d;
          closestDot = dot;
        }
      }

      if (!closestDot) return;

      const nextId = completed.length + 1; // dots are numbered 1..n

      if (closestDot.id === nextId) {
        // Correct dot!
        const next = [...completed, closestDot.id];
        setCompleted(next);
        setWrongId(null);
        if (next.length === dots.length) {
          setTimeout(onComplete, 600);
        }
      } else if (!completed.includes(closestDot.id)) {
        // Wrong order — shake the next expected dot
        setWrongId(nextId);
        shakeCtrl.start({
          x: [-5, 5, -4, 4, 0],
          transition: { duration: 0.35, ease: "easeOut" },
        });
        setTimeout(() => setWrongId(null), 500);
      }
    },
    [completed, dots, onComplete, shakeCtrl]
  );

  const nextExpected = completed.length + 1;

  return (
    <svg
      viewBox="0 0 200 220"
      width="200"
      height="220"
      onPointerDown={handleSvgPointer}
      style={{
        touchAction: "none",
        cursor: "pointer",
        userSelect: "none",
        overflow: "visible",
      }}
      aria-label={`עקבי אחרי הנקודות — ${dots.length} נקודות`}
      role="img"
    >
      {/* ── Faint background letter ── */}
      <text
        x="100"
        y="155"
        textAnchor="middle"
        fontSize="160"
        fontFamily="var(--font-primary)"
        fill="rgba(100,120,180,0.08)"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {letterChar}
      </text>

      {/* ── Lines between completed dots ── */}
      {completed.length > 1 &&
        completed.slice(1).map((id) => {
          const from = dots.find(d => d.id === id - 1)!;
          const to   = dots.find(d => d.id === id)!;
          return (
            <motion.line
              key={`line-${id}`}
              x1={from.x} y1={from.y}
              x2={to.x}   y2={to.y}
              stroke="var(--color-reading)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        })}

      {/* ── Line to next expected dot (dashed hint) ── */}
      {completed.length > 0 && nextExpected <= dots.length && (
        <motion.line
          key={`hint-${nextExpected}`}
          x1={dots[completed.length - 1].x}
          y1={dots[completed.length - 1].y}
          x2={dots[nextExpected - 1].x}
          y2={dots[nextExpected - 1].y}
          stroke="rgba(78,205,196,0.3)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 5"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* ── Dots ── */}
      {dots.map(dot => {
        const isDone     = completed.includes(dot.id);
        const isNext     = dot.id === nextExpected;
        const isWrong    = dot.id === wrongId;

        return (
          <g key={`dot-${dot.id}`}>
            {/* Outer glow ring for next dot */}
            {isNext && !isDone && (
              <motion.circle
                cx={dot.x} cy={dot.y} r={26}
                fill="none"
                stroke="var(--color-reading)"
                strokeWidth="2.5"
                animate={{ r: [22, 30, 22], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Main dot */}
            <motion.circle
              cx={dot.x}
              cy={dot.y}
              r={isDone ? 14 : 18}
              fill={isDone ? "var(--color-reading)" : isNext ? "white" : "rgba(200,220,255,0.5)"}
              stroke={isDone ? "var(--color-reading-dark, #3aada5)" : isNext ? "var(--color-reading)" : "rgba(100,140,200,0.4)"}
              strokeWidth={isDone ? 2 : 3}
              animate={isWrong ? shakeCtrl : {}}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            />

            {/* Number or checkmark */}
            <text
              x={dot.x} y={dot.y + 6}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fontFamily="var(--font-primary)"
              fill={isDone ? "white" : isNext ? "var(--color-reading)" : "rgba(100,140,200,0.6)"}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {isDone ? "✓" : dot.id}
            </text>
          </g>
        );
      })}

      {/* ── All done sparkle ── */}
      <AnimatePresence>
        {completed.length === dots.length && (
          <motion.text
            key="done"
            x="100" y="18"
            textAnchor="middle"
            fontSize="28"
            initial={{ opacity: 0, y: 30, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{ pointerEvents: "none" }}
          >
            ✨
          </motion.text>
        )}
      </AnimatePresence>
    </svg>
  );
}
