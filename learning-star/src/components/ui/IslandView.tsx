import { motion } from "framer-motion";
import { useState } from "react";
import { IslandLandscape } from "./IslandLandscape";
import { GamePin } from "./GamePin";
import { CatCharacter } from "./CatCharacter";
import {
  getIslandGames, isTreasureUnlocked, islandProgress, ISLAND_META,
} from "../../engine/islandProgress";
import type { IslandSubject, GameWithState } from "../../engine/islandProgress";
import { useRewardStore } from "../../stores/rewardStore";

interface IslandViewProps {
  subject: IslandSubject;
  onSelectGame: (route: string) => void;
  onBack: () => void;
  onSafeSpace: () => void;
}

// \u2500\u2500\u2500 Pin positions per island (SVG coordinates, viewBox 0 0 800 520) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const PIN_POSITIONS: Record<IslandSubject, Array<{ x: number; y: number }>> = {
  math: [
    { x: 152, y: 362 },
    { x: 298, y: 295 },
    { x: 468, y: 282 },
    { x: 605, y: 268 },
  ],
  reading: [
    { x: 280, y: 318 },
  ],
};

const PATHS: Record<IslandSubject, string> = {
  math:    'M152,362 Q210,338 250,318 Q298,295 348,295 Q420,308 468,282 Q540,258 605,268 Q665,278 700,310',
  reading: 'M180,340 Q228,320 280,318 Q340,322 400,318',
};

const TREASURE_POS: Record<IslandSubject, { x: number; y: number }> = {
  math:    { x: 700, y: 310 },
  reading: { x: 440, y: 318 },
};

function getCatSpeech(games: GameWithState[], treasureOpen: boolean): string {
  if (treasureOpen) return '!\u05de\u05b7\u05d3\u05b0\u05d4\u05b4\u05d9\u05dd! \u05e4\u05b4\u05ea\u05b0\u05d7\u05b4\u05d9 \u05d0\u05b6\u05ea \u05d4\u05b8\u05d0\u05d5\u05b9\u05e6\u05b8\u05e8';
  const allDone = games.every(g => g.state === 'completed');
  if (allDone) return '!\u05de\u05b7\u05d3\u05b0\u05d4\u05b4\u05d9\u05dd! \u05e4\u05b4\u05ea\u05b0\u05d7\u05b4\u05d9 \u05d0\u05b6\u05ea \u05d4\u05b8\u05d0\u05d5\u05b9\u05e6\u05b8\u05e8';
  const hasCompleted = games.some(g => g.state === 'completed');
  if (hasCompleted) return '!\u05d9\u05b9\u05e4\u05b4\u05d9, \u05ea\u05bc\u05b7\u05de\u05b0\u05e9\u05c1\u05b4\u05d9\u05db\u05b4\u05d9';
  return '!\u05d1\u05bc\u05b7\u05d7\u05b2\u05e8\u05b4\u05d9 \u05de\u05b4\u05e9\u05c2\u05b0\u05d7\u05b8\u05e7';
}

export function IslandView({ subject, onSelectGame, onBack, onSafeSpace }: IslandViewProps) {
  const { completedGames, islandTreasures, unlockTreasure, earnNextSticker } = useRewardStore();
  const [lockedMsg, setLockedMsg] = useState(false);

  const games         = getIslandGames(subject, completedGames);
  const treasureReady = isTreasureUnlocked(subject, completedGames);
  const treasureOpen  = islandTreasures.includes(subject);
  const { done, total } = islandProgress(subject, completedGames);
  const meta          = ISLAND_META[subject];
  const positions     = PIN_POSITIONS[subject];
  const path          = PATHS[subject];
  const treasurePos   = TREASURE_POS[subject];

  function handlePinClick(game: GameWithState) {
    if (game.state === 'locked') {
      setLockedMsg(true);
      setTimeout(() => setLockedMsg(false), 2200);
      return;
    }
    onSelectGame(game.route);
  }

  function handleTreasureClick() {
    if (!treasureReady || treasureOpen) return;
    unlockTreasure(subject);
    earnNextSticker();
  }

  const currentIdx = games.findIndex(g => g.state === 'current');
  const catPos = currentIdx >= 0 ? positions[currentIdx] : positions[positions.length - 1];
  const catX   = (catPos?.x ?? 400) - 35;
  const catY   = (catPos?.y ?? 300) + 40;

  const catSpeech = lockedMsg
    ? '!\u05e7\u05d5\u05b9\u05d3\u05b6\u05dd \u05e0\u05b0\u05e1\u05b7\u05d9\u05bc\u05b5\u05dd \u05d0\u05b6\u05ea \u05d4\u05b7\u05de\u05bc\u05b4\u05e9\u05c2\u05b0\u05d7\u05b8\u05e7 \u05d4\u05b7\u05e7\u05bc\u05d5\u05b9\u05d3\u05b5\u05dd'
    : getCatSpeech(games, treasureOpen);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      style={{ position: 'relative', width: '100%', height: '100svh', overflow: 'hidden' }}
    >
      {/* Island SVG */}
      <svg
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        role="img"
        aria-label={`${meta.name} \u2014 \u05de\u05b7\u05e4\u05bc\u05b7\u05ea \u05d4\u05b7\u05de\u05bc\u05b4\u05e9\u05c2\u05b0\u05d7\u05b8\u05e7\u05b4\u05d9\u05dd`}
      >
        <IslandLandscape subject={subject} />

        {/* Winding path */}
        <path d={path} stroke="#C8963A" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.55"/>
        <path d={path} stroke="#E8B84A" strokeWidth="5" fill="none" strokeDasharray="10,9" opacity="0.45" strokeLinecap="round"/>

        {/* Game pins */}
        {games.map((game, i) => {
          const pos = positions[i];
          if (!pos) return null;
          return (
            <GamePin
              key={game.id}
              game={game}
              x={pos.x}
              y={pos.y}
              onClick={handlePinClick}
            />
          );
        })}

        {/* Treasure chest */}
        <g
          transform={`translate(${treasurePos.x}, ${treasurePos.y})`}
          style={{ cursor: treasureReady && !treasureOpen ? 'pointer' : 'default' }}
          onClick={handleTreasureClick}
          role={treasureReady && !treasureOpen ? 'button' : undefined}
          aria-label={treasureOpen ? '\u05d0\u05d5\u05b9\u05e6\u05b8\u05e8 \u05e0\u05b4\u05e4\u05b0\u05ea\u05bc\u05b7\u05d7!' : '\u05d0\u05d5\u05b9\u05e6\u05b8\u05e8 \u05e0\u05b8\u05e2\u05d5\u05bc\u05dc'}
        >
          {treasureOpen ? (
            <motion.text
              x="0" y="0"
              textAnchor="middle" fontSize="38"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >\U0001f381</motion.text>
          ) : (
            <>
              <text x="0" y="0" textAnchor="middle" fontSize="32"
                    opacity={treasureReady ? 1 : 0.5}>\U0001f4e6</text>
              {!treasureReady && (
                <text x="0" y="-2" textAnchor="middle" fontSize="16">\U0001f512</text>
              )}
            </>
          )}
          <text x="0" y="20" textAnchor="middle" fontSize="11"
                fontWeight="700" fontFamily="var(--font-primary)" fill="#8B6340"
                direction="rtl">
            {treasureOpen ? '!\u05e0\u05b4\u05e4\u05b0\u05ea\u05bc\u05b7\u05d7' : '!\u05d0\u05d5\u05b9\u05e6\u05b8\u05e8'}
          </text>
          {treasureReady && !treasureOpen && (
            <circle cx="0" cy="-10" r="32" fill="transparent"/>
          )}
        </g>
      </svg>

      {/* Cat companion overlay */}
      <div style={{
        position: 'absolute',
        left: `${(catX / 800) * 100}%`,
        top: `${(catY / 520) * 100}%`,
        zIndex: 5,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}>
        <CatCharacter
          size={90}
          pose="idle"
          speechBubble={catSpeech}
          doFunnyAnimation={false}
        />
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(340px, 80%)',
        zIndex: 6,
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.18)',
          borderRadius: '999px',
          height: '10px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            style={{ height: '100%', background: '#6BCB77', borderRadius: '999px' }}
          />
        </div>
        <p style={{
          textAlign: 'center', margin: '0.3rem 0 0',
          fontFamily: 'var(--font-primary)', fontSize: '13px',
          color: 'white', fontWeight: 700,
          textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          direction: 'rtl',
        }}>
          {done}/{total} \u05de\u05b4\u05e9\u05c2\u05b0\u05d7\u05b8\u05e7\u05b4\u05d9\u05dd \u05d4\u05d5\u05bc\u05e9\u05b0\u05c1\u05b0\u05dc\u05b0\u05de\u05d5\u05bc
        </p>
      </div>

      {/* Top header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.65rem 1.2rem',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.5)',
          direction: 'rtl',
        }}
      >
        <h2 style={{
          fontFamily: 'var(--font-primary)', fontSize: '1.1rem', fontWeight: 700,
          color: subject === 'math' ? '#7C6FEB' : '#4ECDC4', margin: 0,
        }}>
          {meta.icon} {meta.name}
        </h2>
        <button
          onClick={onBack}
          aria-label="\u05d7\u05b2\u05d6\u05b8\u05e8\u05b8\u05d4 \u05dc\u05b7\u05de\u05bc\u05b7\u05e4\u05bc\u05b8\u05d4"
          style={{
            fontFamily: 'var(--font-primary)', fontSize: '0.95rem',
            color: '#4A5568', background: 'rgba(0,0,0,0.06)',
            border: 'none', borderRadius: '8px', padding: '6px 14px',
            cursor: 'pointer', direction: 'rtl',
          }}
        >
          \u2190 \u05d7\u05b2\u05d6\u05b8\u05e8\u05b8\u05d4 \u05dc\u05b7\u05de\u05bc\u05b7\u05e4\u05bc\u05b8\u05d4
        </button>
      </motion.header>

      {/* Safe space button */}
      <button
        onClick={onSafeSpace}
        aria-label="\u05e4\u05b4\u05d9\u05e0\u05b7\u05ea \u05d4\u05b7\u05e9\u05bc\u05c1\u05b6\u05e7\u05b6\u05d8"
        style={{
          position: 'absolute',
          bottom: '1rem',
          insetInlineEnd: '1rem',
          zIndex: 10,
          width: 52, height: 52,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.85)',
          border: '2px solid rgba(255,255,255,0.9)',
          fontSize: '1.5rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        }}
      >
        \U0001f3e0
      </button>
    </motion.div>
  );
}
