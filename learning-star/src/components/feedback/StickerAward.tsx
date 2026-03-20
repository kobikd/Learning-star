import { motion } from "framer-motion";
import { useEffect } from "react";
import type { StickerDefinition } from "../../content/stickers";
import { speak } from "../../utils/speak";

// ─── Sparkle particles ────────────────────────────────────────────────────────

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function SparkleBurst() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {PARTICLE_ANGLES.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const tx  = Math.cos(rad) * 90;
        const ty  = Math.sin(rad) * 90;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: 0, x: tx, y: ty, scale: 1.2 }}
            transition={{ duration: 0.7, delay: i * 0.04, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-12px",
              marginLeft: "-12px",
              fontSize: "1.5rem",
              display: "block",
            }}
          >
            ⭐
          </motion.span>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StickerAwardProps {
  sticker:   StickerDefinition;
  onDismiss: () => void;
}

export function StickerAward({ sticker, onDismiss }: StickerAwardProps) {
  useEffect(() => {
    const t = setTimeout(
      () => speak(`!כָּל הַכָּבוֹד! זָכִית בְּמַדְבֵּקָה — ${sticker.name}`, "instruction"),
      500
    );
    return () => clearTimeout(t);
  }, [sticker]);

  return (
    <motion.div
      key="sticker-award-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(20, 20, 60, 0.72)",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="מדבקה חדשה"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 60 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35), 0 0 0 3px rgba(255,215,0,0.5)",
          padding: "2.5rem 2.8rem",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "1rem",
          maxWidth: "340px", width: "90vw",
          textAlign: "center",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Star burst */}
        <div style={{ position: "relative", width: "120px", height: "120px" }}>
          <SparkleBurst />
          {/* Glow ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: "-8px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          {/* Sticker emoji */}
          <motion.div
            initial={{ scale: 0.2, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.15 }}
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "5.5rem",
              filter: "drop-shadow(0 4px 12px rgba(255,215,0,0.6))",
            }}
          >
            {sticker.emoji}
          </motion.div>
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          lang="he" dir="rtl"
          style={{
            margin: 0,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-title)",
            fontWeight: "var(--font-bold)",
            color: "var(--color-stars)",
            lineHeight: 1.3,
          }}
        >
          מַדְבֵּקָה חֲדָשָׁה! 🎉
        </motion.h2>

        {/* Sticker name */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          lang="he" dir="rtl"
          style={{
            margin: 0,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-instruction)",
            fontWeight: "var(--font-semibold)",
            color: "var(--text-primary)",
            lineHeight: "var(--leading-nikud)",
          }}
        >
          {sticker.name}
        </motion.p>

        {/* Dismiss button */}
        <motion.button
          onClick={onDismiss}
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.05 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          style={{
            marginTop: "0.5rem",
            backgroundColor: "var(--color-stars)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "0.9rem 2.2rem",
            fontSize: "var(--text-button)",
            fontFamily: "var(--font-primary)",
            fontWeight: "var(--font-bold)",
            cursor: "pointer",
            minHeight: "var(--touch-preferred)",
            boxShadow: "0 4px 16px rgba(255,215,0,0.5)",
            direction: "rtl",
          }}
          lang="he"
        >
          מֶה יָפֶה! ✨
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
