import type { AuthRole } from '../auth.types';

interface RoleToggleProps {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
}

export function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="flex gap-2 mt-1">
      {(['BUYER', 'SUPPLIER'] as const).map((role) => {
        const isActive = value === role;
        const label = role === 'BUYER' ? 'Acheteur' : 'Fournisseur';
        const activeClass =
          role === 'BUYER'
            ? 'bg-blue-50 border-blue-400 text-blue-700'
            : 'bg-[#FFF8E7] border-[#F5A623] text-[#C47F00]';

        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={[
              'flex-1 py-2 px-4 rounded-full border text-xs font-semibold tracking-wide transition-all duration-200',
              isActive
                ? activeClass
                : 'border-[#CFCEC8] text-[#9A9A94] bg-transparent hover:border-[#ABABAB]',
            ].join(' ')}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
