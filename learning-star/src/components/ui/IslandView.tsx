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
import { UnicornDresser } from "../rescue/UnicornDresser";
import { GAME_CONFIGS }   from "../../engine/gameRegistry";

interface IslandViewProps {
  subject: IslandSubject;
  onSelectGame: (route: string) => void;
  onBack: () => void;
  onSafeSpace: () => void;
}

// ─── Pin positions per island (SVG coordinates, viewBox 0 0 800 520) ─────────────

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
  if (treasureOpen) return '!מאשימים! פִּתחִי אֳ6ת האָוצָר';
  const allDone = games.every(g => g.state === 'completed');
  if (allDone) return '!מאשימים! פִּתחִי אֳ6ת האָוצָר';
  const hasCompleted = games.some(g => g.state === 'completed');
  if (hasCompleted) return '!יֹפִי, תַּמְשִׁיכִי';
  return '!בַּחֲרִי מִשְׂחָק';
}

export function IslandView({ subject, onSelectGame, onBack, onSafeSpace }: IslandViewProps) {
  const { completedGames, islandTreasures, unlockTreasure, puzzlePieces, activeSkin } = useRewardStore();
  const [lockedMsg, setLockedMsg] = useState(false);

  const activeSkinConfig = activeSkin
    ? Object.values(GAME_CONFIGS).find(g => g.reward.skin.id === activeSkin)?.reward.skin ?? null
    : null;

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
    // Sticker is now earned via RewardSequence when the last puzzle piece is collected
  }

  const currentIdx = games.findIndex(g => g.state === 'current');
  const catPos = currentIdx >= 0 ? positions[currentIdx] : positions[positions.length - 1];
  const catX   = (catPos?.x ?? 400) - 35;
  const catY   = (catPos?.y ?? 300) + 40;

  const catSpeech = lockedMsg
    ? '!קוֹדֶם נְסַיֵּם אֶת הַמִּשְׂחָק הַקּוֹדֵם'
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
        aria-label={}
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
          transform={}
          style={{ cursor: treasureReady && !treasureOpen ? 'pointer' : 'default' }}
          onClick={handleTreasureClick}
          role={treasureReady && !treasureOpen ? 'button' : undefined}
          aria-label={treasureOpen ? 'אוֹצָר נִפְתַח!' : 'אוֹצָר נָעוּל'}
        >
          {treasureOpen ? (
            <motion.text
              x="0" y="0"
              textAnchor="middle" fontSize="38"
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >🎁</motion.text>
          ) : (
            <>
              <text x="0" y="0" textAnchor="middle" fontSize="32"
                    opacity={treasureReady ? 1 : 0.5}>📦</text>
              {!treasureReady && (
                <text x="0" y="-2" textAnchor="middle" fontSize="16">🔒</text>
              )}
            </>
          )}
          <text x="0" y="20" textAnchor="middle" fontSize="11"
                fontWeight="700" fontFamily="var(--font-primary)" fill="#8B6340"
                direction="rtl">
            {treasureOpen ? '!נִפְתַח' : '!אוֹצָר'}
          </text>
          {treasureReady && !treasureOpen && (
            <circle cx="0" cy="-10" r="32" fill="transparent"/>
          )}
        </g>
      </svg>

      {/* Cat companion overlay */}
      <div style={{
        position: 'absolute',
        left: ,
        top: ,
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
            animate={{ width:  }}
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
          {done}/{total} מִשְׂחָקִים הוּשְׁלְמוּ
        </p>
      </div>

      {/* Puzzle board - bottom left */}
      <div style={{
        position: "absolute",
        bottom: "1rem",
        left: "1rem",
        zIndex: 6,
        background: "rgba(0,0,0,0.45)",
        borderRadius: 12,
        padding: "6px 8px",
        backdropFilter: "blur(6px)",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {(puzzlePieces[subject as "math" | "reading"] ?? [false,false,false,false]).map((earned, i) => (
            <div key={i} style={{
              width: 22, height: 22,
              background: earned ? "#FFD700" : "rgba(255,255,255,0.15)",
              borderRadius: 4,
              border: earned ? "1px solid rgba(255,215,0,0.6)" : "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
              boxShadow: earned ? "0 0 6px rgba(255,215,0,0.5)" : "none",
              transition: "all 0.3s",
            }}>
              {earned ? "⭐" : ""}
            </div>
          ))}
        </div>
        <div style={{
          fontSize: 9, color: "rgba(255,255,255,0.5)",
          textAlign: "center", marginTop: 3,
          direction: "rtl",
        }}>
          חֵׁלְקֵי הָאוצָר
        </div>
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
          aria-label="חֲזָרָה לַמַּפָּה"
          style={{
            fontFamily: 'var(--font-primary)', fontSize: '0.95rem',
            color: '#4A5568', background: 'rgba(0,0,0,0.06)',
            border: 'none', borderRadius: '8px', padding: '6px 14px',
            cursor: 'pointer', direction: 'rtl',
          }}
        >
          ← חֲזָרָה לַמַּפָּה
        </button>
      </motion.header>

      {/* Unicorn avatar - bottom right (also navigates to safe space on tap) */}
      <button
        onClick={onSafeSpace}
        aria-label="פִּינַת הַשֶּׁקֶט"
        style={{
          position: "absolute",
          bottom: "1rem",
          insetInlineEnd: "1rem",
          zIndex: 10,
          width: 64, height: 64,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.85)",
          border: "2px solid rgba(255,255,255,0.9)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          overflow: "hidden",
          padding: 0,
        }}
      >
        <UnicornDresser skin={activeSkinConfig} size={52} animate={false}/>
      </button>
    </motion.div>
  );
}
