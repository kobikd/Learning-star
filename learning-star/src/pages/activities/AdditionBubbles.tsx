import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { Bubble, BubbleBurst }       from "../../components/activities/Bubble";
import { Butterfly, StreakBanner }   from "../../components/activities/Butterfly";
import { CatCharacter }              from "../../components/ui/CatCharacter";
import { SpeakButton }               from "../../components/ui/SpeakButton";
import { StarCounter }               from "../../components/ui/StarCounter";
import { SafeSpaceButton }           from "../../components/ui/SafeSpaceButton";
import { HEBREW_NUMBERS, speak }     from "../../utils/speak";
import {
  playCorrect, playStreakBonus, playTryAgain,
  playLevelUp, playDemoPing, playButtonTap,
  playBubblePop,
} from "../../audio/sfxPlayer";
import { useRewardStore }            from "../../stores/rewardStore";
import type { CatPose }              from "../../components/ui/CatCharacter";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "instruction" | "answering" | "correct" | "wrong" | "demo";
type ScaffoldLevel = 0 | 1 | 2 | 3;

interface AdditionBubblesProps {
  onBack:       () => void;
  onSafeSpace:  () => void;
  initialLevel?: number;     // 1–5, default 1
}

interface Question {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDistractors(correct: number, count: number, max: number): number[] {
  const distractors = new Set<number>();
  // Prefer close numbers (±1, ±2)
  const candidates = [correct - 2, correct - 1, correct + 1, correct + 2]
    .filter(n => n > 0 && n <= max && n !== correct);
  for (const c of shuffle(candidates)) {
    if (distractors.size >= count) break;
    distractors.add(c);
  }
  // Fill remaining if needed
  let attempts = 0;
  while (distractors.size < count && attempts < 50) {
    const d = randInt(1, max);
    if (d !== correct) distractors.add(d);
    attempts++;
  }
  return [...distractors];
}

function generateQuestion(level: number): Question {
  let a: number, b: number, maxSum: number, numOptions: number;

  switch (level) {
    case 1:
      a = randInt(1, 3); b = randInt(1, Math.min(3, 5 - a));
      numOptions = 2; maxSum = 5; break;
    case 2:
      a = randInt(1, 5); b = randInt(1, Math.min(5, 7 - a));
      numOptions = 2; maxSum = 7; break;
    case 3:
      a = randInt(1, 7); b = randInt(1, Math.min(7, 10 - a));
      numOptions = 3; maxSum = 10; break;
    case 4:
      if (Math.random() < 0.4) { a = randInt(2, 5); b = a; }
      else { a = randInt(1, 9); b = randInt(1, Math.min(9, 10 - a)); }
      numOptions = 3; maxSum = 10; break;
    default: // level 5
      a = randInt(5, 9); b = randInt(Math.max(1, 11 - a), Math.min(9, 15 - a));
      numOptions = 3; maxSum = 15; break;
  }

  const answer = a + b;
  const distractors = generateDistractors(answer, numOptions - 1, maxSum);
  const options = shuffle([answer, ...distractors]);
  return { a, b, answer, options };
}

function hebrewNum(n: number): string {
  return HEBREW_NUMBERS[n] ?? String(n);
}

function buildInstruction(a: number, b: number): string {
  return `כַּמָּה זֶה ${hebrewNum(a)} וְעוֹד ${hebrewNum(b)}?`;
}

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

// ─── Bonus stars ──────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export function AdditionBubbles({
  onBack,
  onSafeSpace,
  initialLevel = 1,
}: AdditionBubblesProps) {
  const { stars, recordCorrect, recordWrong } = useRewardStore();

  const [level,          setLevel]          = useState(Math.max(1, Math.min(5, initialLevel)));
  const [question,       setQuestion]       = useState<Question>(() => generateQuestion(initialLevel));
  const [phase,          setPhase]          = useState<Phase>("answering");
  const [wrongAttempts,  setWrongAttempts]  = useState<ScaffoldLevel>(0);
  const [butterflyTrig,  setButterflyTrig]  = useState(0);
  const [showBurst,      setShowBurst]      = useState(false);
  const [showBonus,      setShowBonus]      = useState(false);
  const [poppedAnswer,   setPoppedAnswer]   = useState<number | null>(null);
  const [demoDotCountA,  setDemoDotCountA]  = useState(0);
  const [demoDotCountB,  setDemoDotCountB]  = useState(0);
  const [autoHighlight,  setAutoHighlight]  = useState<number | null>(null);
  const [catMessage,     setCatMessage]     = useState<string | undefined>(undefined);
  const [catPose,        setCatPose]        = useState<CatPose>("idle");
  const [catFunny,       setCatFunny]       = useState(false);

  // Adaptive tracking
  const consecutiveCorrectRef = useRef(0);
  const consecutiveWrongRef   = useRef(0);
  const totalCorrectRef       = useRef(0);
  const totalAttemptsRef      = useRef(0);

  const demoTimeouts     = useRef<ReturnType<typeof setTimeout>[]>([]);
  // ── Clear pending demo timeouts ──────────────────────────────────────────
  const clearDemo = useCallback(() => {
    demoTimeouts.current.forEach(clearTimeout);
    demoTimeouts.current = [];
    setDemoDotCountA(0);
    setDemoDotCountB(0);
    setAutoHighlight(null);
  }, []);

  // ── Start new question ───────────────────────────────────────────────────
  const newQuestion = useCallback((lvl: number) => {
    clearDemo();
    const q = generateQuestion(lvl);
    setQuestion(q);
    setPhase("instruction");
    setWrongAttempts(0);
    setPoppedAnswer(null);
    setShowBurst(false);
    setCatMessage(undefined);
    setCatPose("idle");

    const inst = buildInstruction(q.a, q.b);
    setTimeout(() => speak(inst, "instruction"), 300);
    setTimeout(() => setPhase("answering"), 1200);
  }, [clearDemo]);

  // ── Handle answer selection ──────────────────────────────────────────────
  const handleAnswer = useCallback((selected: number) => {
    if (phase !== "answering" && phase !== "demo") return;

    totalAttemptsRef.current++;

    if (selected === question.answer) {
      // ── CORRECT ─────────────────────────────────────────────────────────
      clearDemo();
      setPhase("correct");
      playCorrect();
      playBubblePop();
      speak("!כל הכבוד", "encouragement");
      setPoppedAnswer(selected);
      setShowBurst(true);

      totalCorrectRef.current++;
      consecutiveCorrectRef.current++;
      consecutiveWrongRef.current = 0;

      const { streakBonus } = recordCorrect();
      if (streakBonus) {
        playStreakBonus();
        setButterflyTrig(t => t + 1);
        setShowBonus(true);
        setTimeout(() => setShowBonus(false), 2400);
        setTimeout(() => speak("!שלוש ברצף — מדהים", "encouragement"), 600);

      }

      setCatPose("wave");
      setCatMessage("!כָּל הַכָּבוֹד");
      setTimeout(() => setCatFunny(true), 300);
      setTimeout(() => setCatFunny(false), 900);

      // Advance
      setTimeout(() => {
        setShowBurst(false);
        setPoppedAnswer(null);

        // Adaptive: level up if 5+ correct in a row, never exceed 5
        let nextLevel = level;
        if (consecutiveCorrectRef.current >= 5 && level < 5) {
          nextLevel = level + 1;
          playLevelUp();
        }
        setLevel(nextLevel);
        newQuestion(nextLevel);
      }, 2800);

    } else {
      // ── WRONG — encourage, never punish ─────────────────────────────────
      const newAttempts = Math.min(wrongAttempts + 1, 3) as ScaffoldLevel;
      setWrongAttempts(newAttempts);
      setPhase("wrong");
      playTryAgain();
      recordWrong();

      consecutiveCorrectRef.current = 0;
      consecutiveWrongRef.current++;

      setCatPose("point-right");

      if (newAttempts === 1) {
        speak("נְנַסֶּה יַחַד!", "encouragement");
        setCatMessage("אֲנִי כָּאן אִתָּךְ! 💛");
      } else if (newAttempts === 2) {
        const answerText = hebrewNum(question.answer);
        speak(`${hebrewNum(question.a)} וְעוֹד ${hebrewNum(question.b)} זֶה ${answerText}. נְנַסֶּה שׁוּב!`, "instruction");
        setCatMessage(`${hebrewNum(question.a)} + ${hebrewNum(question.b)} = ${answerText}`);
      } else {
        // Will run demo
      }

      setTimeout(() => {
        if (newAttempts >= 3) {
          setPhase("demo");
          runDemo();
        } else {
          setPhase("answering");
        }
      }, 700);
    }
  }, [phase, question, wrongAttempts, level, clearDemo, recordCorrect, recordWrong, newQuestion]); // eslint-disable-line

  // ── Demo: count dots step by step ────────────────────────────────────────
  const runDemo = useCallback(() => {
    clearDemo();
    speak("בּוֹאִי נִסְפּוֹר יַחַד!", "instruction");
    setCatMessage("בּוֹאִי נִסְפּוֹר יַחַד!");
    setCatPose("idle");

    const { a, b, answer } = question;

    // Count dots in bubble A (1..a)
    for (let i = 1; i <= a; i++) {
      const t = setTimeout(() => {
        setDemoDotCountA(i);
        playDemoPing();
        speak(hebrewNum(i), "number");
      }, 500 + (i - 1) * 800);
      demoTimeouts.current.push(t);
    }

    // Continue counting in bubble B (a+1..a+b)
    const bStart = 500 + a * 800 + 400;
    for (let i = 1; i <= b; i++) {
      const t = setTimeout(() => {
        setDemoDotCountB(i);
        playDemoPing();
        speak(hebrewNum(a + i), "number");
      }, bStart + (i - 1) * 800);
      demoTimeouts.current.push(t);
    }

    // Highlight correct answer
    const highlightTime = bStart + b * 800 + 400;
    const t1 = setTimeout(() => {
      setAutoHighlight(answer);
      speak(`${hebrewNum(answer)}!`, "number");
      setCatMessage(`${hebrewNum(answer)}!`);
      setCatPose("point-right");
    }, highlightTime);

    // Auto-select correct answer
    const t2 = setTimeout(() => {
      handleAnswer(answer);
    }, highlightTime + 1800);

    demoTimeouts.current.push(t1, t2);
  }, [question, clearDemo, handleAnswer]);

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => () => { clearDemo(); window.speechSynthesis?.cancel(); }, [clearDemo]);

  // ── Speak instruction on new question ────────────────────────────────────
  useEffect(() => {
    const inst = buildInstruction(question.a, question.b);
    const t = setTimeout(() => speak(inst, "instruction"), 500);
    return () => clearTimeout(t);
  }, [question.a, question.b]);

  // ── Derived state ────────────────────────────────────────────────────────
  const scaffoldLevel = phase === "demo" ? 3 : wrongAttempts;
  const isDisabled    = phase === "correct" || phase === "demo" || phase === "instruction";
  const showDots      = level <= 2 || phase === "demo";

  const instruction   = buildInstruction(question.a, question.b);

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
        <FeedbackOverlay phase={phase} />
      </AnimatePresence>

      <BonusStars active={showBonus} />

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
            fontWeight: "var(--font-bold)", color: "var(--color-math)",
            textShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          🫧 חִיבּוּר בּוּעוֹת
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
          paddingBottom: "2rem",
          gap: "1rem",
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
          <SpeakButton text={instruction} iconOnly rate={0.78} />
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
            {instruction}
          </p>
        </motion.div>

        {/* ── Equation row: [A] + [B] = [?] ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 24 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            padding: "1rem",
          }}
        >
          <Bubble
            value={question.a}
            variant="operand"
            size={100}
            showDots={showDots && phase === "demo"}
            dotCount={demoDotCountA}
            floatDelay={0}
          />

          <span
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-number, 48px)",
              fontWeight: "var(--font-bold)",
              color: "var(--color-math)",
              lineHeight: 1,
            }}
          >
            +
          </span>

          <Bubble
            value={question.b}
            variant="operand"
            size={100}
            showDots={showDots && phase === "demo"}
            dotCount={demoDotCountB}
            floatDelay={0.5}
          />

          <span
            style={{
              fontFamily: "var(--font-primary)",
              fontSize: "var(--text-number, 48px)",
              fontWeight: "var(--font-bold)",
              color: "var(--color-math)",
              lineHeight: 1,
            }}
          >
            =
          </span>

          <div style={{ position: "relative" }}>
            <Bubble
              value={question.answer}
              variant="question"
              size={100}
              popped={poppedAnswer === question.answer}
              floatDelay={1}
            />
            <BubbleBurst active={showBurst} />
          </div>
        </motion.div>

        {/* ── Cat character ── */}
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
            display: "flex",
            justifyContent: "center",
            gap: "1.2rem",
            flexWrap: "wrap",
            padding: "0 1rem",
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

          {question.options.map((opt, i) => (
            <Bubble
              key={`${question.a}-${question.b}-${opt}`}
              value={opt}
              variant="answer"
              size={90}
              showDots={showDots && !isDisabled}
              dotCount={opt}
              highlighted={autoHighlight === opt}
              dimmed={scaffoldLevel >= 1 && opt !== question.answer}
              disabled={isDisabled}
              popped={poppedAnswer === opt && opt === question.answer}
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
