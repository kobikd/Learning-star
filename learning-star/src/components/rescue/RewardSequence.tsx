import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UnicornDresser } from "./UnicornDresser";
import { useRewardStore } from "../../stores/rewardStore";
import type { GameConfig } from "../../engine/gameRegistry";

type Step = 0 | 1 | 2 | 3 | 4;

const STEP_DURATIONS: Record<number, number> = { 0: 3000, 1: 4000, 2: 3000, 3: 0 };

interface RewardSequenceProps {
  config: GameConfig;
  onDismiss: () => void;
}

function Particle({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: x, top: y,
        width: 8, height: 8, borderRadius: "50%",
        background: color, pointerEvents: "none",
      }}
      initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
      animate={{
        scale: 0,
        opacity: 0,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
      }}
      transition={{ duration: 1.4, delay, ease: "easeOut" }}
    />
  );
}

function PuzzleBoard({ islandId, pieces, newPieceIndex }: {
  islandId: "math" | "reading";
  pieces: boolean[];
  newPieceIndex: number;
}) {
  const color = islandId === "math" ? "#7C6FEB" : "#4ECDC4";
  const layout = [
    { x: 8,  y: 8,  tabR: true,  tabB: true  },
    { x: 76, y: 8,  tabR: false, tabB: true  },
    { x: 8,  y: 76, tabR: true,  tabB: false },
    { x: 76, y: 76, tabR: false, tabB: false },
  ];

  function piecePath(tabR: boolean, tabB: boolean): string {
    const r = tabR ? "L60,10 Q68,4 68,20 Q68,36 60,30 L60,60" : "L60,60";
    const b = tabB ? "L30,60 Q24,68 16,68 Q8,68 10,60 L10,60" : "L10,60";
    return `M10,10 L60,10 ${r} L60,60 ${b} L10,60 Z`;
  }

  return (
    <svg viewBox="0 0 150 150" width={150} height={150}>
      {layout.map((l, i) => (
        <motion.g key={i} transform={`translate(${l.x},${l.y})`}
          initial={i === newPieceIndex ? { scale: 0, opacity: 0 } : {}}
          animate={{ scale: 1, opacity: 1 }}
          transition={i === newPieceIndex
            ? { type: "spring", stiffness: 300, damping: 18, delay: 0.3 }
            : {}
          }
        >
          <path
            d={piecePath(l.tabR, l.tabB)}
            fill={pieces[i] ? color : "rgba(255,255,255,0.1)"}
            stroke={pieces[i] ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}
            strokeWidth="2"
            style={i === newPieceIndex && pieces[i] ? {
              filter: "drop-shadow(0 0 8px gold)",
            } : {}}
          />
          {pieces[i] && (
            <text x="30" y="38" textAnchor="middle" fontSize="22">
              {i === newPieceIndex ? "✨" : "⭐"}
            </text>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export function RewardSequence({ config, onDismiss }: RewardSequenceProps) {
  const [step, setStep] = useState<Step>(0);
  const [canSkip, setCanSkip] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      x: 80 + Math.random() * 240,
      y: 80 + Math.random() * 300,
      color: ["#FFD700","#6BCB77","#FF9FF3","#4ECDC4","#FF6B6B"][i % 5],
      delay: i * 0.06,
    }))
  );

  const { earnCard, earnSticker, earnPuzzlePiece, unlockIsland, earnSkin } = useRewardStore();
  const actionsCalledRef = useRef({ card: false, puzzle: false, skin: false });

  useEffect(() => {
    if (step === 1 && !actionsCalledRef.current.card) {
      actionsCalledRef.current.card = true;
      earnCard({
        gameId: config.id,
        earnedAt: Date.now(),
        animal: config.rescue.animal,
        titleHe: config.reward.cardTitleHe,
      });
      earnSticker(config.reward.stickerId);
    }
    if (step === 2 && !actionsCalledRef.current.puzzle) {
      actionsCalledRef.current.puzzle = true;
      earnPuzzlePiece(config.reward.puzzlePiece.islandId, config.reward.puzzlePiece.pieceIndex);
      const updated = useRewardStore.getState().puzzlePieces;
      if (updated[config.reward.puzzlePiece.islandId].every(Boolean)) {
        unlockIsland(config.reward.puzzlePiece.islandId);
      }
    }
    if (step === 3 && !actionsCalledRef.current.skin) {
      actionsCalledRef.current.skin = true;
      earnSkin(config.reward.skin.id);
    }
    if (step === 4) {
      onDismiss();
    }
  }, [step]);

  useEffect(() => {
    const dur = STEP_DURATIONS[step];
    if (dur === undefined || dur === 0) return;
    const t = setTimeout(() => setStep(s => (s + 1) as Step), dur);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setCanSkip(true), 2800);
      return () => clearTimeout(t);
    }
  }, [step]);

  const currentPieces = useRewardStore(s => s.puzzlePieces);
  const islandPieces = currentPieces[config.reward.puzzlePiece.islandId];
  const isLastPiece = islandPieces.every(Boolean);

  function handleTap() {
    if (!canSkip) return;
    if (step < 3) setStep((step + 1) as Step);
    else setStep(4);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleTap}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "radial-gradient(ellipse at 50% 40%, #1A2A4A, #0a0a1a)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24, padding: 24,
        cursor: canSkip ? "pointer" : "default",
        overflowY: "auto",
      }}
    >
      {step === 0 && particles.map((p, i) => (
        <Particle key={i} {...p}/>
      ))}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="act1"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 100, marginBottom: 16,
              animation: "freeJump 0.8s ease-in-out infinite" }}>
              {config.rescue.animal}
            </div>
            <div style={{
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
              fontWeight: 800,
              color: "#FFD700",
              direction: "rtl",
              textShadow: "0 0 24px rgba(255,215,0,0.6)",
            }}>
              {config.rescue.freedomTextHe}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="act2"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            style={{
              background: "linear-gradient(135deg, #1A4A8A, #2B7BBB)",
              borderRadius: 20,
              border: "3px solid #FFD700",
              boxShadow: "0 8px 40px rgba(255,215,0,0.4), 0 0 80px rgba(78,205,196,0.2)",
              padding: "28px 36px",
              textAlign: "center",
              minWidth: 240,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ left: "-60%" }}
              animate={{ left: "160%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              style={{
                position: "absolute", top: 0, bottom: 0, width: "40%",
                background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
                pointerEvents: "none",
              }}
            />
            <div style={{ fontSize: 72, marginBottom: 8 }}>{config.rescue.animal}</div>
            <div style={{
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "1.3rem", fontWeight: 800, color: "#FFD700",
              direction: "rtl", marginBottom: 8,
            }}>
              {config.reward.cardTitleHe}
            </div>
            <div style={{
              fontSize: "0.9rem", color: "rgba(255,255,255,0.75)",
              direction: "rtl", marginBottom: 12,
            }}>
              {config.reward.cardSubtitleHe}
            </div>
            <div style={{ fontSize: 22, letterSpacing: 4 }}>⭐⭐⭐⭐⭐</div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="act3"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{ textAlign: "center" }}
          >
            <div style={{
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "1.4rem", fontWeight: 800,
              color: "white", direction: "rtl", marginBottom: 20,
            }}>
              {isLastPiece ? "הָאוֹצָר נִפְתַּח!" : "עוֹד חֵלֶק לָאוֹצָר!"}
            </div>
            <PuzzleBoard
              islandId={config.reward.puzzlePiece.islandId}
              pieces={islandPieces}
              newPieceIndex={config.reward.puzzlePiece.pieceIndex}
            />
            {isLastPiece && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                style={{ fontSize: 64, marginTop: 12 }}
              >
                🎁
              </motion.div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="act4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center" }}
            onClick={(e) => { e.stopPropagation(); setStep(4); }}
          >
            <div style={{
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "1.5rem", fontWeight: 800,
              color: "#FFD700", direction: "rtl", marginBottom: 16,
            }}>
              תַּלְבּוֹשֶׁת חֲדָשָׁה!
            </div>
            <UnicornDresser skin={config.reward.skin} size={160} animate={true}/>
            <div style={{
              marginTop: 12,
              fontFamily: "var(--font-primary, system-ui)",
              fontSize: "1.1rem", fontWeight: 700,
              color: "rgba(255,255,255,0.8)", direction: "rtl",
            }}>
              {config.reward.skin.nameHe}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setStep(4)}
              style={{
                marginTop: 24, padding: "12px 36px",
                background: "#FFD700", color: "#1a1a2e",
                border: "none", borderRadius: 999,
                fontFamily: "var(--font-primary, system-ui)",
                fontSize: "1.1rem", fontWeight: 800,
                cursor: "pointer", direction: "rtl",
              }}
            >
              מַדְהֵם!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {canSkip && step < 3 && (
        <div style={{
          position: "fixed", bottom: 24,
          fontFamily: "var(--font-primary, system-ui)",
          fontSize: "0.85rem", color: "rgba(255,255,255,0.4)",
        }}>
          הקש להמשך ←
        </div>
      )}

      <style>{`
        @keyframes freeJump {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
    </motion.div>
  );
}
