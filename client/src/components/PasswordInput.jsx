import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PasswordInput(props) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

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
        className="absolute inset-y-0 right-3 flex items-center text-stone-400 transition hover:text-orange-600 focus:outline-none focus:text-orange-600"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        title={isVisible ? 'Hide password' : 'Show password'}
      >
        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
      </button>
    </div>
  );
}

export default PasswordInput;
