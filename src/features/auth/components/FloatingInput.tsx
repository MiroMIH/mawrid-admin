import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  suffix?: React.ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, suffix, onChange, onBlur, onFocus, className = '', ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(!!rest.defaultValue || !!rest.value);

    const floated = focused || filled;

    return (
      <div className="relative mb-5">
        <div className="relative">
          <input
            ref={ref}
            {...rest}
            onChange={(e) => {
              setFilled(!!e.target.value);
              onChange?.(e);
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              setFilled(!!e.target.value);
              onBlur?.(e);
            }}
            placeholder=" "
            className={[
              'peer w-full border-b bg-transparent pt-5 pb-1.5 text-sm text-[#1A1A18] outline-none transition-colors duration-200 pr-8',
              focused ? 'border-[#F5A623]' : 'border-[#CFCEC8]',
              error ? 'border-red-400' : '',
              className,
            ].join(' ')}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          />
          {suffix && (
            <div className="absolute right-0 bottom-2 flex items-center">{suffix}</div>
          )}
        </div>
        <label
          className="pointer-events-none absolute left-0 transition-all duration-200"
          style={{
            top: floated ? '0px' : '20px',
            fontSize: floated ? '11px' : '14px',
            color: error ? '#EF4444' : focused ? '#F5A623' : '#9A9A94',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {label}
        </label>
        {error && (
          <p
            className="mt-1 text-[11px] text-red-500"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

FloatingInput.displayName = 'FloatingInput';

// Floating select (same style, different element)
interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export const FloatingSelect = forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ label, error, children, onChange, onBlur, onFocus, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(!!rest.defaultValue || !!rest.value);
    const floated = focused || filled;

    return (
      <div className="relative mb-5">
        <select
          ref={ref}
          {...rest}
          onChange={(e) => {
            setFilled(!!e.target.value);
            onChange?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setFilled(!!e.target.value);
            onBlur?.(e);
          }}
          className={[
            'w-full border-b bg-transparent pt-5 pb-1.5 text-sm text-[#1A1A18] outline-none transition-colors duration-200 appearance-none',
            focused ? 'border-[#F5A623]' : 'border-[#CFCEC8]',
            error ? 'border-red-400' : '',
          ].join(' ')}
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {children}
        </select>
        <label
          className="pointer-events-none absolute left-0 transition-all duration-200"
          style={{
            top: floated ? '0px' : '20px',
            fontSize: floated ? '11px' : '14px',
            color: error ? '#EF4444' : focused ? '#F5A623' : '#9A9A94',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-[11px] text-red-500" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

FloatingSelect.displayName = 'FloatingSelect';
