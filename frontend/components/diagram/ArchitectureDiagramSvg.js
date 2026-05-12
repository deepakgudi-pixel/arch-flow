import React from 'react';

export default function ArchitectureDiagramSvg() {
  return (
    <svg viewBox="0 0 660 420" width="100%" style={{ display: 'block', borderRadius: '10px' }} aria-label="Architecture diagram preview">
      <defs>
        {/* White glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feFlood floodColor="#fff" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feFlood floodColor="#fff" floodOpacity="0.12" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Arrow marker */}
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L0,8 L8,4 z" fill="#fff" opacity="0.7" />
        </marker>
        {/* Grid pattern */}
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
        </pattern>
        {/* Scanline overlay */}
        <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.012)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ── BACKGROUND ── */}
      <rect width="660" height="420" rx="10" fill="#09090b" />
      <rect width="660" height="420" rx="10" fill="url(#grid)" />
      <rect width="660" height="420" rx="10" fill="url(#scanlines)" />

      {/* Ambient glow spots */}
      <circle cx="170" cy="150" r="130" fill="#fff" opacity="0.012" />
      <circle cx="500" cy="210" r="150" fill="#fff" opacity="0.01" />

      {/* ── EDGES ── */}
      {/* React Native → API Gateway */}
      <path id="e1" d="M 185 90 C 250 90 280 145 310 150"
        stroke="#fff" strokeWidth="1.2" fill="none" markerEnd="url(#arr)" opacity="0"
        strokeDasharray="200" strokeDashoffset="200">
        <animate attributeName="opacity" from="0" to="0.5" dur="0.2s" begin="0.3s" fill="freeze" />
        <animate attributeName="stroke-dashoffset" from="200" to="0" dur="0.6s" begin="0.3s" fill="freeze" />
      </path>
      {/* Next.js → API Gateway */}
      <path id="e2" d="M 185 215 C 250 215 280 175 310 170"
        stroke="#fff" strokeWidth="1.2" fill="none" markerEnd="url(#arr)" opacity="0"
        strokeDasharray="200" strokeDashoffset="200">
        <animate attributeName="opacity" from="0" to="0.5" dur="0.2s" begin="0.45s" fill="freeze" />
        <animate attributeName="stroke-dashoffset" from="200" to="0" dur="0.6s" begin="0.45s" fill="freeze" />
      </path>
      {/* Next.js → Clerk Auth */}
      <path id="e3" d="M 150 248 C 190 300 230 330 260 338"
        stroke="#fff" strokeWidth="1" fill="none" strokeDasharray="5 4" markerEnd="url(#arr)" opacity="0">
        <animate attributeName="opacity" from="0" to="0.35" dur="0.3s" begin="0.6s" fill="freeze" />
      </path>
      {/* API Gateway → Postgres */}
      <path id="e4" d="M 448 145 C 480 120 500 95 520 90"
        stroke="#fff" strokeWidth="1.2" fill="none" markerEnd="url(#arr)" opacity="0"
        strokeDasharray="140" strokeDashoffset="140">
        <animate attributeName="opacity" from="0" to="0.5" dur="0.2s" begin="0.55s" fill="freeze" />
        <animate attributeName="stroke-dashoffset" from="140" to="0" dur="0.5s" begin="0.55s" fill="freeze" />
      </path>
      {/* API Gateway → SQS */}
      <path id="e5" d="M 448 170 C 480 195 500 210 520 215"
        stroke="#fff" strokeWidth="1" fill="none" strokeDasharray="5 4" markerEnd="url(#arr)" opacity="0">
        <animate attributeName="opacity" from="0" to="0.35" dur="0.3s" begin="0.7s" fill="freeze" />
      </path>
      {/* API Gateway → S3 */}
      <path id="e6" d="M 448 180 C 480 250 500 310 520 330"
        stroke="#fff" strokeWidth="1" fill="none" strokeDasharray="5 4" markerEnd="url(#arr)" opacity="0">
        <animate attributeName="opacity" from="0" to="0.35" dur="0.3s" begin="0.8s" fill="freeze" />
      </path>

      {/* ── ANIMATED DATA PACKETS ── */}
      <circle r="3" fill="#fff" opacity="0" filter="url(#glow)"><animate attributeName="opacity" from="0" to="0.9" dur="0.1s" begin="1s" fill="freeze" /><animateMotion dur="2s" repeatCount="indefinite" begin="1s"><mpath href="#e1" /></animateMotion></circle>
      <circle r="3" fill="#fff" opacity="0" filter="url(#glow)"><animate attributeName="opacity" from="0" to="0.9" dur="0.1s" begin="1.6s" fill="freeze" /><animateMotion dur="2.5s" repeatCount="indefinite" begin="1.6s"><mpath href="#e2" /></animateMotion></circle>
      <circle r="2.5" fill="#fff" opacity="0" filter="url(#glow)"><animate attributeName="opacity" from="0" to="0.7" dur="0.1s" begin="2.2s" fill="freeze" /><animateMotion dur="3s" repeatCount="indefinite" begin="2.2s"><mpath href="#e3" /></animateMotion></circle>
      <circle r="3" fill="#fff" opacity="0" filter="url(#glow)"><animate attributeName="opacity" from="0" to="0.9" dur="0.1s" begin="1.4s" fill="freeze" /><animateMotion dur="1.8s" repeatCount="indefinite" begin="1.4s"><mpath href="#e4" /></animateMotion></circle>
      <circle r="3" fill="#fff" opacity="0" filter="url(#glow)"><animate attributeName="opacity" from="0" to="0.7" dur="0.1s" begin="2s" fill="freeze" /><animateMotion dur="2.3s" repeatCount="indefinite" begin="2s"><mpath href="#e5" /></animateMotion></circle>
      <circle r="2.5" fill="#fff" opacity="0" filter="url(#glow)"><animate attributeName="opacity" from="0" to="0.7" dur="0.1s" begin="2.6s" fill="freeze" /><animateMotion dur="2.9s" repeatCount="indefinite" begin="2.6s"><mpath href="#e6" /></animateMotion></circle>

      {/* ── NODES ── */}

      {/* React Native */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="0.1s" fill="freeze" />
        <rect x="30" y="55" width="155" height="70" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="52" cy="80" r="4" fill="#fff" opacity="0.9" />
        <text x="64" y="84" fontFamily="var(--font-sans)" fontSize="12" fontWeight="700" fill="rgba(255,255,255,0.9)">React Native</text>
        <rect x="52" y="96" width="52" height="16" rx="4" fill="rgba(255,255,255,0.06)" />
        <text x="58" y="108" fontFamily="var(--font-mono)" fontSize="8.5" fontWeight="800" fill="rgba(255,255,255,0.5)">MOBILE</text>
      </g>

      {/* Next.js App */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="0.2s" fill="freeze" />
        <rect x="30" y="180" width="155" height="70" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="52" cy="205" r="4" fill="#fff" opacity="0.9" />
        <text x="64" y="209" fontFamily="var(--font-sans)" fontSize="12" fontWeight="700" fill="rgba(255,255,255,0.9)">Next.js App</text>
        <rect x="52" y="221" width="66" height="16" rx="4" fill="rgba(255,255,255,0.06)" />
        <text x="58" y="233" fontFamily="var(--font-mono)" fontSize="8.5" fontWeight="800" fill="rgba(255,255,255,0.5)">FRONTEND</text>
      </g>

      {/* API Gateway — primary node */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="0.3s" fill="freeze" />
        <rect x="310" y="118" width="138" height="80" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" filter="url(#glow-soft)" />
        <circle cx="334" cy="146" r="5" fill="#fff" opacity="0.95" />
        <text x="348" y="151" fontFamily="var(--font-sans)" fontSize="13" fontWeight="800" fill="#fff">API Gateway</text>
        <rect x="334" y="164" width="44" height="18" rx="4" fill="rgba(255,255,255,0.08)" />
        <text x="341" y="177" fontFamily="var(--font-mono)" fontSize="9" fontWeight="800" fill="rgba(255,255,255,0.6)">gRPC</text>
        <rect x="386" y="164" width="44" height="18" rx="4" fill="rgba(255,255,255,0.08)" />
        <text x="393" y="177" fontFamily="var(--font-mono)" fontSize="9" fontWeight="800" fill="rgba(255,255,255,0.6)">REST</text>
      </g>

      {/* Clerk Auth */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="0.42s" fill="freeze" />
        <rect x="230" y="310" width="130" height="65" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="252" cy="335" r="4" fill="#fff" opacity="0.9" />
        <text x="264" y="339" fontFamily="var(--font-sans)" fontSize="12" fontWeight="700" fill="rgba(255,255,255,0.9)">Clerk Auth</text>
        <rect x="252" y="351" width="36" height="15" rx="4" fill="rgba(255,255,255,0.06)" />
        <text x="258" y="363" fontFamily="var(--font-mono)" fontSize="8.5" fontWeight="800" fill="rgba(255,255,255,0.5)">OIDC</text>
      </g>

      {/* Postgres */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="0.5s" fill="freeze" />
        <rect x="520" y="55" width="115" height="70" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="542" cy="80" r="4" fill="#fff" opacity="0.9" />
        <text x="554" y="84" fontFamily="var(--font-sans)" fontSize="12" fontWeight="700" fill="rgba(255,255,255,0.9)">Postgres</text>
        <rect x="542" y="96" width="36" height="16" rx="4" fill="rgba(255,255,255,0.06)" />
        <text x="548" y="108" fontFamily="var(--font-mono)" fontSize="8.5" fontWeight="800" fill="rgba(255,255,255,0.5)">SQL</text>
      </g>

      {/* SQS */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="0.57s" fill="freeze" />
        <rect x="520" y="180" width="115" height="70" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="542" cy="205" r="4" fill="#fff" opacity="0.9" />
        <text x="554" y="209" fontFamily="var(--font-sans)" fontSize="12" fontWeight="700" fill="rgba(255,255,255,0.9)">SQS</text>
        <rect x="542" y="221" width="48" height="16" rx="4" fill="rgba(255,255,255,0.06)" />
        <text x="548" y="233" fontFamily="var(--font-mono)" fontSize="8.5" fontWeight="800" fill="rgba(255,255,255,0.5)">ASYNC</text>
      </g>

      {/* S3 Bucket */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.35s" begin="0.64s" fill="freeze" />
        <rect x="520" y="310" width="115" height="65" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="542" cy="335" r="4" fill="#fff" opacity="0.9" />
        <text x="554" y="339" fontFamily="var(--font-sans)" fontSize="12" fontWeight="700" fill="rgba(255,255,255,0.9)">S3 Bucket</text>
        <rect x="542" y="351" width="28" height="15" rx="4" fill="rgba(255,255,255,0.06)" />
        <text x="548" y="363" fontFamily="var(--font-mono)" fontSize="8.5" fontWeight="800" fill="rgba(255,255,255,0.5)">S3</text>
      </g>

      {/* Protocol labels on edges */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1s" fill="freeze" />
        <rect x="225" y="82" width="38" height="16" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <text x="232" y="94" fontFamily="var(--font-mono)" fontSize="8" fontWeight="800" fill="rgba(255,255,255,0.4)">REST</text>
      </g>
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.1s" fill="freeze" />
        <rect x="225" y="202" width="38" height="16" rx="4" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <text x="233" y="214" fontFamily="var(--font-mono)" fontSize="8" fontWeight="800" fill="rgba(255,255,255,0.4)">WSS</text>
      </g>

      {/* Corner accents */}
      <path d="M 14 28 L 14 14 L 28 14" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      <path d="M 632 14 L 646 14 L 646 28" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      <path d="M 14 392 L 14 406 L 28 406" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />
      <path d="M 632 406 L 646 406 L 646 392" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />

      {/* HUD status bar */}
      <g opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" begin="1.3s" fill="freeze" />
        <text x="32" y="406" fontFamily="var(--font-mono)" fontSize="7" fontWeight="700" fill="rgba(255,255,255,0.2)">SYS.ARCHFLOW // TOPOLOGY v2.4.1</text>
        <text x="490" y="406" fontFamily="var(--font-mono)" fontSize="7" fontWeight="700" fill="rgba(255,255,255,0.2)">NODES: 7 • EDGES: 6</text>
      </g>
    </svg>
  );
}
