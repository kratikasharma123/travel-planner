import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../hooks/useAuth.js';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (data.user) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setSuccess('Account created. Please confirm your email, then login.');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Start planning</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Create your TravelAI account</h1>
      <p className="mt-3 text-slate-600">Create an account to save your future AI-powered travel plans.</p>

      {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Full name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            autoComplete="name"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
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
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="At least 8 characters"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Confirm password
          <PasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Repeat password"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary-500 px-6 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Login
        </Link>
      </p>
    </section>
  );
}

export default RegisterPage;
