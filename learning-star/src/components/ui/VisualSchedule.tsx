import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScheduleItemStatus = "done" | "active" | "upcoming";

export interface ScheduleItem {
  id: string;
  /** Hebrew label shown to the child */
  label: string;
  /** Emoji icon representing the activity */
  icon: string;
  status: ScheduleItemStatus;
}

interface VisualScheduleProps {
  items: ScheduleItem[];
  /** Called when child taps an upcoming item (optional preview) */
  onItemPress?: (id: string) => void;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ScheduleItemStatus, {
  bg: string;
  border: string;
  text: string;
  iconOpacity: number;
}> = {
  done:     { bg: "var(--color-success-light)", border: "var(--color-success)",   text: "var(--text-secondary)",  iconOpacity: 0.55 },
  active:   { bg: "var(--color-math-light)",    border: "var(--color-math)",      text: "var(--text-primary)",    iconOpacity: 1    },
  upcoming: { bg: "var(--bg-secondary)",         border: "var(--border-default)", text: "var(--text-secondary)",  iconOpacity: 0.75 },
};

// ─── Single schedule row ──────────────────────────────────────────────────────

function ScheduleRow({
  item,
  index,
  onPress,
}: {
  item: ScheduleItem;
  index: number;
  onPress?: () => void;
}) {
  const s = STATUS_STYLES[item.status];
  const isActive = item.status === "active";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 28 }}
      onClick={item.status === "upcoming" ? onPress : undefined}
      role={item.status === "upcoming" && onPress ? "button" : undefined}
      aria-label={`${item.label} — ${item.status === "done" ? "הושלם" : item.status === "active" ? "עכשיו" : "בהמשך"}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.6rem 0.75rem",
        borderRadius: "var(--radius-sm)",
        backgroundColor: s.bg,
        border: `2px solid ${isActive ? s.border : "transparent"}`,
        cursor: item.status === "upcoming" && onPress ? "pointer" : "default",
        // Active item gets a left-side glow strip (RTL: inline-end)
        boxShadow: isActive ? `inset -4px 0 0 var(--color-math)` : "none",
        transition: "background-color var(--duration-fast)",
      }}
    >
      {/* Icon */}
      <span
        aria-hidden
        style={{
          fontSize: "1.5rem",
          lineHeight: 1,
          opacity: s.iconOpacity,
          // Active icon pulses gently
          filter: isActive ? "drop-shadow(0 0 4px var(--color-math))" : "none",
        }}
      >
        {item.icon}
      </span>

      {/* Label */}
      <span
        style={{
          flex: 1,
          fontSize: "var(--text-label)",
          fontWeight: isActive ? "var(--font-semibold)" : "var(--font-regular)",
          color: s.text,
          lineHeight: 1.4,
        }}
      >
        {item.label}
      </span>

      {/* Status badge */}
      {item.status === "done" && (
        <span aria-hidden style={{ fontSize: "1rem" }}>✅</span>
      )}
      {item.status === "active" && (
        <motion.span
          aria-hidden
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          style={{ fontSize: "0.75rem", color: "var(--color-math)" }}
        >
          ▶
        </motion.span>
      )}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * VisualSchedule — persistent sidebar strip showing today's activity plan.
 *
 * Per CLAUDE.md autism adaptations:
 * - Always visible — child knows exactly what comes next
 * - Clear routine: done → active → upcoming
 * - No surprises: upcoming items are visible but dimmed
 * - Smooth entrance animations (no jarring jumps)
 */
export function VisualSchedule({ items, onItemPress }: VisualScheduleProps) {
  const activeIndex = items.findIndex((i) => i.status === "active");

  return (
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      aria-label="לוח הפעילויות של היום"
      role="complementary"
      style={{
        position: "fixed",
        // RTL: inset-inline-start = right side of screen in Hebrew
        insetInlineStart: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: "var(--z-raised)",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        padding: "0.75rem 0.5rem",
        backgroundColor: "var(--bg-surface)",
        borderRadius: "0 var(--radius-md) var(--radius-md) 0",
        boxShadow: "var(--shadow-md)",
        minWidth: "140px",
        maxWidth: "160px",
        // Subtle backdrop blur for depth
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Header */}
      <p
        style={{
          fontSize: "var(--text-label)",
          fontWeight: "var(--font-bold)",
          color: "var(--text-secondary)",
          textAlign: "center",
          marginBottom: "0.25rem",
          lineHeight: 1.3,
        }}
      >
        📋 היום
      </p>

      {/* Progress bar */}
      <div
        aria-label={`${items.filter((i) => i.status === "done").length} מתוך ${items.length} הושלמו`}
        style={{
          height: "6px",
          backgroundColor: "var(--border-default)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
          marginBottom: "0.4rem",
        }}
      >
        <motion.div
          animate={{ width: `${(activeIndex / Math.max(items.length - 1, 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          style={{
            height: "100%",
            backgroundColor: "var(--color-success)",
            borderRadius: "var(--radius-full)",
          }}
        />
      </div>

      {/* Items */}
      <AnimatePresence initial={false}>
        {items.map((item, i) => (
          <ScheduleRow
            key={item.id}
            item={item}
            index={i}
            onPress={onItemPress ? () => onItemPress(item.id) : undefined}
          />
        ))}
      </AnimatePresence>
    </motion.aside>
  );
}
