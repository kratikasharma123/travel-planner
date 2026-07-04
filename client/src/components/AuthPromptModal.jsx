import { Link } from 'react-router-dom';

function normalizeRedirectTarget(redirectTo) {
  if (!redirectTo) return { pathname: '/dashboard' };
  if (typeof redirectTo === 'string') return { pathname: redirectTo };
  return redirectTo;
}

function AuthPromptModal({ mode = 'login', onClose, redirectTo = '/dashboard', destination = null }) {
  const isSignup = mode === 'register';
  const redirectTarget = normalizeRedirectTarget(redirectTo);
  const linkState = {
    from: destination
      ? { ...redirectTarget, state: { ...(redirectTarget.state || {}), destination } }
      : redirectTarget,
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl shadow-slate-900/20">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-orange-100 hover:text-orange-600"
          aria-label="Close popup"
        >
          ×
        </button>

        <div className="rounded-[1.5rem] bg-gradient-to-br from-orange-100 via-white to-sky-100 p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">
            {isSignup ? 'Create account' : 'Welcome back'}
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">
            {isSignup ? 'Save your dream trips with TripSafar.' : 'Login to continue your travel plan.'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isSignup
              ? 'Create an account to save itineraries, budgets, and AI travel ideas in one place.'
              : 'Access your saved trips, budgets, and personalized recommendations.'}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <Link
            to={isSignup ? '/register' : '/login'}
            state={linkState}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-orange-500"
          >
            {isSignup ? 'Sign up now' : 'Login now'}
          </Link>
          <Link
            to={isSignup ? '/login' : '/register'}
            state={linkState}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-center text-sm font-black text-slate-700 transition hover:border-orange-200 hover:text-orange-600"
          >
            {isSignup ? 'Already have account? Login' : 'New here? Sign up'}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-sm font-bold text-slate-500 transition hover:text-orange-600"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPromptModal;
