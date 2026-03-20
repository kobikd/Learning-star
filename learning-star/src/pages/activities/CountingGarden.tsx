import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { GardenBackground }         from "../../components/activities/GardenBackground";
import { Flower, BloomBurst }        from "../../components/activities/Flower";
import { NumberRow }                 from "../../components/activities/NumberRow";
import { Butterfly, StreakBanner }   from "../../components/activities/Butterfly";
import { CatCharacter }              from "../../components/ui/CatCharacter";
import { SpeakButton }               from "../../components/ui/SpeakButton";
import { StarCounter }               from "../../components/ui/StarCounter";
import { SafeSpaceButton }           from "../../components/ui/SafeSpaceButton";
import { HEBREW_NUMBERS, speak }     from "../../utils/speak";
import {
  playFlowerTap, playCorrect, playStreakBonus,
  playTryAgain, playLevelUp, playBloom, playDemoPing, playButtonTap,
} from "../../audio/sfxPlayer";
import { useRewardStore }            from "../../stores/rewardStore";
import type { ScaffoldLevel }        from "../../components/activities/NumberRow";
import type { CatPose }              from "../../components/ui/CatCharacter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "counting" | "answering" | "correct" | "wrong" | "demo";

interface CountingGardenProps {
  onBack:       () => void;
  onSafeSpace:  () => void;
  onComplete?:  () => void;   // triggered on first streak-of-3 (for sticker award)
  initialLevel?: number;      // flower count 3–10, default 3
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTapOrders(count: number): number[] {
  return Array.from({ length: count }, () => 0);
}

const INSTRUCTION = "סִפְרִי אֶת הַפְּרָחִים!";

// ─── Back button ──────────────────────────────────────────────────────────────

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      onClick={() => { playButtonTap(); onBack(); }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label="חזרה למפת העולם"
      style={{
        minWidth: "var(--touch-min)", minHeight: "var(--touch-min)",
        background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)",
        border: "2px solid var(--border-default)", borderRadius: "var(--radius-md)",
        cursor: "pointer", fontSize: "1.3rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      ←
    </motion.button>
  );
}

// ─── Feedback overlay ─────────────────────────────────────────────────────────

function FeedbackOverlay({ phase }: { phase: Phase }) {
  if (phase !== "correct" && phase !== "wrong") return null;
  return (
    <motion.div
      key={phase}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      aria-live="assertive"
      dir="rtl" lang="he"
      style={{
        position: "fixed", top: "28%", left: "50%", transform: "translateX(-50%)",
        zIndex: 40, borderRadius: "var(--radius-xl)",
        padding: "1.2rem 2.5rem",
        backgroundColor: phase === "correct" ? "var(--color-success)" : "var(--color-try-again)",
        color: "white",
        fontFamily: "var(--font-primary)",
        fontSize: "var(--text-instruction)",
        fontWeight: "var(--font-bold)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        textAlign: "center", lineHeight: 1.6,
        pointerEvents: "none",
      }}
    >
      {phase === "correct" ? "!כָּל הַכָּבוֹד ✨" : "נְנַסֶּה יַחַד! 💛"}
    </motion.div>
  );
}

// ─── Bonus stars indicator ────────────────────────────────────────────────────

function BonusStars({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="bonus"
          initial={{ opacity: 0, y: -30, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.7 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          style={{
            position: "fixed", top: "18%", left: "50%", transform: "translateX(-50%)",
            zIndex: 45,
            background: "linear-gradient(135deg, #FFD700, #FFB347)",
            color: "white",
            borderRadius: "var(--radius-xl)",
            padding: "0.8rem 1.8rem",
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-instruction)",
            fontWeight: "var(--font-bold)",
            boxShadow: "0 4px 20px rgba(255,215,0,0.5)",
            pointerEvents: "none",
          }}
          dir="rtl" lang="he"
        >
          +3 כּוֹכָבִים! ⭐⭐⭐
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CountingGarden({
  onBack,
  onSafeSpace,
  onComplete,
  initialLevel = 3,
}: CountingGardenProps) {
  const { stars, recordCorrect, recordWrong } = useRewardStore();

  const [flowerCount,    setFlowerCount]    = useState(Math.max(3, Math.min(10, initialLevel)));
  const [tapOrders,      setTapOrders]      = useState<number[]>(() => buildTapOrders(initialLevel));
  const [nextTapNum,     setNextTapNum]     = useState(1);
  const [phase,          setPhase]          = useState<Phase>("counting");
  const [wrongAttempts,  setWrongAttempts]  = useState<ScaffoldLevel>(0);
  const [butterflyTrig,  setButterflyTrig]  = useState(0);
  const [showBloom,      setShowBloom]      = useState(false);
  const [showBonus,      setShowBonus]      = useState(false);
  const [autoHighlight,  setAutoHighlight]  = useState<number | null>(null);
  const [demoStep,       setDemoStep]       = useState(-1);
  const [catMessage,     setCatMessage]     = useState<string | undefined>(undefined);
  const [catPose,        setCatPose]        = useState<CatPose>("idle");
  const [catFunny,       setCatFunny]       = useState(false);

  const demoTimeouts      = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stickerTriggered  = useRef(false);   // only award sticker once per session

  // ── Clear all pending demo timeouts ──────────────────────────────────────
  const clearDemo = useCallback(() => {
    demoTimeouts.current.forEach(clearTimeout);
    demoTimeouts.current = [];
    setDemoStep(-1);
  }, []);

  // ── Tap a flower ──────────────────────────────────────────────────────────
  const handleFlowerTap = useCallback((index: number) => {
    if (phase !== "counting" && phase !== "answering") return;
    if (tapOrders[index] !== 0) return;

    const order = nextTapNum;
    setTapOrders(prev => { const a = [...prev]; a[index] = order; return a; });
    setNextTapNum(n => n + 1);
    playFlowerTap(order);
    speak(HEBREW_NUMBERS[order] ?? String(order), "number");
  }, [phase, tapOrders, nextTapNum]);

  // ── Handle answer selection ───────────────────────────────────────────────
  const handleAnswer = useCallback((selected: number) => {
    if (phase !== "counting" && phase !== "answering") return;

    if (selected === flowerCount) {
      // ── CORRECT ─────────────────────────────────────────────────────────
      clearDemo();
      setPhase("correct");
      playCorrect();
      speak("!כל הכבוד", "encouragement");
      setShowBloom(true);
      playBloom();

      // Record in store — handles star counting + streak bonus
      const { streakBonus } = recordCorrect();
      if (streakBonus) {
        playStreakBonus();
        setButterflyTrig(t => t + 1);
        setShowBonus(true);
        setTimeout(() => setShowBonus(false), 2400);
        setTimeout(() => speak("!שלוש ברצף — מדהים", "encouragement"), 600);

        // Award sticker once per session on first streak-of-3
        if (!stickerTriggered.current) {
          stickerTriggered.current = true;
          setTimeout(() => onComplete?.(), 3000);
        }
      }

      setCatPose("wave");
      setCatMessage("!כל הכבוד");
      setTimeout(() => setCatFunny(true),  300);
      setTimeout(() => setCatFunny(false), 900);

      setTimeout(() => {
        setShowBloom(false);
        setCatMessage(undefined);
        setWrongAttempts(0);
        setAutoHighlight(null);
        const nextCount = Math.min(flowerCount + 1, 10);
        if (nextCount > flowerCount) playLevelUp();
        setFlowerCount(nextCount);
        setTapOrders(buildTapOrders(nextCount));
        setNextTapNum(1);
        setPhase("counting");
        setCatPose("idle");
        speak(INSTRUCTION, "instruction");
      }, 2800);

    } else {
      // ── WRONG — never deduct stars, always encourage ──────────────────
      const newAttempts = (wrongAttempts + 1) as ScaffoldLevel;
      setWrongAttempts(newAttempts);
      setPhase("wrong");
      playTryAgain();
      recordWrong();   // resets store streak

      setCatPose("point-right");

      if (newAttempts === 1) {
        speak("נְנַסֶּה יַחַד!", "encouragement");
        setCatMessage("אֲנִי כָּאן אִתָּךְ! 💛");
      } else if (newAttempts === 2) {
        const answer = HEBREW_NUMBERS[flowerCount] ?? String(flowerCount);
        speak(`יֵשׁ כָּאן ${answer} פְּרָחִים. נְנַסֶּה שׁוּב יַחַד!`, "instruction");
        setCatMessage(`יֵשׁ ${answer} פְּרָחִים`);
      } else {
        runDemo();
      }

      setTimeout(() => setPhase(newAttempts >= 3 ? "demo" : "answering"), 700);
    }
  }, [phase, flowerCount, wrongAttempts, clearDemo, recordCorrect, recordWrong, onComplete]); // eslint-disable-line

  // ── Automatic demonstration ──────────────────────────────────────────────
  const runDemo = useCallback(() => {
    clearDemo();
    speak("בּוֹאִי נִסְפּוֹר יַחַד!", "instruction");
    setCatMessage("בּוֹאִי נִסְפּוֹר יַחַד!");
    setCatPose("idle");

    const resetOrders = buildTapOrders(flowerCount);
    setTapOrders(resetOrders);
    setNextTapNum(1);

    for (let i = 0; i < flowerCount; i++) {
      const t = setTimeout(() => {
        setDemoStep(i);
        setTapOrders(prev => { const a = [...prev]; a[i] = i + 1; return a; });
        setNextTapNum(i + 2);
        playDemoPing();
        speak(HEBREW_NUMBERS[i + 1] ?? String(i + 1), "number");
      }, 600 + i * 900);
      demoTimeouts.current.push(t);
    }

    const totalDelay = 600 + flowerCount * 900 + 400;
    const t1 = setTimeout(() => {
      setDemoStep(-1);
      setAutoHighlight(flowerCount);
      speak(HEBREW_NUMBERS[flowerCount] ?? String(flowerCount), "number");
      setCatMessage(`${HEBREW_NUMBERS[flowerCount]}!`);
      setCatPose("point-right");
    }, totalDelay);

    const t2 = setTimeout(() => {
      setAutoHighlight(null);
      handleAnswer(flowerCount);
    }, totalDelay + 1800);

    demoTimeouts.current.push(t1, t2);
  }, [flowerCount, clearDemo, handleAnswer]);

  useEffect(() => () => { clearDemo(); window.speechSynthesis?.cancel(); }, [clearDemo]);

  useEffect(() => {
    const t = setTimeout(() => speak(INSTRUCTION, "instruction"), 500);
    return () => clearTimeout(t);
  }, [flowerCount]);

  const scaffoldLevel  = phase === "demo" ? 3 : wrongAttempts;
  const isDisabled     = phase === "correct" || phase === "demo";
  const allCounted     = nextTapNum > flowerCount;
  const activeCatPose: CatPose = catPose !== "idle" ? catPose
    : allCounted && phase !== "correct" ? "point-right"
    : "idle";
  const activeCatMsg = catMessage
    ?? (allCounted && phase !== "correct" ? "!לַחְצִי עַל הַמִּסְפָּר" : undefined);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: "relative", minHeight: "100svh", width: "100%", overflow: "hidden" }}
    >
      <GardenBackground />

      <Butterfly    triggerCount={butterflyTrig} />
      <StreakBanner triggerCount={butterflyTrig} />

      <AnimatePresence>
        <FeedbackOverlay phase={phase} />
      </AnimatePresence>

      <BonusStars active={showBonus} />

      <div style={{ position: "fixed", top: "42%", left: "50%", zIndex: 30 }}>
        <BloomBurst active={showBloom} />
      </div>

      {/* ── Top bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.7rem 1.2rem",
          backgroundColor: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.6)",
          direction: "rtl",
        }}
      >
        <BackButton onBack={onBack} />
        <h1
          lang="he" dir="rtl"
          style={{
            flex: 1, margin: 0,
            fontFamily: "var(--font-primary)", fontSize: "var(--text-content)",
            fontWeight: "var(--font-bold)", color: "var(--color-success-light)",
            textShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          🌸 גַּן הַפְּרָחִים
        </h1>
        <StarCounter count={stars} compact />
      </motion.header>

      {/* ── Main content ── */}
      <main
        style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-start",
          minHeight: "100svh",
          paddingTop: "72px",
          paddingBottom: "8rem",
          gap: "0.75rem",
        }}
      >
        {/* Instruction */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            backgroundColor: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(8px)",
            borderRadius: "var(--radius-lg)",
            padding: "0.9rem 1.5rem",
            boxShadow: "var(--shadow-sm)",
            maxWidth: "90%",
          }}
        >
          <SpeakButton text={INSTRUCTION} iconOnly rate={0.78} />
          <p
            dir="rtl" lang="he"
            style={{
              margin: 0,
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-instruction)",
              fontWeight: "var(--font-semibold)",
              color: "var(--text-primary)",
              lineHeight: 1.8,
            }}
          >
            {INSTRUCTION} 🌸
          </p>
        </motion.div>

        {/* Flower bed + cat */}
        <div
          style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "center", gap: "1.5rem",
            flexWrap: "wrap",
            padding: "0 1rem",
            width: "100%",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 24 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              justifyContent: "center",
              alignItems: "flex-end",
              backgroundColor: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(4px)",
              borderRadius: "var(--radius-xl)",
              border: "2px solid rgba(255,255,255,0.7)",
              padding: "1.5rem 1.5rem 0.75rem",
              boxShadow: "0 4px 20px rgba(78,139,46,0.18)",
            }}
          >
            {tapOrders.map((order, i) => (
              <Flower
                key={`flower-${i}-${flowerCount}`}
                index={i}
                tapOrder={order}
                isDemo={demoStep === i}
                onTap={handleFlowerTap}
                size={Math.max(72, Math.min(100, 420 / flowerCount))}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CatCharacter
              size={140}
              pose={activeCatPose}
              speechBubble={activeCatMsg}
              doFunnyAnimation={catFunny}
            />
          </motion.div>
        </div>
      </main>

      {/* ── Number row — fixed bottom ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 10,
          backgroundColor: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(12px)",
          borderTop: "1.5px solid rgba(255,255,255,0.7)",
          padding: "0.75rem 1rem 1rem",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <p
          dir="rtl" lang="he"
          style={{
            margin: 0,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-label)",
            fontWeight: "var(--font-semibold)",
            color: "var(--text-secondary)",
          }}
        >
          כַּמָּה פְּרָחִים יֵשׁ?
        </p>
        <NumberRow
          correctAnswer={flowerCount}
          scaffoldLevel={scaffoldLevel as ScaffoldLevel}
          disabled={isDisabled}
          autoHighlight={autoHighlight}
          onSelect={handleAnswer}
        />
      </motion.div>

      <SafeSpaceButton onPress={onSafeSpace} position="bottom-end" />
    </motion.div>
  );
}
