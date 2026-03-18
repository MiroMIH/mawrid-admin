import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useCallback,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from 'react';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  suffix?: React.ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, suffix, onChange, onBlur, onFocus, ...rest }, forwardedRef) => {
    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(false);
    const innerRef = useRef<HTMLInputElement>(null);

    // Merge the forwarded ref with our local ref
    const mergeRef = useCallback(
      (node: HTMLInputElement | null) => {
        (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef)
          (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [forwardedRef],
    );

    // Detect react-hook-form defaultValues (written to DOM, not React state)
    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      if (el.value) { setFilled(true); return; }
      // Small delay: RHF may set the value slightly after mount
      const t = setTimeout(() => { if (el.value) setFilled(true); }, 50);
      return () => clearTimeout(t);
    }, []);

    const floated = focused || filled;

    return (
      <div className="relative mb-5">
        <div className="relative">
          <input
            ref={mergeRef}
            {...rest}
            placeholder=" "
            onChange={(e) => { setFilled(!!e.target.value); onChange?.(e); }}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); setFilled(!!e.target.value); onBlur?.(e); }}
            // Detect browser autofill via animation event (Chrome/Edge/Safari trick)
            onAnimationStart={(e) => {
              if (e.animationName === 'fl-autofill-on')  setFilled(true);
              if (e.animationName === 'fl-autofill-off') setFilled(false);
            }}
            className={[
              'peer w-full border-b bg-transparent pt-5 pb-1.5 text-sm text-[#1A1A18]',
              'outline-none transition-colors duration-200',
              suffix ? 'pr-8' : '',
              focused
                ? 'border-[#F5A623]'
                : error
                ? 'border-red-400'
                : 'border-[#CFCEC8]',
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
            top:      floated ? 0 : 20,
            fontSize: floated ? 11 : 14,
            color:    error ? '#EF4444' : focused ? '#F5A623' : '#9A9A94',
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

FloatingInput.displayName = 'FloatingInput';

// ── FloatingSelect ─────────────────────────────────────────────────────────────

interface FloatingSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
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
          onChange={(e) => { setFilled(!!e.target.value); onChange?.(e); }}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); setFilled(!!e.target.value); onBlur?.(e); }}
          className={[
            'w-full border-b bg-transparent pt-5 pb-1.5 text-sm text-[#1A1A18]',
            'outline-none transition-colors duration-200 appearance-none',
            focused ? 'border-[#F5A623]' : error ? 'border-red-400' : 'border-[#CFCEC8]',
          ].join(' ')}
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {children}
        </select>

        <label
          className="pointer-events-none absolute left-0 transition-all duration-200"
          style={{
            top:      floated ? 0 : 20,
            fontSize: floated ? 11 : 14,
            color:    error ? '#EF4444' : focused ? '#F5A623' : '#9A9A94',
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
