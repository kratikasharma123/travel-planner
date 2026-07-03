import { useState } from 'react';

function EyeIcon({ isVisible }) {
  if (isVisible) {
    return (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7a12.7 12.7 0 0 1-2.2 3.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.3 6.3A13 13 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7a10.6 10.6 0 0 0 4.1-.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PasswordInput(props) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={isVisible ? 'text' : 'password'}
        className={`${props.className || ''} pr-12`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((current) => !current)}
        className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-primary-600 focus:outline-none focus:text-primary-600"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        title={isVisible ? 'Hide password' : 'Show password'}
      >
        <EyeIcon isVisible={isVisible} />
      </button>
    </div>
  );
}

export default PasswordInput;
