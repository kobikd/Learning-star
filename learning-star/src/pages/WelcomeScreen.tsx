import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { speak }             from "../utils/speak";
import { useWelcomeMusic }  from "../hooks/useWelcomeMusic";
import { BigButton }       from "../components/ui/BigButton";
import { SafeSpaceButton } from "../components/ui/SafeSpaceButton";
import { SkyBackground }   from "../components/ui/SkyBackground";
import { StarCounter }     from "../components/ui/StarCounter";
import { AVATAR_CONFIG }   from "../components/ui/avatars";
import { AvatarPicker }   from "../components/ui/AvatarPicker";
import { useAvatarStore } from "../stores/avatarStore";

// --- Types ---

interface WelcomeScreenProps {
  onNavigate: () => void;
  onSafeSpace: () => void;
  starCount?: number;
}

// --- Emoji burst ---

interface BurstEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

const BURST_EMOJIS = ["⭐", "💛", "🎉", "✨", "🌟", "💫"];

let emojiIdCounter = 0;

function EmojiParticle({ item, onDone }: { item: BurstEmoji; onDone: (id: number) => void }) {
  return (
    <motion.span
      initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: 0,
        x: (Math.random() - 0.5) * 120,
        y: -(40 + Math.random() * 80),
        scale: 1.6,
      }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onAnimationComplete={() => onDone(item.id)}
      aria-hidden
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        fontSize: "1.5rem",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 20,
      }}
    >
      {item.emoji}
    </motion.span>
  );
}

// --- Screen ---

export function WelcomeScreen({ onNavigate, onSafeSpace, starCount = 0 }: WelcomeScreenProps) {
  const [leaving, setLeaving] = useState(false);
  const { on: musicOn, toggle: toggleMusic } = useWelcomeMusic();

  useEffect(() => {
    let played = false;
    function tryPlay() {
      if (played) return;
      played = true;
      speak("הֵי גֶּפֶן! מַה שְּׁלוֹמֵךְ?", "encouragement");
    }
    const t = setTimeout(tryPlay, 800);
    function onFirstTap() {
      clearTimeout(t);
      setTimeout(tryPlay, 80);
      document.removeEventListener("pointerdown", onFirstTap);
    }
    document.addEventListener("pointerdown", onFirstTap);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onFirstTap);
    };
  }, []);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const { selectedAvatar } = useAvatarStore();
  const avatarCfg = AVATAR_CONFIG.find(a => a.id === selectedAvatar) ?? AVATAR_CONFIG[0];
  const SelectedAvatarComponent = avatarCfg.component;

  const [bursts, setBursts] = useState<BurstEmoji[]>([]);

  const handleStart = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
  }, [leaving]);

  const handleAvatarClick = useCallback(() => {
    const newEmojis: BurstEmoji[] = Array.from({ length: 5 }, () => ({
      id: emojiIdCounter++,
      emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
      x: 80 + Math.random() * 60,
      y: 50 + Math.random() * 80,
    }));
    setBursts((prev: BurstEmoji[]) => [...prev, ...newEmojis]);
  }, []);

  const removeEmoji = useCallback((id: number) => {
    setBursts((prev: BurstEmoji[]) => prev.filter((e: BurstEmoji) => e.id !== id));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (leaving) onNavigate();
      }}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem 1.5rem 3rem",
        overflow: "hidden",
      }}
    >
      <SkyBackground />

      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          insetInlineEnd: "1.25rem",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <motion.button
          onClick={toggleMusic}
          whileTap={{ scale: 0.88 }}
          aria-label={musicOn ? "השתק מוזיקה" : "הפעל מוזיקה"}
          data-music-toggle="true"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1.5px solid rgba(124,111,235,0.25)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            opacity: musicOn ? 1 : 0.5,
          }}
        >
          {musicOn ? "🎵" : "🔇"}
        </motion.button>
        <StarCounter count={starCount} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 220, damping: 26 }}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
          backgroundColor: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem 3rem 2.25rem",
          boxShadow: "0 8px 32px rgba(124,111,235,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          maxWidth: "420px",
          width: "100%",
          border: "1.5px solid rgba(255,255,255,0.8)",
        }}
      >
        <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
          <SelectedAvatarComponent
            size={180}
            onClick={handleAvatarClick}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAvatarPicker(true)}
            lang="he" dir="rtl"
            style={{
              background: "rgba(124,111,235,0.12)",
              border: "1.5px solid rgba(124,111,235,0.3)",
              borderRadius: "var(--radius-xl)",
              padding: "0.3rem 0.9rem",
              fontFamily: "var(--font-primary)",
              fontSize: "0.78rem",
              fontWeight: "var(--font-medium)",
              color: "var(--color-math)",
              cursor: "pointer",
            }}
          >
            🎭 שַׁנִּי אָוָטָר
          </motion.button>
          <AnimatePresence>
            {bursts.map((b: BurstEmoji) => (
              <EmojiParticle key={b.id} item={b} onDone={removeEmoji} />
            ))}
          </AnimatePresence>
        </div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 24 }}
          lang="he"
          dir="rtl"
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-title)",
            fontWeight: "var(--font-bold)",
            color: "var(--color-math)",
            lineHeight: 1.5,
            margin: 0,
            textAlign: "center",
            textShadow: "0 2px 12px rgba(124,111,235,0.25)",
          }}
        >
          הֵי גֶּפֶן! 👋
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          lang="he"
          dir="rtl"
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-content)",
            fontWeight: "var(--font-medium)",
            color: "var(--text-secondary)",
            lineHeight: 1.8,
            margin: 0,
            textAlign: "center",
          }}
        >
          מַה שְּׁלוֹמֵךְ? 😊
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, type: "spring", stiffness: 260, damping: 24 }}
          style={{ position: "relative", marginTop: "0.5rem" }}
        >
          <motion.div
            aria-hidden
            animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: "-8px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-math)",
              pointerEvents: "none",
            }}
          />
          <BigButton
            variant="math"
            onClick={handleStart}
            ariaLabel="בואי נתחיל ללמוד"
            block
          >
            בּוֹאִי נִתְחִיל! 🚀
          </BigButton>
        </motion.div>
      </motion.div>

      <SafeSpaceButton onPress={onSafeSpace} position="bottom-end" />

      {showAvatarPicker && (
        <AvatarPicker onClose={() => setShowAvatarPicker(false)} />
      )}
    </motion.div>
  );
}
