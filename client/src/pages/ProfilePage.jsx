import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

function preferencesToForm(user) {
  return {
    name: user?.name || '',
    preferredBudgetRange: user?.travelPreferences?.preferredBudgetRange || '',
    preferredTravelStyle: user?.travelPreferences?.preferredTravelStyle || '',
    interests: user?.travelPreferences?.interests?.join(', ') || '',
  };
}

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState(() => preferencesToForm(user));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleReset() {
    setFormData(preferencesToForm(user));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const interests = formData.interests
      .split(',')
      .map((interest) => interest.trim())
      .filter(Boolean);

    try {
      await updateProfile({
        name: formData.name,
        travelPreferences: {
          preferredBudgetRange: formData.preferredBudgetRange,
          preferredTravelStyle: formData.preferredTravelStyle,
          interests,
        },
      });
      setSuccess('Profile updated successfully.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Profile update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Profile</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-950">Your travel profile</h1>
      <p className="mt-3 text-slate-600">
        Manage basic account details and travel preferences for future personalized planning.
      </p>

      <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <span className="font-semibold text-slate-950">Email:</span> {user?.email}
        </div>
        <div>
          <span className="font-semibold text-slate-950">Role:</span> {user?.role}
        </div>
      </div>

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
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Preferred budget range
            <input
              type="text"
              name="preferredBudgetRange"
              value={formData.preferredBudgetRange}
              onChange={handleChange}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              placeholder="Budget / Comfort / Luxury"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Preferred travel style
            <input
              type="text"
              name="preferredTravelStyle"
              value={formData.preferredTravelStyle}
              onChange={handleChange}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              placeholder="Adventure / Relaxed / Family"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Interests
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
            placeholder="Food, beaches, museums"
          />
          <span className="text-xs text-slate-500">Comma-separated interests.</span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary-500 px-6 py-3 font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save profile'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
