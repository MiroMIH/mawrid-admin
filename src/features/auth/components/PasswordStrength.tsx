interface PasswordStrengthProps {
  password: string;
}

function getStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  const hasNum = /\d/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  if (pw.length >= 8 && hasNum && hasSpecial) return 4;
  if (pw.length >= 6 && hasNum) return 3;
  if (pw.length >= 6) return 2;
  return 1;
}

const LEVELS = [
  { label: 'Faible', color: '#EF4444' },
  { label: 'Moyen', color: '#F97316' },
  { label: 'Bien', color: '#EAB308' },
  { label: 'Fort', color: '#22C55E' },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);
  if (!password) return null;

  const level = LEVELS[strength - 1];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: seg <= strength ? level.color : '#E5E5E0',
            }}
          />
        ))}
      </div>
      <p
        className="text-[11px] font-medium transition-colors duration-300"
        style={{ color: level.color, fontFamily: 'DM Sans, sans-serif' }}
      >
        {level.label}
      </p>
    </div>
  );
}
