import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback } from "react";
import { IslandView } from "../components/ui/IslandView";
import { CatCharacter } from "../components/ui/CatCharacter";
import { StarCounter } from "../components/ui/StarCounter";
import { SafeSpaceButton } from "../components/ui/SafeSpaceButton";
import { useWorldMapMusic } from "../hooks/useWorldMapMusic";
import { useRewardStore } from "../stores/rewardStore";
import {
  getRecommendedIsland,
} from "../engine/islandProgress";
import type { IslandSubject } from "../engine/islandProgress";

// ─── Types ────────────────────────────────────────────────────────────────────

type MapView =
  | { mode: 'map' }
  | { mode: 'island'; subject: IslandSubject };

interface WorldMapScreenProps {
  onSelectGame:  (route: string) => void;
  onSafeSpace:   () => void;
  onOpenAlbum?:  () => void;
  starCount?:    number;
  stickerCount?: number;
}

// ─── Parchment map SVG ────────────────────────────────────────────────────────

interface MapSVGProps {
  recommendedSubject: IslandSubject;
  mathTreasureOpen: boolean;
  readingTreasureOpen: boolean;
  onSelectMath: () => void;
  onSelectReading: () => void;
}

function ParchmentMap({
  recommendedSubject,
  mathTreasureOpen,
  readingTreasureOpen,
  onSelectMath,
  onSelectReading,
}: MapSVGProps) {
  const mathGlow    = recommendedSubject === 'math';
  const readingGlow = recommendedSubject === 'reading';

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label="מַפַּת הַהַרְפַּתְקָאוֹת"
    >
      {/* Parchment base */}
      <rect width="800" height="500" fill="#D4B87A"/>
      <defs>
        <radialGradient id="parchGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#E8D4A0" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#B89850" stopOpacity="0.0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="url(#parchGlow)"/>

      {/* Ocean/sea colour tint over parchment */}
      <rect width="800" height="500" fill="#5A94B0" opacity="0.22"/>

      {/* Hand-drawn wave lines */}
      <g stroke="#4A7A8C" fill="none" strokeWidth="1.2" opacity="0.18">
        <path d="M40,130 Q72,125 104,130 Q136,135 168,130 Q200,125 232,130"/>
        <path d="M310,85 Q342,80 374,85 Q406,90 438,85"/>
        <path d="M495,420 Q527,415 559,420 Q591,425 623,420"/>
        <path d="M90,395 Q122,390 154,395 Q186,400 218,395"/>
        <path d="M595,162 Q627,157 659,162 Q691,167 723,162"/>
      </g>

      {/* ── MATH ISLAND — upper right ─────────────────────────────── */}
      <g
        onClick={onSelectMath}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-label="אִי הַמִּסְפָּרִים — 4 מִשְׂגָּקִים"
      >
        {(mathGlow || mathTreasureOpen) && (
          <motion.ellipse
            cx="590" cy="175" rx="105" ry="100"
            fill="none"
            stroke={mathTreasureOpen ? '#FFD700' : '#7C6FEB'}
            strokeWidth="4" opacity="0.45"
            animate={{ opacity: [0.45, 0.2, 0.45] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
        )}
        {/* Island land shape */}
        <path
          d="M480,108 Q518,72 578,82 Q638,68 678,94 Q718,114 707,154 Q728,195 697,224
             Q677,264 637,273 Q598,284 558,268 Q518,273 488,242 Q458,212 448,172 Q438,132 480,108Z"
          fill="#8B9E6B" stroke="#6B7D4E" strokeWidth="2.5"
        />
        {/* Sandy beach edge */}
        <path
          d="M488,242 Q518,273 558,268 Q598,284 637,273 Q677,264 697,224"
          fill="none" stroke="#E8D5A3" strokeWidth="8" opacity="0.7" strokeLinecap="round"
        />
        {/* Mini volcano */}
        <path d="M578,85 L598,132 L558,132Z" fill="#7A8B5A" stroke="#6B7D4E" strokeWidth="1"/>
        <path d="M573,92 L588,114 L562,114Z" fill="#9BAF7A"/>
        {/* Palm trees */}
        <line x1="518" y1="162" x2="522" y2="136" stroke="#8B6340" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M522,136 Q510,126 505,132" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M522,136 Q534,124 538,130" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="660" y1="175" x2="657" y2="150" stroke="#8B6340" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M657,150 Q645,140 641,146" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M657,150 Q669,138 674,144" stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Island label */}
        <text x="590" y="204"
              textAnchor="middle" fontFamily="'Assistant','Rubik',sans-serif"
              fontSize="17" fontWeight="700" fill="#2D3748" direction="rtl" unicodeBidi="embed">
          🏝️ אִי הַמִּסְפָּרִים
        </text>
        <text x="590" y="224"
              textAnchor="middle" fontFamily="'Assistant','Rubik',sans-serif"
              fontSize="12" fill="#4A5568" direction="rtl" unicodeBidi="embed">
          4 מִשְׂגָּקִים{mathTreasureOpen ? ' ✅' : ''}
        </text>

        {/* Recommended badge */}
        {mathGlow && (
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <rect x="525" y="68" width="130" height="18" rx="9" fill="#FFD700"/>
            <text x="590" y="81"
                  textAnchor="middle" fontSize="11" fontWeight="700"
                  fontFamily="'Assistant','Rubik',sans-serif" fill="#2D3748" direction="rtl" unicodeBidi="embed">
              ✨ מוּמְלָץ עַכְשָׁו
            </text>
          </motion.g>
        )}
      </g>

      {/* ── READING ISLAND — lower left ───────────────────────────── */}
      <g
        onClick={onSelectReading}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-label="אִי הַסִּפּוּרִים — 1 מִשְׂגָּקִים"
      >
        {(readingGlow || readingTreasureOpen) && (
          <motion.ellipse
            cx="180" cy="305" rx="108" ry="98"
            fill="none"
            stroke={readingTreasureOpen ? '#FFD700' : '#4ECDC4'}
            strokeWidth="4" opacity="0.45"
            animate={{ opacity: [0.45, 0.2, 0.45] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          />
        )}
        <path
          d="M78,255 Q118,224 178,233 Q238,218 278,243 Q308,263 298,303
             Q308,343 278,363 Q238,393 178,382 Q128,398 88,372 Q58,342 53,302 Q48,272 78,255Z"
          fill="#6B8E5A" stroke="#5A7A4A" strokeWidth="2.5"
        />
        {/* Beach */}
        <path
          d="M88,372 Q128,398 178,382 Q238,393 278,363 Q308,343 298,303"
          fill="none" stroke="#E8D5A3" strokeWidth="8" opacity="0.7" strokeLinecap="round"
        />
        {/* Trees */}
        <rect x="134" y="260" width="11" height="55" rx="4" fill="#6B4226"/>
        <circle cx="139" cy="252" r="23" fill="#2E7D32" opacity="0.85"/>
        <circle cx="154" cy="258" r="17" fill="#388E3C" opacity="0.8"/>
        <circle cx="128" cy="265" r="14" fill="#43A047" opacity="0.8"/>
        <rect x="196" y="265" width="10" height="50" rx="4" fill="#6B4226"/>
        <circle cx="201" cy="257" r="20" fill="#2E7D32" opacity="0.85"/>
        <circle cx="215" cy="263" r="14" fill="#388E3C" opacity="0.8"/>
        {/* Sparkles */}
        <text x="112" y="308" fontSize="12" opacity="0.55">✨</text>
        <text x="228" y="295" fontSize="10" opacity="0.45">✨</text>

        {/* Island label */}
        <text x="178" y="338"
              textAnchor="middle" fontFamily="'Assistant','Rubik',sans-serif"
              fontSize="17" fontWeight="700" fill="#2D3748" direction="rtl" unicodeBidi="embed">
          📚 אִי הַסִּפּוּרִים
        </text>
        <text x="178" y="358"
              textAnchor="middle" fontFamily="'Assistant','Rubik',sans-serif"
              fontSize="12" fill="#4A5568" direction="rtl" unicodeBidi="embed">
          1 מִשְׂגָּקִים{readingTreasureOpen ? ' ✅' : ''}
        </text>

        {readingGlow && (
          <motion.g
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <rect x="112" y="218" width="132" height="18" rx="9" fill="#FFD700"/>
            <text x="178" y="231"
                  textAnchor="middle" fontSize="11" fontWeight="700"
                  fontFamily="'Assistant','Rubik',sans-serif" fill="#2D3748" direction="rtl" unicodeBidi="embed">
              ✨ מוּמְלָץ עַכְשָׁו
            </text>
          </motion.g>
        )}
      </g>

      {/* ── Dotted sea route ──────────────────────────────────────── */}
      <path
        d="M278,300 Q340,255 400,275 Q460,295 488,242"
        stroke="#8B6340" strokeWidth="2" fill="none"
        strokeDasharray="8,7" opacity="0.38"
      />

      {/* ── Compass rose ─────────────────────────────────────────── */}
      <g transform="translate(715, 428)" opacity="0.42">
        <circle cx="0" cy="0" r="26" fill="none" stroke="#8B6340" strokeWidth="1.5"/>
        <text x="0" y="-14" textAnchor="middle" fontSize="9" fill="#8B6340" fontWeight="700">N</text>
        <text x="0" y="20" textAnchor="middle" fontSize="9" fill="#8B6340" fontWeight="700">S</text>
        <text x="17" y="4" textAnchor="middle" fontSize="9" fill="#8B6340" fontWeight="700">E</text>
        <text x="-17" y="4" textAnchor="middle" fontSize="9" fill="#8B6340" fontWeight="700">W</text>
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#8B6340" strokeWidth="1.5"/>
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#8B6340" strokeWidth="1.5"/>
      </g>

      {/* ── Decorations ──────────────────────────────────────────── */}
      <text x="390" y="445" fontSize="22" opacity="0.25">🐙</text>
      <text x="648" y="358" fontSize="16" opacity="0.22">🐠</text>
      <text x="338" y="155" fontSize="14" opacity="0.2">🐚</text>
      <text x="105" y="165" fontSize="20" opacity="0.22">⚓</text>

      {/* ── Parchment border ─────────────────────────────────────── */}
      <rect x="2" y="2" width="796" height="496" fill="none" stroke="#B8963E" strokeWidth="7" rx="6"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorldMapScreen({
  onSelectGame,
  onSafeSpace,
  onOpenAlbum,
  starCount = 0,
  stickerCount = 0,
}: WorldMapScreenProps) {
  useWorldMapMusic();
  const { completedGames, islandTreasures } = useRewardStore();
  const [view, setView] = useState<MapView>({ mode: 'map' });
  const [catFunny, setCatFunny] = useState(false);

  const recommendedSubject = getRecommendedIsland(completedGames);
  const mathTreasureOpen   = islandTreasures.includes('math');
  const readingTreasureOpen = islandTreasures.includes('reading');

  const catSpeech =
    view.mode === 'map'
      ? recommendedSubject === 'math'
        ? '!נְסִי אֶת אִי הַמִּסְפָּרִים'
        : '!נְסִי אֶת אִי הַסִּפּוּרִים'
      : '!בַּחֲרִי מִשְׂגָּק';

  const handleCatClick = useCallback(() => {
    setCatFunny(true);
    setTimeout(() => setCatFunny(false), 600);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ position: 'relative', width: '100%', height: '100svh', overflow: 'hidden' }}
    >
      <AnimatePresence mode="wait">

        {view.mode === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
          >
            {/* ── Top header ──────────────────────────────────────── */}
            <header style={{
              position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.65rem 1.2rem',
              background: 'rgba(212,184,122,0.88)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderBottom: '1px solid rgba(184,150,62,0.4)',
              direction: 'rtl',
            }}>
              <h1 style={{
                flex: 1, fontFamily: 'var(--font-primary)', fontSize: '1.15rem',
                fontWeight: 700, color: '#5A3E1B', margin: 0,
              }}>
                🗺️ מַפַּת הַהַרְפַּתְקָאוֹת
              </h1>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {stickerCount > 0 && (
                  <motion.button
                    onClick={onOpenAlbum}
                    whileTap={{ scale: 0.92 }}
                    aria-label={`פְּתַח אַלְבּוּם מַדְבְּקוֹת — ${stickerCount} מַדְבְּקוֹת`}
                    style={{
                      background: 'rgba(255,255,255,0.7)', border: 'none',
                      borderRadius: '20px', padding: '4px 12px',
                      fontFamily: 'var(--font-primary)', fontSize: '14px',
                      fontWeight: 700, color: '#FFB347', cursor: 'pointer',
                    }}
                  >
                    🏅 {stickerCount}
                  </motion.button>
                )}
                <StarCounter count={starCount} compact />
              </div>
            </header>

            {/* ── Parchment map ────────────────────────────────────── */}
            <div style={{ flex: 1, paddingTop: '48px', position: 'relative' }}>
              <ParchmentMap
                recommendedSubject={recommendedSubject}
                mathTreasureOpen={mathTreasureOpen}
                readingTreasureOpen={readingTreasureOpen}
                onSelectMath={() => setView({ mode: 'island', subject: 'math' })}
                onSelectReading={() => setView({ mode: 'island', subject: 'reading' })}
              />
            </div>

            {/* ── Cat on boat ──────────────────────────────────────── */}
            <div style={{
              position: 'absolute',
              bottom: '18%', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 5,
            }}>
              <CatCharacter
                size={100}
                pose="idle"
                speechBubble={catSpeech}
                doFunnyAnimation={catFunny}
                onClick={handleCatClick}
              />
            </div>

            {/* ── Safe space ───────────────────────────────────────── */}
            <SafeSpaceButton onPress={onSafeSpace} position="bottom-end" />
          </motion.div>
        )}

        {view.mode === 'island' && (
          <IslandView
            key={`island-${view.subject}`}
            subject={view.subject}
            onSelectGame={onSelectGame}
            onBack={() => setView({ mode: 'map' })}
            onSafeSpace={onSafeSpace}
          />
        )}

      </AnimatePresence>
    </motion.div>
  );
}
