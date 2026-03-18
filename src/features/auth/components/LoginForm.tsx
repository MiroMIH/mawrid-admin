import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { FloatingInput } from './FloatingInput';
import { useLogin } from '../hooks/useAuth';

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  role:     z.enum(['BUYER', 'SUPPLIER']),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [success, setSuccess] = useState(false);
  const login = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email:    'superadmin@mawrid.dz',
      password: 'SuperAdmin@2026',
      role:     'BUYER',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login.mutateAsync(data);
      setSuccess(true);
    } catch {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div style={{ animation: shaking ? 'authShake 0.55s ease-in-out' : undefined }}>

      {/* Admin badge */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 6,
          background: 'rgba(13,13,13,0.06)',
          border: '1px solid rgba(13,13,13,0.1)',
          marginBottom: 16,
        }}>
          <ShieldCheck style={{ width: 12, height: 12, color: '#0D0D0D', opacity: 0.6 }} />
          <span style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 10.5,
            fontWeight: 600,
            color: '#0D0D0D',
            opacity: 0.55,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Espace administration
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: 28,
          color: '#1A1A18',
          lineHeight: 1.15,
          marginBottom: 6,
        }}>
          Bon retour 👋
        </h1>
        <p style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 14,
          color: '#7A7A72',
          lineHeight: 1.5,
        }}>
          Connectez-vous au backoffice Mawrid
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Email */}
        <FloatingInput
          label="Adresse email"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password */}
        <FloatingInput
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          error={errors.password?.message}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ padding: 4, color: '#ABABAB', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
            >
              {showPassword
                ? <EyeOff style={{ width: 15, height: 15 }} />
                : <Eye    style={{ width: 15, height: 15 }} />}
            </button>
          }
          {...register('password')}
        />

        {/* Error message */}
        {login.isError && (
          <div style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.18)',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 13,
            color: '#C53030',
          }}>
            Email ou mot de passe incorrect.
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={login.isPending || success}
          className="w-full flex items-center justify-center gap-2"
          style={{
            marginTop: 8,
            height: 50,
            background: success ? '#1A6B3C' : '#0D0D0D',
            color: '#FFFFFF',
            border: '1.5px solid transparent',
            borderRadius: 11,
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            fontSize: 15,
            cursor: login.isPending || success ? 'default' : 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.2s, background 0.3s',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={(e) => {
            if (!login.isPending && !success) {
              const b = e.currentTarget;
              b.style.transform = 'translateY(-1px)';
              b.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
              b.style.borderColor = '#F5A623';
            }
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget;
            b.style.transform = 'translateY(0)';
            b.style.boxShadow = 'none';
            b.style.borderColor = 'transparent';
          }}
        >
          {login.isPending ? (
            <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />Connexion…</>
          ) : success ? (
            <><Check style={{ width: 16, height: 16 }} />Connecté !</>
          ) : (
            <>Se connecter<ArrowRight style={{ width: 16, height: 16 }} /></>
          )}
        </button>

      </form>
    </div>
  );
}
