import { motion } from "framer-motion";
import type { GameWithState } from "../../engine/islandProgress";

interface GamePinProps {
  game: GameWithState;
  /** SVG coordinate of the pin base (bottom of the pole) */
  x: number;
  y: number;
  onClick: (game: GameWithState) => void;
}

const PIN_COLORS = {
  completed: { flag: '#6BCB77', circle: '#6BCB77', opacity: 1 },
  current:   { flag: '#FFD700', circle: '#FFD700', opacity: 1 },
  locked:    { flag: '#BBBBBB', circle: '#BBBBBB', opacity: 0.6 },
} as const;

export function GamePin({ game, x, y, onClick }: GamePinProps) {
  const colors = PIN_COLORS[game.state];

  return (
    <g>
      {/* Visual pin — pole, flag, base circle */}
      <g opacity={colors.opacity} transform={`translate(${x}, ${y})`}>
        {/* Pole */}
        <line x1="0" y1="0" x2="0" y2="-42" stroke="#5A3E1B" strokeWidth="3" strokeLinecap="round"/>

        {/* Flag */}
        {game.state === 'current' ? (
          <motion.path
            d="M0,-42 L26,-35 L0,-28Z"
            fill={colors.flag}
            animate={{ scaleX: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            style={{ transformOrigin: '0px -42px' }}
          />
        ) : (
          <path d="M0,-42 L26,-35 L0,-28Z" fill={colors.flag} />
        )}

        {/* Base circle */}
        {game.state === 'current' ? (
          <>
            <motion.circle
              cx="0" cy="0" r="16"
              fill="none" stroke={colors.circle} strokeWidth="2.5"
              animate={{ r: [14, 18, 14], opacity: [0.6, 0.2, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            />
            <circle cx="0" cy="0" r="9" fill={colors.circle} stroke="white" strokeWidth="2.5"/>
            <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white">⭐</text>
          </>
        ) : game.state === 'completed' ? (
          <>
            <circle cx="0" cy="0" r="9" fill={colors.circle} stroke="white" strokeWidth="2.5"/>
            <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white">✓</text>
          </>
        ) : (
          <>
            <circle cx="0" cy="0" r="9" fill={colors.circle} stroke="white" strokeWidth="2.5"/>
            <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#888">🔒</text>
          </>
        )}

        {/* Game icon + name below */}
        <text x="0" y="20" textAnchor="middle" fontSize="14">{game.icon}</text>
        <text
          x="0" y="34"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fontFamily="var(--font-primary)"
          fill={game.state === 'locked' ? '#999' : '#2D3748'}
          direction="rtl"
        >
          {game.name}
        </text>
      </g>

      {/* Invisible 64×64 hit area (accessible button) */}
      <foreignObject
        x={x - 32}
        y={y - 64}
        width="64"
        height="80"
        style={{ overflow: 'visible' }}
      >
        <button
          onClick={() => onClick(game)}
          aria-label={`${game.name} — ${
            game.state === 'completed' ? 'הוּשְׁלַם' :
            game.state === 'current'   ? 'פָּעִיל' :
            'נָעוּל'
          }`}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            cursor: game.state === 'locked' ? 'not-allowed' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      </foreignObject>
    </g>
  );
}
