import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../hooks/useAuth.js';

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
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
      await resetPassword(formData.password);
      setSuccess('Your password has been updated. Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard', { replace: true }), 800);
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message ||
          'Unable to update password. Please open the latest reset link and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="app-card">
      <p className="section-eyebrow">Secure reset</p>
      <h1 className="section-title">Create a new password</h1>
      <p className="section-description">
        Choose a strong password for your TravelAI Planner account.
      </p>

      {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {success && (
        <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>
      )}

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          New password
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full form-control"
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
            className="w-full form-control"
            placeholder="Repeat password"
          />
        </label>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Updating...' : 'Update password'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Need a new reset email?{' '}
        <Link
          to="/forgot-password"
          className="font-semibold text-primary-600 hover:text-primary-700"
        >
          Request another link
        </Link>
      </p>
    </section>
  );
}

export default ResetPasswordPage;
