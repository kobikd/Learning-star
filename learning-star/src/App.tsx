import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { WelcomeScreen }      from "./pages/WelcomeScreen";
import { WorldMapScreen }     from "./pages/WorldMapScreen";
import { CountingGarden }     from "./pages/activities/CountingGarden";
import { LetterExplorer }     from "./pages/activities/LetterExplorer";
import { StickerAlbum }       from "./components/ui/StickerAlbum";
import { BreakScreen, EndOfDay } from "./pages/BreakScreen";
import { useRewardStore }     from "./stores/rewardStore";
import { useCurriculum }      from "./hooks/useAdaptive";
import { SafeSpace }           from "./pages/SafeSpace";
import { AdditionBubbles }     from "./pages/activities/AdditionBubbles";
import { Gafbon }               from "./pages/activities/Gafbon";
import { OceanSubtraction }     from "./pages/activities/OceanSubtraction";
import { playWelcomeChime }    from "./audio/welcomeChime";
import { RescueSession }       from "./components/rescue/RescueSession";
import { GAME_CONFIGS }        from "./engine/gameRegistry";
import "./index.css";

// Break timer: random between 10 and 15 minutes (ms)
function randomBreakDelay() {
  return (10 + Math.random() * 5) * 60 * 1000;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showAlbum,    setShowAlbum]    = useState(false);
  const [showBreak,    setShowBreak]    = useState(false);
  const [showEndOfDay, setShowEndOfDay] = useState(false);
  // ── Welcome chime — plays on first user gesture ──
  useEffect(() => {
    const handler = () => {
      playWelcomeChime();
      document.removeEventListener("pointerdown", handler);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);

  // Gamification
  const { stars, stickersEarned, markGameCompleted } = useRewardStore();

  // Curriculum engine
  const {
    getStartingLevel,
    startSession,
    finishSession,
    refresh: refreshCurriculum,
  } = useCurriculum();

  // ── Session tracking for BreakScreen ────────────────────────────────────
  const sessionActiveRef          = useRef(false);
  const sessionStartRef           = useRef<number>(Date.now());
  const starsAtSessionStartRef    = useRef(stars);
  const stickersAtSessionStartRef = useRef(stickersEarned.length);
  const breakTimerRef             = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startBreakTimer() {
    if (breakTimerRef.current) return;
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

  useEffect(() => () => clearBreakTimer(), []);

  // ── Derived session stats ────────────────────────────────────────────────
  const sessionStars    = stars - starsAtSessionStartRef.current;
  const sessionStickers = stickersEarned.length - stickersAtSessionStartRef.current;
  const sessionMinutes  = Math.max(
    1,
    Math.round((Date.now() - sessionStartRef.current) / 60_000)
  );

  // ── Start session tracking ───────────────────────────────────────────────
  function ensureSession() {
    if (!sessionActiveRef.current) {
      sessionActiveRef.current          = true;
      sessionStartRef.current           = Date.now();
      starsAtSessionStartRef.current    = stars;
      stickersAtSessionStartRef.current = stickersEarned.length;
      startBreakTimer();
    }
  }

  // ── Navigate to an activity ──────────────────────────────────────────────
  function enterActivity(route: string, subject: "math" | "reading") {
    startSession(subject);
    ensureSession();
    navigate(route);
  }

  // ── Back pressed inside activity ──────────────────────────────────────────
  function handleActivityBack() {
    markGameCompleted(location.pathname);   // record which game was finished
    finishSession();
    refreshCurriculum();
    navigate("/map");
  }

  // ── Session completed with reward (from RescueSession) ───────────────────
  function handleSessionComplete() {
    markGameCompleted(location.pathname);
    finishSession();
    refreshCurriculum();
    navigate("/map");
  }

  // ── Break screen handlers ────────────────────────────────────────────────
  function handleBreakContinue() {
    setShowBreak(false);
    clearBreakTimer();
    startBreakTimer();
    navigate("/map");
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
    navigate("/");
  }

  // ── Adaptive starting levels ──────────────────────────────────────────────
  const mathLevel     = getStartingLevel("counting-garden");
  const additionLevel = getStartingLevel("addition-activity");
  const gafbonLevel   = getStartingLevel("gafbon");
  const oceanSubLevel = getStartingLevel("sub_objects");

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} style={{ width: "100%" }}>
          <Routes location={location}>

            <Route path="/" element={
              <WelcomeScreen
                onNavigate={() => navigate("/map")}
                onSafeSpace={() => navigate("/safe-space")}
                starCount={stars}
              />
            } />

            <Route path="/map" element={
              <WorldMapScreen
                onSelectGame={(route) => {
                  const subject: "math" | "reading" =
                    route === "/reading" ? "reading" : "math";
                  enterActivity(route, subject);
                }}
                onSafeSpace={() => navigate("/safe-space")}
                onOpenAlbum={() => setShowAlbum(true)}
                starCount={stars}
                stickerCount={stickersEarned.length}
              />
            } />

            <Route path="/counting" element={
              GAME_CONFIGS["/counting"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/counting"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <CountingGarden
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      initialLevel={mathLevel}
                      onCorrectAnswer={onCorrectAnswer}
                      onComplete={onComplete}
                    />
                  )}
                </RescueSession>
              ) : (
                <CountingGarden
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                  initialLevel={mathLevel}
                />
              )
            } />

            <Route path="/addition" element={
              GAME_CONFIGS["/addition"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/addition"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <AdditionBubbles
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      initialLevel={additionLevel}
                      onCorrectAnswer={onCorrectAnswer}
                      onComplete={onComplete}
                    />
                  )}
                </RescueSession>
              ) : (
                <AdditionBubbles
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                  initialLevel={additionLevel}
                />
              )
            } />

            <Route path="/gafbon" element={
              GAME_CONFIGS["/gafbon"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/gafbon"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <Gafbon
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      onComplete={onComplete}
                      initialLevel={gafbonLevel}
                      onCorrectAnswer={onCorrectAnswer}
                    />
                  )}
                </RescueSession>
              ) : (
                <Gafbon
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                  onComplete={handleActivityBack}
                  initialLevel={gafbonLevel}
                />
              )
            } />

            <Route path="/subtraction" element={
              GAME_CONFIGS["/subtraction"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/subtraction"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <OceanSubtraction
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      onComplete={onComplete}
                      initialLevel={oceanSubLevel}
                      onCorrectAnswer={onCorrectAnswer}
                    />
                  )}
                </RescueSession>
              ) : (
                <OceanSubtraction
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                  onComplete={handleActivityBack}
                  initialLevel={oceanSubLevel}
                />
              )
            } />

            <Route path="/reading" element={
              GAME_CONFIGS["/reading"] ? (
                <RescueSession
                  config={GAME_CONFIGS["/reading"]}
                  onSessionComplete={handleSessionComplete}
                >
                  {({ onCorrectAnswer, onComplete }) => (
                    <LetterExplorer
                      onBack={handleActivityBack}
                      onSafeSpace={() => navigate("/safe-space")}
                      onCorrectAnswer={onCorrectAnswer}
                      onComplete={onComplete}
                    />
                  )}
                </RescueSession>
              ) : (
                <LetterExplorer
                  onBack={handleActivityBack}
                  onSafeSpace={() => navigate("/safe-space")}
                />
              )
            } />

            <Route path="/safe-space" element={
              <SafeSpace
                onBack={() => navigate("/map")}
              />
            } />

            {/* Fallback — redirect unknown paths to welcome */}
            <Route path="*" element={
              <WelcomeScreen
                onNavigate={() => navigate("/map")}
                onSafeSpace={() => navigate("/safe-space")}
                starCount={stars}
              />
            } />

          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* ── Sticker album (any screen) ── */}
      <AnimatePresence>
        {showAlbum && (
          <StickerAlbum key="album" onClose={() => setShowAlbum(false)} />
        )}
      </AnimatePresence>


      {/* ── Break screen ── */}
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
