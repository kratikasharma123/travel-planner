import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Welcome back</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Login to TravelAI Planner</h1>
      <p className="mt-3 text-slate-600">Access your dashboard and continue planning smarter trips.</p>

      {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="you@example.com"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Enter your password"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary-500 px-6 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
          Create an account
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;
