import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef } from "react";
import { AVATAR_CONFIG } from "./avatars";
import type { AvatarId } from "../../stores/avatarStore";
import { useAvatarStore } from "../../stores/avatarStore";

// Avatar SFX player (uses sfxPlayer cache)
function playAvatarSfx(file: string) {
  try {
    const audio = new Audio(`/audio/sfx/${file}`);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch { /* silent */ }
}

// Random avatar encouragement voice
const ENC_FILES = [
  "avatar_enc_1.mp3","avatar_enc_2.mp3","avatar_enc_3.mp3","avatar_enc_4.mp3",
  "avatar_enc_5.mp3","avatar_enc_6.mp3","avatar_enc_7.mp3","avatar_enc_8.mp3",
];
let lastEncIdx = -1;
let currentVoice: HTMLAudioElement | null = null;

function playRandomEncouragement() {
  let idx: number;
  do { idx = Math.floor(Math.random() * ENC_FILES.length); } while (idx === lastEncIdx);
  lastEncIdx = idx;
  try {
    if (currentVoice) { currentVoice.pause(); currentVoice.currentTime = 0; }
    currentVoice = new Audio(`/audio/voices/${ENC_FILES[idx]}`);
    currentVoice.volume = 1.0;
    setTimeout(() => currentVoice?.play().catch(() => {}), 600); // slight delay after SFX
  } catch { /* silent */ }
}

interface AvatarPickerProps {
  onClose: () => void;
}

export function AvatarPicker({ onClose }: AvatarPickerProps) {
  const { selectedAvatar, setAvatar } = useAvatarStore();
  const animatingRef = useRef<AvatarId | null>(null);

  const handleSelect = useCallback((id: AvatarId, sfx: string) => {
    if (animatingRef.current === id) return;
    animatingRef.current = id;
    setTimeout(() => { animatingRef.current = null; }, 700);

    playAvatarSfx(sfx);
    setAvatar(id);
    playRandomEncouragement();
  }, [setAvatar]);

  return (
    <AnimatePresence>
      <motion.div
        key="avatar-picker-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(20,10,40,0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          padding: "1.5rem 1rem 5rem",
        }}
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          lang="he" dir="rtl"
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "clamp(1.4rem, 5vw, 2rem)",
            fontWeight: "var(--font-bold)",
            color: "white",
            textAlign: "center",
            margin: "0 0 0.25rem",
            textShadow: "0 2px 12px rgba(180,100,255,0.5)",
          }}
        >
          {"\u05D1\u05B0\u05BC\u05D7\u05B2\u05E8\u05B4\u05D9 \u05D0\u05B6\u05EA \u05D4\u05B7\u05D7\u05B2\u05D1\u05B5\u05E8\u05B8\u05D4 \u05E9\u05B6\u05BC\u05DC\u05B8\u05DA! \uD83C\uDF1F"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.2 }}
          lang="he" dir="rtl"
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "0.95rem",
            color: "rgba(255,255,255,0.7)",
            margin: "0 0 1.5rem",
            textAlign: "center",
          }}
        >
          {"\u05DC\u05B7\u05D7\u05B0\u05E6\u05B4\u05D9 \u05E2\u05B7\u05DC \u05D0\u05B8\u05D5\u05B8\u05D8\u05B8\u05E8 \u05DB\u05B0\u05BC\u05D3\u05B5\u05D9 \u05DC\u05B4\u05E8\u05B0\u05D0\u05D5\u05B9\u05EA \u05D0\u05D5\u05B9\u05EA\u05D5\u05B9!"}
        </motion.p>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.9rem",
          width: "100%",
          maxWidth: "480px",
        }}>
          {AVATAR_CONFIG.map((cfg, i) => {
            const isSelected = selectedAvatar === cfg.id;
            const AvatarComponent = cfg.component;
            return (
              <motion.div
                key={cfg.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 + i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
                onPointerDown={() => handleSelect(cfg.id, cfg.sfx)}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${cfg.color}33, ${cfg.color}22)`
                    : "rgba(255,255,255,0.07)",
                  border: isSelected
                    ? `2.5px solid ${cfg.color}`
                    : "2px solid rgba(255,255,255,0.12)",
                  borderRadius: "1.25rem",
                  padding: "0.75rem 0.5rem 0.5rem",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "0.4rem",
                  cursor: "pointer",
                  boxShadow: isSelected
                    ? `0 0 18px ${cfg.color}55, 0 4px 16px rgba(0,0,0,0.3)`
                    : "0 4px 12px rgba(0,0,0,0.2)",
                  transition: "border 0.2s, background 0.2s, box-shadow 0.2s",
                  position: "relative",
                  userSelect: "none",
                }}
              >
                {/* Selected badge */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: "absolute", top: "0.5rem", insetInlineStart: "0.5rem",
                      background: cfg.color, borderRadius: "50%",
                      width: 24, height: 24,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.9rem", zIndex: 2,
                    }}
                  >
                    {"\u2713"}
                  </motion.div>
                )}

                <AvatarComponent size={110} onClick={() => handleSelect(cfg.id, cfg.sfx)} />

                <p lang="he" dir="rtl" style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "1rem",
                  fontWeight: "var(--font-semibold)",
                  color: isSelected ? cfg.color : "rgba(255,255,255,0.85)",
                  margin: 0,
                  textAlign: "center",
                  lineHeight: "var(--leading-nikud)",
                }}>
                  {cfg.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          whileTap={{ scale: 0.94 }}
          lang="he" dir="rtl"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "2px solid rgba(255,255,255,0.3)",
            borderRadius: "var(--radius-xl)",
            padding: "0.9rem 2.5rem",
            fontFamily: "var(--font-primary)",
            fontSize: "1.1rem",
            fontWeight: "var(--font-bold)",
            color: "white",
            cursor: "pointer",
            minHeight: "var(--touch-preferred)",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {"\u05E1\u05B8\u05D2\u05D5\u05BC\u05E8 \u2713"}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
