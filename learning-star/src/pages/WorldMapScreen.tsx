import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { OceanBackground }  from "../components/ui/OceanBackground";
import { IslandButton }     from "../components/ui/IslandButton";
import { CatCharacter }     from "../components/ui/CatCharacter";
import { StarCounter }      from "../components/ui/StarCounter";
import { SafeSpaceButton }  from "../components/ui/SafeSpaceButton";

import type { IslandSubject } from "../components/ui/IslandButton";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorldMapScreenProps {
  onSelectMath:    () => void;
  onSelectAddition: () => void;
  onSelectReading: () => void;
  onSafeSpace:     () => void;
  starCount?:      number;
  stickerCount?:   number;
  /** Which island the adaptive engine recommends right now */
  recommendedSubject?: IslandSubject;
  onOpenAlbum?:    () => void;
}

// ─── Sticker counter badge ────────────────────────────────────────────────────

function StickerBadge({ count, onOpen }: { count: number; onOpen?: () => void }) {
  return (
    <motion.button
      onClick={onOpen}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
      aria-label={`פתח אלבום מדבקות — ${count} מדבקות`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        backgroundColor: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-full)",
        padding: "0.4rem 0.9rem",
        boxShadow: "var(--shadow-sm)",
        fontFamily: "var(--font-primary)",
        fontSize: "var(--text-content)",
        fontWeight: "var(--font-bold)",
        color: "var(--color-games)",
        border: "1.5px solid rgba(255,179,71,0.3)",
        direction: "rtl",
        cursor: onOpen ? "pointer" : "default",
        minHeight: "var(--touch-min)",
      }}
    >
      <span aria-hidden>🏅</span>
      <span>{count}</span>
    </motion.button>
  );
}

// ─── Decorative treasure-map elements ────────────────────────────────────────

function TreasureDecor() {
  return (
    <>
      {/* Compass rose — bottom-right area */}
      <motion.div
        aria-hidden
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        style={{
          position: "fixed",
          bottom: "6%",
          insetInlineStart: "8%",   // right side in RTL
          fontSize: "2.5rem",
          opacity: 0.28,
          pointerEvents: "none",
          zIndex: 1,
          userSelect: "none",
        }}
      >
        🧭
      </motion.div>
      {/* Anchor */}
      <motion.div
        aria-hidden
        animate={{ y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
        style={{
          position: "fixed",
          top: "12%",
          insetInlineEnd: "6%",   // left side in RTL
          fontSize: "2rem",
          opacity: 0.22,
          pointerEvents: "none",
          zIndex: 1,
          userSelect: "none",
        }}
      >
        ⚓
      </motion.div>
      {/* Fish swimming */}
      <motion.div
        aria-hidden
        animate={{ x: ["0%", "5%", "0%"] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 2 }}
        style={{
          position: "fixed",
          bottom: "14%",
          insetInlineEnd: "12%",
          fontSize: "1.8rem",
          opacity: 0.30,
          pointerEvents: "none",
          zIndex: 1,
          userSelect: "none",
        }}
      >
        🐠
      </motion.div>
    </>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

/**
 * WorldMapScreen — adventure hub for choosing a learning subject.
 *
 * Layout (RTL physical positions):
 *   - Schedule panel: fixed physical LEFT edge
 *   - Top bar: stars (right) + stickers (left of stars)
 *   - Center: two islands + cat between/below them
 *   - SafeSpaceButton: bottom-right corner
 *   - Decorative elements scattered on the map
 *
 * Autism: layout is identical every session; no pop-ups or unexpected changes.
 * Dyspraxia: islands are 220px, generous touch targets; safe-space always reachable.
 */
export function WorldMapScreen({
  onSelectMath,
  onSelectAddition,
  onSelectReading,
  onSafeSpace,
  starCount = 0,
  stickerCount = 0,
  onOpenAlbum,
  recommendedSubject,
}: WorldMapScreenProps) {
  const [catFunny, setCatFunny] = useState(false);

  const handleCatClick = useCallback(() => {
    setCatFunny(true);
    setTimeout(() => setCatFunny(false), 600);
  }, []);

  // Speech bubble text depends on recommendation
  const catSpeech =
    recommendedSubject === "math"    ? "📍 נסי את אי המספרים!" :
    recommendedSubject === "reading" ? "📍 נסי את אי הסיפורים!" :
    "!בחרי איפה להתחיל 😊";

  // Cat pose: point toward the recommended island
  const catPose =
    recommendedSubject === "math"    ? "point-right" :
    recommendedSubject === "reading" ? "point-left"  :
    "idle";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: "relative", minHeight: "100svh", width: "100%", overflow: "hidden" }}
    >
      {/* Ocean background */}
      <OceanBackground />

      {/* Decorative map elements */}
      <TreasureDecor />

      {/* ── Top bar ───────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 28 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",   // in RTL → items at physical left
          gap: "1rem",
          padding: "0.75rem 1.25rem",
          backgroundColor: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.6)",
          direction: "rtl",
        }}
      >
        {/* Screen title */}
        <h1
          lang="he"
          dir="rtl"
          style={{
            flex: 1,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-instruction)",
            fontWeight: "var(--font-bold)",
            color: "var(--color-reading-dark)",
            margin: 0,
            textShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          🗺️ מַפַּת הַהַרְפַּתְקָאוֹת
        </h1>
        <StickerBadge count={stickerCount} onOpen={onOpenAlbum} />
        <StarCounter count={starCount} compact />
      </motion.header>

      {/* ── Main content ──────────────────────────────────── */}
      <main
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100svh",
          paddingTop: "80px",        // clear top bar
          paddingBottom: "1rem",
        }}
      >
        {/* Islands row */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 24 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "3rem",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          {/* Math island */}
          <IslandButton
            subject="math"
            name="אִי הַמִּסְפָּרִים"
            icon="🔢"
            activityCount={5}
            recommended={recommendedSubject === "math"}
            onClick={onSelectMath}
          />

          {/* Addition island */}
          <IslandButton
            subject="addition"
            name="חִיבּוּר בּוּעוֹת"
            icon="🫧"
            activityCount={5}
            recommended={recommendedSubject === "addition" as never}
            onClick={onSelectAddition}
          />

          {/* Reading island */}
          <IslandButton
            subject="reading"
            name="אִי הַסִּפּוּרִים"
            icon="📖"
            activityCount={7}
            recommended={recommendedSubject === "reading"}
            onClick={onSelectReading}
          />
        </motion.div>

        {/* Cat below the islands, pointing at recommendation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 220, damping: 22 }}
          style={{ marginTop: "1.5rem" }}
        >
          <CatCharacter
            size={155}
            pose={catPose}
            speechBubble={catSpeech}
            doFunnyAnimation={catFunny}
            onClick={handleCatClick}
          />
        </motion.div>
      </main>

      {/* Always-visible escape */}
      <SafeSpaceButton onPress={onSafeSpace} position="bottom-end" />
    </motion.div>
  );
}
