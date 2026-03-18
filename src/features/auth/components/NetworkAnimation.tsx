/**
 * NetworkAnimation — symmetrical constellation graph.
 *
 * Pure SVG. No HTML cards.
 * Hub · Inner hex ring (r=22) · Outer octagon ring (r=38)
 * Comet-tail travelers · SVG glow filters · sonar rings.
 */

const PI = Math.PI;
const HX = 50, HY = 50;

function polar(r: number, deg: number) {
  const a = deg * PI / 180;
  return { x: +(HX + r * Math.cos(a)).toFixed(2), y: +(HY + r * Math.sin(a)).toFixed(2) };
}

// ── Inner ring: 6 nodes, 60° apart ──────────────────────────────────────────
const INNER = [
  { sector: 'Distribution',  wilaya: 'Alger',        dur: 5.5, delay: 0.0, amp: 4 },
  { sector: 'Métallurgie',   wilaya: 'Constantine',  dur: 6.2, delay: 0.5, amp: 5 },
  { sector: 'Hydraulique',   wilaya: 'Annaba',        dur: 5.8, delay: 1.0, amp: 4 },
  { sector: 'Agriculture',   wilaya: 'Oran',          dur: 6.5, delay: 1.5, amp: 5 },
  { sector: 'Électrique',    wilaya: 'Batna',         dur: 5.2, delay: 2.0, amp: 4 },
  { sector: 'Mécanique',     wilaya: 'Sétif',         dur: 6.8, delay: 2.5, amp: 5 },
].map((m, i) => ({ ...m, id: i, ...polar(22, -90 + i * 60) }));

// ── Outer ring: 8 nodes, 45° apart ──────────────────────────────────────────
const OUTER = [
  { wilaya: 'Skikda',     delay: 0.2 },
  { wilaya: 'Jijel',      delay: 0.9 },
  { wilaya: 'El Tarf',    delay: 1.6 },
  { wilaya: 'Mostaganem', delay: 2.3 },
  { wilaya: "M'Sila",     delay: 3.0 },
  { wilaya: 'Médéa',      delay: 3.7 },
  { wilaya: 'Tizi Ouzou', delay: 4.4 },
  { wilaya: 'Béjaïa',     delay: 5.1 },
].map((m, i) => ({ ...m, id: i, ...polar(38, -90 + i * 45) }));

// ── Inner → Outer edges ──────────────────────────────────────────────────────
const IO_EDGES: [number, number][] = [
  [0,7],[0,0],[0,1],
  [1,1],[1,2],
  [2,2],[2,3],
  [3,3],[3,4],[3,5],
  [4,5],[4,6],
  [5,6],[5,7],
];

// ── Label positions (outward from hub, 5 units beyond node) ─────────────────
function innerLabel(i: number) {
  const θ = (-90 + i * 60) * PI / 180;
  const n = INNER[i];
  return {
    x:      +(n.x + 5 * Math.cos(θ)).toFixed(2),
    y:      +(n.y + 5 * Math.sin(θ)).toFixed(2),
    anchor: i === 0 || i === 3 ? 'middle' : i < 3 ? 'start' : 'end',
  };
}

function outerLabel(i: number) {
  const θ = (-90 + i * 45) * PI / 180;
  const n = OUTER[i];
  return {
    x:      +(n.x + 4.5 * Math.cos(θ)).toFixed(2),
    y:      +(n.y + 4.5 * Math.sin(θ)).toFixed(2),
    anchor:
      i === 0 || i === 4 ? 'middle' :
      i >= 1 && i <= 3   ? 'start'  : 'end',
  };
}

// Outer octagon path (for circumference comets)
const OCTAGON_CW  = OUTER.map((n) => `${n.x},${n.y}`).join(' L ');
const OCTAGON_CCW = [...OUTER].reverse().map((n) => `${n.x},${n.y}`).join(' L ');

export function NetworkAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes svFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes svFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(calc(-1px * var(--amp, 4))); }
        }
        @keyframes svHubGlow {
          0%,100% { opacity: 0.85; }
          50%     { opacity: 0.55; }
        }
        @keyframes svLineShimmer {
          0%,100% { opacity: var(--lo, 0.28); }
          50%     { opacity: var(--hi, 0.58); }
        }
        .sv-fade  { animation: svFadeIn 0.9s var(--del, 0s) cubic-bezier(.4,0,.2,1) both; }
        .sv-float { animation: svFloat var(--dur, 5.5s) var(--del, 0s) ease-in-out infinite; }
        .sv-hub-g { animation: svHubGlow 4.5s ease-in-out infinite; }
        .sv-line  { animation: svLineShimmer var(--ld, 5s) var(--lo2, 0s) ease-in-out infinite; }
      `}</style>

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* ── Dot grid ── */}
          <pattern id="sv-dots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.14" fill="rgba(255,255,255,0.038)" />
          </pattern>

          {/* ── Glow filters ── */}
          <filter id="sv-g1" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.0" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="sv-g2" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2.2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="sv-g3" x="-250%" y="-250%" width="600%" height="600%">
            <feGaussianBlur stdDeviation="4.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Lines-only glow */}
          <filter id="sv-lg" x="-30%" y="-200%" width="160%" height="500%">
            <feGaussianBlur stdDeviation="0.6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* ── Ambient hub halo gradient ── */}
          <radialGradient id="sv-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F5A623" stopOpacity="0.22"/>
            <stop offset="35%"  stopColor="#F5A623" stopOpacity="0.07"/>
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="sv-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F5A623" stopOpacity="0.055"/>
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0"/>
          </radialGradient>

          {/* ── Comet gradient (x1=tail, x2=head / direction of travel) ── */}
          <linearGradient id="sv-comet-fwd" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#F5A623" stopOpacity="0"/>
            <stop offset="55%"  stopColor="#F5A623" stopOpacity="0.55"/>
            <stop offset="88%"  stopColor="#F5A623" stopOpacity="0.92"/>
            <stop offset="100%" stopColor="#FFFFFF"  stopOpacity="1"/>
          </linearGradient>
          <linearGradient id="sv-comet-ret" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#F5A623" stopOpacity="0"/>
            <stop offset="60%"  stopColor="#F5A623" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#FFC85A"  stopOpacity="0.65"/>
          </linearGradient>
          {/* Circumference comet */}
          <linearGradient id="sv-comet-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#F5A623" stopOpacity="0"/>
            <stop offset="70%"  stopColor="#F5A623" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#F5A623" stopOpacity="0.75"/>
          </linearGradient>

          {/* ── Motion paths ── */}
          {/* Hub → inner */}
          {INNER.map((n) => (
            <path key={`pd-hi-${n.id}`} id={`sv-hi-${n.id}`}
              d={`M ${HX},${HY} L ${n.x},${n.y}`} fill="none"/>
          ))}
          {/* Inner → hub */}
          {INNER.map((n) => (
            <path key={`pd-ih-${n.id}`} id={`sv-ih-${n.id}`}
              d={`M ${n.x},${n.y} L ${HX},${HY}`} fill="none"/>
          ))}
          {/* Outer ring CW/CCW */}
          <path id="sv-ocw"  d={`M ${OCTAGON_CW} Z`}  fill="none"/>
          <path id="sv-occw" d={`M ${OCTAGON_CCW} Z`} fill="none"/>
        </defs>

        {/* ── Background ── */}
        <rect width="100" height="100" fill="#0D0D0D"/>
        <rect width="100" height="100" fill="url(#sv-dots)"/>
        <ellipse cx="50" cy="50" rx="52" ry="52" fill="url(#sv-ambient)"/>

        {/* ── Hub halo ── */}
        <ellipse cx="50" cy="50" rx="26" ry="26" fill="url(#sv-halo)"/>

        {/* ── Structural outlines (dashed) ── */}
        <polygon
          points={OCTAGON_CW}
          fill="none" stroke="#F5A623" strokeWidth="0.11"
          strokeDasharray="1.8 2.8" opacity="0.2"
        />
        <polygon
          points={INNER.map((n) => `${n.x},${n.y}`).join(' ')}
          fill="none" stroke="#F5A623" strokeWidth="0.13"
          strokeDasharray="1.4 2.4" opacity="0.16"
        />

        {/* ── Inner→Outer connections ── */}
        {IO_EDGES.map(([ii, oi], idx) => (
          <line key={`io-${idx}`}
            x1={INNER[ii].x} y1={INNER[ii].y}
            x2={OUTER[oi].x} y2={OUTER[oi].y}
            stroke="#F5A623" strokeWidth="0.13" opacity="0.18"
          />
        ))}

        {/* ── Hub → Inner connections (glowing, shimmer) ── */}
        {INNER.map((n) => (
          <line key={`hi-${n.id}`}
            x1={HX} y1={HY} x2={n.x} y2={n.y}
            stroke="#F5A623" strokeWidth="0.28"
            filter="url(#sv-lg)"
            className="sv-line"
            style={{ '--ld': `${n.dur}s`, '--lo2': `${n.delay}s`, '--lo': '0.28', '--hi': '0.62' } as React.CSSProperties}
          />
        ))}

        {/* ── Outer nodes (static, no float) ── */}
        {OUTER.map((n) => {
          const lbl = outerLabel(n.id);
          return (
            <g key={`o-${n.id}`}
              className="sv-fade"
              style={{ '--del': `${n.delay}s` } as React.CSSProperties}
            >
              {/* Dot */}
              <circle cx={n.x} cy={n.y} r="0.85"
                fill="#F5A623" opacity="0.55" filter="url(#sv-g1)"/>
              <circle cx={n.x} cy={n.y} r="0.4"
                fill="#FFFFFF" opacity="0.7"/>
              {/* Pulse ring */}
              <circle cx={n.x} cy={n.y} r="1.2"
                fill="none" stroke="#F5A623" strokeWidth="0.18" opacity="0">
                <animate attributeName="r"       from="1.2" to="5"   dur="3.5s" begin={`${n.delay * 0.25}s`} repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.4"  to="0"  dur="3.5s" begin={`${n.delay * 0.25}s`} repeatCount="indefinite"/>
              </circle>
              {/* Label */}
              <text
                x={lbl.x} y={lbl.y}
                textAnchor={lbl.anchor}
                dominantBaseline="middle"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '1.55px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fill: 'rgba(255,255,255,0.28)',
                }}
              >
                {n.wilaya}
              </text>
            </g>
          );
        })}

        {/* ── Inner nodes (floating) ── */}
        {INNER.map((n) => {
          const lbl = innerLabel(n.id);
          return (
            /* Fade wrapper */
            <g key={`i-${n.id}`}
              className="sv-fade"
              style={{ '--del': `${n.delay}s` } as React.CSSProperties}
            >
              {/* Float wrapper */}
              <g className="sv-float"
                style={{ '--dur': `${n.dur}s`, '--del': `${n.delay}s`, '--amp': String(n.amp) } as React.CSSProperties}
              >
                {/* Outer glow ring */}
                <circle cx={n.x} cy={n.y} r="2.5"
                  fill="#F5A623" opacity="0.08" filter="url(#sv-g2)"/>
                {/* Dot */}
                <circle cx={n.x} cy={n.y} r="1.7"
                  fill="#F5A623" opacity="0.85" filter="url(#sv-g1)"/>
                <circle cx={n.x} cy={n.y} r="0.8"
                  fill="#FFFFFF" opacity="0.95"/>
                {/* Pulse ring */}
                <circle cx={n.x} cy={n.y} r="2"
                  fill="none" stroke="#F5A623" strokeWidth="0.22" opacity="0">
                  <animate attributeName="r"       from="2"   to="8"  dur="2.8s" begin={`${n.delay * 0.3}s`} repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.45" to="0"  dur="2.8s" begin={`${n.delay * 0.3}s`} repeatCount="indefinite"/>
                </circle>

                {/* Sector label (line 1) */}
                <text
                  x={lbl.x} y={lbl.y}
                  textAnchor={lbl.anchor}
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: '1.95px',
                    fill: 'rgba(255,255,255,0.82)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {n.sector}
                </text>
                {/* Wilaya label (line 2) */}
                <text
                  x={lbl.x}
                  y={+(lbl.y + (lbl.anchor === 'middle' && n.y < HY ? -2.4 : 2.4)).toFixed(2)}
                  textAnchor={lbl.anchor}
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '1.5px',
                    fill: 'rgba(245,166,35,0.52)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {n.wilaya}
                </text>
              </g>
            </g>
          );
        })}

        {/* ── Hub glow layers ── */}
        <g className="sv-hub-g">
          <circle cx={HX} cy={HY} r="7"   fill="#F5A623" opacity="0.06" filter="url(#sv-g3)"/>
          <circle cx={HX} cy={HY} r="3.8" fill="#F5A623" opacity="0.18" filter="url(#sv-g2)"/>
          <circle cx={HX} cy={HY} r="2.0" fill="#F5A623" opacity="0.70" filter="url(#sv-g1)"/>
          <circle cx={HX} cy={HY} r="1.0" fill="#FFFFFF"  opacity="0.95"/>
        </g>

        {/* ── Hub sonar rings ── */}
        {[0, 1.5, 3.0].map((begin) => (
          <circle key={`sonar-${begin}`} cx={HX} cy={HY} r="3"
            fill="none" stroke="#F5A623" strokeWidth="0.3">
            <animate attributeName="r"       from="3"   to="22" dur="4.5s" begin={`${begin}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.5"  to="0"  dur="4.5s" begin={`${begin}s`} repeatCount="indefinite"/>
          </circle>
        ))}

        {/* ── Traveling comets: Hub → Inner (forward, bright) ── */}
        {INNER.map((n) => (
          <ellipse key={`cf-${n.id}`} rx="5" ry="0.52" fill="url(#sv-comet-fwd)"
            filter="url(#sv-g1)" opacity="0.9">
            <animateMotion rotate="auto" dur={`${n.dur * 0.88}s`} begin={`${n.delay}s`}
              repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1">
              <mpath href={`#sv-hi-${n.id}`}/>
            </animateMotion>
          </ellipse>
        ))}

        {/* ── Traveling comets: Inner → Hub (return, dimmer) ── */}
        {INNER.map((n) => (
          <ellipse key={`cr-${n.id}`} rx="3.8" ry="0.42" fill="url(#sv-comet-ret)"
            filter="url(#sv-g1)" opacity="0.6">
            <animateMotion rotate="auto" dur={`${n.dur * 0.88}s`} begin={`${n.delay + n.dur * 0.44}s`}
              repeatCount="indefinite" calcMode="spline" keySplines="0.42 0 0.58 1">
              <mpath href={`#sv-ih-${n.id}`}/>
            </animateMotion>
          </ellipse>
        ))}

        {/* ── Circumference comets (2 opposite directions) ── */}
        <ellipse rx="4.5" ry="0.45" fill="url(#sv-comet-ring)" filter="url(#sv-g1)" opacity="0.55">
          <animateMotion rotate="auto" dur="24s" begin="0s" repeatCount="indefinite" calcMode="linear">
            <mpath href="#sv-ocw"/>
          </animateMotion>
        </ellipse>
        <ellipse rx="4.5" ry="0.45" fill="url(#sv-comet-ring)" filter="url(#sv-g1)" opacity="0.55">
          <animateMotion rotate="auto" dur="24s" begin="12s" repeatCount="indefinite" calcMode="linear">
            <mpath href="#sv-occw"/>
          </animateMotion>
        </ellipse>
      </svg>
    </div>
  );
}
