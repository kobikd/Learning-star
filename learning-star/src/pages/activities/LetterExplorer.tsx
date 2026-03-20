import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { TracingDots }       from "../../components/activities/TracingDots";
import { CatCharacter }      from "../../components/ui/CatCharacter";
import { SafeSpaceButton }   from "../../components/ui/SafeSpaceButton";
import { SpeakButton }       from "../../components/ui/SpeakButton";
import { StarCounter }       from "../../components/ui/StarCounter";
import { LETTERS }           from "../../content/letters";
import { speak }             from "../../utils/speak";
import {
  playLetterReveal, playLetterTap, playCorrectChoice, playWrongChoice,
  playTraceComplete, playPhaseTransition, playLetterComplete,
} from "../../audio/sfxPlayer";
import { useRewardStore }     from "../../stores/rewardStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "see" | "hear" | "trace" | "connect" | "letter-complete";

interface LetterExplorerProps {
  onBack:       () => void;
  onSafeSpace:  () => void;
  onComplete?:  () => void;  // triggered when all letters completed
}

// ─── Phase step indicator ─────────────────────────────────────────────────────

const PHASE_LABELS: { id: Phase; label: string; emoji: string }[] = [
  { id: "see",     label: "רְאִי",  emoji: "👁️"  },
  { id: "hear",    label: "שִׁמְעִי", emoji: "👂"  },
  { id: "trace",   label: "כִּתְבִי",  emoji: "✏️" },
  { id: "connect", label: "חַבְּרִי", emoji: "🔗"  },
];

function PhaseBar({ phase }: { phase: Phase }) {
  const active = PHASE_LABELS.findIndex(p => p.id === phase);
  return (
    <div style={{
      display: "flex", gap: "0.35rem", alignItems: "center",
      direction: "rtl",
    }}>
      {PHASE_LABELS.map((p, i) => (
        <motion.div
          key={p.id}
          animate={{
            scale: i === active ? 1.12 : 0.95,
            backgroundColor: i < active
              ? "var(--color-success)"
              : i === active
                ? "var(--color-reading)"
                : "rgba(200,220,240,0.6)",
          }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex", alignItems: "center", gap: "0.3rem",
            borderRadius: "var(--radius-md)",
            padding: i === active ? "0.35rem 0.7rem" : "0.3rem 0.5rem",
            fontSize: i === active ? "var(--text-label)" : "0.85rem",
            fontWeight: "var(--font-bold)",
            fontFamily: "var(--font-primary)",
            color: i <= active ? "white" : "var(--text-secondary)",
            minHeight: "var(--touch-min)",
            minWidth: "var(--touch-min)",
            justifyContent: "center",
            boxShadow: i === active ? "0 3px 10px rgba(78,205,196,0.35)" : "none",
          }}
        >
          <span>{p.emoji}</span>
          {i === active && (
            <span dir="rtl" lang="he">{p.label}</span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Back button ──────────────────────────────────────────────────────────────

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      onClick={onBack}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label="חזרה למפת העולם"
      style={{
        minWidth: "var(--touch-min)", minHeight: "var(--touch-min)",
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
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

// ─── Reading background ───────────────────────────────────────────────────────

function ReadingBackground() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      background: "linear-gradient(160deg, #E8F8F5 0%, #D5EFF9 50%, #EFF5FF 100%)",
    }}>
      {/* Floating bokeh circles */}
      {[
        { size: 120, x: "10%",  y: "15%", color: "rgba(78,205,196,0.12)", dur: 7 },
        { size: 80,  x: "78%",  y: "8%",  color: "rgba(108,140,220,0.1)", dur: 9 },
        { size: 100, x: "55%",  y: "60%", color: "rgba(255,179,71,0.1)",  dur: 8 },
        { size: 60,  x: "20%",  y: "75%", color: "rgba(78,205,196,0.08)", dur: 11 },
      ].map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute", left: b.x, top: b.y,
            width: b.size, height: b.size, borderRadius: "50%",
            background: b.color, pointerEvents: "none",
          }}
          animate={{ y: [-8, 8, -8], scale: [1, 1.05, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Phase 1: SEE ─────────────────────────────────────────────────────────────

function PhaseSeeLetter({
  letterIndex,
  onNext,
}: {
  letterIndex: number;
  onNext: () => void;
}) {
  const letter = LETTERS[letterIndex];

  useEffect(() => {
    playLetterReveal();
    const t = setTimeout(() => speak(`הָאוֹת ${letter.nameTTS}`, "letter"), 450);
    return () => clearTimeout(t);
  }, [letter]);

  return (
    <motion.div
      key={`see-${letterIndex}`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "1.2rem", width: "100%", maxWidth: "480px",
      }}
    >
      {/* Giant letter card */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          boxShadow: `0 8px 40px rgba(78,205,196,0.22), 0 2px 8px rgba(0,0,0,0.08)`,
          border: `3px solid ${letter.color}`,
          padding: "1.5rem 2.5rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
          minWidth: "220px",
        }}
      >
        <span
          lang="he"
          style={{
            fontSize: "clamp(7rem, 20vw, 10rem)",
            lineHeight: 1.1,
            fontFamily: "var(--font-primary)",
            fontWeight: "var(--font-bold)",
            color: letter.color,
            filter: "drop-shadow(0 4px 12px rgba(78,205,196,0.3))",
          }}
        >
          {letter.charNikud}
        </span>

        <span
          lang="he" dir="rtl"
          style={{
            fontSize: "var(--text-instruction)",
            fontFamily: "var(--font-primary)",
            fontWeight: "var(--font-semibold)",
            color: "var(--text-secondary)",
            lineHeight: "var(--leading-nikud)",
          }}
        >
          {letter.name}
        </span>
      </motion.div>

      {/* Example word card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(8px)",
          borderRadius: "var(--radius-lg)",
          padding: "1rem 1.8rem",
          display: "flex", alignItems: "center", gap: "1rem",
          boxShadow: "var(--shadow-sm)",
          direction: "rtl",
        }}
      >
        <span style={{ fontSize: "3.5rem" }}>{letter.exampleEmoji}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span
            lang="he" dir="rtl"
            style={{
              fontSize: "var(--text-content)",
              fontFamily: "var(--font-primary)",
              fontWeight: "var(--font-bold)",
              color: "var(--text-primary)",
              lineHeight: "var(--leading-nikud)",
            }}
          >
            {letter.exampleWord}
          </span>
          <span
            lang="he" dir="rtl"
            style={{
              fontSize: "var(--text-label)",
              fontFamily: "var(--font-primary)",
              color: "var(--text-secondary)",
            }}
          >
            {letter.exampleMeaning}
          </span>
        </div>
        <SpeakButton
          text={`${letter.nameTTS} — ${letter.exampleWordTTS}`}
          iconOnly
          rate={0.78}
        />
      </motion.div>

      {/* Phoneme hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        lang="he" dir="rtl"
        style={{
          margin: 0, fontSize: "var(--text-body)",
          fontFamily: "var(--font-primary)", color: "var(--text-secondary)",
          lineHeight: "var(--leading-nikud)",
          textAlign: "center",
        }}
      >
        {letter.phoneme}
      </motion.p>

      {/* Next button */}
      <motion.button
        onClick={onNext}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        style={{
          backgroundColor: "var(--color-reading)",
          color: "white", border: "none",
          borderRadius: "var(--radius-md)",
          padding: "1rem 2.5rem",
          fontSize: "var(--text-button)",
          fontFamily: "var(--font-primary)",
          fontWeight: "var(--font-bold)",
          cursor: "pointer",
          minHeight: "var(--touch-preferred)",
          boxShadow: "0 4px 16px rgba(78,205,196,0.4)",
          direction: "rtl",
        }}
      >
        שָׁמַעְתִּי! ←
      </motion.button>
    </motion.div>
  );
}

// ─── Phase 2: HEAR ────────────────────────────────────────────────────────────

function PhaseHear({
  letterIndex,
  onNext,
}: {
  letterIndex: number;
  onNext: () => void;
}) {
  const letter = LETTERS[letterIndex];
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong,    setWrong]    = useState<string | null>(null);

  // Shuffle: target + 2 distractors, then randomize order
  const options = useRef<string[]>([]);
  if (options.current.length === 0) {
    const arr = [letter.char, ...letter.distractors];
    // Fisher-Yates shuffle (stable across re-renders via ref)
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    options.current = arr;
  }

  useEffect(() => {
    playPhaseTransition();
    const t = setTimeout(() => speak(`מִי הָאוֹת ${letter.nameTTS}? לַחְצִי עָלֶיהָ!`, "instruction"), 400);
    return () => clearTimeout(t);
  }, [letter]);

  const handleTap = useCallback((char: string) => {
    if (selected) return;
    if (char === letter.char) {
      setSelected(char);
      playCorrectChoice();
      speak("!נִפְלָא", "encouragement");
      setTimeout(onNext, 1400);
    } else {
      setWrong(char);
      playWrongChoice();
      playWrongChoice();
      speak("נְנַסֶּה יַחַד!", "encouragement");
      setTimeout(() => setWrong(null), 600);
    }
  }, [selected, letter, onNext]);

  return (
    <motion.div
      key={`hear-${letterIndex}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "1.5rem", width: "100%", maxWidth: "480px",
      }}
    >
      {/* Instruction */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-lg)", padding: "0.9rem 1.4rem",
        boxShadow: "var(--shadow-sm)", direction: "rtl",
      }}>
        <SpeakButton
          text={`מִי הָאוֹת ${letter.nameTTS}? לַחְצִי עָלֶיהָ!`}
          iconOnly rate={0.78}
        />
        <p lang="he" dir="rtl" style={{
          margin: 0, fontFamily: "var(--font-primary)",
          fontSize: "var(--text-instruction)", fontWeight: "var(--font-semibold)",
          color: "var(--text-primary)", lineHeight: "var(--leading-nikud)",
        }}>
          אֵיזוֹ אוֹת שָׁמַעְתְּ? 👂
        </p>
      </div>

      {/* Sound play button */}
      <motion.button
        onClick={() => { playLetterTap(); speak(letter.nameTTS, "letter"); }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        animate={{
          boxShadow: ["0 4px 16px rgba(78,205,196,0.35)", "0 4px 24px rgba(78,205,196,0.6)", "0 4px 16px rgba(78,205,196,0.35)"],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          width: "90px", height: "90px", borderRadius: "50%",
          background: "var(--color-reading)", border: "none",
          cursor: "pointer", fontSize: "2.4rem",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        aria-label={`הַשְׁמֵע את האות ${letter.nameTTS}`}
      >
        🔊
      </motion.button>

      {/* Letter choice buttons */}
      <div style={{
        display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center",
        direction: "rtl",
      }}>
        {options.current.map(char => {
          const isTarget  = char === letter.char;
          const isWrong   = char === wrong;
          const isCorrect = char === selected && isTarget;

          return (
            <motion.button
              key={char}
              onClick={() => handleTap(char)}
              whileTap={!selected ? { scale: 0.9 } : {}}
              whileHover={!selected ? { scale: 1.05, y: -3 } : {}}
              animate={
                isWrong   ? { x: [-6, 6, -5, 5, 0] } :
                isCorrect ? { scale: [1, 1.2, 1.1],
                  backgroundColor: ["var(--color-reading)", "var(--color-success)", "var(--color-success)"] } :
                {}
              }
              transition={{ duration: 0.35 }}
              style={{
                width: "clamp(90px,22vw,110px)",
                height: "clamp(90px,22vw,110px)",
                borderRadius: "var(--radius-lg)",
                backgroundColor: isCorrect
                  ? "var(--color-success)"
                  : "white",
                border: `3px solid ${
                  isCorrect ? "var(--color-success)"
                  : isWrong  ? "var(--color-try-again)"
                  : "var(--border-default)"
                }`,
                cursor: selected ? "default" : "pointer",
                fontSize: "clamp(3rem,10vw,4rem)",
                fontFamily: "var(--font-primary)",
                fontWeight: "var(--font-bold)",
                color: isCorrect ? "white" : "var(--text-primary)",
                lineHeight: "var(--leading-nikud)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                WebkitTapHighlightColor: "transparent",
              }}
              lang="he"
              aria-label={`אות ${char}`}
            >
              {char}
            </motion.button>
          );
        })}
      </div>

      {/* Correct feedback message */}
      <AnimatePresence>
        {selected && (
          <motion.p
            key="correct-msg"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            lang="he" dir="rtl"
            style={{
              margin: 0, fontSize: "var(--text-instruction)",
              fontFamily: "var(--font-primary)", fontWeight: "var(--font-bold)",
              color: "var(--color-success)",
            }}
          >
            ✨ נִפְלָא!
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Phase 3: TRACE ───────────────────────────────────────────────────────────

function PhaseTrace({
  letterIndex,
  onNext,
}: {
  letterIndex: number;
  onNext: () => void;
}) {
  const letter = LETTERS[letterIndex];
  const [traceMode,     setTraceMode]     = useState<"dots" | "choice">("dots");
  const [traceResetKey, setTraceResetKey] = useState(0);
  const [traceDone,     setTraceDone]     = useState(false);
  const [choiceWrong,   setChoiceWrong]   = useState<string | null>(null);
  const [choiceDone,    setChoiceDone]    = useState(false);

  // Distractors shuffled once
  const choices = useRef<string[]>([]);
  if (choices.current.length === 0) {
    const arr = [letter.char, ...letter.distractors];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    choices.current = arr;
  }

  useEffect(() => {
    const txt = traceMode === "dots"
      ? `עִקְבִי אַחֲרֵי הַנְּקֻדּוֹת לְפִי הַסֵּדֶר`
      : `אֵיזוֹ אוֹת זוֹ? לַחְצִי עָלֶיהָ!`;
    playPhaseTransition();
    const t = setTimeout(() => speak(txt, "instruction"), 400);
    return () => clearTimeout(t);
  }, [traceMode, letter]);

  const handleTraceDone = useCallback(() => {
    setTraceDone(true);
    playTraceComplete();
    speak("!כָּל הַכָּבוֹד", "encouragement");
    setTimeout(onNext, 1600);
  }, [onNext]);

  const handleChoiceTap = useCallback((char: string) => {
    if (choiceDone) return;
    if (char === letter.char) {
      setChoiceDone(true);
      playCorrectChoice();
      speak("!כָּל הַכָּבוֹד", "encouragement");
      setTimeout(onNext, 1400);
    } else {
      setChoiceWrong(char);
      playWrongChoice();
      speak("נְנַסֶּה יַחַד! 💛");
      setTimeout(() => setChoiceWrong(null), 600);
    }
  }, [choiceDone, letter, onNext]);

  return (
    <motion.div
      key={`trace-${letterIndex}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "1.2rem", width: "100%", maxWidth: "480px",
      }}
    >
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "0.6rem", direction: "rtl" }}>
        {(["dots", "choice"] as const).map(m => (
          <motion.button
            key={m}
            onClick={() => setTraceMode(m)}
            whileTap={{ scale: 0.93 }}
            animate={{
              backgroundColor: traceMode === m ? "var(--color-reading)" : "rgba(255,255,255,0.7)",
              color: traceMode === m ? "white" : "var(--text-secondary)",
            }}
            style={{
              padding: "0.5rem 1.1rem", border: "2px solid var(--color-reading)",
              borderRadius: "var(--radius-md)", cursor: "pointer",
              fontSize: "var(--text-body)", fontFamily: "var(--font-primary)",
              fontWeight: "var(--font-semibold)",
              minHeight: "var(--touch-min)", minWidth: "80px",
            }}
            lang="he" dir="rtl"
          >
            {m === "dots" ? "✏️ עִקְבִי" : "🔤 בְּחִירָה"}
          </motion.button>
        ))}
      </div>

      {/* Instruction */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-lg)", padding: "0.8rem 1.4rem",
        boxShadow: "var(--shadow-sm)", direction: "rtl",
      }}>
        <SpeakButton
          text={traceMode === "dots"
            ? `עִקְבִי אַחֲרֵי הַנְּקֻדּוֹת לְפִי הַסֵּדֶר`
            : `אֵיזוֹ אוֹת זוֹ?`}
          iconOnly rate={0.78}
        />
        <p lang="he" dir="rtl" style={{
          margin: 0, fontFamily: "var(--font-primary)",
          fontSize: "var(--text-instruction)", fontWeight: "var(--font-semibold)",
          color: "var(--text-primary)", lineHeight: "var(--leading-nikud)",
        }}>
          {traceMode === "dots"
            ? `עִקְבִי לְפִי הַסֵּדֶר ✏️`
            : `אֵיזוֹ אוֹת זוֹ? 🔤`
          }
        </p>
      </div>

      {/* Dots mode */}
      {traceMode === "dots" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: "white",
            borderRadius: "var(--radius-xl)",
            boxShadow: `0 6px 28px rgba(78,205,196,0.18)`,
            border: `2.5px solid var(--color-reading)`,
            padding: "0.5rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <TracingDots
            dots={letter.traceDots}
            letterChar={letter.char}
            onComplete={handleTraceDone}
            resetKey={traceResetKey}
          />
        </motion.div>
      )}

      {/* Choice mode */}
      {traceMode === "choice" && (
        <div style={{
          display: "flex", gap: "1rem", flexWrap: "wrap",
          justifyContent: "center", direction: "rtl",
        }}>
          {choices.current.map(char => {
            const isWrong   = char === choiceWrong;
            const isCorrect = choiceDone && char === letter.char;
            return (
              <motion.button
                key={char}
                onClick={() => handleChoiceTap(char)}
                whileTap={!choiceDone ? { scale: 0.9 } : {}}
                whileHover={!choiceDone ? { scale: 1.05, y: -3 } : {}}
                animate={
                  isWrong   ? { x: [-6, 6, -5, 5, 0] } :
                  isCorrect ? { scale: [1, 1.2, 1.1] } : {}
                }
                transition={{ duration: 0.35 }}
                style={{
                  width: "clamp(90px,22vw,110px)",
                  height: "clamp(90px,22vw,110px)",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: isCorrect ? "var(--color-success)" : "white",
                  border: `3px solid ${
                    isCorrect ? "var(--color-success)"
                    : isWrong  ? "var(--color-try-again)"
                    : "var(--border-default)"
                  }`,
                  cursor: choiceDone ? "default" : "pointer",
                  fontSize: "clamp(3rem,10vw,4rem)",
                  fontFamily: "var(--font-primary)",
                  fontWeight: "var(--font-bold)",
                  color: isCorrect ? "white" : "var(--text-primary)",
                  lineHeight: "var(--leading-nikud)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  WebkitTapHighlightColor: "transparent",
                }}
                lang="he" aria-label={`אות ${char}`}
              >
                {char}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Reset trace button */}
      {traceMode === "dots" && !traceDone && (
        <motion.button
          onClick={() => setTraceResetKey(k => k + 1)}
          whileTap={{ scale: 0.92 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            padding: "0.6rem 1.4rem",
            background: "rgba(255,255,255,0.7)",
            border: "1.5px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer", fontSize: "var(--text-body)",
            fontFamily: "var(--font-primary)",
            color: "var(--text-secondary)",
            minHeight: "var(--touch-min)",
          }}
          lang="he" dir="rtl"
        >
          🔄 נסי שוב
        </motion.button>
      )}

      {/* Done feedback */}
      <AnimatePresence>
        {(traceDone || choiceDone) && (
          <motion.p
            key="done"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            lang="he" dir="rtl"
            style={{
              margin: 0, fontSize: "var(--text-instruction)",
              fontFamily: "var(--font-primary)", fontWeight: "var(--font-bold)",
              color: "var(--color-success)",
            }}
          >
            🌟 כָּל הַכָּבוֹד!
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Phase 4: CONNECT (syllable animation) ───────────────────────────────────

function PhaseConnect({
  letterIndex,
  onNext,
}: {
  letterIndex: number;
  onNext: () => void;
}) {
  const letter = LETTERS[letterIndex];
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  // 0: letter alone  1: second letter slides in  2: syllable glows  3: done

  useEffect(() => {
    playPhaseTransition();
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => {
      setStep(2);
      speak(letter.syllableTTS, "syllable");
    }, 1700);
    const t3 = setTimeout(() => setStep(3), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [letter]);

  return (
    <motion.div
      key={`connect-${letterIndex}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "1.5rem", width: "100%", maxWidth: "480px",
      }}
    >
      {/* Instruction */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)",
          borderRadius: "var(--radius-lg)", padding: "0.8rem 1.4rem",
          boxShadow: "var(--shadow-sm)", direction: "rtl",
        }}
      >
        <p lang="he" dir="rtl" style={{
          margin: 0, fontFamily: "var(--font-primary)",
          fontSize: "var(--text-instruction)", fontWeight: "var(--font-semibold)",
          color: "var(--text-primary)", lineHeight: "var(--leading-nikud)",
        }}>
          הָאוֹת מִצְטָרֶפֶת! 🔗
        </p>
      </motion.div>

      {/* Animation area */}
      <div style={{
        background: "white",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 6px 32px rgba(78,205,196,0.2)",
        border: `2.5px solid rgba(78,205,196,0.4)`,
        padding: "2rem 3rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "0.5rem", minWidth: "280px", minHeight: "160px",
        direction: "rtl", position: "relative", overflow: "visible",
      }}>
        {step < 2 ? (
          <>
            {/* First letter */}
            <motion.span
              lang="he"
              animate={
                step === 1
                  ? { x: [0, -4, 0], scale: [1, 1.08, 1] }
                  : { scale: [1, 1.05, 1] }
              }
              transition={
                step === 1
                  ? { delay: 0.4, duration: 0.4, ease: "easeOut" }
                  : { duration: 2.5, repeat: Infinity }
              }
              style={{
                fontSize: "clamp(5rem,15vw,7rem)",
                fontFamily: "var(--font-primary)",
                fontWeight: "var(--font-bold)",
                color: letter.color,
                lineHeight: 1.1,
              }}
            >
              {letter.charNikud}
            </motion.span>

            {/* Second letter slides in from the start (RTL = right) */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.span
                  key="connect-char"
                  lang="he"
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
                  style={{
                    fontSize: "clamp(5rem,15vw,7rem)",
                    fontFamily: "var(--font-primary)",
                    fontWeight: "var(--font-bold)",
                    color: "var(--color-math)",
                    lineHeight: 1.1,
                  }}
                >
                  {letter.connectChar}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Merged syllable */
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <motion.span
              lang="he"
              animate={{ y: [0, -10, 0, -6, 0] }}
              transition={{ duration: 1.2, repeat: 2, ease: "easeInOut" }}
              style={{
                fontSize: "clamp(5.5rem,16vw,7.5rem)",
                fontFamily: "var(--font-primary)",
                fontWeight: "var(--font-bold)",
                lineHeight: 1.1,
                background: `linear-gradient(135deg, ${letter.color}, var(--color-math))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 6px rgba(78,205,196,0.4))",
              }}
            >
              {letter.syllable}
            </motion.span>
            <span lang="he" dir="rtl" style={{
              fontSize: "var(--text-body)",
              fontFamily: "var(--font-primary)",
              color: "var(--text-secondary)",
            }}>
              {letter.syllableMeaning}
            </span>
          </motion.div>
        )}
      </div>

      {/* Speak syllable + next button */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}
          >
            <SpeakButton
              text={letter.syllableTTS}
              rate={0.72}
            />
            <motion.button
              onClick={onNext}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.04 }}
              style={{
                backgroundColor: "var(--color-success)",
                color: "white", border: "none",
                borderRadius: "var(--radius-md)",
                padding: "1rem 2.2rem",
                fontSize: "var(--text-button)",
                fontFamily: "var(--font-primary)",
                fontWeight: "var(--font-bold)",
                cursor: "pointer",
                minHeight: "var(--touch-preferred)",
                boxShadow: "0 4px 16px rgba(107,203,119,0.4)",
                direction: "rtl",
              }}
            >
              {step === 3 ? "!יֶשׁ כּוֹכָב ⭐" : "הָלְאָה! ←"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Letter celebration overlay ───────────────────────────────────────────────

function LetterComplete({
  letterIndex,
  isLast,
  onNext,
}: {
  letterIndex: number;
  isLast: boolean;
  onNext: () => void;
}) {
  const letter = LETTERS[letterIndex];

  useEffect(() => {
    const msg = isLast
      ? `!סִיַּמְתְּ אֶת כָּל הָאוֹתִיּוֹת! כָּל הַכָּבוֹד`
      : `!כָּל הַכָּבוֹד! לָמַדְתְּ אֶת הָאוֹת ${letter.nameTTS}`;
    playLetterComplete();
    const t = setTimeout(() => speak(msg, "encouragement"), 400);
    return () => clearTimeout(t);
  }, [letter, isLast]);

  return (
    <motion.div
      key="letter-complete"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "1.5rem", width: "100%", maxWidth: "420px",
        background: "white",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 12px 48px rgba(107,203,119,0.25)",
        border: "3px solid var(--color-success)",
        padding: "2.5rem 2rem",
      }}
    >
      <motion.span
        animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.9, delay: 0.2 }}
        style={{ fontSize: "4rem" }}
      >
        {isLast ? "🏆" : "⭐"}
      </motion.span>

      <h2 lang="he" dir="rtl" style={{
        margin: 0, fontFamily: "var(--font-primary)",
        fontSize: "var(--text-title)", fontWeight: "var(--font-bold)",
        color: "var(--color-success)", textAlign: "center",
        lineHeight: "var(--leading-nikud)",
      }}>
        {isLast ? "!סִיַּמְתְּ הַכֹּל" : `!לָמַדְתְּ ${letter.name}`}
      </h2>

      <p lang="he" dir="rtl" style={{
        margin: 0, fontFamily: "var(--font-primary)",
        fontSize: "var(--text-instruction)", color: "var(--text-secondary)",
        textAlign: "center", lineHeight: "var(--leading-nikud)",
      }}>
        {isLast
          ? "אַתְּ מַדְהִימָה! לָמַדְתְּ אָלֶף, בֵּית, גִּימֶל!"
          : `הָאוֹת "${letter.char}" — ${letter.exampleWord} ${letter.exampleEmoji}`}
      </p>

      <motion.button
        onClick={onNext}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        style={{
          backgroundColor: isLast ? "var(--color-reading)" : "var(--color-success)",
          color: "white", border: "none",
          borderRadius: "var(--radius-md)",
          padding: "1rem 2.5rem",
          fontSize: "var(--text-button)",
          fontFamily: "var(--font-primary)",
          fontWeight: "var(--font-bold)",
          cursor: "pointer",
          minHeight: "var(--touch-preferred)",
          boxShadow: "0 4px 16px rgba(107,203,119,0.4)",
          direction: "rtl",
        }}
      >
        {isLast ? "חֲזָרָה לַמַּפָּה 🗺️" : "לָאוֹת הַבָּאָה! ←"}
      </motion.button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LetterExplorer({ onBack, onSafeSpace, onComplete }: LetterExplorerProps) {
  const [letterIndex, setLetterIndex] = useState(0);
  const [phase,       setPhase]       = useState<Phase>("see");
  const { stars, recordCorrect } = useRewardStore();
  const [catFunny,    setCatFunny]    = useState(false);

  const letter = LETTERS[letterIndex];
  const isLast = letterIndex === LETTERS.length - 1;

  const advancePhase = useCallback(() => {
    setPhase(prev => {
      if (prev === "see")     return "hear";
      if (prev === "hear")    return "trace";
      if (prev === "trace")   return "connect";
      if (prev === "connect") return "letter-complete";
      return prev;
    });
    if (phase === "connect") {
      recordCorrect();
      setCatFunny(true);
      setTimeout(() => setCatFunny(false), 900);
    }
  }, [phase, recordCorrect]);

  const handleLetterComplete = useCallback(() => {
    if (isLast) {
      onComplete?.();
    } else {
      setLetterIndex(i => i + 1);
      setPhase("see");
    }
  }, [isLast, onBack]);

  // Cat message per phase
  const catMessages: Partial<Record<Phase, string>> = {
    see:    `הָאוֹת ${letter.name}`,
    hear:   "שִׁמְעִי טוֹב!",
    trace:  "אַתְּ יְכוֹלָה!",
    connect: "!מַגִּיעַ לָךְ כּוֹכָב",
    "letter-complete": "!כָּל הַכָּבוֹד",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ position: "relative", minHeight: "100svh", width: "100%", overflow: "hidden" }}
    >
      <ReadingBackground />

      {/* ── Top bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.7rem 1.2rem",
          backgroundColor: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.6)",
          direction: "rtl",
        }}
      >
        <BackButton onBack={onBack} />
        <h1
          lang="he" dir="rtl"
          style={{
            margin: 0, fontFamily: "var(--font-primary)",
            fontSize: "var(--text-content)", fontWeight: "var(--font-bold)",
            color: "var(--color-reading)",
            textShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          📖 חוֹקֵר הָאוֹתִיּוֹת
        </h1>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {phase !== "letter-complete" && <PhaseBar phase={phase} />}
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
          paddingTop: "88px",
          paddingBottom: "6rem",
          gap: "1rem",
          paddingInline: "1rem",
        }}
      >
        {/* Letter progress dots */}
        {phase !== "letter-complete" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: "flex", gap: "0.6rem", direction: "rtl" }}
          >
            {LETTERS.map((l, i) => (
              <motion.div
                key={l.id}
                animate={{
                  scale: i === letterIndex ? 1.3 : 0.9,
                  backgroundColor: i < letterIndex
                    ? "var(--color-success)"
                    : i === letterIndex
                      ? "var(--color-reading)"
                      : "rgba(200,220,240,0.5)",
                }}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-body)", fontFamily: "var(--font-primary)",
                  fontWeight: "var(--font-bold)",
                  color: i <= letterIndex ? "white" : "var(--text-secondary)",
                  boxShadow: i === letterIndex ? "0 2px 10px rgba(78,205,196,0.5)" : "none",
                }}
                lang="he"
              >
                {l.char}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Phase content */}
        <AnimatePresence mode="wait">
          {phase === "see" && (
            <PhaseSeeLetter
              key={`see-${letterIndex}`}
              letterIndex={letterIndex}
              onNext={advancePhase}
            />
          )}
          {phase === "hear" && (
            <PhaseHear
              key={`hear-${letterIndex}`}
              letterIndex={letterIndex}
              onNext={advancePhase}
            />
          )}
          {phase === "trace" && (
            <PhaseTrace
              key={`trace-${letterIndex}`}
              letterIndex={letterIndex}
              onNext={advancePhase}
            />
          )}
          {phase === "connect" && (
            <PhaseConnect
              key={`connect-${letterIndex}`}
              letterIndex={letterIndex}
              onNext={advancePhase}
            />
          )}
          {phase === "letter-complete" && (
            <LetterComplete
              key={`complete-${letterIndex}`}
              letterIndex={letterIndex}
              isLast={isLast}
              onNext={handleLetterComplete}
            />
          )}
        </AnimatePresence>

        {/* Cat companion */}
        {phase !== "letter-complete" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              position: "fixed", bottom: "5.5rem",
              insetInlineEnd: "1rem",
              zIndex: 8,
            }}
          >
            <CatCharacter
              size={110}
              pose="idle"
              speechBubble={catMessages[phase]}
              doFunnyAnimation={catFunny}
            />
          </motion.div>
        )}
      </main>

      <SafeSpaceButton onPress={onSafeSpace} position="bottom-end" />
    </motion.div>
  );
}
