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
    <section className="app-card">
      <p className="section-eyebrow">Profile</p>
      <h1 className="section-title">Your travel profile</h1>
      <p className="section-description">
        Manage basic account details and travel preferences for future personalized planning.
      </p>

      <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <span className="font-semibold text-slate-950">Email:</span> {user?.email}
        </div>
        <div>
          <span className="font-semibold text-slate-950">Role:</span> {user?.role}
        </div>
      </div>

      {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {success && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</p>}

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Full name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            minLength={2}
            className="form-control"
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
              className="form-control"
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
              className="form-control"
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
            className="form-control"
            placeholder="Food, beaches, museums"
          />
          <span className="text-xs text-slate-500">Comma-separated interests.</span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Saving...' : 'Save profile'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
