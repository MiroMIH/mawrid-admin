/**
 * AuthPage — admin-only split-screen login.
 * Left: 55% animated network panel.
 * Right: 45% clean admin login form.
 * Mobile: left panel hidden, full-width form.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { AuthLeftPanel } from '../components/AuthLeftPanel';
import { LoginForm } from '../components/LoginForm';

export function AuthPage() {
  const navigate     = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <>
      <style>{`
        .auth-root * { box-sizing: border-box; }

        @keyframes authShake {
          0%,100% { transform: translateX(0); }
          18%     { transform: translateX(-8px); }
          36%     { transform: translateX(8px); }
          54%     { transform: translateX(-4px); }
          72%     { transform: translateX(4px); }
        }
        @keyframes authFormIn {
          from { opacity:0; transform: translateY(16px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .auth-form-wrap {
          animation: authFormIn 0.55s 0.1s cubic-bezier(.4,0,.2,1) both;
        }
        .auth-scroll::-webkit-scrollbar { width: 3px; }
        .auth-scroll::-webkit-scrollbar-track { background: transparent; }
        .auth-scroll::-webkit-scrollbar-thumb { background: #E2E1DC; border-radius: 2px; }
      `}</style>

      <div
        className="auth-root flex min-h-screen"
        style={{ backgroundColor: '#F7F6F3' }}
      >
        {/* ── Left: dark network panel (hidden on mobile) ── */}
        <div className="hidden md:block flex-shrink-0" style={{ width: '55%' }}>
          <AuthLeftPanel />
        </div>

        {/* ── Right: login form ── */}
        <div
          className="auth-scroll flex flex-col flex-1 overflow-y-auto"
          style={{ backgroundColor: '#F7F6F3' }}
        >
          {/* Mobile logo — visible below md breakpoint only */}
          <div className="md:hidden flex items-center gap-3 px-6 pt-8 pb-2">
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: '#0D0D0D',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'serif', fontSize: 20, color: '#F5A623' }}>م</span>
            </div>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 17,
              color: '#0D0D0D',
              letterSpacing: '0.12em',
            }}>
              MAWRID
            </span>
          </div>

          {/* Centered form */}
          <div className="flex flex-1 items-center justify-center px-8 py-12">
            <div className="auth-form-wrap w-full" style={{ maxWidth: 380 }}>
              <LoginForm />
            </div>
          </div>

          {/* Footer */}
          <div
            className="text-center pb-6"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 10.5,
              color: '#BBBBB4',
              letterSpacing: '0.01em',
            }}
          >
            © 2026 MAWRID · Accès réservé aux administrateurs
          </div>
        </div>
      </div>
    </>
  );
}
