import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RescueOverlay } from "./RescueOverlay";
import { RewardSequence } from "./RewardSequence";
import type { GameConfig } from "../../engine/gameRegistry";
import type { ReactNode } from "react";

type Phase = "playing" | "rewarding";

interface RescueSessionCallbacks {
  onCorrectAnswer: () => void;
  onComplete: () => void;
}

interface RescueSessionProps {
  config: GameConfig;
  onSessionComplete: () => void;
  children: (callbacks: RescueSessionCallbacks) => ReactNode;
}

export function RescueSession({ config, onSessionComplete, children }: RescueSessionProps) {
  const [answersCorrect, setAnswersCorrect] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");

  const onCorrectAnswer = useCallback(() => {
    setAnswersCorrect(prev => {
      const next = prev + 1;
      if (next >= config.totalQuestions) {
        // Use setTimeout to avoid setting state during render
        setTimeout(() => setPhase("rewarding"), 600);
      }
      return next;
    });
  }, [config.totalQuestions]);

  const onComplete = useCallback(() => {
    // Game's own completion (e.g., LetterExplorer finishing all letters)
    setPhase("rewarding");
  }, []);

  return (
    <>
      {phase === "playing" && (
        <>
          {/* Spacer so game content clears the 120px overlay */}
          <div style={{ paddingTop: 120 }}>
            {children({ onCorrectAnswer, onComplete })}
          </div>
          <RescueOverlay config={config} answersCorrect={answersCorrect}/>
        </>
      )}

      <AnimatePresence>
        {phase === "rewarding" && (
          <RewardSequence
            key="reward"
            config={config}
            onDismiss={onSessionComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
