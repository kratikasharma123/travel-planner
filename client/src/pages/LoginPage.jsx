import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput.jsx';
import { canChooseAdminDashboard } from '../features/admin/adminConstants.js';
import { useAuth } from '../hooks/useAuth.js';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from || { pathname: '/dashboard' };

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(formData);
      const nextRoute = canChooseAdminDashboard(loggedInUser) ? '/choose-dashboard' : redirectTo;
      navigate(nextRoute || '/dashboard', { replace: true });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/85 p-6 shadow-2xl shadow-orange-100/70 backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-orange-600 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-500 text-white">✈</span>
          TripSafar
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-600">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Welcome back
        </div>
        <h1 className="landing-hero-title mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
          Login to your travel workspace.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
          Continue planning smarter routes, budgets, destinations, and AI-powered itineraries.
        </p>

        {error && (
          <p className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Email address
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            <span className="flex items-center justify-between gap-3">
              Password
              <Link
                to="/forgot-password"
                className="text-xs font-black text-orange-500 transition hover:text-orange-600"
              >
                Forgot password?
              </Link>
            </span>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              placeholder="Enter your password"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-600">
          New here?{' '}
          <Link to="/register" className="font-black text-orange-500 transition hover:text-orange-600">
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
