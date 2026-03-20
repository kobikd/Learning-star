import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScaffoldLevel = 0 | 1 | 2 | 3;

interface NumberRowProps {
  /** Which number is the correct answer */
  correctAnswer: number;
  /** 0 = no scaffold, 1 = dim wrong, 2 = dim + hint, 3 = auto-select */
  scaffoldLevel: ScaffoldLevel;
  /** Disabled during celebration or demo */
  disabled: boolean;
  onSelect: (n: number) => void;
  /** Highlight this number (used by demo auto-select) */
  autoHighlight?: number | null;
}

// ─── Single number button ─────────────────────────────────────────────────────

function NumButton({
  value,
  dimmed,
  highlighted,
  disabled,
  onClick,
}: {
  value: number;
  dimmed: boolean;
  highlighted: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={disabled || dimmed ? undefined : onClick}
      aria-label={`המספר ${value}`}
      aria-disabled={disabled || dimmed}
      whileTap={disabled || dimmed ? {} : { scale: 0.88 }}
      whileHover={disabled || dimmed ? {} : { scale: 1.08, y: -4 }}
      animate={
        highlighted
          ? { scale: [1, 1.2, 1], backgroundColor: "#FFD700" }
          : {}
      }
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{
        // ── 80 px minimum touch target ──
        minWidth:  "var(--touch-preferred)",  // 80px
        minHeight: "var(--touch-preferred)",  // 80px
        border: highlighted
          ? "3px solid #F5A000"
          : dimmed
          ? "2px solid transparent"
          : "2px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        backgroundColor: highlighted
          ? "#FFD700"
          : dimmed
          ? "rgba(200,200,200,0.18)"
          : "rgba(255,255,255,0.88)",
        backdropFilter: "blur(6px)",
        cursor: disabled || dimmed ? "default" : "pointer",
        opacity: dimmed ? 0.28 : 1,
        fontFamily: "var(--font-primary)",
        fontSize: "var(--text-instruction)",   // 28px — large & readable
        fontWeight: "var(--font-bold)",
        color: highlighted ? "#2D3748" : dimmed ? "var(--text-secondary)" : "var(--text-primary)",
        boxShadow: highlighted
          ? "0 4px 16px rgba(255,215,0,0.55)"
          : dimmed
          ? "none"
          : "var(--shadow-sm)",
        transition: "background-color 300ms, opacity 300ms, border-color 300ms, box-shadow 300ms",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {value}
    </motion.button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * NumberRow — two rows of numbers 1–10 the child taps to answer.
 *
 * Scaffolding levels (per CLAUDE.md errorless learning):
 *   0 → all numbers visible equally
 *   1 → wrong numbers dimmed (answer attempt 1 failed)
 *   2 → same as 1 + cat already spoke the answer (handled in parent)
 *   3 → autoHighlight blinks on correct answer (parent drives demo)
 */
export function NumberRow({
  correctAnswer,
  scaffoldLevel,
  disabled,
  onSelect,
  autoHighlight,
}: NumberRowProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const row1 = numbers.slice(0, 5);   // 1-5
  const row2 = numbers.slice(5, 10);  // 6-10

  const isDimmed = (n: number) => scaffoldLevel >= 1 && n !== correctAnswer;

  return (
    <div
      role="group"
      aria-label="בחרי את המספר הנכון"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.6rem",
        width: "100%",
        padding: "0 0.5rem",
      }}
    >
      {/* Hint label (appears at scaffold ≥ 1) */}
      {scaffoldLevel >= 1 && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          dir="rtl"
          lang="he"
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-content)",
            color: "var(--color-math)",
            fontWeight: "var(--font-semibold)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {scaffoldLevel === 1 && "💡 נסי שוב — הסתכלי על הפרחים שנשארו!"}
          {scaffoldLevel >= 2 && "💡 האזיני לחתול — הוא יגיד את המספר!"}
        </motion.p>
      )}

      {/* Row 1: 1–5 */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {row1.map((n) => (
          <NumButton
            key={n}
            value={n}
            dimmed={isDimmed(n)}
            highlighted={autoHighlight === n}
            disabled={disabled}
            onClick={() => onSelect(n)}
          />
        ))}
      </div>

      {/* Row 2: 6–10 */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {row2.map((n) => (
          <NumButton
            key={n}
            value={n}
            dimmed={isDimmed(n)}
            highlighted={autoHighlight === n}
            disabled={disabled}
            onClick={() => onSelect(n)}
          />
        ))}
      </div>
    </div>
  );
}
