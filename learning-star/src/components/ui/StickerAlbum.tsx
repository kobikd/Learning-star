import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { STICKERS, TOPIC_META } from "../../content/stickers";
import type { StickerTopic } from "../../content/stickers";
import { useRewardStore } from "../../stores/rewardStore";

// ─── Individual sticker slot ──────────────────────────────────────────────────

function StickerSlot({
  id,
  emoji,
  name,
  earned,
  index,
}: {
  id: string;
  emoji: string;
  name: string;
  earned: boolean;
  index: number;
}) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 280, damping: 22 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.6rem 0.4rem",
        borderRadius: "var(--radius-lg)",
        backgroundColor: earned ? "white" : "rgba(220,225,235,0.4)",
        border: earned
          ? "2px solid rgba(255,215,0,0.7)"
          : "2px solid rgba(180,190,210,0.3)",
        boxShadow: earned
          ? "0 2px 12px rgba(255,215,0,0.25), 0 0 0 1px rgba(255,215,0,0.1)"
          : "none",
        minWidth: "76px",
        minHeight: "88px",
        justifyContent: "center",
      }}
    >
      {/* Emoji */}
      <motion.span
        animate={earned ? { scale: [1, 1.08, 1] } : {}}
        transition={earned ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
        style={{
          fontSize: "2.4rem",
          lineHeight: 1,
          filter: earned ? "none" : "grayscale(1) opacity(0.28)",
          userSelect: "none",
        }}
        aria-hidden={!earned}
      >
        {earned ? emoji : "❓"}
      </motion.span>

      {/* Name — only for earned */}
      <span
        lang="he"
        style={{
          fontSize: "0.68rem",
          fontFamily: "var(--font-primary)",
          fontWeight: earned ? "var(--font-semibold)" : "var(--font-regular)",
          color: earned ? "var(--text-primary)" : "transparent",
          lineHeight: "var(--leading-nikud)",
          textAlign: "center",
          minHeight: "1.2em",
          userSelect: "none",
        }}
      >
        {earned ? name : "·"}
      </span>

      {/* Gold shine on earned */}
      {earned && (
        <motion.div
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, rgba(255,215,0,0.15) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
      )}
    </motion.div>
  );
}

// ─── StickerAlbum ─────────────────────────────────────────────────────────────

interface StickerAlbumProps {
  onClose: () => void;
}

export function StickerAlbum({ onClose }: StickerAlbumProps) {
  const { stars, stickersEarned } = useRewardStore();
  const [activeTopic, setActiveTopic] = useState<StickerTopic>("animals");

  const topicStickers = STICKERS.filter(s => s.topic === activeTopic);
  const earnedCount   = stickersEarned.length;
  const totalCount    = STICKERS.length;

  function topicEarned(topic: StickerTopic) {
    return STICKERS.filter(s => s.topic === topic && stickersEarned.includes(s.id)).length;
  }

  return (
    <motion.div
      key="album-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: "rgba(20,30,60,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Album sheet — slides up */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "540px",
          maxHeight: "88svh",
          backgroundColor: "var(--bg-primary)",
          borderRadius: "var(--radius-xl) var(--radius-xl) 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="אלבום המדבקות שלי"
      >
        {/* Handle */}
        <div style={{
          display: "flex", justifyContent: "center",
          paddingTop: "0.6rem", paddingBottom: "0.2rem",
        }}>
          <div style={{
            width: "40px", height: "4px",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--border-default)",
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.6rem 1.2rem 0.8rem",
          borderBottom: "1px solid var(--border-default)",
          direction: "rtl",
        }}>
          <h2 lang="he" dir="rtl" style={{
            flex: 1, margin: 0,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-instruction)",
            fontWeight: "var(--font-bold)",
            color: "var(--text-primary)",
          }}>
            🌟 הָאַלְבּוֹם שֶׁלִּי
          </h2>

          {/* Total progress */}
          <div lang="he" dir="rtl" style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            background: "rgba(255,215,0,0.12)",
            borderRadius: "var(--radius-full)",
            padding: "0.3rem 0.8rem",
            border: "1.5px solid rgba(255,215,0,0.35)",
          }}>
            <span style={{ fontSize: "1rem" }}>🏅</span>
            <span style={{
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-bold)",
              color: "var(--color-games)",
            }}>
              {earnedCount}/{totalCount}
            </span>
          </div>

          {/* Stars */}
          <div style={{
            display: "flex", alignItems: "center", gap: "0.3rem",
            background: "rgba(255,215,0,0.12)",
            borderRadius: "var(--radius-full)",
            padding: "0.3rem 0.8rem",
            border: "1.5px solid rgba(255,215,0,0.35)",
          }}>
            <span style={{ fontSize: "1rem" }}>⭐</span>
            <span style={{
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-bold)",
              color: "var(--color-stars)",
            }}>
              {stars}
            </span>
          </div>

          {/* Close button */}
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            aria-label="סגור אלבום"
            style={{
              width: "var(--touch-min)", height: "var(--touch-min)",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.06)",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </motion.button>
        </div>

        {/* Topic tabs */}
        <div style={{
          display: "flex", gap: "0.4rem",
          padding: "0.8rem 1rem 0",
          direction: "rtl",
        }}>
          {(Object.keys(TOPIC_META) as StickerTopic[]).map(topic => {
            const meta   = TOPIC_META[topic];
            const count  = topicEarned(topic);
            const active = topic === activeTopic;
            return (
              <motion.button
                key={topic}
                onClick={() => setActiveTopic(topic)}
                whileTap={{ scale: 0.95 }}
                animate={{
                  backgroundColor: active ? meta.color : "rgba(200,210,230,0.35)",
                  color: active ? "white" : "var(--text-secondary)",
                  scale: active ? 1 : 0.96,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  flex: 1,
                  padding: "0.55rem 0.4rem",
                  border: "none",
                  borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                  cursor: "pointer",
                  fontFamily: "var(--font-primary)",
                  fontSize: "var(--text-body)",
                  fontWeight: "var(--font-bold)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.15rem",
                  minHeight: "var(--touch-min)",
                  boxShadow: active ? "0 -2px 8px rgba(0,0,0,0.1)" : "none",
                  position: "relative",
                  zIndex: active ? 2 : 1,
                }}
                lang="he"
              >
                <span style={{ fontSize: "1.4rem" }}>{meta.icon}</span>
                <span dir="rtl">{meta.label}</span>
                <span style={{
                  fontSize: "0.7rem",
                  opacity: 0.85,
                  fontWeight: "var(--font-regular)",
                }}>
                  {count}/9
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Sticker grid */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0.8rem 1rem 1.2rem",
          background: "white",
          borderTop: "2px solid var(--border-default)",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTopic}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.6rem",
              }}
            >
              {topicStickers.map((sticker, i) => (
                <StickerSlot
                  key={sticker.id}
                  id={sticker.id}
                  emoji={sticker.emoji}
                  name={sticker.name}
                  earned={stickersEarned.includes(sticker.id)}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Encouraging footer */}
        <div style={{
          padding: "0.7rem 1rem",
          backgroundColor: "rgba(255,249,230,0.9)",
          borderTop: "1px solid rgba(255,215,0,0.2)",
          textAlign: "center",
        }}>
          <p lang="he" dir="rtl" style={{
            margin: 0,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-body)",
            fontWeight: "var(--font-semibold)",
            color: "var(--color-games)",
          }}>
            {earnedCount === totalCount
              ? "!אָסַפְתְּ אֶת כָּל הַמַּדְבֵּקוֹת — מַדְהִים 🏆"
              : `עוֹד מַדְבֵּקוֹת מְחַכּוֹת לָךְ! ✨`}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
