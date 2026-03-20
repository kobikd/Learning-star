import { motion, useAnimation } from "framer-motion";
import { useCallback } from "react";
import type { AvatarId } from "../../../stores/avatarStore";

export interface AvatarProps {
  size?: number;
  isAnimating?: boolean;
  onClick?: () => void;
}

// ─── Cat ─────────────────────────────────────────────────────────────────────
export function CatAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    await ctrl.start({ y: [-8, 0], scaleX: [1, 1.08, 1], transition: { duration: 0.4 } });
  }, [ctrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 200 210" width={size} height={size * 1.05}>
          {/* Ears */}
          <polygon points="48,72 32,40 72,60" fill="#FFD89B" />
          <polygon points="152,72 168,40 128,60" fill="#FFD89B" />
          <polygon points="50,70 36,46 68,62" fill="#FFB0BE" opacity="0.7" />
          <polygon points="150,70 164,46 132,62" fill="#FFB0BE" opacity="0.7" />
          {/* Head */}
          <circle cx="100" cy="115" r="68" fill="#FFD89B" />
          {/* Closed eyes */}
          <path d="M 72,105 Q 82,97 92,105" stroke="#5A3825" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 108,105 Q 118,97 128,105" stroke="#5A3825" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <ellipse cx="76" cy="122" rx="12" ry="8" fill="rgba(255,140,120,0.28)" />
          <ellipse cx="124" cy="122" rx="12" ry="8" fill="rgba(255,140,120,0.28)" />
          {/* Nose */}
          <ellipse cx="100" cy="122" rx="5" ry="4" fill="#F4A0B0" />
          {/* Mouth */}
          <path d="M 92,130 Q 100,137 108,130" stroke="#5A3825" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Whiskers */}
          <line x1="58" y1="117" x2="88" y2="120" stroke="#5A3825" strokeWidth="1.5" opacity="0.4" />
          <line x1="60" y1="126" x2="88" y2="126" stroke="#5A3825" strokeWidth="1.5" opacity="0.4" />
          <line x1="112" y1="120" x2="142" y2="117" stroke="#5A3825" strokeWidth="1.5" opacity="0.4" />
          <line x1="112" y1="126" x2="140" y2="126" stroke="#5A3825" strokeWidth="1.5" opacity="0.4" />
          {/* Body */}
          <ellipse cx="100" cy="185" rx="42" ry="28" fill="#F5BC5A" />
          {/* Belly */}
          <ellipse cx="100" cy="183" rx="26" ry="18" fill="#FFF4DC" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Dog ──────────────────────────────────────────────────────────────────────
export function DogAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    await ctrl.start({ rotate: [0, -8, 8, -5, 0], y: [-6, 0], transition: { duration: 0.5 } });
  }, [ctrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
          {/* Floppy ears */}
          <ellipse cx="52" cy="90" rx="24" ry="38" fill="#C47A3A" transform="rotate(-12,52,90)" />
          <ellipse cx="148" cy="90" rx="24" ry="38" fill="#C47A3A" transform="rotate(12,148,90)" />
          <ellipse cx="52" cy="92" rx="16" ry="28" fill="#E8943A" opacity="0.5" transform="rotate(-12,52,92)" />
          <ellipse cx="148" cy="92" rx="16" ry="28" fill="#E8943A" opacity="0.5" transform="rotate(12,148,92)" />
          {/* Head */}
          <circle cx="100" cy="108" r="65" fill="#D4885A" />
          {/* Snout */}
          <ellipse cx="100" cy="128" rx="28" ry="20" fill="#E8A07A" />
          {/* Eyes */}
          <circle cx="78" cy="100" r="11" fill="white" />
          <circle cx="122" cy="100" r="11" fill="white" />
          <circle cx="80" cy="101" r="6" fill="#3D2010" />
          <circle cx="124" cy="101" r="6" fill="#3D2010" />
          <circle cx="82" cy="99" r="2" fill="white" />
          <circle cx="126" cy="99" r="2" fill="white" />
          {/* Nose */}
          <ellipse cx="100" cy="122" rx="9" ry="7" fill="#3D2010" />
          {/* Tongue */}
          <ellipse cx="100" cy="140" rx="10" ry="8" fill="#F07090" />
          <line x1="100" y1="134" x2="100" y2="148" stroke="#E05878" strokeWidth="1.5" />
          {/* Cheeks */}
          <ellipse cx="72" cy="118" rx="12" ry="8" fill="rgba(255,120,80,0.22)" />
          <ellipse cx="128" cy="118" rx="12" ry="8" fill="rgba(255,120,80,0.22)" />
          {/* Body */}
          <ellipse cx="100" cy="188" rx="44" ry="30" fill="#C47A3A" />
          <ellipse cx="100" cy="186" rx="28" ry="18" fill="#E8A07A" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Unicorn ──────────────────────────────────────────────────────────────────
export function UnicornAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    await ctrl.start({ rotate: [0, 360], scale: [1, 1.12, 1], transition: { duration: 0.7, ease: "easeInOut" } });
  }, [ctrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -5, 0], rotate: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
          {/* Horn */}
          <polygon points="100,10 90,58 110,58" fill="url(#hornGrad)" />
          <defs>
            <linearGradient id="hornGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#FF9ECD" />
              <stop offset="100%" stopColor="#B388FF" />
            </linearGradient>
          </defs>
          {/* Sparkles around horn */}
          <text x="72" y="32" fontSize="12" opacity="0.8">✨</text>
          <text x="116" y="28" fontSize="10" opacity="0.7">⭐</text>
          {/* Mane */}
          <ellipse cx="62" cy="88" rx="22" ry="40" fill="#FFB3DE" transform="rotate(-15,62,88)" />
          <ellipse cx="138" cy="88" rx="22" ry="40" fill="#B3D9FF" transform="rotate(15,138,88)" />
          {/* Head */}
          <circle cx="100" cy="115" r="65" fill="#FFF0F8" />
          {/* Eyes */}
          <ellipse cx="80" cy="108" rx="10" ry="11" fill="#B388FF" />
          <ellipse cx="120" cy="108" rx="10" ry="11" fill="#B388FF" />
          <circle cx="80" cy="109" r="5" fill="#3D006E" />
          <circle cx="120" cy="109" r="5" fill="#3D006E" />
          <circle cx="82" cy="107" r="2" fill="white" />
          <circle cx="122" cy="107" r="2" fill="white" />
          {/* Eyelashes */}
          <path d="M72,100 Q80,92 88,100" stroke="#B388FF" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M112,100 Q120,92 128,100" stroke="#B388FF" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <ellipse cx="72" cy="124" rx="13" ry="9" fill="rgba(255,160,200,0.35)" />
          <ellipse cx="128" cy="124" rx="13" ry="9" fill="rgba(255,160,200,0.35)" />
          {/* Nose */}
          <ellipse cx="100" cy="128" rx="5" ry="4" fill="#FFB3DE" />
          {/* Mouth */}
          <path d="M 92,136 Q 100,144 108,136" stroke="#D87AB0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="100" cy="188" rx="44" ry="28" fill="#FFF0F8" />
          <ellipse cx="100" cy="186" rx="26" ry="16" fill="#FFD6EE" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Rabbit ───────────────────────────────────────────────────────────────────
export function RabbitAvatar({ size = 160, onClick }: AvatarProps) {
  const earCtrl = useAnimation();
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    earCtrl.start({ scaleY: [1, 0.7, 1.2, 1], transition: { duration: 0.4 } });
    await ctrl.start({ y: [-14, 0], transition: { duration: 0.4, ease: "easeOut" } });
  }, [ctrl, earCtrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 200 230" width={size} height={size * 1.15}>
          {/* Ears */}
          <motion.g animate={earCtrl}>
            <ellipse cx="70" cy="55" rx="18" ry="48" fill="#E8E0F0" />
            <ellipse cx="130" cy="55" rx="18" ry="48" fill="#E8E0F0" />
            <ellipse cx="70" cy="58" rx="10" ry="36" fill="#FFB3C8" opacity="0.6" />
            <ellipse cx="130" cy="58" rx="10" ry="36" fill="#FFB3C8" opacity="0.6" />
          </motion.g>
          {/* Head */}
          <circle cx="100" cy="128" r="62" fill="#F0ECF8" />
          {/* Eyes */}
          <circle cx="80" cy="120" r="10" fill="#CC66AA" />
          <circle cx="120" cy="120" r="10" fill="#CC66AA" />
          <circle cx="80" cy="120" r="5" fill="#3D0030" />
          <circle cx="120" cy="120" r="5" fill="#3D0030" />
          <circle cx="82" cy="118" r="2" fill="white" />
          <circle cx="122" cy="118" r="2" fill="white" />
          {/* Cheeks */}
          <ellipse cx="72" cy="132" rx="12" ry="8" fill="rgba(255,140,180,0.3)" />
          <ellipse cx="128" cy="132" rx="12" ry="8" fill="rgba(255,140,180,0.3)" />
          {/* Nose */}
          <ellipse cx="100" cy="135" rx="6" ry="5" fill="#FFB3C8" />
          {/* Mouth */}
          <path d="M 94,142 Q 100,150 106,142" stroke="#CC66AA" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="100" y1="140" x2="100" y2="143" stroke="#CC66AA" strokeWidth="2" />
          {/* Whiskers */}
          <line x1="58" y1="132" x2="88" y2="135" stroke="#9988AA" strokeWidth="1.2" opacity="0.5" />
          <line x1="112" y1="135" x2="142" y2="132" stroke="#9988AA" strokeWidth="1.2" opacity="0.5" />
          {/* Body */}
          <ellipse cx="100" cy="196" rx="42" ry="28" fill="#E8E0F0" />
          <ellipse cx="100" cy="194" rx="24" ry="16" fill="white" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Fox ─────────────────────────────────────────────────────────────────────
export function FoxAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    await ctrl.start({ rotate: [0, -6, 6, 0], scale: [1, 1.1, 1], transition: { duration: 0.5 } });
  }, [ctrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 200 220" width={size} height={size * 1.1}>
          {/* Pointy ears */}
          <polygon points="58,80 38,40 80,72" fill="#E8622A" />
          <polygon points="142,80 162,40 120,72" fill="#E8622A" />
          <polygon points="60,76 46,50 76,70" fill="white" opacity="0.7" />
          <polygon points="140,76 154,50 124,70" fill="white" opacity="0.7" />
          {/* Head */}
          <circle cx="100" cy="112" r="64" fill="#E8622A" />
          {/* White muzzle */}
          <ellipse cx="100" cy="130" rx="32" ry="24" fill="#FFF0E0" />
          {/* White forehead */}
          <ellipse cx="100" cy="90" rx="36" ry="22" fill="#FFF0E0" opacity="0.6" />
          {/* Eyes */}
          <ellipse cx="78" cy="104" rx="10" ry="11" fill="#2C6E00" />
          <ellipse cx="122" cy="104" rx="10" ry="11" fill="#2C6E00" />
          <circle cx="78" cy="105" r="5" fill="#0A1A00" />
          <circle cx="122" cy="105" r="5" fill="#0A1A00" />
          <circle cx="80" cy="103" r="2" fill="white" />
          <circle cx="124" cy="103" r="2" fill="white" />
          {/* Cheeks */}
          <ellipse cx="70" cy="120" rx="12" ry="8" fill="rgba(255,100,50,0.25)" />
          <ellipse cx="130" cy="120" rx="12" ry="8" fill="rgba(255,100,50,0.25)" />
          {/* Nose */}
          <ellipse cx="100" cy="126" rx="7" ry="5" fill="#2C1A00" />
          {/* Mouth */}
          <path d="M 91,134 Q 100,142 109,134" stroke="#8B3A00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Whiskers */}
          <line x1="56" y1="120" x2="86" y2="124" stroke="#8B3A00" strokeWidth="1.2" opacity="0.5" />
          <line x1="114" y1="124" x2="144" y2="120" stroke="#8B3A00" strokeWidth="1.2" opacity="0.5" />
          {/* Body */}
          <ellipse cx="100" cy="186" rx="44" ry="28" fill="#E8622A" />
          <ellipse cx="100" cy="184" rx="24" ry="16" fill="#FFF0E0" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Bear ─────────────────────────────────────────────────────────────────────
export function BearAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    await ctrl.start({ scale: [1, 1.15, 0.95, 1.05, 1], transition: { duration: 0.6 } });
  }, [ctrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ scaleY: [1, 1.02, 1], y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 200 215" width={size} height={size * 1.075}>
          {/* Round ears */}
          <circle cx="52" cy="68" r="26" fill="#8B5E3C" />
          <circle cx="148" cy="68" r="26" fill="#8B5E3C" />
          <circle cx="52" cy="68" r="16" fill="#C4845A" opacity="0.7" />
          <circle cx="148" cy="68" r="16" fill="#C4845A" opacity="0.7" />
          {/* Head */}
          <circle cx="100" cy="118" r="66" fill="#A0693A" />
          {/* Muzzle */}
          <ellipse cx="100" cy="134" rx="30" ry="22" fill="#C4845A" />
          {/* Eyes */}
          <circle cx="78" cy="108" r="11" fill="#2C1200" />
          <circle cx="122" cy="108" r="11" fill="#2C1200" />
          <circle cx="80" cy="106" r="3" fill="white" />
          <circle cx="124" cy="106" r="3" fill="white" />
          {/* Cheeks */}
          <ellipse cx="68" cy="124" rx="14" ry="10" fill="rgba(200,90,50,0.22)" />
          <ellipse cx="132" cy="124" rx="14" ry="10" fill="rgba(200,90,50,0.22)" />
          {/* Nose */}
          <ellipse cx="100" cy="128" rx="8" ry="6" fill="#2C1200" />
          {/* Mouth */}
          <path d="M 92,138 Q 100,146 108,138" stroke="#5A2800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <line x1="100" y1="134" x2="100" y2="138" stroke="#5A2800" strokeWidth="2" />
          {/* Body */}
          <ellipse cx="100" cy="188" rx="48" ry="30" fill="#8B5E3C" />
          <ellipse cx="100" cy="186" rx="30" ry="18" fill="#C4845A" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Penguin ──────────────────────────────────────────────────────────────────
export function PenguinAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    await ctrl.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.5 } });
  }, [ctrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 200 225" width={size} height={size * 1.125}>
          {/* Body */}
          <ellipse cx="100" cy="170" rx="52" ry="55" fill="#1A1A2E" />
          {/* White belly */}
          <ellipse cx="100" cy="178" rx="34" ry="44" fill="white" />
          {/* Head */}
          <circle cx="100" cy="105" r="58" fill="#1A1A2E" />
          {/* White face */}
          <ellipse cx="100" cy="112" rx="38" ry="42" fill="white" />
          {/* Eyes */}
          <circle cx="82" cy="100" r="11" fill="white" />
          <circle cx="118" cy="100" r="11" fill="white" />
          <circle cx="82" cy="100" r="6" fill="#1A1A2E" />
          <circle cx="118" cy="100" r="6" fill="#1A1A2E" />
          <circle cx="84" cy="98" r="2.5" fill="white" />
          <circle cx="120" cy="98" r="2.5" fill="white" />
          {/* Beak */}
          <polygon points="100,118 88,126 112,126" fill="#FF8C00" />
          {/* Cheeks */}
          <ellipse cx="70" cy="116" rx="12" ry="8" fill="rgba(255,100,80,0.25)" />
          <ellipse cx="130" cy="116" rx="12" ry="8" fill="rgba(255,100,80,0.25)" />
          {/* Flippers */}
          <ellipse cx="46" cy="162" rx="16" ry="36" fill="#1A1A2E" transform="rotate(-18,46,162)" />
          <ellipse cx="154" cy="162" rx="16" ry="36" fill="#1A1A2E" transform="rotate(18,154,162)" />
          {/* Feet */}
          <ellipse cx="80" cy="215" rx="18" ry="8" fill="#FF8C00" />
          <ellipse cx="120" cy="215" rx="18" ry="8" fill="#FF8C00" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Dragon ───────────────────────────────────────────────────────────────────
export function DragonAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const wingCtrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    wingCtrl.start({ scaleX: [1, 1.4, 1], transition: { duration: 0.4 } });
    await ctrl.start({ y: [-10, 0], scale: [1, 1.1, 1], transition: { duration: 0.5 } });
  }, [ctrl, wingCtrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 220 220" width={size} height={size}>
          {/* Wings */}
          <motion.g animate={wingCtrl} style={{ transformOrigin: "100px 120px" }}>
            <path d="M50,120 Q20,80 40,60 Q60,40 80,90 Z" fill="#9B59B6" opacity="0.85" />
            <path d="M150,120 Q180,80 160,60 Q140,40 120,90 Z" fill="#9B59B6" opacity="0.85" />
            <path d="M50,120 Q22,85 42,65 Q58,48 78,88 Z" fill="#C39BD3" opacity="0.5" />
            <path d="M150,120 Q178,85 158,65 Q142,48 122,88 Z" fill="#C39BD3" opacity="0.5" />
          </motion.g>
          {/* Spikes on head */}
          <polygon points="80,62 74,40 88,58" fill="#E74C3C" />
          <polygon points="100,55 100,30 110,54" fill="#E74C3C" />
          <polygon points="120,62 126,40 112,58" fill="#E74C3C" />
          {/* Head */}
          <circle cx="100" cy="118" r="60" fill="#76D7C4" />
          {/* Snout */}
          <ellipse cx="100" cy="138" rx="26" ry="18" fill="#A9DFBF" />
          {/* Eyes */}
          <ellipse cx="78" cy="108" rx="12" ry="13" fill="#F39C12" />
          <ellipse cx="122" cy="108" rx="12" ry="13" fill="#F39C12" />
          <ellipse cx="78" cy="109" rx="5" ry="8" fill="#1A0A00" />
          <ellipse cx="122" cy="109" rx="5" ry="8" fill="#1A0A00" />
          <circle cx="79" cy="106" r="2" fill="white" />
          <circle cx="123" cy="106" r="2" fill="white" />
          {/* Nostrils */}
          <ellipse cx="94" cy="136" rx="4" ry="3" fill="#5DADE2" opacity="0.8" />
          <ellipse cx="106" cy="136" rx="4" ry="3" fill="#5DADE2" opacity="0.8" />
          {/* Mouth/smile */}
          <path d="M 88,145 Q 100,155 112,145" stroke="#1ABC9C" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <ellipse cx="68" cy="126" rx="13" ry="9" fill="rgba(230,180,30,0.28)" />
          <ellipse cx="132" cy="126" rx="13" ry="9" fill="rgba(230,180,30,0.28)" />
          {/* Body */}
          <ellipse cx="100" cy="188" rx="44" ry="26" fill="#76D7C4" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Owl ──────────────────────────────────────────────────────────────────────
export function OwlAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    await ctrl.start({ rotate: [0, 25, -25, 15, -10, 0], transition: { duration: 0.7 } });
  }, [ctrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 200 225" width={size} height={size * 1.125}>
          {/* Ear tufts */}
          <polygon points="66,68 52,38 80,65" fill="#8B6914" />
          <polygon points="134,68 148,38 120,65" fill="#8B6914" />
          {/* Body */}
          <ellipse cx="100" cy="170" rx="52" ry="55" fill="#C8A84B" />
          {/* Wing pattern */}
          <ellipse cx="54" cy="168" rx="22" ry="40" fill="#8B6914" opacity="0.7" transform="rotate(10,54,168)" />
          <ellipse cx="146" cy="168" rx="22" ry="40" fill="#8B6914" opacity="0.7" transform="rotate(-10,146,168)" />
          {/* Belly stripes */}
          <ellipse cx="100" cy="175" rx="30" ry="38" fill="#F5DEB3" />
          {/* Head */}
          <circle cx="100" cy="100" r="62" fill="#C8A84B" />
          {/* Forehead feathers */}
          <path d="M 68,68 Q 100,55 132,68" stroke="#8B6914" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Big eyes - facial discs */}
          <circle cx="76" cy="100" r="22" fill="#F5DEB3" />
          <circle cx="124" cy="100" r="22" fill="#F5DEB3" />
          <circle cx="76" cy="100" r="16" fill="#FFD700" />
          <circle cx="124" cy="100" r="16" fill="#FFD700" />
          <circle cx="76" cy="100" r="8" fill="#1A0A00" />
          <circle cx="124" cy="100" r="8" fill="#1A0A00" />
          <circle cx="78" cy="97" r="3" fill="white" />
          <circle cx="126" cy="97" r="3" fill="white" />
          {/* Beak */}
          <polygon points="100,112 91,122 109,122" fill="#FF8C00" />
          {/* Cheeks */}
          <ellipse cx="58" cy="110" rx="12" ry="8" fill="rgba(180,120,20,0.25)" />
          <ellipse cx="142" cy="110" rx="12" ry="8" fill="rgba(180,120,20,0.25)" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Frog ─────────────────────────────────────────────────────────────────────
export function FrogAvatar({ size = 160, onClick }: AvatarProps) {
  const ctrl = useAnimation();
  const handleClick = useCallback(async () => {
    onClick?.();
    await ctrl.start({ y: [-16, 0], scaleX: [0.9, 1.1, 1], transition: { duration: 0.4, ease: "easeOut" } });
  }, [ctrl, onClick]);
  return (
    <motion.div animate={ctrl} style={{ cursor: "pointer", display: "inline-block" }} onPointerDown={handleClick}>
      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
        <svg viewBox="0 0 210 210" width={size} height={size}>
          {/* Eye bumps on top of head */}
          <circle cx="62" cy="80" r="28" fill="#5DBB63" />
          <circle cx="148" cy="80" r="28" fill="#5DBB63" />
          {/* Head */}
          <ellipse cx="105" cy="118" rx="72" ry="58" fill="#5DBB63" />
          {/* Underbelly */}
          <ellipse cx="105" cy="128" rx="50" ry="38" fill="#A8E6A3" />
          {/* Big eyes */}
          <circle cx="62" cy="78" r="20" fill="white" />
          <circle cx="148" cy="78" r="20" fill="white" />
          <circle cx="62" cy="79" r="11" fill="#228B22" />
          <circle cx="148" cy="79" r="11" fill="#228B22" />
          <circle cx="62" cy="79" r="6" fill="#0A2A00" />
          <circle cx="148" cy="79" r="6" fill="#0A2A00" />
          <circle cx="64" cy="77" r="2.5" fill="white" />
          <circle cx="150" cy="77" r="2.5" fill="white" />
          {/* Nostrils */}
          <ellipse cx="95" cy="118" rx="4" ry="3" fill="#3A8A3A" opacity="0.7" />
          <ellipse cx="115" cy="118" rx="4" ry="3" fill="#3A8A3A" opacity="0.7" />
          {/* Big smile */}
          <path d="M 68,136 Q 105,160 142,136" stroke="#228B22" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <ellipse cx="72" cy="130" rx="15" ry="10" fill="rgba(40,180,60,0.22)" />
          <ellipse cx="138" cy="130" rx="15" ry="10" fill="rgba(40,180,60,0.22)" />
          {/* Body/legs hint */}
          <ellipse cx="105" cy="195" rx="46" ry="20" fill="#5DBB63" />
          <ellipse cx="70" cy="195" rx="18" ry="10" fill="#4CAF50" />
          <ellipse cx="140" cy="195" rx="18" ry="10" fill="#4CAF50" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface AvatarConfig {
  id:        AvatarId;
  label:     string;          // Hebrew name
  component: React.FC<AvatarProps>;
  sfx:       string;          // filename in /audio/sfx/
  color:     string;          // accent color for card highlight
}

export const AVATAR_CONFIG: AvatarConfig[] = [
  { id: "cat",     label: "\u05D7\u05B8\u05EA\u05D5\u05BC\u05DC",    component: CatAvatar,     sfx: "avatar_cat.mp3",     color: "#FFD89B" },
  { id: "dog",     label: "\u05DB\u05B6\u05BC\u05DC\u05B6\u05D1",    component: DogAvatar,     sfx: "avatar_dog.mp3",     color: "#D4885A" },
  { id: "unicorn", label: "\u05D7\u05B7\u05D3 \u05E7\u05B6\u05E8\u05B6\u05DF", component: UnicornAvatar, sfx: "avatar_unicorn.mp3", color: "#B388FF" },
  { id: "rabbit",  label: "\u05D0\u05B7\u05E8\u05B0\u05E0\u05B8\u05D1",   component: RabbitAvatar,  sfx: "avatar_rabbit.mp3",  color: "#CC66AA" },
  { id: "fox",     label: "\u05E9\u05C1\u05D5\u05BC\u05E2\u05B8\u05DC",   component: FoxAvatar,     sfx: "avatar_fox.mp3",     color: "#E8622A" },
  { id: "bear",    label: "\u05D3\u05BC\u05D5\u05B9\u05D1",     component: BearAvatar,    sfx: "avatar_bear.mp3",    color: "#A0693A" },
  { id: "penguin", label: "\u05E4\u05BC\u05B4\u05D9\u05E0\u05B0\u05D2\u05B0\u05D5\u05B4\u05D9\u05DF", component: PenguinAvatar, sfx: "avatar_penguin.mp3", color: "#5B6FA6" },
  { id: "dragon",  label: "\u05D3\u05B0\u05BC\u05E8\u05B8\u05E7\u05D5\u05B9\u05DF", component: DragonAvatar,  sfx: "avatar_dragon.mp3",  color: "#76D7C4" },
  { id: "owl",     label: "\u05D9\u05B7\u05E0\u05B0\u05E9\u05C1\u05D5\u05BC\u05E3", component: OwlAvatar,     sfx: "avatar_owl.mp3",     color: "#C8A84B" },
  { id: "frog",    label: "\u05E6\u05B0\u05E4\u05B7\u05E8\u05B0\u05D3\u05B5\u05BC\u05E2\u05B7", component: FrogAvatar, sfx: "avatar_frog.mp3",    color: "#5DBB63" },
];
