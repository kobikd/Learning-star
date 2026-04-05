import type { IslandSubject } from "../../engine/islandProgress";

interface IslandLandscapeProps {
  subject: IslandSubject;
}

function MathLandscape() {
  return (
    <>
      <defs>
        <linearGradient id="mathSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB"/>
          <stop offset="100%" stopColor="#B8E4F0"/>
        </linearGradient>
        <linearGradient id="mathOcean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4FA8D4"/>
          <stop offset="100%" stopColor="#2B7BBB"/>
        </linearGradient>
      </defs>

      <rect width="800" height="300" fill="url(#mathSky)"/>
      <rect y="400" width="800" height="120" fill="url(#mathOcean)"/>
      <path d="M0,405 Q100,398 200,405 Q300,412 400,405 Q500,398 600,405 Q700,412 800,405"
            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>

      <path d="M60,390 Q40,330 80,265 Q110,220 175,205 Q225,175 300,165 Q380,140 400,148
               Q460,138 535,168 Q590,178 635,210 Q695,230 720,275 Q755,330 740,390
               Q720,408 660,418 Q575,436 490,425 Q415,436 330,425 Q250,436 170,418 Q95,405 60,390Z"
            fill="#7BA05B" stroke="#5A8040" strokeWidth="2"/>
      <path d="M60,390 Q95,405 170,418 Q250,436 330,425 Q415,436 490,425 Q575,436 660,418 Q720,408 740,390"
            fill="none" stroke="#E8D5A3" strokeWidth="14" strokeLinecap="round" opacity="0.65"/>

      <path d="M350,155 L395,218 L305,218Z" fill="#5A7A3A" stroke="#4A6A2A" strokeWidth="1.5"/>
      <path d="M355,162 L385,202 L328,202Z" fill="#6B8E4E"/>
      <path d="M352,160 L368,182 L336,182Z" fill="white" opacity="0.55"/>
      <circle cx="354" cy="148" r="9" fill="white" opacity="0.28"/>
      <circle cx="362" cy="138" r="7" fill="white" opacity="0.2"/>
      <circle cx="357" cy="129" r="5" fill="white" opacity="0.14"/>

      <circle cx="148" cy="285" r="20" fill="#2E7D32"/>
      <circle cx="164" cy="278" r="15" fill="#388E3C"/>
      <circle cx="138" cy="295" r="13" fill="#43A047"/>
      <circle cx="648" cy="288" r="18" fill="#2E7D32"/>
      <circle cx="663" cy="280" r="13" fill="#388E3C"/>
      <circle cx="638" cy="296" r="11" fill="#43A047"/>

      <line x1="118" y1="320" x2="122" y2="282" stroke="#8B6340" strokeWidth="4" strokeLinecap="round"/>
      <path d="M122,282 Q106,270 100,278" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M122,282 Q138,268 143,276" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M122,282 Q120,265 126,263" stroke="#66BB6A" strokeWidth="3" fill="none" strokeLinecap="round"/>

      <line x1="682" y1="318" x2="679" y2="282" stroke="#8B6340" strokeWidth="4" strokeLinecap="round"/>
      <path d="M679,282 Q663,270 657,278" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M679,282 Q695,268 700,276" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </>
  );
}

function ReadingLandscape() {
  return (
    <>
      <defs>
        <linearGradient id="readingSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8D5F5"/>
          <stop offset="100%" stopColor="#C8E6C9"/>
        </linearGradient>
      </defs>

      <rect width="800" height="520" fill="url(#readingSky)"/>
      <path d="M0,288 Q200,260 400,275 Q600,260 800,288 L800,520 L0,520Z" fill="#5A8040"/>
      <path d="M0,308 Q200,288 400,296 Q600,288 800,308 L800,520 L0,520Z" fill="#4A7030"/>

      <rect x="84" y="210" width="13" height="78" rx="5" fill="#6B4226"/>
      <circle cx="90" cy="198" r="36" fill="#2E7D32"/>
      <circle cx="110" cy="204" r="26" fill="#388E3C"/>
      <circle cx="70" cy="210" r="22" fill="#43A047"/>

      <rect x="686" y="218" width="12" height="70" rx="5" fill="#6B4226"/>
      <circle cx="692" cy="206" r="32" fill="#2E7D32"/>
      <circle cx="710" cy="212" r="23" fill="#388E3C"/>
      <circle cx="676" cy="218" r="18" fill="#43A047"/>

      <rect x="284" y="228" width="10" height="62" rx="4" fill="#6B4226"/>
      <circle cx="289" cy="216" r="26" fill="#2E7D32"/>
      <circle cx="305" cy="222" r="19" fill="#388E3C"/>

      <rect x="536" y="222" width="10" height="66" rx="4" fill="#6B4226"/>
      <circle cx="541" cy="210" r="29" fill="#2E7D32"/>
      <circle cx="556" cy="216" r="20" fill="#388E3C"/>

      <circle cx="152" cy="252" r="3.5" fill="#FFD700" opacity="0.7"/>
      <circle cx="358" cy="242" r="3" fill="#FFD700" opacity="0.6"/>
      <circle cx="502" cy="255" r="3.5" fill="#FFD700" opacity="0.7"/>
      <circle cx="635" cy="245" r="2.5" fill="#FFD700" opacity="0.5"/>
      <text x="204" y="270" fontSize="14" opacity="0.55">✨</text>
      <text x="438" y="260" fontSize="12" opacity="0.45">✨</text>
      <text x="598" y="272" fontSize="14" opacity="0.55">✨</text>

      <circle cx="660" cy="80" r="32" fill="#FFF9C4" opacity="0.6"/>
      <circle cx="674" cy="72" r="26" fill="url(#readingSky)" opacity="0.75"/>

      <circle cx="120" cy="55" r="2.5" fill="white" opacity="0.7"/>
      <circle cx="240" cy="38" r="2" fill="white" opacity="0.6"/>
      <circle cx="490" cy="48" r="2.5" fill="white" opacity="0.7"/>
      <circle cx="730" cy="38" r="2" fill="white" opacity="0.5"/>
    </>
  );
}

export function IslandLandscape({ subject }: IslandLandscapeProps) {
  return subject === 'math' ? <MathLandscape /> : <ReadingLandscape />;
}
