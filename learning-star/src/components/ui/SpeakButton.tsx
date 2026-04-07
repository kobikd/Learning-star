import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { speak, stopSpeech } from "../../utils/speak";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpeakButtonProps {
  /** Hebrew text to speak (with or without nikud — both work) */
  text: string;
  /** Compact icon-only mode (default false — shows small label) */
  iconOnly?: boolean;
  /** Speech rate: 0.5 = slower for learning, 1 = normal */
  rate?: number;
  /** Called after speech ends */
  onDone?: () => void;
}

// ─── Sound wave bars (playing indicator) ─────────────────────────────────────

function SoundWave() {
  return (
    <span aria-hidden style={{ display: "inline-flex", alignItems: "flex-end", gap: "2px", height: "18px" }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          style={{
            display: "block",
            width: "4px",
            height: "100%",
            backgroundColor: "currentColor",
            borderRadius: "2px",
            transformOrigin: "bottom",
          }}
        />
      ))}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SpeakButton — reads Hebrew text aloud via the shared voice pipeline.
 *
 * Per CLAUDE.md: "narration always available — speaker button next to every text."
 * Rate is kept for compatibility but runtime playback is handled upstream.
 */
export function SpeakButton({
  text,
  iconOnly = false,
  rate = 0.85,
  onDone,
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      stopSpeech();
    };
  }, []);

  const handleSpeak = useCallback(() => {
    if (speaking) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      stopSpeech();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    speak(text, "instruction");

    const estimatedDurationMs = Math.max(1800, Math.ceil(text.length * (420 / Math.max(rate, 0.1))));
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setSpeaking(false);
      onDone?.();
    }, estimatedDurationMs);
  }, [speaking, text, rate, onDone]);

  return (
    <motion.button
      onClick={handleSpeak}
      aria-label={speaking ? "עצור קריאה" : "קרא בקול"}
      aria-pressed={speaking}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{
        // Minimum touch target — 80px preferred, but speaker button can be 64px
        minWidth: "var(--touch-min)",
        minHeight: "var(--touch-min)",
        padding: "0.75rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.4rem",
        backgroundColor: speaking ? "var(--color-reading-light)" : "var(--bg-secondary)",
        color: speaking ? "var(--color-reading-dark)" : "var(--text-secondary)",
        border: `2px solid ${speaking ? "var(--color-reading)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-full)",
        cursor: "pointer",
        fontFamily: "var(--font-primary)",
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-medium)",
        transition: "background-color var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Speaker icon (SVG, no external dependency) */}
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        {speaking ? (
          <>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </>
        ) : (
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        )}
      </svg>

      {/* Animated sound wave bars while speaking */}
      {speaking && <SoundWave />}

      {/* Label (hidden in icon-only mode) */}
      {!iconOnly && !speaking && (
        <span style={{ fontSize: "var(--text-label)" }}>האזן</span>
      )}
    </motion.button>
  );
}
