import type { GameConfig } from "../../engine/gameRegistry";

interface DangerSceneProps {
  danger: GameConfig["rescue"]["danger"];
  animal: string;
  progress: number;   // 0 = fully trapped, 1 = fully free
}

function clamp(v: number) { return Math.max(0, Math.min(1, v)); }

function WebScene({ animal, progress }: { animal: string; progress: number }) {
  const opacity = clamp(1 - progress);
  return (
    <g>
      <defs>
        <filter id="web-turbulence">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.04;0.06;0.04" dur="3s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <g opacity={opacity} filter="url(#web-turbulence)">
        <line x1="70" y1="0" x2="100" y2="40" stroke="#C8A882" strokeWidth="1.5" opacity="0.8"/>
        <line x1="100" y1="0" x2="100" y2="40" stroke="#C8A882" strokeWidth="1.5" opacity="0.8"/>
        <line x1="130" y1="0" x2="100" y2="40" stroke="#C8A882" strokeWidth="1.5" opacity="0.8"/>
        <line x1="60" y1="20" x2="140" y2="20" stroke="#C8A882" strokeWidth="1.5" opacity="0.7"/>
        <line x1="55" y1="35" x2="145" y2="35" stroke="#C8A882" strokeWidth="1.5" opacity="0.7"/>
        <ellipse cx="100" cy="40" rx="30" ry="25" stroke="#C8A882" strokeWidth="2" fill="rgba(200,168,130,0.15)"/>
      </g>
      <text
        x="100" y="48"
        textAnchor="middle"
        fontSize={progress > 0.8 ? "34" : "28"}
        style={{
          transition: "font-size 0.4s",
          animation: "animalWiggle 1.4s ease-in-out infinite",
        }}
      >{animal}</text>
    </g>
  );
}

function BubbleScene({ animal, progress }: { animal: string; progress: number }) {
  const scale = clamp(1 - progress * 0.4);
  const crackOpacity = clamp(progress * 2 - 0.5);
  return (
    <g transform={`translate(100,40) scale(${scale}) translate(-100,-40)`}>
      <defs>
        <radialGradient id="bubble-grad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="rgba(78,205,196,0.7)"/>
          <stop offset="60%" stopColor="rgba(78,205,196,0.2)"/>
          <stop offset="100%" stopColor="rgba(78,205,196,0.5)"/>
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="42" rx="36" ry="30" fill="url(#bubble-grad)" stroke="#4ECDC4" strokeWidth="2.5">
        <animate attributeName="rx" values="36;38;36" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      <g opacity={crackOpacity}>
        <path d="M88,18 L94,28 L86,36" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
        <path d="M112,20 L107,30 L115,38" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
      </g>
      <ellipse cx="88" cy="28" rx="8" ry="5" fill="rgba(255,255,255,0.4)" transform="rotate(-20,88,28)"/>
      <text x="100" y="50" textAnchor="middle" fontSize="28"
        style={{ animation: "animalWiggle 1.6s ease-in-out infinite" }}
      >{animal}</text>
    </g>
  );
}

function QuicksandScene({ animal, progress }: { animal: string; progress: number }) {
  const sinkDepth = clamp(1 - progress) * 24;
  return (
    <g>
      <defs>
        <filter id="sand-turbulence">
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="3" result="noise">
            <animate attributeName="baseFrequency" values="0.05;0.08;0.05" dur="2.5s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <rect x="40" y="50" width="120" height="30" rx="4" fill="#C8963A" filter="url(#sand-turbulence)" opacity="0.85"/>
      <rect x="40" y="48" width="120" height="8" rx="4" fill="#E8B84A" filter="url(#sand-turbulence)" opacity="0.7"/>
      <text
        x="100" y={48 - sinkDepth + sinkDepth * progress}
        textAnchor="middle" fontSize="30"
        style={{ animation: "animalWiggle 1.2s ease-in-out infinite" }}
      >{animal}</text>
    </g>
  );
}

function NetScene({ animal, progress }: { animal: string; progress: number }) {
  const netOpacity = clamp(1 - progress);
  const tearWidth  = clamp(progress) * 40;
  return (
    <g>
      <g opacity={netOpacity}>
        {[60,75,90,105,120,135].map(x => (
          <line key={`v${x}`} x1={x} y1="8" x2={x} y2="72" stroke="#8B6340" strokeWidth="1.5"/>
        ))}
        {[15,30,45,60].map(y => (
          <line key={`h${y}`} x1="60" y1={y} x2="140" y2={y} stroke="#8B6340" strokeWidth="1.5"/>
        ))}
        <rect x="60" y="8" width="80" height="64" stroke="#8B6340" strokeWidth="2.5" fill="rgba(139,99,64,0.1)" rx="2"/>
      </g>
      {progress > 0.2 && (
        <ellipse cx="100" cy="40" rx={tearWidth / 2} ry={tearWidth * 0.4}
          fill="rgba(100,180,255,0.15)" stroke="rgba(139,99,64,0.5)" strokeWidth="1"
          strokeDasharray="3,2"
        />
      )}
      <text x="100" y="46" textAnchor="middle" fontSize="30"
        style={{ animation: "animalWiggle 1.4s ease-in-out infinite" }}
      >{animal}</text>
    </g>
  );
}

function StormScene({ animal, progress }: { animal: string; progress: number }) {
  const cloudOpacity = clamp(1 - progress);
  const lightningOpacity = clamp(1 - progress * 2);
  return (
    <g>
      <defs>
        <filter id="storm-blur">
          <feGaussianBlur stdDeviation="1.5"/>
        </filter>
      </defs>
      <g opacity={cloudOpacity}>
        <ellipse cx="75" cy="25" rx="28" ry="16" fill="#8899AA" filter="url(#storm-blur)">
          <animateTransform attributeName="transform" type="translate" values="0,0;-5,2;0,0" dur="3s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="125" cy="20" rx="24" ry="14" fill="#99AABB" filter="url(#storm-blur)">
          <animateTransform attributeName="transform" type="translate" values="0,0;4,-2;0,0" dur="3.5s" repeatCount="indefinite"/>
        </ellipse>
      </g>
      <polyline points="105,30 98,45 104,45 96,62" stroke="#FFD700" strokeWidth="2.5"
        fill="none" opacity={lightningOpacity}
        style={{ filter: "drop-shadow(0 0 4px #FFD700)" }}
      >
        <animate attributeName="opacity" values={`${lightningOpacity};0;${lightningOpacity}`} dur="1.5s" repeatCount="indefinite"/>
      </polyline>
      <text x="100" y="52" textAnchor="middle" fontSize="30"
        style={{ animation: "animalWiggle 1s ease-in-out infinite" }}
      >{animal}</text>
    </g>
  );
}

export function DangerScene({ danger, animal, progress }: DangerSceneProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      width="200" height="80"
      style={{ overflow: "visible" }}
    >
      <style>{`
        @keyframes animalWiggle {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
      `}</style>
      {danger === "web"       && <WebScene      animal={animal} progress={progress}/>}
      {danger === "bubble"    && <BubbleScene   animal={animal} progress={progress}/>}
      {danger === "quicksand" && <QuicksandScene animal={animal} progress={progress}/>}
      {danger === "net"       && <NetScene      animal={animal} progress={progress}/>}
      {danger === "storm"     && <StormScene    animal={animal} progress={progress}/>}
    </svg>
  );
}
