import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { speak } from "../utils/speak";

// ─── Pre-computed assets ──────────────────────────────────────────────────────

const BREAK_STARS = Array.from({ length: 22 }, (_, i) => {
  const g = ((i + 3) * 1.6180339887) % 1;
  return {
    id:  i,
    x:   (g * 88 + 5),
    y:   (g * 36 + 2),  // top 38% only — rest is warm sky
    r:   1.0 + (i % 4) * 0.36,
    dur: 3.5 + (i % 5) * 0.55,
    del: (i * 0.33) % 3.8,
    col: i % 4 === 0 ? '#C8DFFF' : i % 7 === 0 ? '#FFF0AA' : 'rgba(255,255,255,0.82)',
  };
});

const CONFETTI = Array.from({ length: 20 }, (_, i) => {
  const g = ((i + 1) * 1.6180339887) % 1;
  return {
    id:    i,
    x:     g * 86 + 7,
    driftX: (i % 2 === 0 ? 1 : -1) * (18 + g * 28),
    delay:  g * 2.8,
    dur:    4 + g * 2,
    emoji: ['⭐', '✨', '🌟', '💫', '🎉', '💛', '🎊'][i % 7],
    size:  1.3 + g * 1.1,
  };
});

// ─── Twilight sky ─────────────────────────────────────────────────────────────

function TwilightSky() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse at 50% 35%, rgba(100,60,180,0.14) 0%, transparent 55%),
          linear-gradient(180deg,
            #08061E 0%,
            #14104A 18%,
            #2C1A70 36%,
            #5E3082 52%,
            #9A4870 64%,
            #C86040 74%,
            #E48A40 84%,
            #F5B060 92%,
            #F8C880 100%)
        `,
      }}
    >
      {/* Stars — visible only in the dark upper sky */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {BREAK_STARS.map(s => (
          <motion.circle
            key={s.id}
            cx={`${s.x}%`} cy={`${s.y}%`} r={s.r}
            fill={s.col}
            animate={{ opacity: [0.2, 0.85, 0.2], r: [s.r, s.r * 1.4, s.r] }}
            transition={{ duration: s.dur, delay: s.del, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* Moon low on the horizon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.8 }}
        style={{
          position: "absolute",
          top: "18%",
          insetInlineEnd: "8%",
          pointerEvents: "none",
        }}
      >
        <svg viewBox="0 0 60 60" width="52" aria-hidden>
          <defs>
            <filter id="breakMoonGlow">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d="M40,10 A22,22 0 1,0 40,50 A14,14 0 1,1 40,10 Z"
            fill="rgba(255,240,170,0.85)" filter="url(#breakMoonGlow)" />
        </svg>
      </motion.div>

      {/* Warm horizon haze */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: "linear-gradient(180deg, transparent 0%, rgba(240,130,50,0.12) 60%, rgba(248,180,80,0.2) 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─── Resting cat on a cloud ───────────────────────────────────────────────────

function RestingCat() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-block" }}
    >
      <svg viewBox="0 0 220 240" width="190" height="210" aria-label="חתול נח" aria-hidden>
        {/* Cloud */}
        <ellipse cx="110" cy="220" rx="90" ry="22" fill="rgba(255,255,255,0.65)" />
        <ellipse cx="75"  cy="214" rx="38" ry="16" fill="rgba(255,255,255,0.55)" />
        <ellipse cx="145" cy="214" rx="38" ry="16" fill="rgba(255,255,255,0.55)" />
        <ellipse cx="110" cy="210" rx="65" ry="20" fill="rgba(255,255,255,0.7)" />

        {/* Body — sitting upright */}
        <ellipse cx="110" cy="175" rx="55" ry="48" fill="#C9A87A" />

        {/* Tail to the side */}
        <path d="M 155,198 Q 192,188 188,162 Q 182,140 168,144"
          stroke="#C9A87A" strokeWidth="14" fill="none" strokeLinecap="round" />

        {/* Head */}
        <circle cx="110" cy="106" r="54" fill="#C9A87A" />

        {/* Ears */}
        <polygon points="72,65  56,34  90,60" fill="#C9A87A" />
        <polygon points="148,65 164,34 130,60" fill="#C9A87A" />
        <polygon points="74,63  62,42  88,60" fill="#E8A8A8" opacity="0.65" />
        <polygon points="146,63 158,44 132,60" fill="#E8A8A8" opacity="0.65" />

        {/* Happy squinting eyes — content crescents pointing UP */}
        <path d="M 78,108 Q 88,100 98,108"
          stroke="#6B4A30" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 122,108 Q 132,100 142,108"
          stroke="#6B4A30" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Rosy cheeks */}
        <ellipse cx="82"  cy="120" rx="11" ry="7" fill="rgba(230,140,130,0.28)" />
        <ellipse cx="138" cy="120" rx="11" ry="7" fill="rgba(230,140,130,0.28)" />

        {/* Nose */}
        <ellipse cx="110" cy="120" rx="5" ry="3.5" fill="#E8A8A8" />

        {/* Small smile */}
        <path d="M 102,128 Q 110,136 118,128"
          stroke="#6B4A30" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Whiskers */}
        {[["62,114","92,118"],["64,124","92,124"],["128,118","158,114"],["128,124","156,124"]].map(([p1, p2], i) => (
          <line key={i}
            x1={p1.split(",")[0]} y1={p1.split(",")[1]}
            x2={p2.split(",")[0]} y2={p2.split(",")[1]}
            stroke="#6B4A30" strokeWidth="1.5" opacity="0.4"
          />
        ))}

        {/* Front paws */}
        <ellipse cx="88"  cy="208" rx="22" ry="13" fill="#B89560" />
        <ellipse cx="132" cy="208" rx="22" ry="13" fill="#B89560" />

        {/* Paw lines */}
        {[-6,0,6].map(dx => (
          <line key={dx}
            x1={88+dx} y1="213" x2={88+dx} y2="218"
            stroke="#A07840" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
          />
        ))}
        {[-6,0,6].map(dx => (
          <line key={dx}
            x1={132+dx} y1="213" x2={132+dx} y2="218"
            stroke="#A07840" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"
          />
        ))}
      </svg>
    </motion.div>
  );
}

// ─── Session summary card ─────────────────────────────────────────────────────

function SessionSummaryCard({
  stars,
  stickers,
  minutes,
}: {
  stars:    number;
  stickers: number;
  minutes:  number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.7, type: "spring", stiffness: 220, damping: 22 }}
      style={{
        background: "rgba(255,255,255,0.18)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1.5px solid rgba(255,255,255,0.35)",
        borderRadius: "var(--radius-xl)",
        padding: "1rem 1.8rem",
        display: "flex",
        gap: "1.8rem",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        flexWrap: "wrap",
      }}
    >
      {[
        { emoji: "⭐", value: `+${stars}`, label: "כּוֹכָבִים" },
        { emoji: "🏅", value: String(stickers), label: "מַדְבֵּקוֹת" },
        { emoji: "⏱", value: String(minutes), label: "דַּקּוֹת" },
      ].map(item => (
        <div key={item.label} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.1rem",
        }}>
          <span style={{ fontSize: "1.8rem" }}>{item.emoji}</span>
          <span style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-number)",
            fontWeight: "var(--font-bold)",
            color: "white",
            lineHeight: 1,
            textShadow: "0 2px 8px rgba(0,0,0,0.35)",
          }}>{item.value}</span>
          <span lang="he" style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-body)",
            color: "rgba(255,255,255,0.85)",
            lineHeight: "var(--leading-nikud)",
          }}>{item.label}</span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── BreakScreen ──────────────────────────────────────────────────────────────

interface BreakScreenProps {
  sessionStars:    number;
  sessionStickers: number;
  sessionMinutes:  number;
  onContinue:      () => void;
  onFinish:        () => void;
}

export function BreakScreen({
  sessionStars,
  sessionStickers,
  sessionMinutes,
  onContinue,
  onFinish,
}: BreakScreenProps) {
  useEffect(() => {
    const t = setTimeout(
      () => speak("יוֹפִי! עָשִׂית עֲבוֹדָה נֶהֱדֶרֶת! אֵיךְ אַתְּ מַרְגִּישָׁה?", "instruction"),
      800
    );
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      key="break-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column" }}
    >
      <TwilightSky />

      <main style={{
        position: "relative", zIndex: 2,
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "1.4rem",
        padding: "1.5rem 1.2rem 2rem",
      }}>

        {/* Resting cat */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 22 }}
        >
          <RestingCat />
        </motion.div>

        {/* Main praise text */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          style={{
            textAlign: "center",
            background: "rgba(255,255,255,0.14)",
            backdropFilter: "blur(10px)",
            borderRadius: "var(--radius-xl)",
            padding: "1rem 2rem",
            border: "1px solid rgba(255,255,255,0.28)",
          }}
        >
          <h1 lang="he" dir="rtl" style={{
            margin: 0,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-title)",
            fontWeight: "var(--font-bold)",
            color: "white",
            lineHeight: "var(--leading-nikud)",
            textShadow: "0 2px 12px rgba(0,0,0,0.35)",
          }}>
            יוֹפִי! עָשִׂית עֲבוֹדָה נֶהֱדֶרֶת! 🌟
          </h1>
          <p lang="he" dir="rtl" style={{
            margin: "0.4rem 0 0",
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-instruction)",
            color: "rgba(255,255,255,0.85)",
            lineHeight: "var(--leading-nikud)",
          }}>
            אוּלַי זֶה הַזְּמַן לִנְשׁוֹם וְלִנּוּחַ קְצָת
          </p>
        </motion.div>

        {/* Session summary */}
        <SessionSummaryCard
          stars={sessionStars}
          stickers={sessionStickers}
          minutes={sessionMinutes}
        />

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          style={{
            display: "flex", flexDirection: "column",
            gap: "0.9rem", width: "100%", maxWidth: "380px",
          }}
        >
          {/* Continue */}
          <motion.button
            onClick={onContinue}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            style={{
              backgroundColor: "var(--color-reading)",
              color: "white", border: "none",
              borderRadius: "var(--radius-lg)",
              padding: "1.2rem 2rem",
              fontSize: "var(--text-button)",
              fontFamily: "var(--font-primary)",
              fontWeight: "var(--font-bold)",
              cursor: "pointer",
              minHeight: "var(--touch-preferred)",
              boxShadow: "0 5px 20px rgba(78,205,196,0.45)",
              direction: "rtl",
            }}
            lang="he"
          >
            רוֹצָה לְהַמְשִׁיך! ←
          </motion.button>

          {/* Finish */}
          <motion.button
            onClick={onFinish}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            style={{
              backgroundColor: "rgba(120,80,180,0.35)",
              color: "rgba(255,255,255,0.95)",
              border: "2px solid rgba(180,140,220,0.5)",
              borderRadius: "var(--radius-lg)",
              padding: "1.2rem 2rem",
              fontSize: "var(--text-button)",
              fontFamily: "var(--font-primary)",
              fontWeight: "var(--font-semibold)",
              cursor: "pointer",
              minHeight: "var(--touch-preferred)",
              backdropFilter: "blur(8px)",
              direction: "rtl",
            }}
            lang="he"
          >
            מַסְפִּיק לְהַיּוֹם 🌙
          </motion.button>
        </motion.div>
      </main>
    </motion.div>
  );
}

// ─── Hugging cat (End of Day) ─────────────────────────────────────────────────

function HuggingCat() {
  const leftArm  = useAnimation();
  const rightArm = useAnimation();

  useEffect(() => {
    const t = setTimeout(async () => {
      await Promise.all([
        leftArm.start({
          rotate: -75,
          transition: { type: "spring", stiffness: 160, damping: 14 },
        }),
        rightArm.start({
          rotate: 75,
          transition: { type: "spring", stiffness: 160, damping: 14 },
        }),
      ]);
    }, 600);
    return () => clearTimeout(t);
  }, [leftArm, rightArm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.3 }}
    >
      <svg viewBox="0 0 240 270" width="200" height="225" aria-label="חתול מחבק" aria-hidden>
        {/* Left arm */}
        <motion.g
          style={{ transformOrigin: "75px 155px" }}
          initial={{ rotate: 0 }}
          animate={leftArm}
        >
          <rect x="60" y="150" width="16" height="48" rx="8" fill="#C9A87A" />
          <ellipse cx="68" cy="200" rx="12" ry="9" fill="#B89560" />
        </motion.g>

        {/* Right arm */}
        <motion.g
          style={{ transformOrigin: "165px 155px" }}
          initial={{ rotate: 0 }}
          animate={rightArm}
        >
          <rect x="164" y="150" width="16" height="48" rx="8" fill="#C9A87A" />
          <ellipse cx="172" cy="200" rx="12" ry="9" fill="#B89560" />
        </motion.g>

        {/* Body */}
        <ellipse cx="120" cy="178" rx="52" ry="50" fill="#C9A87A" />

        {/* Head */}
        <circle cx="120" cy="106" r="54" fill="#C9A87A" />

        {/* Ears */}
        <polygon points="82,65  66,34 100,60" fill="#C9A87A" />
        <polygon points="158,65 174,34 140,60" fill="#C9A87A" />
        <polygon points="84,63  72,42  98,60" fill="#E8A8A8" opacity="0.65" />
        <polygon points="156,63 168,44 142,60" fill="#E8A8A8" opacity="0.65" />

        {/* Happy open eyes */}
        <circle cx="98"  cy="105" r="8" fill="#5B3A20" />
        <circle cx="142" cy="105" r="8" fill="#5B3A20" />
        <circle cx="101" cy="102" r="3" fill="white" />
        <circle cx="145" cy="102" r="3" fill="white" />

        {/* Big smile */}
        <path d="M 92,126 Q 120,148 148,126"
          stroke="#6B4A30" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Rosy cheeks */}
        <ellipse cx="85"  cy="120" rx="13" ry="8" fill="rgba(230,140,130,0.4)" />
        <ellipse cx="155" cy="120" rx="13" ry="8" fill="rgba(230,140,130,0.4)" />

        {/* Nose */}
        <ellipse cx="120" cy="120" rx="5" ry="3.5" fill="#E8A8A8" />

        {/* Feet */}
        <ellipse cx="98"  cy="220" rx="22" ry="13" fill="#B89560" />
        <ellipse cx="142" cy="220" rx="22" ry="13" fill="#B89560" />
      </svg>
    </motion.div>
  );
}

// ─── Floating hearts ──────────────────────────────────────────────────────────

function FloatingHearts() {
  return (
    <>
      {[
        { x: "42%", delay: 1.5, dur: 3.0 },
        { x: "52%", delay: 1.9, dur: 3.4 },
        { x: "60%", delay: 2.3, dur: 2.8 },
        { x: "36%", delay: 2.7, dur: 3.2 },
      ].map((h, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.9, 0.9, 0], y: -90 }}
          transition={{ duration: h.dur, delay: h.delay, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: h.x,
            top: "55%",
            fontSize: "1.6rem",
            pointerEvents: "none",
            zIndex: 55,
          }}
        >
          ❤️
        </motion.span>
      ))}
    </>
  );
}

// ─── Confetti shower ──────────────────────────────────────────────────────────

function ConfettiShower() {
  return (
    <>
      {CONFETTI.map(c => (
        <motion.span
          key={c.id}
          initial={{ opacity: 0, x: `${c.x}vw`, y: "-8vh" }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: "108vh",
            x: [`${c.x}vw`, `calc(${c.x}vw + ${c.driftX}px)`],
          }}
          transition={{ duration: c.dur, delay: c.delay, ease: "easeIn", repeat: Infinity, repeatDelay: 1.5 }}
          style={{
            position: "fixed",
            fontSize: `${c.size}rem`,
            pointerEvents: "none",
            zIndex: 53,
          }}
        >
          {c.emoji}
        </motion.span>
      ))}
    </>
  );
}

// ─── End of Day screen ────────────────────────────────────────────────────────

interface EndOfDayProps {
  sessionStars:    number;
  sessionStickers: number;
  onDismiss:       () => void;   // back to welcome screen
}

export function EndOfDay({
  sessionStars,
  sessionStickers,
  onDismiss,
}: EndOfDayProps) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(
      () => speak("כָּל הַכָּבוֹד! סִיַּמְתְּ לְהַיּוֹם. נִתְרָאֶה מָחָר!", "instruction"),
      800
    );
    const t2 = setTimeout(() => setShowButton(true), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      key="end-of-day"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column" }}
    >
      <TwilightSky />
      <ConfettiShower />
      <FloatingHearts />

      <main style={{
        position: "relative", zIndex: 2,
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "1.4rem",
        padding: "2rem 1.5rem",
      }}>

        <HuggingCat />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 20 }}
          style={{
            textAlign: "center",
            background: "rgba(255,255,255,0.16)",
            backdropFilter: "blur(12px)",
            borderRadius: "var(--radius-xl)",
            padding: "1.2rem 2.2rem",
            border: "1.5px solid rgba(255,255,255,0.3)",
          }}
        >
          <h1 lang="he" dir="rtl" style={{
            margin: 0,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-title)",
            fontWeight: "var(--font-bold)",
            color: "white",
            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            lineHeight: "var(--leading-nikud)",
          }}>
            כָּל הַכָּבוֹד! 🌟
          </h1>
          <p lang="he" dir="rtl" style={{
            margin: "0.5rem 0 0",
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-instruction)",
            color: "rgba(255,255,255,0.88)",
            lineHeight: "var(--leading-nikud)",
          }}>
            עָשִׂית עֲבוֹדָה נֶהֱדֶרֶת הַיּוֹם!
          </p>
        </motion.div>

        {/* Stars/stickers earned today */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          style={{
            display: "flex", gap: "1.2rem", flexWrap: "wrap", justifyContent: "center",
          }}
        >
          {[
            { emoji: "⭐", n: sessionStars,    label: "כּוֹכָבִים" },
            { emoji: "🏅", n: sessionStickers, label: "מַדְבֵּקוֹת" },
          ].map(item => (
            <motion.div
              key={item.label}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                borderRadius: "var(--radius-full)",
                padding: "0.6rem 1.4rem",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <span style={{ fontSize: "1.6rem" }}>{item.emoji}</span>
              <span style={{
                fontFamily: "var(--font-primary)",
                fontSize: "var(--text-instruction)",
                fontWeight: "var(--font-bold)",
                color: "white",
              }}>{item.n}</span>
              <span lang="he" style={{
                fontFamily: "var(--font-primary)",
                fontSize: "var(--text-body)",
                color: "rgba(255,255,255,0.8)",
              }}>{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* "See you tomorrow" subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          lang="he" dir="rtl"
          style={{
            margin: 0,
            fontFamily: "var(--font-primary)",
            fontSize: "var(--text-instruction)",
            fontWeight: "var(--font-semibold)",
            color: "rgba(255,240,200,0.9)",
            textAlign: "center",
            lineHeight: "var(--leading-nikud)",
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}
        >
          נִתְרָאֶה מָחָר! 🌙
        </motion.p>

        {/* Dismiss button — appears after 3.5 s */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              key="dismiss-btn"
              onClick={onDismiss}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "2px solid rgba(255,255,255,0.4)",
                borderRadius: "var(--radius-xl)",
                padding: "1rem 2.5rem",
                fontFamily: "var(--font-primary)",
                fontSize: "var(--text-button)",
                fontWeight: "var(--font-semibold)",
                color: "white",
                cursor: "pointer",
                minHeight: "var(--touch-preferred)",
                backdropFilter: "blur(10px)",
                direction: "rtl",
              }}
              lang="he"
            >
              לְהִתְרָאוֹת! 👋
            </motion.button>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
