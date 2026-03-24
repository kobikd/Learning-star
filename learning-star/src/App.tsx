import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { WelcomeScreen }      from "./pages/WelcomeScreen";
import { WorldMapScreen }     from "./pages/WorldMapScreen";
import { CountingGarden }     from "./pages/activities/CountingGarden";
import { LetterExplorer }     from "./pages/activities/LetterExplorer";
import { StickerAward }       from "./components/feedback/StickerAward";
import { StickerAlbum }       from "./components/ui/StickerAlbum";
import { BreakScreen, EndOfDay } from "./pages/BreakScreen";
import { useRewardStore }     from "./stores/rewardStore";
import { useCurriculum }      from "./hooks/useAdaptive";
import { SafeSpace }           from "./pages/SafeSpace";
import { AdditionBubbles }     from "./pages/activities/AdditionBubbles";
import { playWelcomeChime }    from "./audio/welcomeChime";
import "./index.css";

type Screen = "welcome" | "world-map" | "math-activity" | "addition-activity" | "reading-activity" | "safe-space";

// Break timer: random between 10 and 15 minutes (ms)
function randomBreakDelay() {
  return (10 + Math.random() * 5) * 60 * 1000;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,       setScreen]       = useState<Screen>("welcome");
  const [showAlbum,    setShowAlbum]    = useState(false);
  const [showBreak,    setShowBreak]    = useState(false);
  const [showEndOfDay, setShowEndOfDay] = useState(false);
  const [awardSticker, setAwardSticker] = useState<
    ReturnType<ReturnType<typeof useRewardStore.getState>["earnNextSticker"]>
  >(null);

  // ── Welcome chime — plays on first user gesture (browsers block audio before it) ──
  useEffect(() => {
    const handler = () => {
      playWelcomeChime();
      document.removeEventListener("pointerdown", handler);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  // Gamification (stars, stickers) — Zustand with localStorage persistence
  const { stars, stickersEarned } = useRewardStore();

  // Curriculum engine — adaptive activity selection
  const {
    recommendedSubject,
    nextActivity,
    getStartingLevel,
    startSession,
    finishSession,
    refresh: refreshCurriculum,
  } = useCurriculum();

  // ── Session tracking for BreakScreen ────────────────────────────────────
  const sessionActiveRef         = useRef(false);
  const sessionStartRef          = useRef<number>(Date.now());
  const starsAtSessionStartRef   = useRef(stars);
  const stickersAtSessionStartRef = useRef(stickersEarned.length);
  const breakTimerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startBreakTimer() {
    if (breakTimerRef.current) return;           // already running
    breakTimerRef.current = setTimeout(() => {
      setShowBreak(true);
    }, randomBreakDelay());
  }

  function clearBreakTimer() {
    if (breakTimerRef.current) {
      clearTimeout(breakTimerRef.current);
      breakTimerRef.current = null;
    }
  }

  // Clear timer on unmount
  useEffect(() => () => clearBreakTimer(), []);

  // ── Derived session stats ────────────────────────────────────────────────
  const sessionStars    = stars - starsAtSessionStartRef.current;
  const sessionStickers = stickersEarned.length - stickersAtSessionStartRef.current;
  const sessionMinutes  = Math.max(
    1,
    Math.round((Date.now() - sessionStartRef.current) / 60_000)
  );

  // ── Navigate to an activity ──────────────────────────────────────────────
  function enterActivity(activityScreen: "math-activity" | "reading-activity") {
    const subject = activityScreen === "math-activity" ? "math" : "reading";
    startSession(subject);

    // Route to the curriculum-recommended math activity
    if (subject === "math" && nextActivity?.activityId === "addition-activity") {
      if (!sessionActiveRef.current) {
        sessionActiveRef.current          = true;
        sessionStartRef.current           = Date.now();
        starsAtSessionStartRef.current    = stars;
        stickersAtSessionStartRef.current = stickersEarned.length;
        startBreakTimer();
      }
      setScreen("addition-activity");
      return;
    }

    // Start break timer only on first activity in this session
    if (!sessionActiveRef.current) {
      sessionActiveRef.current         = true;
      sessionStartRef.current          = Date.now();
      starsAtSessionStartRef.current   = stars;
      stickersAtSessionStartRef.current = stickersEarned.length;
      startBreakTimer();
    }

    setScreen(activityScreen);
  }


  // ── Back pressed inside activity (partial session) ────────────────────────
  function handleActivityBack() {
    finishSession();
    refreshCurriculum();
    setScreen("world-map");
  }

  // ── Break screen handlers ────────────────────────────────────────────────
  function handleBreakContinue() {
    setShowBreak(false);
    clearBreakTimer();
    startBreakTimer();          // restart timer for next break
    setScreen("world-map");
  }

  function handleBreakFinish() {
    setShowBreak(false);
    clearBreakTimer();
    sessionActiveRef.current = false;
    setShowEndOfDay(true);
  }

  function handleEndOfDayDismiss() {
    setShowEndOfDay(false);
    starsAtSessionStartRef.current    = stars;
    stickersAtSessionStartRef.current = stickersEarned.length;
    setScreen("welcome");
  }

  // ── Adaptive starting levels ──────────────────────────────────────────────
  const mathLevel = getStartingLevel("counting-garden");
  const additionLevel = getStartingLevel("addition-activity");   // 3–10 flowers

  return (
    <>
      <AnimatePresence mode="wait">

        {screen === "welcome" && (
          <motion.div key="welcome" style={{ width: "100%" }}>
            <WelcomeScreen
              onNavigate={() => setScreen("world-map")}
              onSafeSpace={() => setScreen("safe-space")}
              starCount={stars}
            />
          </motion.div>
        )}

        {screen === "world-map" && (
          <WorldMapScreen
            key="world-map"
            onSelectMath={() => enterActivity("math-activity")}
            onSelectAddition={() => setScreen("addition-activity")}
            onSelectReading={() => enterActivity("reading-activity")}
            onSafeSpace={() => setScreen("safe-space")}
            onOpenAlbum={() => setShowAlbum(true)}
            starCount={stars}
            stickerCount={stickersEarned.length}
            recommendedSubject={recommendedSubject}
          />
        )}

        {screen === "math-activity" && (
          <CountingGarden
            key="counting-garden"
            onBack={handleActivityBack}
            onSafeSpace={() => setScreen("safe-space")}
            initialLevel={mathLevel}
          />
        )}

        {screen === "addition-activity" && (
          <AdditionBubbles
            key="addition-bubbles"
            onBack={handleActivityBack}
            onSafeSpace={() => setScreen("safe-space")}
            initialLevel={additionLevel}
          />
        )}

        {screen === "reading-activity" && (
          <LetterExplorer
            key="letter-explorer"
            onBack={handleActivityBack}
            onSafeSpace={() => setScreen("safe-space")}
          />
        )}

        {screen === "safe-space" && (
          <SafeSpace
            key="safe-space"
            onBack={handleActivityBack}
          />
        )}

      </AnimatePresence>

      {/* ── Sticker album (any screen) ── */}
      <AnimatePresence>
        {showAlbum && (
          <StickerAlbum key="album" onClose={() => setShowAlbum(false)} />
        )}
      </AnimatePresence>

      {/* ── Sticker award (after activity completes) ── */}
      <AnimatePresence>
        {awardSticker && (
          <StickerAward
            key="sticker-award"
            sticker={awardSticker}
            onDismiss={() => setAwardSticker(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Break screen (auto after 10–15 min) ── */}
      <AnimatePresence>
        {showBreak && (
          <BreakScreen
            key="break-screen"
            sessionStars={sessionStars}
            sessionStickers={sessionStickers}
            sessionMinutes={sessionMinutes}
            onContinue={handleBreakContinue}
            onFinish={handleBreakFinish}
          />
        )}
      </AnimatePresence>

      {/* ── End-of-day celebration ── */}
      <AnimatePresence>
        {showEndOfDay && (
          <EndOfDay
            key="end-of-day"
            sessionStars={sessionStars}
            sessionStickers={sessionStickers}
            onDismiss={handleEndOfDayDismiss}
          />
        )}
      </AnimatePresence>
    </>
  );
}
