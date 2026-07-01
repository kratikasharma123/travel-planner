import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSuccess('If an account exists for this email, a secure reset link has been sent.');
      setEmail('');
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message || 'Unable to send reset instructions. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="app-card">
      <p className="section-eyebrow">Account recovery</p>
      <h1 className="section-title">Reset your password</h1>
      <p className="section-description">
        Enter your account email and we will send a secure Supabase password reset link.
      </p>

      {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {success && (
        <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>
      )}

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="form-control"
            placeholder="you@example.com"
          />
        </label>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Remembered your password?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Back to login
        </Link>
      </p>
    </section>
  );
}

export default ForgotPasswordPage;
