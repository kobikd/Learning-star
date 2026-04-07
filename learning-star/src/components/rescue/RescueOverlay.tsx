import { motion } from "framer-motion";
import { DangerScene } from "./DangerScene";
import type { GameConfig } from "../../engine/gameRegistry";

interface RescueOverlayProps {
  config: GameConfig;
  answersCorrect: number;
}

export function RescueOverlay({ config, answersCorrect }: RescueOverlayProps) {
  const { rescue, totalQuestions } = config;
  const progress = answersCorrect / totalQuestions;
  const stageIdx = Math.min(answersCorrect, rescue.stages.length - 1);
  const stage = rescue.stages[stageIdx];

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      height: 120,
      zIndex: 100,
      background: "rgba(10,10,26,0.88)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderBottom: "2px solid rgba(255,215,0,0.2)",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "0 1.2rem",
      direction: "rtl",
    }}>
      {/* Animal emoji */}
      <div style={{
        fontSize: 42,
        flexShrink: 0,
        animation: "rescueWiggle 1.4s ease-in-out infinite",
      }}>
        {rescue.animal}
      </div>

      {/* Center: progress bar + scene */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 999,
          height: 10,
          overflow: "hidden",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
        }}>
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #6BCB77, #FFD700)",
              boxShadow: "0 0 8px rgba(107,203,119,0.6)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DangerScene
            danger={rescue.danger}
            animal={rescue.animal}
            progress={progress}
          />
        </div>
      </div>

      {/* Stage label */}
      <div style={{
        flexShrink: 0,
        maxWidth: 90,
        textAlign: "center",
        fontFamily: "var(--font-primary, system-ui)",
        fontSize: 13,
        fontWeight: 700,
        color: progress >= 1 ? "#FFD700" : "rgba(255,255,255,0.85)",
        direction: "rtl",
        lineHeight: 1.4,
      }}>
        {answersCorrect === 0
          ? rescue.animalNameHe + " צָרִיךְ עֶזְרָה!"
          : stage?.labelHe ?? ""}
      </div>

      <style>{`
        @keyframes rescueWiggle {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          50% { transform: rotate(5deg) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
