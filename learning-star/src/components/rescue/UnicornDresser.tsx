import { motion, AnimatePresence } from "framer-motion";
import type { SkinConfig, SkinPiece } from "../../engine/gameRegistry";

interface UnicornDresserProps {
  skin?: SkinConfig | null;
  size?: number;
  animate?: boolean;
}

function getInitialTransform(piece: SkinPiece) {
  switch (piece.animateFrom) {
    case "top":   return { y: -80, opacity: 0 };
    case "right": return { x: 80,  opacity: 0 };
    case "left":  return { x: -80, opacity: 0 };
    case "pop":   return { scale: 0, opacity: 0 };
    default:      return { opacity: 0 };
  }
}

function SkinPieceLayer({ piece, index }: { piece: SkinPiece; index: number }) {
  return (
    <motion.g
      key={piece.id}
      initial={getInitialTransform(piece)}
      animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      transition={{
        delay: index * 0.35,
        type: "spring",
        stiffness: 280,
        damping: 20,
      }}
    >
      <path
        d={piece.svgPath}
        fill={piece.color}
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.8"
        transform={`translate(${piece.x},${piece.y})`}
      />
    </motion.g>
  );
}

export function UnicornDresser({ skin = null, size = 120, animate = true }: UnicornDresserProps) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size * 1.2}
      style={{ overflow: "visible" }}
    >
      {/* ── Body ── */}
      <ellipse cx="50" cy="78" rx="30" ry="20" fill="#F0D6FF"/>
      {/* ── Tail ── */}
      <path d="M20,68 Q10,62 12,76 Q14,88 22,84" stroke="#DDB6FF" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M20,68 Q8,64 10,80" stroke="#FF9FF3" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* ── Legs ── */}
      <rect x="26" y="94" width="8" height="20" rx="4" fill="#E0C0F8"/>
      <rect x="38" y="96" width="8" height="20" rx="4" fill="#E0C0F8"/>
      <rect x="54" y="96" width="8" height="20" rx="4" fill="#E0C0F8"/>
      <rect x="66" y="94" width="8" height="20" rx="4" fill="#E0C0F8"/>
      {/* ── Neck ── */}
      <path d="M58,66 Q72,62 70,48 Q68,40 64,37" stroke="#E0C0F8" strokeWidth="13" fill="none" strokeLinecap="round"/>
      <path d="M58,66 Q72,62 70,48 Q68,40 64,37" stroke="#F0D6FF" strokeWidth="9" fill="none" strokeLinecap="round"/>
      {/* ── Head ── */}
      <circle cx="62" cy="33" r="17" fill="#F0D6FF"/>
      {/* ── Horn ── */}
      <path d="M62,16 L57,32 L67,32Z" fill="#FFD700"/>
      <line x1="62" y1="17" x2="62" y2="31" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
      {/* ── Mane ── */}
      <path d="M50,34 Q42,40 44,54 Q46,62 50,66" stroke="#FF9FF3" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M52,31 Q46,37 48,50 Q50,58 54,63" stroke="#C44FBF" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M54,29 Q50,35 52,46" stroke="#FF6BCD" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* ── Eye ── */}
      <circle cx="68" cy="33" r="3.5" fill="#5C4BD6"/>
      <circle cx="69" cy="32" r="1.2" fill="white"/>
      {/* ── Nose ── */}
      <ellipse cx="74" cy="40" rx="5.5" ry="3.5" fill="#EEB0DC"/>
      <circle cx="73" cy="39.5" r="1" fill="rgba(0,0,0,0.25)"/>
      <circle cx="76" cy="41" r="1" fill="rgba(0,0,0,0.25)"/>

      {/* ── Skin pieces ── */}
      <AnimatePresence>
        {skin && skin.pieces.map((piece, i) => (
          animate
            ? <SkinPieceLayer key={piece.id} piece={piece} index={i}/>
            : (
              <g key={piece.id}>
                <path
                  d={piece.svgPath}
                  fill={piece.color}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="0.8"
                  transform={`translate(${piece.x},${piece.y})`}
                />
              </g>
            )
        ))}
      </AnimatePresence>
    </svg>
  );
}
