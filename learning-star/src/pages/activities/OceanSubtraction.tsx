/**
 * OceanSubtraction — חִיסּוּר בַּיָּם
 *
 * Subtraction up to 20, using Template A (Ocean).
 *
 * Follows the exact activity pattern from CLAUDE.md:
 *   Props: { onBack, onSafeSpace, onComplete, initialLevel? }
 *   Phase machine: 'answering' | 'correct' | 'wrong' | 'demo'
 *   Hooks: useAdaptive(skillId), useRewardStore(), sfxPlayer
 *   Scaffolding: 3 wrong → dim → hint → demo (errorless learning)
 */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { CatCharacter }        from "../../components/ui/CatCharacter";
import { StarCounter }         from "../../components/ui/StarCounter";
import { SafeSpaceButton }     from "../../components/ui/SafeSpaceButton";
import { Butterfly, StreakBanner } from "../../components/activities/Butterfly";
import { OceanScene }          from "../../components/activities/OceanScene";
import { OceanBubble, SplashBurst } from "../../components/activities/OceanBubble";
import { useAdaptive }         from "../../hooks/useAdaptive";
import { useRewardStore }      from "../../stores/rewardStore";
import {
  playCorrect, playStreakBonus, playTryAgain,
  playDemoPing, playButtonTap,
} from "../../audio/sfxPlayer";
import { speak, stopVoice }    from "../../audio/voicePlayer";
import { generateSubtractionQuestion } from "../../engine/subtractionQuestions";
import type { SubtractionQuestion }    from "../../engine/subtractionQuestions";
import type { CatPose }        from "../../components/ui/CatCharacter";
import { HEBREW_NUMBERS }      from "../../utils/speak";

// ─── Constants ───────────────────────────────────────────────────────────────

const SKILL_ID              = "sub_objects";
const QUESTIONS_PER_SESSION = 7;

const ENCOURAGEMENT = [
  "!כָּל הַכָּבוֹד",
  "!יוֹפִי, עָשִׂית אֶת זֶה",
  "!מְעוּלֶה",
  "!אַתְּ מַדְהִימָה",
  "!אֵיזוֹ כוֹכָבָה",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hebrewNum(n: number): string {
  return HEBREW_NUMBERS[n] ?? String(n);
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "answering" | "correct" | "wrong" | "demo";

interface Props {
  onBack:       () => void;
  onSafeSpace:  () => void;
  onComplete:   () => void;
  initialLevel?: number;
  onCorrectAnswer?: () => void;
}

// ─── Back button ─────────────────────────────────────────────────────────────

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      onClick={() => { playButtonTap(); onBack(); }}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label="חֲזָרָה לְמַפַּת הָעוֹלָם"
      style={{
        minWidth: 48, minHeight: 48,
        background: "rgba(255,255,255,0.25)",
        backdropFilter: "blur(8px)",
        border: "2px solid rgba(255,255,255,0.3)",
        borderRadius: 12,
        cursor: "pointer",
        fontSize: "1.3rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
        color: "white",
      }}
    >
      ←
    </motion.button>
  );
}

// ─── Feedback overlay ────────────────────────────────────────────────────────

function FeedbackOverlay({ phase, text }: { phase: Phase; text: string }) {
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
        position: "fixed", top: "28%", insetInlineStart: "50%",
        transform: "translateX(50%)",
        zIndex: 40, borderRadius: 20,
        padding: "1.2rem 2.5rem",
        backgroundColor: phase === "correct" ? "#6BCB77" : "#FFA07A",
        color: "white",
        fontFamily: "var(--font-primary)",
        fontSize: "var(--text-instruction)",
        fontWeight: "var(--font-bold, 700)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        textAlign: "center", lineHeight: 1.6,
        pointerEvents: "none",
      }}
    >
      {text}
    </motion.div>
  );
}

// ─── Bonus stars overlay ─────────────────────────────────────────────────────

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
          dir="rtl" lang="he"
          style={{
            position: "fixed", top: "18%", insetInlineStart: "50%",
            transform: "translateX(50%)",
            zIndex: 45,
            background: "linear-gradient(135deg, #FFD700, #FFB347)",
            color: "white", borderRadius: 20,
            padding: "0.8rem 1.8rem",
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-instruction)",
            fontWeight: "var(--font-bold, 700)",
            boxShadow: "0 4px 20px rgba(255,215,0,0.5)",
            pointerEvents: "none",
          }}
        >
          +3 כּוֹכָבִים! ⭐⭐⭐
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function OceanSubtraction({
  onBack,
  onSafeSpace,
  onComplete,
  initialLevel = 1,
  onCorrectAnswer,
}: Props) {
  const { currentLevel, recordAttempt } = useAdaptive(SKILL_ID);
  const { stars, recordCorrect, recordWrong } = useRewardStore();

  const effectiveLevel = currentLevel || initialLevel;
  const [question,           setQuestion]           = useState<SubtractionQuestion>(() => generateSubtractionQuestion(effectiveLevel));
  const [phase,              setPhase]              = useState<Phase>("answering");
  const [wrongAttempts,      setWrongAttempts]      = useState(0);
  const [feedbackText,       setFeedbackText]       = useState("");
  const [showBonus,          setShowBonus]          = useState(false);
  const [butterflyTrig,      setButterflyTrig]      = useState(0);
  const [autoHighlight,      setAutoHighlight]      = useState<number | null>(null);
  const [showSplash,         setShowSplash]         = useState(false);
  const [catMessage,         setCatMessage]         = useState<string | undefined>(undefined);
  const [catPose,            setCatPose]            = useState<CatPose>("idle");
  const [catFunny,           setCatFunny]           = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);

  const demoTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef(Date.now());

  // ── Cleanup demo timeouts ─────────────────────────────────────────────────
  const clearDemo = useCallback(() => {
    demoTimeouts.current.forEach(clearTimeout);
    demoTimeouts.current = [];
    setAutoHighlight(null);
  }, []);

  // ── Start new question ────────────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    clearDemo();
    const q = generateSubtractionQuestion(effectiveLevel);
    setQuestion(q);
    setPhase("answering");
    setWrongAttempts(0);
    setFeedbackText("");
    setCatMessage(undefined);
    setCatPose("idle");
    setAutoHighlight(null);
    setShowSplash(false);
    startTimeRef.current = Date.now();

    setTimeout(() => speak(q.hebrewText), 300);
  }, [effectiveLevel, clearDemo]);

  // ── Handle answer ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback((selected: number) => {
    if (phase !== "answering" && phase !== "demo") return;

    const responseTime = Date.now() - startTimeRef.current;
    const correct = selected === question.answer;
    const scaffold = (phase === "demo" ? 3 : Math.min(wrongAttempts, 3)) as 0 | 1 | 2 | 3;

    recordAttempt({
      correct,
      responseTimeMs: responseTime,
      scaffoldLevel:  scaffold,
      hintsUsed:      wrongAttempts,
    });

    if (correct) {
      clearDemo();
      setPhase("correct");
      playCorrect();
      setShowSplash(true);
      setTimeout(() => setShowSplash(false), 800);

      const praise = pickRandom(ENCOURAGEMENT);
      setFeedbackText(`${praise} ✨`);
      speak(praise);

      setCatPose("wave");
      setCatMessage(praise);
      setTimeout(() => setCatFunny(true), 300);
      setTimeout(() => setCatFunny(false), 900);

      const { streakBonus } = recordCorrect();
      onCorrectAnswer?.();
      if (streakBonus) {
        playStreakBonus();
        setButterflyTrig(t => t + 1);
        setShowBonus(true);
        setTimeout(() => setShowBonus(false), 2400);
      }

      const completed = questionsCompleted + 1;
      setQuestionsCompleted(completed);

      setTimeout(() => {
        if (completed >= QUESTIONS_PER_SESSION) {
          setTimeout(() => onComplete(), 2000);
        } else {
          nextQuestion();
        }
      }, 2200);

    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setPhase("wrong");
      playTryAgain();
      recordWrong();
      setCatPose("point-right");

      if (newAttempts === 1) {
        const msg = "!נַסִּי שׁוּב";
        setFeedbackText(msg);
        setCatMessage("!אֲנִי כָּאן אִתָּךְ 💛");
        speak("נַסִּי שׁוּב!");
        setTimeout(() => setPhase("answering"), 1200);

      } else if (newAttempts === 2) {
        const hintText = `${hebrewNum(question.a)} פָּחוֹת ${hebrewNum(question.b)} זֶה ${hebrewNum(question.answer)}. נְנַסֶּה שׁוּב!`;
        setFeedbackText(hintText);
        setCatMessage(hintText);
        speak(hintText);
        setTimeout(() => setPhase("answering"), 2500);

      } else {
        setFeedbackText("!בּוֹאִי נִפְתּוֹר יַחַד");
        speak("בּוֹאִי נִפְתּוֹר יַחַד!");
        setTimeout(() => {
          setPhase("demo");
          runDemo();
        }, 800);
      }
    }
  }, [phase, question, wrongAttempts, questionsCompleted, clearDemo, recordAttempt, recordCorrect, recordWrong, nextQuestion, onComplete]);

  // ── Demo: step-by-step animated solution ──────────────────────────────────
  const runDemo = useCallback(() => {
    clearDemo();
    setCatMessage("!בּוֹאִי נִסְפּוֹר יַחַד");
    setCatPose("idle");
    speak("בּוֹאִי נִסְפּוֹר יַחַד!");

    const { a, b, answer } = question;

    // Count backwards from a, b times
    for (let i = 1; i <= b; i++) {
      const t = setTimeout(() => {
        playDemoPing();
        setCatMessage(`${hebrewNum(a - i)}`);
      }, 600 + (i - 1) * 900);
      demoTimeouts.current.push(t);
    }

    const highlightTime = 600 + b * 900 + 500;
    const t1 = setTimeout(() => {
      setAutoHighlight(answer);
      setCatMessage(`!${answer}`);
      setCatPose("point-right");
    }, highlightTime);

    const t2 = setTimeout(() => {
      handleAnswer(answer);
    }, highlightTime + 1800);

    demoTimeouts.current.push(t1, t2);
  }, [question, clearDemo, handleAnswer]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    clearDemo();
    stopVoice();
  }, [clearDemo]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const isDisabled = phase === "correct" || phase === "demo";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "relative", minHeight: "100svh", width: "100%", overflow: "hidden",
      }}
    >
      <OceanScene />
      <Butterfly    triggerCount={butterflyTrig} />
      <StreakBanner triggerCount={butterflyTrig} />

      <AnimatePresence>
        <FeedbackOverlay phase={phase} text={feedbackText} />
      </AnimatePresence>

      <BonusStars active={showBonus} />

      {/* ── Top bar (frosted blue glass) ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          position: "fixed", top: 0, insetInlineStart: 0, insetInlineEnd: 0,
          zIndex: 10,
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.7rem 1.2rem",
          backgroundColor: "rgba(43, 108, 176, 0.65)",
          backdropFilter: "blur(10px)",
          borderBlockEnd: "1px solid rgba(255,255,255,0.3)",
          direction: "rtl",
        }}
      >
        <BackButton onBack={onBack} />
        <h1
          lang="he" dir="rtl"
          style={{
            flex: 1, margin: 0,
            fontFamily: "var(--font-primary)", fontSize: "var(--text-content)",
            fontWeight: "var(--font-bold, 700)", color: "white",
            textShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        >
          🐠 חִיסּוּר בַּיָּם
        </h1>

        <div
          dir="rtl" lang="he"
          aria-label={`שְׁאֵלָה ${questionsCompleted + 1} מִתּוֹךְ ${QUESTIONS_PER_SESSION}`}
          style={{ fontFamily: "var(--font-primary)", fontSize: 14, color: "rgba(255,255,255,0.85)" }}
        >
          {"⭐".repeat(questionsCompleted)}{"☆".repeat(QUESTIONS_PER_SESSION - questionsCompleted)}
        </div>

        <StarCounter count={stars} compact />
      </motion.header>

      {/* ── Main content ── */}
      <main
        style={{
          position: "relative", zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-start",
          minHeight: "100svh",
          paddingBlockStart: "72px",
          paddingBlockEnd: "2rem",
          gap: "0.8rem",
        }}
      >
        {/* Instruction card (sandy) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            backgroundColor: "rgba(246, 230, 200, 0.85)",
            border: "2px solid rgba(246, 230, 200, 0.8)",
            borderRadius: 16,
            padding: "0.9rem 1.5rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            maxWidth: "90%",
          }}
        >
          <p
            dir="rtl" lang="he"
            style={{
              margin: 0,
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-instruction)",
              fontWeight: "var(--font-semibold, 600)",
              color: "var(--text-primary)",
              lineHeight: 1.8,
            }}
          >
            {question.hebrewText}
          </p>
        </motion.div>

        {/* ── Equation: A − B = ? ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 24 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.6rem", flexWrap: "wrap", padding: "0.8rem",
          }}
        >
          <OceanBubble value={question.a} variant="operand" floatDelay={0} />

          <span style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-number, 48px)",
            fontWeight: "var(--font-bold, 700)",
            color: "#FC8181",
            lineHeight: 1,
          }}>
            −
          </span>

          <OceanBubble value={question.b} variant="operand" floatDelay={0.5} />

          <span style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-number, 48px)",
            fontWeight: "var(--font-bold, 700)",
            color: "#FC8181",
            lineHeight: 1,
          }}>
            =
          </span>

          <div style={{ position: "relative" }}>
            <OceanBubble value="?" variant="question" />
            <SplashBurst active={showSplash} />
          </div>
        </motion.div>

        {/* ── Cat companion ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <CatCharacter
            size={130}
            pose={catPose}
            speechBubble={catMessage}
            doFunnyAnimation={catFunny}
          />
        </motion.div>

        {/* ── Answer bubbles ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{
            display: "flex", justifyContent: "center",
            gap: "1.2rem", flexWrap: "wrap", padding: "0 1rem",
          }}
        >
          <p
            dir="rtl" lang="he"
            style={{
              width: "100%", textAlign: "center", margin: 0,
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-semibold, 600)",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            לַחְצִי עַל הַתְּשׁוּבָה:
          </p>

          {question.options.map((opt, i) => (
            <OceanBubble
              key={`${question.a}-${question.b}-${opt}`}
              value={opt}
              variant="answer"
              highlighted={autoHighlight === opt}
              dimmed={wrongAttempts >= 1 && opt !== question.answer}
              disabled={isDisabled}
              onClick={() => handleAnswer(opt)}
              floatDelay={i * 0.3}
            />
          ))}
        </motion.div>
      </main>

      <SafeSpaceButton onPress={onSafeSpace} position="bottom-end" />
    </motion.div>
  );
}
