/**
 * Gafbon — גַּפְבּוֹן
 *
 * Addition + subtraction up to 20.
 * Named after Gefen (גפן) + חשבון (arithmetic).
 *
 * Follows the exact activity pattern from CLAUDE.md:
 *   Props: { onBack, onSafeSpace, onComplete, initialLevel? }
 *   Phase machine: 'answering' | 'correct' | 'wrong' | 'demo'
 *   Hooks: useAdaptive(skillId), useRewardStore(), sfxPlayer
 *   Scaffolding escalation: 3 wrong → dim → hint → demo
 */

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { CatCharacter }        from "../../components/ui/CatCharacter";
import { StarCounter }         from "../../components/ui/StarCounter";
import { SafeSpaceButton }     from "../../components/ui/SafeSpaceButton";
import { Butterfly, StreakBanner } from "../../components/activities/Butterfly";
import { useAdaptive }         from "../../hooks/useAdaptive";
import { useRewardStore }      from "../../stores/rewardStore";
import {
  playCorrect, playStreakBonus, playTryAgain,
  playDemoPing, playButtonTap,
} from "../../audio/sfxPlayer";
import { generateQuestion }    from "../../engine/gafbonQuestions";
import type { GafbonQuestion } from "../../engine/gafbonQuestions";
import type { CatPose }        from "../../components/ui/CatCharacter";
import { speak, stopVoice }    from "../../audio/voicePlayer";

// ─── Constants ───────────────────────────────────────────────────────────────

const SKILL_ID        = "gafbon";
const QUESTIONS_PER_SESSION = 7;

// Encouragement lines — warm, specific, with full nikud
const ENCOURAGEMENT_CORRECT = [
  "!כָּל הַכָּבוֹד",
  "!יוֹפִי, עָשִׂית אֶת זֶה",
  "!מְעוּלֶה",
  "!אַתְּ מַדְהִימָה",
  "!סָפַרְתְּ מְצוּיָן",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = "answering" | "correct" | "wrong" | "demo";

interface GafbonProps {
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
        transform: "translateX(50%)",  // RTL: positive = leftward = center
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
          style={{
            position: "fixed", top: "18%", insetInlineStart: "50%",
            transform: "translateX(50%)",
            zIndex: 45,
            background: "linear-gradient(135deg, #FFD700, #FFB347)",
            color: "white", borderRadius: "var(--radius-xl)",
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

// ─── Answer button ───────────────────────────────────────────────────────────

function AnswerButton({
  value, dimmed, highlighted, disabled, onClick,
}: {
  value: number;
  dimmed: boolean;
  highlighted: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const bg = highlighted
    ? "var(--color-success)"
    : dimmed
      ? "rgba(200,200,200,0.4)"
      : "var(--bg-secondary)";

  const border = highlighted
    ? "3px solid var(--color-success)"
    : "3px solid var(--color-math)";

  return (
    <motion.button
      onClick={() => { if (!disabled) onClick(); }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      disabled={disabled}
      aria-label={`תְּשׁוּבָה ${value}`}
      style={{
        minWidth: 80, minHeight: 80,
        fontSize: "var(--text-number, 48px)",
        fontFamily: "var(--font-primary)",
        fontWeight: "var(--font-bold)",
        padding: "20px 32px",
        margin: 8,
        background: bg,
        border,
        borderRadius: "var(--radius-xl)",
        color: highlighted ? "white" : "var(--text-primary)",
        cursor: disabled ? "default" : "pointer",
        opacity: dimmed ? 0.45 : 1,
        transition: "all 0.3s ease",
        touchAction: "manipulation",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        lineHeight: 1.2,
      }}
    >
      {value}
    </motion.button>
  );
}

// ─── Number line visualisation ───────────────────────────────────────────────

function NumberLine({
  max, a, b, op, showJumps, highlightAnswer,
}: {
  max: number;
  a: number;
  b: number;
  op: "add" | "sub";
  showJumps: boolean;
  highlightAnswer: boolean;
}) {
  const answer = op === "add" ? a + b : a - b;
  const ticks = Array.from({ length: max + 1 }, (_, i) => i);

  return (
    <div
      dir="ltr"
      style={{
        display: "flex", alignItems: "flex-end", gap: 0,
        padding: "0.5rem 1rem", overflowX: "auto",
        maxWidth: "95vw",
      }}
      aria-label={`קַו מִסְפָּרִים מ-0 עַד ${max}`}
    >
      {ticks.map(n => {
        const isA      = n === a;
        const isAnswer = n === answer;
        const inRange  = op === "add"
          ? n >= a && n <= answer
          : n >= answer && n <= a;

        return (
          <div
            key={n}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              minWidth: 28,
            }}
          >
            {/* Jump arc indicator */}
            {showJumps && inRange && n !== a && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  backgroundColor: "var(--color-math)",
                  marginBlockEnd: 4,
                }}
              />
            )}

            {/* Tick mark */}
            <div style={{
              width: 2, height: isA || (highlightAnswer && isAnswer) ? 24 : 14,
              backgroundColor: (highlightAnswer && isAnswer)
                ? "var(--color-success)"
                : isA ? "var(--color-math)" : "var(--text-light)",
              transition: "all 0.3s ease",
            }} />

            {/* Number label */}
            <span style={{
              fontFamily: "var(--font-primary)",
              fontSize: n % 5 === 0 || isA || isAnswer ? 14 : 11,
              fontWeight: isA || isAnswer ? 700 : 400,
              color: (highlightAnswer && isAnswer)
                ? "var(--color-success)"
                : isA ? "var(--color-math)" : "var(--text-light)",
              marginBlockStart: 2,
            }}>
              {n}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function Gafbon({
  onBack,
  onSafeSpace,
  onComplete,
  initialLevel = 1,
  onCorrectAnswer,
}: GafbonProps) {
  // ── Hooks ─────────────────────────────────────────────────────────────────
  const {
    currentLevel,
    recordAttempt,
  } = useAdaptive(SKILL_ID);

  const { stars, recordCorrect, recordWrong } = useRewardStore();

  // ── State ─────────────────────────────────────────────────────────────────
  const effectiveLevel = currentLevel || initialLevel;
  const [question,       setQuestion]       = useState<GafbonQuestion>(() => generateQuestion(effectiveLevel));
  const [phase,          setPhase]          = useState<Phase>("answering");
  const [wrongAttempts,  setWrongAttempts]  = useState(0);
  const [feedbackText,   setFeedbackText]   = useState("");
  const [showBonus,      setShowBonus]      = useState(false);
  const [butterflyTrig,  setButterflyTrig]  = useState(0);
  const [autoHighlight,  setAutoHighlight]  = useState<number | null>(null);
  const [catMessage,     setCatMessage]     = useState<string | undefined>(undefined);
  const [catPose,        setCatPose]        = useState<CatPose>("idle");
  const [catFunny,       setCatFunny]       = useState(false);
  const [showJumps,      setShowJumps]      = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);

  const demoTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef(Date.now());

  // ── Cleanup demo timeouts ─────────────────────────────────────────────────
  const clearDemo = useCallback(() => {
    demoTimeouts.current.forEach(clearTimeout);
    demoTimeouts.current = [];
    setAutoHighlight(null);
    setShowJumps(false);
  }, []);

  // ── Start new question ────────────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    clearDemo();
    const q = generateQuestion(effectiveLevel);
    setQuestion(q);
    setPhase("answering");
    setWrongAttempts(0);
    setFeedbackText("");
    setCatMessage(undefined);
    setCatPose("idle");
    setAutoHighlight(null);
    setShowJumps(false);
    startTimeRef.current = Date.now();

    // Narrate the question
    setTimeout(() => speak(q.hebrewText), 300);
  }, [effectiveLevel, clearDemo]);

  // ── Handle answer ─────────────────────────────────────────────────────────
  const handleAnswer = useCallback((selected: number) => {
    if (phase !== "answering" && phase !== "demo") return;

    const responseTime = Date.now() - startTimeRef.current;
    const correct = selected === question.answer;
    const scaffold = (phase === "demo" ? 3 : Math.min(wrongAttempts, 3)) as 0 | 1 | 2 | 3;

    // Record in adaptive engine
    recordAttempt({
      correct,
      responseTimeMs: responseTime,
      scaffoldLevel:  scaffold,
      hintsUsed:      wrongAttempts,
    });

    if (correct) {
      // ── CORRECT ───────────────────────────────────────────────────────
      clearDemo();
      setPhase("correct");
      playCorrect();

      const praise = pickRandom(ENCOURAGEMENT_CORRECT);
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
      // ── WRONG — encourage, never punish ───────────────────────────────
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      setPhase("wrong");
      playTryAgain();
      recordWrong();
      setCatPose("point-right");

      if (newAttempts === 1) {
        // Scaffold 1: dim wrong options, play tryAgain, show encouragement
        const msg = "!נַסִּי שׁוּב";
        setFeedbackText(msg);
        setCatMessage("אֲנִי כָּאן אִתָּךְ! 💛");
        speak("נַסִּי שׁוּב!");

        setTimeout(() => setPhase("answering"), 1200);

      } else if (newAttempts === 2) {
        // Scaffold 2: verbal hint + text pointing to correct answer
        const opText = question.op === "add" ? "וְעוֹד" : "פָּחוֹת";
        const hintText = `${question.a} ${opText} ${question.b} זֶה ${question.answer}. נְנַסֶּה שׁוּב!`;
        setFeedbackText(hintText);
        setCatMessage(hintText);
        setShowJumps(true);  // show number line jumps as visual hint
        speak(hintText);

        setTimeout(() => setPhase("answering"), 2500);

      } else {
        // Scaffold 3: demo phase — animate the full solution
        setFeedbackText("בּוֹאִי נִפְתּוֹר יַחַד!");
        speak("בּוֹאִי נִפְתּוֹר יַחַד!");
        setTimeout(() => {
          setPhase("demo");
          runDemo();
        }, 800);
      }
    }
  }, [phase, question, wrongAttempts, questionsCompleted, effectiveLevel, clearDemo, recordAttempt, recordCorrect, recordWrong, nextQuestion, onComplete]);

  // ── Demo: step-by-step animated solution ──────────────────────────────────
  const runDemo = useCallback(() => {
    clearDemo();
    setCatMessage("בּוֹאִי נִסְפּוֹר יַחַד!");
    setCatPose("idle");
    speak("בּוֹאִי נִסְפּוֹר יַחַד!");
    setShowJumps(true);

    const { a, b, answer, op } = question;

    // Count the jumps one by one
    const jumpCount = b;
    for (let i = 1; i <= jumpCount; i++) {
      const t = setTimeout(() => {
        const currentNum = op === "add" ? a + i : a - i;
        playDemoPing();
      }, 600 + (i - 1) * 900);
      demoTimeouts.current.push(t);
    }

    // Highlight the answer
    const highlightTime = 600 + jumpCount * 900 + 500;
    const t1 = setTimeout(() => {
      setAutoHighlight(answer);
      setCatMessage(`!${answer}`);
      setCatPose("point-right");
    }, highlightTime);

    // Auto-select the correct answer
    const t2 = setTimeout(() => {
      handleAnswer(answer);
    }, highlightTime + 1800);

    demoTimeouts.current.push(t1, t2);
  }, [question, clearDemo, handleAnswer]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    clearDemo();
  }, [clearDemo]);

  // ── Stop voice on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => stopVoice();
  }, [question.hebrewText]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const isDisabled = phase === "correct" || phase === "demo";
  const opSymbol   = question.op === "add" ? "+" : "−";
  const maxNumber  = question.op === "add" ? question.answer + 3 : question.a + 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "relative", minHeight: "100svh", width: "100%", overflow: "hidden",
        background: "linear-gradient(180deg, #F0F4FF 0%, #E8E5FC 50%, #FFF8F0 100%)",
      }}
    >
      <Butterfly    triggerCount={butterflyTrig} />
      <StreakBanner triggerCount={butterflyTrig} />

      <AnimatePresence>
        <FeedbackOverlay phase={phase} text={feedbackText} />
      </AnimatePresence>

      <BonusStars active={showBonus} />

      {/* ── Top bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          position: "fixed", top: 0, insetInlineStart: 0, insetInlineEnd: 0,
          zIndex: 10,
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.7rem 1.2rem",
          backgroundColor: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
          borderBlockEnd: "1px solid rgba(255,255,255,0.6)",
          direction: "rtl",
        }}
      >
        <BackButton onBack={onBack} />
        <h1
          lang="he" dir="rtl"
          style={{
            flex: 1, margin: 0,
            fontFamily: "var(--font-primary)", fontSize: "var(--text-content)",
            fontWeight: "var(--font-bold)", color: "var(--color-math)",
            textShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          🧮 גַּפְבּוֹן
        </h1>

        {/* Progress: stars showing questions completed */}
        <div
          dir="rtl" lang="he" aria-label={`שְׁאֵלָה ${questionsCompleted + 1} מִתּוֹךְ ${QUESTIONS_PER_SESSION}`}
          style={{
            fontFamily: "var(--font-primary)", fontSize: 14,
            color: "var(--text-light)",
          }}
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
        {/* Instruction row */}
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
            {question.hebrewText}
          </p>
        </motion.div>

        {/* ── Equation display: A ○ B = ? ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 24 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.6rem", flexWrap: "wrap", padding: "0.8rem",
          }}
        >
          {/* Operand A */}
          <motion.div style={{
            minWidth: 80, minHeight: 80,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(124,111,235,0.12)",
            borderRadius: "var(--radius-xl)",
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-number, 48px)",
            fontWeight: "var(--font-bold)",
            color: "var(--color-math)",
          }}>
            {question.a}
          </motion.div>

          {/* Operator */}
          <span style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-number, 48px)",
            fontWeight: "var(--font-bold)",
            color: "var(--color-math)",
            lineHeight: 1,
          }}>
            {opSymbol}
          </span>

          {/* Operand B */}
          <motion.div style={{
            minWidth: 80, minHeight: 80,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(124,111,235,0.12)",
            borderRadius: "var(--radius-xl)",
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-number, 48px)",
            fontWeight: "var(--font-bold)",
            color: "var(--color-math)",
          }}>
            {question.b}
          </motion.div>

          {/* Equals */}
          <span style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-number, 48px)",
            fontWeight: "var(--font-bold)",
            color: "var(--color-math)",
            lineHeight: 1,
          }}>
            =
          </span>

          {/* Question mark */}
          <motion.div
            animate={autoHighlight !== null ? { scale: [1, 1.1, 1] } : undefined}
            transition={{ duration: 0.5 }}
            style={{
              minWidth: 80, minHeight: 80,
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: autoHighlight !== null ? "var(--color-success)" : "var(--color-highlight)",
              borderRadius: "var(--radius-xl)",
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-number, 48px)",
              fontWeight: "var(--font-bold)",
              color: autoHighlight !== null ? "white" : "var(--text-primary)",
            }}
          >
            {autoHighlight !== null ? autoHighlight : "?"}
          </motion.div>
        </motion.div>

        {/* ── Number line (visual anchor) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: "var(--radius-lg)",
            padding: "0.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <NumberLine
            max={Math.min(20, maxNumber)}
            a={question.a}
            b={question.b}
            op={question.op}
            showJumps={showJumps || phase === "demo"}
            highlightAnswer={autoHighlight !== null}
          />
        </motion.div>

        {/* ── Cat character ── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CatCharacter
            size={120}
            pose={catPose}
            speechBubble={catMessage}
            doFunnyAnimation={catFunny}
          />
        </motion.div>

        {/* ── Answer buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: "0.5rem", padding: "0 1rem",
          }}
        >
          <p
            dir="rtl" lang="he"
            style={{
              width: "100%", textAlign: "center", margin: 0,
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-label)",
              fontWeight: "var(--font-semibold)",
              color: "var(--text-secondary)",
            }}
          >
            לַחְצִי עַל הַתְּשׁוּבָה:
          </p>

          <div style={{
            display: "flex", justifyContent: "center",
            gap: "1rem", flexWrap: "wrap",
          }}>
            {question.options.map(opt => (
              <AnswerButton
                key={`${question.a}-${question.b}-${question.op}-${opt}`}
                value={opt}
                dimmed={wrongAttempts >= 1 && opt !== question.answer}
                highlighted={autoHighlight === opt}
                disabled={isDisabled}
                onClick={() => handleAnswer(opt)}
              />
            ))}
          </div>
        </motion.div>
      </main>

      <SafeSpaceButton onPress={onSafeSpace} position="bottom-end" />
    </motion.div>
  );
}
