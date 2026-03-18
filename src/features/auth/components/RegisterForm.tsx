import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Check, ArrowRight } from 'lucide-react';
import { FloatingInput, FloatingSelect } from './FloatingInput';
import { RoleToggle } from './RoleToggle';
import { PasswordStrength } from './PasswordStrength';
import { useRegister } from '../hooks/useAuth';
import type { AuthRole } from '../auth.types';

const WILAYAS = [
  { code: '01', name: 'Adrar' }, { code: '02', name: 'Chlef' },
  { code: '03', name: 'Laghouat' }, { code: '04', name: 'Oum El Bouaghi' },
  { code: '05', name: 'Batna' }, { code: '06', name: 'Béjaïa' },
  { code: '07', name: 'Biskra' }, { code: '08', name: 'Béchar' },
  { code: '09', name: 'Blida' }, { code: '10', name: 'Bouira' },
  { code: '11', name: 'Tamanrasset' }, { code: '12', name: 'Tébessa' },
  { code: '13', name: 'Tlemcen' }, { code: '14', name: 'Tiaret' },
  { code: '15', name: 'Tizi Ouzou' }, { code: '16', name: 'Alger' },
  { code: '17', name: 'Djelfa' }, { code: '18', name: 'Jijel' },
  { code: '19', name: 'Sétif' }, { code: '20', name: 'Saïda' },
  { code: '21', name: 'Skikda' }, { code: '22', name: 'Sidi Bel Abbès' },
  { code: '23', name: 'Annaba' }, { code: '24', name: 'Guelma' },
  { code: '25', name: 'Constantine' }, { code: '26', name: 'Médéa' },
  { code: '27', name: 'Mostaganem' }, { code: '28', name: "M'Sila" },
  { code: '29', name: 'Mascara' }, { code: '30', name: 'Ouargla' },
  { code: '31', name: 'Oran' }, { code: '32', name: 'El Bayadh' },
  { code: '33', name: 'Illizi' }, { code: '34', name: 'Bordj Bou Arreridj' },
  { code: '35', name: 'Boumerdès' }, { code: '36', name: 'El Tarf' },
  { code: '37', name: 'Tindouf' }, { code: '38', name: 'Tissemsilt' },
  { code: '39', name: 'El Oued' }, { code: '40', name: 'Khenchela' },
  { code: '41', name: 'Souk Ahras' }, { code: '42', name: 'Tipaza' },
  { code: '43', name: 'Mila' }, { code: '44', name: 'Aïn Defla' },
  { code: '45', name: 'Naâma' }, { code: '46', name: 'Aïn Témouchent' },
  { code: '47', name: 'Ghardaïa' }, { code: '48', name: 'Relizane' },
];

const schema = z
  .object({
    fullName: z.string().min(2, 'Nom complet requis (min. 2 caractères)'),
    email: z.string().email('Email invalide'),
    phone: z
      .string()
      .regex(/^(\+213|0)[5-7]\d{8}$/, 'Numéro algérien invalide (ex: 0661234567)'),
    wilayaCode: z.string().min(1, 'Veuillez choisir votre wilaya'),
    role: z.enum(['BUYER', 'SUPPLIER']),
    companyName: z.string().optional(),
    password: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
  .refine(
    (d) => {
      if (d.role === 'SUPPLIER') return !!d.companyName && d.companyName.length >= 2;
      return true;
    },
    { message: "Nom de l'entreprise requis", path: ['companyName'] },
  );

type FormData = z.infer<typeof schema>;

interface RegisterFormProps {
  onSwitchTab: () => void;
}

export function RegisterForm({ onSwitchTab }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [success, setSuccess] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'BUYER' },
  });

  const role = watch('role') as AuthRole;
  const password = watch('password') ?? '';
  const isSupplier = role === 'SUPPLIER';

  const onSubmit = async (data: FormData) => {
    try {
      await registerMutation.mutateAsync(data);
      setSuccess(true);
    } catch {
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div
      style={{ animation: shaking ? 'authShake 0.55s ease-in-out' : undefined }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1
          className="mb-1.5"
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: 26,
            color: '#1A1A18',
            lineHeight: 1.2,
          }}
        >
          Créer un compte
        </h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B6B66' }}>
          Rejoignez la plateforme industrielle algérienne
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Full name */}
        <FloatingInput
          label="Nom complet"
          type="text"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        {/* Email */}
        <FloatingInput
          label="Email professionnel"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Phone */}
        <FloatingInput
          label="Téléphone (+213 ou 06/07...)"
          type="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />

        {/* Wilaya */}
        <FloatingSelect
          label="Wilaya"
          error={errors.wilayaCode?.message}
          {...register('wilayaCode')}
        >
          <option value="" />
          {WILAYAS.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code} — {w.name}
            </option>
          ))}
        </FloatingSelect>

        {/* Role */}
        <div className="mb-5">
          <p
            className="mb-1.5"
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9A9A94' }}
          >
            Je suis
          </p>
          <RoleToggle
            value={role}
            onChange={(r) => setValue('role', r, { shouldValidate: true })}
          />
        </div>

        {/* Company name — slides in for SUPPLIER */}
        <div
          style={{
            maxHeight: isSupplier ? 80 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s cubic-bezier(0.4,0,0.2,1)',
            opacity: isSupplier ? 1 : 0,
          }}
        >
          {isSupplier && (
            <FloatingInput
              label="Nom de l'entreprise"
              type="text"
              error={errors.companyName?.message}
              {...register('companyName')}
            />
          )}
        </div>

        {/* Password */}
        <div>
          <FloatingInput
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            error={errors.password?.message}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="p-1"
                style={{ color: '#9A9A94' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />
          <div className="-mt-3 mb-4">
            <PasswordStrength password={password} />
          </div>
        </div>

        {/* Confirm password */}
        <FloatingInput
          label="Confirmer le mot de passe"
          type={showConfirm ? 'text' : 'password'}
          error={errors.confirmPassword?.message}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="p-1"
              style={{ color: '#9A9A94' }}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('confirmPassword')}
        />

        {/* Server error */}
        {registerMutation.isError && (
          <div
            className="mb-4 rounded-lg px-4 py-3"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#DC2626',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 13,
            }}
          >
            Une erreur est survenue. Veuillez réessayer.
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={registerMutation.isPending || success}
          className="w-full flex items-center justify-center gap-2 mb-4"
          style={{
            height: 48,
            background: '#0D0D0D',
            color: '#FFFFFF',
            border: '1.5px solid transparent',
            borderRadius: 10,
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            fontSize: 15,
            cursor: registerMutation.isPending || success ? 'not-allowed' : 'pointer',
            opacity: registerMutation.isPending || success ? 0.85 : 1,
            transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!registerMutation.isPending && !success) {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#F5A623';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
          }}
        >
          {registerMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Création en cours...</>
          ) : success ? (
            <><Check className="w-4 h-4" />Compte créé !</>
          ) : (
            <>Créer mon compte<ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        {/* Terms */}
        <p
          className="text-center mb-4"
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9A9A94', lineHeight: 1.6 }}
        >
          En créant un compte, vous acceptez nos{' '}
          <button type="button" style={{ color: '#F5A623', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11 }}>
            Conditions d'utilisation
          </button>{' '}
          et notre{' '}
          <button type="button" style={{ color: '#F5A623', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11 }}>
            Politique de confidentialité
          </button>
        </p>

        {/* Switch to login */}
        <p
          className="text-center"
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B6B66' }}
        >
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={onSwitchTab}
            className="font-medium"
            style={{ color: '#F5A623', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Se connecter →
          </button>
        </p>
      </form>
    </div>
  );
}
