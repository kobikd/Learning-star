import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CatPose = "wave" | "point-right" | "point-left" | "idle";

interface CatCharacterProps {
  doFunnyAnimation?: boolean;
  onClick?: () => void;
  size?: number;
  /** Body pose — controls arm positions */
  pose?: CatPose;
  /** Text shown in a speech bubble above the cat */
  speechBubble?: string;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const CAT_COLOR  = "#FFD89B";
const CAT_DARK   = "#F5BC5A";
const EAR_INNER  = "#FFB0BE";
const EYE_COLOR  = "#2C1810";
const CHEEK_COLOR= "#FFB0BE";
const BELLY_COLOR= "#FFF4DC";

// ─── Arm configs per pose ─────────────────────────────────────────────────────
// rotate values for the waving / pointing arm (right arm in SVG coords)
// origin is at shoulder: 152px, 145px

const ARM_ANIM: Record<CatPose, {
  rightRotate: number[] | number;
  rightTransition: object;
  leftRotate: number;
}> = {
  "wave":        { rightRotate: [-30, 22, -30], rightTransition: { repeat: Infinity, duration: 0.75, ease: "easeInOut" }, leftRotate: 12  },
  "point-right": { rightRotate: -75,             rightTransition: { type: "spring", stiffness: 200, damping: 18 },       leftRotate: 12  },
  "point-left":  { rightRotate: 0,               rightTransition: { type: "spring", stiffness: 200, damping: 18 },       leftRotate: -70 },
  "idle":        { rightRotate: -15,             rightTransition: { type: "spring", stiffness: 200, damping: 18 },       leftRotate: 12  },
};

// ─── Speech bubble ────────────────────────────────────────────────────────────

function SpeechBubble({ text, pointTo }: { text: string; pointTo: "left" | "right" | "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      style={{
        position: "absolute",
        top: -62,
        insetInlineStart: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "white",
        borderRadius: "var(--radius-md)",
        padding: "0.5rem 1rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-primary)",
        fontSize: "var(--text-label)",
        fontWeight: "var(--font-semibold)",
        color: "var(--text-primary)",
        direction: "rtl",
        zIndex: 10,
        border: "1.5px solid var(--border-default)",
      }}
    >
      {text}
      {/* Downward tail of bubble */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -8,
          // Shift tail toward the side the cat points to
          left: pointTo === "left" ? "25%" : pointTo === "right" ? "75%" : "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid white",
        }}
      />
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CatCharacter — the child's companion throughout the app.
 *
 * Poses:
 *  • wave       — perpetual right-arm wave (Welcome Screen)
 *  • point-right— right arm raised & angled right (map pointing)
 *  • point-left — left arm raised & angled left
 *  • idle       — both arms resting, gentle breathing only
 *
 * Extras:
 *  • speechBubble — shows a floating text bubble above the head
 *  • doFunnyAnimation — happy bounce on tap
 */
export function CatCharacter({
  doFunnyAnimation = false,
  onClick,
  size = 220,
  pose = "wave",
  speechBubble,
}: CatCharacterProps) {
  const bodyControls = useAnimation();
  const eyeControls  = useAnimation();

  // Idle breathing loop
  useEffect(() => {
    bodyControls.start({
      scaleY: [1, 1.025, 1],
      transition: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
    });
  }, [bodyControls]);

  // Funny click animation
  useEffect(() => {
    if (!doFunnyAnimation) return;
    async function run() {
      await eyeControls.start({ scaleY: 0.15, transition: { duration: 0.12 } });
      await bodyControls.start({ y: -28, rotate: [-4, 4, -3, 3, 0], transition: { duration: 0.45, ease: "easeOut" } });
      await bodyControls.start({ y: 0, transition: { type: "spring", stiffness: 280, damping: 14 } });
      await eyeControls.start({ scaleY: 1, transition: { duration: 0.18 } });
      bodyControls.start({ scaleY: [1, 1.025, 1], transition: { repeat: Infinity, duration: 2.8, ease: "easeInOut" } });
    }
    run();
  }, [doFunnyAnimation, bodyControls, eyeControls]);

  const arm = ARM_ANIM[pose];
  // Determine speech bubble tail direction from pose
  const bubblePoint = pose === "point-right" ? "right" : pose === "point-left" ? "left" : "center";

  return (
    <motion.div
      onClick={onClick}
      animate={bodyControls}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? "לחצי על החתול" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick() : undefined}
      style={{
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        display: "inline-flex",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        transformOrigin: "center bottom",
      }}
    >
      {/* Speech bubble */}
      {speechBubble && <SpeechBubble text={speechBubble} pointTo={bubblePoint} />}

      <svg
        viewBox="0 0 200 250"
        width={size}
        height={size * 1.2}
        aria-label="חתול מצויר"
        role="img"
        overflow="visible"
      >
        {/* ── Tail ── */}
        <motion.path
          d="M138,218 Q188,195 175,152"
          stroke={CAT_COLOR} strokeWidth={16} fill="none" strokeLinecap="round"
          animate={{ d: ["M138,218 Q188,195 175,152","M138,218 Q195,185 180,148","M138,218 Q188,195 175,152"] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        />
        <motion.path
          d="M138,218 Q188,195 175,152"
          stroke={CAT_DARK} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.55}
          animate={{ d: ["M138,218 Q188,195 175,152","M138,218 Q195,185 180,148","M138,218 Q188,195 175,152"] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        />

        {/* ── Body ── */}
        <ellipse cx="100" cy="182" rx="54" ry="58" fill={CAT_COLOR} />
        <ellipse cx="100" cy="195" rx="32" ry="40" fill={BELLY_COLOR} />

        {/* ── Left arm ── */}
        <motion.g
          style={{ transformOrigin: "48px 145px" }}
          animate={{ rotate: arm.leftRotate }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <ellipse cx="48" cy="168" rx="15" ry="24" fill={CAT_COLOR} transform="rotate(12 48 168)" />
          <ellipse cx="44" cy="190" rx="14" ry="9"  fill={CAT_COLOR} />
        </motion.g>

        {/* ── Right arm (waving / pointing) ── */}
        <motion.g
          style={{ transformOrigin: "152px 145px" }}
          animate={{ rotate: arm.rightRotate }}
          transition={arm.rightTransition}
        >
          <ellipse cx="152" cy="162" rx="15" ry="24" fill={CAT_COLOR} transform="rotate(-12 152 162)" />
          <ellipse cx="157" cy="142" rx="14" ry="9"  fill={CAT_COLOR} transform="rotate(-12 157 142)" />
        </motion.g>

        {/* ── Head ── */}
        <circle cx="100" cy="90" r="48" fill={CAT_COLOR} />

        {/* ── Ears ── */}
        <polygon points="62,52 42,16 84,46"    fill={CAT_COLOR} />
        <polygon points="138,52 158,16 116,46"  fill={CAT_COLOR} />
        <polygon points="64,50 48,24 82,46"    fill={EAR_INNER} />
        <polygon points="136,50 152,24 118,46"  fill={EAR_INNER} />

        {/* ── Eyes ── */}
        <motion.g animate={eyeControls} style={{ transformOrigin: "82px 88px" }}>
          <ellipse cx="82"  cy="88" rx="12" ry="14" fill={EYE_COLOR} />
          <circle  cx="86"  cy="82" r={4.5}         fill="white" />
          <circle  cx="87"  cy="92" r={2}            fill="white" />
        </motion.g>
        <motion.g animate={eyeControls} style={{ transformOrigin: "118px 88px" }}>
          <ellipse cx="118" cy="88" rx="12" ry="14" fill={EYE_COLOR} />
          <circle  cx="122" cy="82" r={4.5}         fill="white" />
          <circle  cx="123" cy="92" r={2}            fill="white" />
        </motion.g>

        {/* ── Nose ── */}
        <path d="M96,105 L100,110 L104,105 Z" fill="#FF9EC5" />

        {/* ── Smile ── */}
        <path d="M87,114 Q100,126 113,114" stroke={EYE_COLOR} strokeWidth={2.5} fill="none" strokeLinecap="round" />

        {/* ── Cheeks ── */}
        <ellipse cx="68"  cy="108" rx="14" ry="9" fill={CHEEK_COLOR} opacity={0.45} />
        <ellipse cx="132" cy="108" rx="14" ry="9" fill={CHEEK_COLOR} opacity={0.45} />

        {/* ── Whiskers ── */}
        {([
          [48,103,84,106],[48,110,84,110],
          [116,106,152,103],[116,110,152,110],
        ] as [number,number,number,number][]).map(([x1,y1,x2,y2],i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B8A080" strokeWidth={1.4} opacity={0.6} />
        ))}

        {/* ── Feet ── */}
        <ellipse cx="76"  cy="234" rx="22" ry="12" fill={CAT_COLOR} />
        <ellipse cx="124" cy="234" rx="22" ry="12" fill={CAT_COLOR} />
      </svg>
    </motion.div>
  );
}
