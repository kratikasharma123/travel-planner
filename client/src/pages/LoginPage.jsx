import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput.jsx';
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
    <section className="app-card">
      <p className="section-eyebrow">Welcome back</p>
      <h1 className="section-title">Login to TravelAI Planner</h1>
      <p className="section-description">Access your dashboard and continue planning smarter trips.</p>

      {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="form-control"
            placeholder="you@example.com"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Password
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            className="w-full form-control"
            placeholder="Enter your password"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary"
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
