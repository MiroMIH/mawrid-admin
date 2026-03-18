/**
 * AuthLeftPanel — premium dark panel with soft aurora gradient orbs.
 * No network animation. Pure CSS — radial gradients, dot grid, slow drift.
 * Aesthetic: Vercel × Linear × industrial weight.
 */

const STATS = [
  { value: '892', label: 'fournisseurs actifs' },
  { value: '18',  label: 'secteurs industriels' },
  { value: '48',  label: 'wilayas couvertes' },
];

export function AuthLeftPanel() {
  return (
    <div
      className="relative flex flex-col h-full overflow-hidden select-none"
      style={{ background: '#080909' }}
    >
      <style>{`
        /* ── Orb drift paths ── */
        @keyframes lp-drift-a {
          0%,100% { transform: translate(0%,   0%)   scale(1);    }
          30%     { transform: translate(6%,  -10%)  scale(1.06); }
          65%     { transform: translate(-5%,  7%)   scale(0.96); }
        }
        @keyframes lp-drift-b {
          0%,100% { transform: translate(0%,   0%)   scale(1);    }
          40%     { transform: translate(-7%,  6%)   scale(1.04); }
          70%     { transform: translate(5%,  -5%)   scale(0.97); }
        }
        @keyframes lp-drift-c {
          0%,100% { transform: translate(0%,  0%)   scale(1);    }
          50%     { transform: translate(4%, -6%)   scale(1.05); }
        }
        @keyframes lp-drift-d {
          0%,100% { transform: translate(0%,  0%)   scale(1);    }
          35%     { transform: translate(-4%, 8%)   scale(0.95); }
          70%     { transform: translate(3%, -3%)   scale(1.03); }
        }

        /* ── Content entrance ── */
        @keyframes lp-logo-in {
          from { opacity:0; transform: translateY(-10px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes lp-text-in {
          from { opacity:0; transform: translateY(18px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes lp-stats-in {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes lp-orb-in {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes lp-accent-breathe {
          0%,100% { opacity:0.65; transform: scaleX(1); }
          50%     { opacity:1;    transform: scaleX(1.06); }
        }

        .lp-orb-base { animation: lp-orb-in 2.5s ease-out both; }
        .lp-logo     { animation: lp-logo-in  0.7s 0.2s cubic-bezier(.4,0,.2,1) both; }
        .lp-text     { animation: lp-text-in  0.8s 0.4s cubic-bezier(.4,0,.2,1) both; }
        .lp-stats    { animation: lp-stats-in 0.7s 0.65s cubic-bezier(.4,0,.2,1) both; }
        .lp-accent   { animation: lp-accent-breathe 5s ease-in-out infinite; }
      `}</style>

      {/* ━━━━━━━━━━ BACKGROUND LAYERS ━━━━━━━━━━ */}

      {/* Orb 1 — large amber, top-right */}
      <div
        className="lp-orb-base absolute pointer-events-none"
        style={{
          width: '85%', height: '85%',
          top: '-28%', right: '-18%',
          background: 'radial-gradient(circle at 40% 40%, rgba(245,166,35,0.13) 0%, transparent 65%)',
          filter: 'blur(48px)',
          animation: 'lp-orb-in 2.5s 0s both, lp-drift-a 24s 2.5s ease-in-out infinite',
        }}
      />

      {/* Orb 2 — medium amber, bottom-left */}
      <div
        className="lp-orb-base absolute pointer-events-none"
        style={{
          width: '75%', height: '70%',
          bottom: '-22%', left: '-20%',
          background: 'radial-gradient(circle at 55% 55%, rgba(210,130,20,0.10) 0%, transparent 65%)',
          filter: 'blur(56px)',
          animation: 'lp-orb-in 2.5s 0.3s both, lp-drift-b 30s 2.8s ease-in-out infinite',
        }}
      />

      {/* Orb 3 — very wide center wash */}
      <div
        className="lp-orb-base absolute pointer-events-none"
        style={{
          inset: '-10%',
          background: 'radial-gradient(ellipse 55% 45% at 52% 48%, rgba(245,166,35,0.055) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animation: 'lp-orb-in 3s 0.8s both, lp-drift-c 38s 3s ease-in-out infinite',
        }}
      />

      {/* Orb 4 — subtle top-left accent */}
      <div
        className="lp-orb-base absolute pointer-events-none"
        style={{
          width: '50%', height: '50%',
          top: '-5%', left: '-10%',
          background: 'radial-gradient(circle at 60% 60%, rgba(245,166,35,0.07) 0%, transparent 65%)',
          filter: 'blur(44px)',
          animation: 'lp-orb-in 2.5s 0.5s both, lp-drift-d 26s 3s ease-in-out infinite',
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.032) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle horizontal scan lines (industrial texture) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 47px,
            rgba(255,255,255,0.010) 47px,
            rgba(255,255,255,0.010) 48px
          )`,
        }}
      />

      {/* Edge vignette — deepens corners */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 0% 0%,   rgba(8,9,9,0.65) 0%, transparent 55%)',
            'radial-gradient(ellipse 60% 70% at 100% 100%, rgba(8,9,9,0.55) 0%, transparent 55%)',
            'linear-gradient(to top,    rgba(8,9,9,0.60) 0%, transparent 30%)',
            'linear-gradient(to bottom, rgba(8,9,9,0.40) 0%, transparent 25%)',
          ].join(', '),
        }}
      />

      {/* ━━━━━━━━━━ CONTENT ━━━━━━━━━━ */}
      <div className="relative z-10 flex flex-col h-full px-10 py-10">

        {/* Logo mark */}
        <div className="lp-logo flex items-center gap-3.5">
          <div
            style={{
              width: 44, height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(245,166,35,0.20) 0%, rgba(245,166,35,0.06) 100%)',
              border: '1px solid rgba(245,166,35,0.28)',
              boxShadow: '0 0 20px rgba(245,166,35,0.08), inset 0 1px 0 rgba(245,166,35,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{
              fontFamily: 'serif',
              fontSize: 22,
              color: '#F5A623',
              lineHeight: 1,
              textShadow: '0 0 16px rgba(245,166,35,0.5)',
            }}>
              م
            </span>
          </div>
          <div>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 15,
              color: '#FFFFFF',
              letterSpacing: '0.18em',
              lineHeight: 1.1,
            }}>
              MAWRID
            </div>
            <div style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 9.5,
              color: 'rgba(255,255,255,0.22)',
              letterSpacing: '0.05em',
              marginTop: 2,
            }}>
              Plateforme B2B industrielle
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Main brand block */}
        <div className="lp-text" style={{ marginBottom: 52 }}>

          {/* Wordmark */}
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 52,
            color: '#FFFFFF',
            letterSpacing: '0.18em',
            lineHeight: 1,
            marginBottom: 16,
          }}>
            MAWRID
          </div>

          {/* Amber accent line */}
          <div
            className="lp-accent"
            style={{
              height: 2,
              width: 68,
              borderRadius: 1,
              marginBottom: 20,
              background: 'linear-gradient(90deg, #F5A623 0%, rgba(245,166,35,0.12) 100%)',
              transformOrigin: 'left',
            }}
          />

          {/* Tagline */}
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13.5,
            color: 'rgba(255,255,255,0.32)',
            lineHeight: 1.75,
            maxWidth: 285,
          }}>
            Connectez acheteurs et fournisseurs
            <br />à travers les 48 wilayas d'Algérie.
          </p>
        </div>

        {/* Stats */}
        <div className="lp-stats flex items-stretch">
          {STATS.map((stat, i) => (
            <div key={stat.value} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{
                  width: 1, alignSelf: 'stretch',
                  background: 'rgba(255,255,255,0.07)',
                  margin: '0 22px',
                  minHeight: 34,
                }} />
              )}
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: 22,
                  color: '#F5A623',
                  lineHeight: 1,
                  textShadow: '0 0 20px rgba(245,166,35,0.28)',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.28)',
                  lineHeight: 1.4,
                  marginTop: 4,
                  letterSpacing: '0.02em',
                }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
