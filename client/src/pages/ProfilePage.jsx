import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  BadgeCheck,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleAlert,
  Compass,
  Edit3,
  Globe2,
  Heart,
  Hotel,
  Languages,
  LockKeyhole,
  Mail,
  MapPin,
  Moon,
  Phone,
  Plane,
  Save,
  ShieldCheck,
  Sparkles,
  Utensils,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useSavedTrips } from '../hooks/useSavedTrips.js';
import { useTrips } from '../hooks/useTrips.js';

const interestOptions = ['Beach', 'Mountains', 'Adventure', 'Food', 'Culture', 'Shopping', 'Nature', 'Luxury'];

const dummyActivities = [
  { title: 'Trip created', description: 'Jaipur weekend escape was added to your travel board.', icon: Plane, tone: 'bg-orange-50 text-orange-600' },
  { title: 'Destination saved', description: 'Santorini was saved to your inspiration list.', icon: Heart, tone: 'bg-rose-50 text-rose-600' },
  { title: 'Budget updated', description: 'Europe summer budget was optimized for stays and food.', icon: Wallet, tone: 'bg-amber-50 text-amber-700' },
  { title: 'AI planner used', description: 'A day-wise itinerary was generated for your next trip.', icon: Sparkles, tone: 'bg-emerald-50 text-emerald-700' },
];

function preferencesToForm(user) {
  const preferences = user?.travelPreferences || {};

  return {
    name: user?.name || 'TripSafar Traveler',
    email: user?.email || 'traveler@tripsafar.com',
    phone: preferences.phone || '',
    location: preferences.location || '',
    dateOfBirth: preferences.dateOfBirth || '',
    gender: preferences.gender || '',
    favoriteDestinations: preferences.favoriteDestinations || '',
    travelStyle: preferences.travelStyle || preferences.preferredTravelStyle || '',
    budgetRange: preferences.budgetRange || preferences.preferredBudgetRange || '',
    preferredLanguage: preferences.preferredLanguage || 'English',
    foodPreference: preferences.foodPreference || '',
    accommodationPreference: preferences.accommodationPreference || '',
    interests: preferences.interests?.length ? preferences.interests : ['Beach', 'Food', 'Culture'],
  };
}

function getStoredFavoriteCount() {
  try {
    return JSON.parse(window.localStorage.getItem('tripsafar-favorite-destinations') || '[]').length;
  } catch {
    return 0;
  }
}

function getStoredAccountSettings() {
  try {
    return {
      emailNotifications: true,
      travelReminders: true,
      darkMode: false,
      privacyMode: false,
      profileVisibility: 'private',
      dataDownloadReady: false,
      ...JSON.parse(window.localStorage.getItem('tripsafar-account-settings') || '{}'),
    };
  } catch {
    return {
      emailNotifications: true,
      travelReminders: true,
      darkMode: false,
      privacyMode: false,
      profileVisibility: 'private',
      dataDownloadReady: false,
    };
  }
}

function getTripCountry(trip) {
  return trip?.country || trip?.customDestination?.country || trip?.destination?.country || '';
}

function FieldLabel({ icon: Icon, label, children }) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      <span className="inline-flex items-center gap-2">
        {createElement(Icon, { className: 'h-4 w-4 text-orange-500' })}
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleRow({ icon: Icon, label, description, enabled, onChange }) {
  return (
    <button type="button" onClick={onChange} className="group flex w-full items-center justify-between gap-4 rounded-2xl bg-orange-50/60 p-4 text-left ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:bg-white">
      <span className="flex items-start gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-orange-500 ring-1 ring-orange-100">{createElement(Icon, { className: 'h-5 w-5' })}</span>
        <span>
          <span className="block font-black text-slate-950 group-hover:text-orange-600">{label}</span>
          <span className="mt-1 block text-sm leading-5 text-slate-600">{description}</span>
        </span>
      </span>
      <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${enabled ? 'bg-orange-500' : 'bg-slate-200'}`}>
        <span className={`h-5 w-5 rounded-full bg-white transition ${enabled ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}

function ProfilePage() {
  const personalInfoRef = useRef(null);
  const nameInputRef = useRef(null);
  const { user, updateProfile, requestPasswordReset } = useAuth();
  const { trips } = useTrips();
  const { savedTrips } = useSavedTrips();
  const [formData, setFormData] = useState(() => preferencesToForm(user));
  const [settings, setSettings] = useState(getStoredAccountSettings);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setFormData(preferencesToForm(user)));
  }, [user]);

  useEffect(() => {
    window.localStorage.setItem('tripsafar-account-settings', JSON.stringify(settings));
    window.localStorage.setItem('tripsafar-dashboard-theme', settings.darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dashboard-dark-root', settings.darkMode);
    window.dispatchEvent(new Event('tripsafar-theme-updated'));
  }, [settings]);

  const stats = useMemo(() => {
    const countries = new Set(trips.map(getTripCountry).filter(Boolean));

    return [
      { label: 'Total Trips', value: trips.length || 0, icon: Plane, tone: 'bg-orange-50 text-orange-600' },
      { label: 'Countries Visited', value: countries.size || 0, icon: Globe2, tone: 'bg-emerald-50 text-emerald-700' },
      { label: 'Saved Places', value: savedTrips.length + getStoredFavoriteCount(), icon: Heart, tone: 'bg-rose-50 text-rose-600' },
      { label: 'AI Plans Generated', value: Math.max(trips.length * 2, user?.travelPreferences?.aiPlansGenerated || 0), icon: Sparkles, tone: 'bg-amber-50 text-amber-700' },
    ];
  }, [savedTrips, trips, user]);

  const completion = useMemo(() => {
    const checks = [
      ['Full name', formData.name],
      ['Phone number', formData.phone],
      ['Location', formData.location],
      ['Date of birth', formData.dateOfBirth],
      ['Favorite destinations', formData.favoriteDestinations],
      ['Travel style', formData.travelStyle],
      ['Budget range', formData.budgetRange],
      ['Food preference', formData.foodPreference],
    ];
    const complete = checks.filter(([, value]) => String(value || '').trim()).length;

    return {
      percentage: Math.round((complete / checks.length) * 100),
      missing: checks.filter(([, value]) => !String(value || '').trim()).map(([label]) => label),
    };
  }, [formData]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function toggleInterest(interest) {
    setFormData((current) => ({
      ...current,
      interests: current.interests.includes(interest)
        ? current.interests.filter((item) => item !== interest)
        : [...current.interests, interest],
    }));
  }

  function handleReset() {
    setFormData(preferencesToForm(user));
    setError('');
    setSuccess('');
  }

  function handleEditProfile() {
    personalInfoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => nameInputRef.current?.focus(), 450);
  }

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: typeof value === 'function' ? value(current[key]) : value,
    }));
  }

  async function handlePasswordReset() {
    setError('');
    setSuccess('');
    setIsSendingReset(true);

    try {
      await requestPasswordReset(formData.email);
      setSuccess('Password reset link sent to your email. Please check your inbox.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Unable to send password reset link. Please try again.');
    } finally {
      setIsSendingReset(false);
    }
  }

  function handlePrepareDataDownload() {
    updateSetting('dataDownloadReady', true);
    setSuccess('Your privacy export is ready. Profile preferences have been prepared locally.');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await updateProfile({
        name: formData.name,
        travelPreferences: {
          ...user?.travelPreferences,
          phone: formData.phone,
          location: formData.location,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          favoriteDestinations: formData.favoriteDestinations,
          preferredTravelStyle: formData.travelStyle,
          travelStyle: formData.travelStyle,
          preferredBudgetRange: formData.budgetRange,
          budgetRange: formData.budgetRange,
          preferredLanguage: formData.preferredLanguage,
          foodPreference: formData.foodPreference,
          accommodationPreference: formData.accommodationPreference,
          interests: formData.interests,
        },
      });
      setSuccess('Profile updated successfully. Your next TripSafar plan will use these preferences.');
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Profile update failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const avatarInitial = (formData.name || formData.email || 'T').charAt(0).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="relative grid gap-6 overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-emerald-100/70 blur-3xl" />

      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 p-6 sm:p-8 lg:p-10">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=90"
          alt="Warm beach travel profile background"
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-orange-950/45 to-orange-400/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(251,146,60,0.35),transparent_30%),radial-gradient(circle_at_86%_76%,rgba(16,185,129,0.24),transparent_28%)]" />
       
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-[2rem] bg-white text-5xl font-black text-orange-500 ring-4 ring-white/70">
              {avatarInitial}
              <span className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-2xl bg-orange-500 text-white"><Camera className="h-5 w-5" /></span>
            </div>
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-100 backdrop-blur"><Sparkles className="h-4 w-4" />Profile cockpit</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">{formData.name}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold text-white/80"><Mail className="h-4 w-4 text-orange-200" />{formData.email}<span className="text-white/35">•</span>Traveler</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white"><BadgeCheck className="h-4 w-4" />Explorer Level</span>
                <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-100 ring-1 ring-white/25 backdrop-blur">{completion.percentage}% complete</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={handleEditProfile} className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-orange-600 ring-1 ring-white/70 transition hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white">
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </section>

      {(error || success) && (
        <div className="grid gap-3">
          {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
          {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{success}</p>}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-[1.5rem] border border-orange-100 bg-white p-5 transition hover:-translate-y-1">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${item.tone}`}>{createElement(Icon, { className: 'h-6 w-6' })}</span>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{item.value}</p>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
        <div className="grid gap-6">
          <section ref={personalInfoRef} className="scroll-mt-24 rounded-[2rem] border border-orange-100 bg-white p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Personal information</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Your basic details</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Keep your account details fresh so your travel plans feel personal.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FieldLabel icon={UserRound} label="Full Name"><input ref={nameInputRef} name="name" value={formData.name} onChange={handleChange} required minLength={2} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" /></FieldLabel>
              <FieldLabel icon={Mail} label="Email"><input name="email" value={formData.email} disabled className="rounded-2xl border border-orange-100 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500 outline-none" /></FieldLabel>
              <FieldLabel icon={Phone} label="Phone"><input name="phone" value={formData.phone} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" placeholder="+91 98765 43210" /></FieldLabel>
              <FieldLabel icon={MapPin} label="Location"><input name="location" value={formData.location} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" placeholder="Mumbai, India" /></FieldLabel>
              <FieldLabel icon={CalendarDays} label="Date of Birth"><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" /></FieldLabel>
              <FieldLabel icon={UserRound} label="Gender optional"><select name="gender" value={formData.gender} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="non-binary">Non-binary</option><option value="other">Other</option></select></FieldLabel>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-orange-100 pt-5">
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" onClick={handleReset} className="rounded-full border border-orange-100 px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50">Reset</button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-orange-100 bg-white p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Travel preferences</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Plan around what you love</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">These preferences help TripSafar personalize routes, stays, food, and budget ideas.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FieldLabel icon={MapPin} label="Favorite destinations"><input name="favoriteDestinations" value={formData.favoriteDestinations} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" placeholder="Bali, Paris, Manali" /></FieldLabel>
              <FieldLabel icon={Compass} label="Travel style"><select name="travelStyle" value={formData.travelStyle} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"><option value="">Choose style</option><option value="relaxed">Relaxed</option><option value="adventure">Adventure</option><option value="family">Family-friendly</option><option value="luxury">Luxury comfort</option><option value="culture">Culture-first</option></select></FieldLabel>
              <FieldLabel icon={Wallet} label="Budget range"><select name="budgetRange" value={formData.budgetRange} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"><option value="">Choose range</option><option value="budget">Budget friendly</option><option value="comfort">Comfort</option><option value="premium">Premium</option><option value="luxury">Luxury</option></select></FieldLabel>
              <FieldLabel icon={Languages} label="Preferred language"><input name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100" placeholder="English" /></FieldLabel>
              <FieldLabel icon={Utensils} label="Food preference"><select name="foodPreference" value={formData.foodPreference} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"><option value="">Choose food preference</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="non-vegetarian">Non-vegetarian</option><option value="local-food">Local food explorer</option></select></FieldLabel>
              <FieldLabel icon={Hotel} label="Accommodation preference"><select name="accommodationPreference" value={formData.accommodationPreference} onChange={handleChange} className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"><option value="">Choose stay preference</option><option value="hotel">Hotels</option><option value="homestay">Homestays</option><option value="resort">Resorts</option><option value="hostel">Hostels</option><option value="apartment">Apartments</option></select></FieldLabel>
            </div>
            <div className="mt-6">
              <p className="text-sm font-black text-slate-700">Interests</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`rounded-full px-4 py-2 text-sm font-black transition ${formData.interests.includes(interest) ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-6">
          <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-white via-orange-50/50 to-emerald-50 p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Profile completion</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{completion.percentage}% complete</h2>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white ring-1 ring-orange-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${completion.percentage}%` }} /></div>
            <div className="mt-5 grid gap-2">
              {(completion.missing.length ? completion.missing : ['Everything looks complete']).map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm font-bold text-slate-700 ring-1 ring-orange-100">
                  {completion.missing.length ? <CircleAlert className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  {completion.missing.length ? `Add ${item}` : item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-orange-100 bg-white p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Account settings</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Security & reminders</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Manage password recovery, notification preferences, reminders, and privacy controls.</p>
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={isSendingReset}
                className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/60 p-4 text-left font-black text-slate-950 ring-1 ring-orange-100 transition hover:bg-white hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="flex items-center gap-3"><LockKeyhole className="h-5 w-5 text-orange-500" />{isSendingReset ? 'Sending reset link...' : 'Change password'}</span>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">Email link</span>
              </button>
              <ToggleRow icon={Bell} label="Email notifications" description="Get trip updates and booking reminders." enabled={settings.emailNotifications} onChange={() => updateSetting('emailNotifications', (value) => !value)} />
              <ToggleRow icon={CalendarDays} label="Travel reminders" description="Receive packing and itinerary nudges." enabled={settings.travelReminders} onChange={() => updateSetting('travelReminders', (value) => !value)} />
              <ToggleRow icon={Moon} label="Dark mode" description="Preview a darker dashboard experience." enabled={settings.darkMode} onChange={() => updateSetting('darkMode', (value) => !value)} />
              <ToggleRow icon={ShieldCheck} label="Privacy mode" description="Hide profile details from shared travel boards." enabled={settings.privacyMode} onChange={() => updateSetting('privacyMode', (value) => !value)} />
              <button
                type="button"
                onClick={() => setIsPrivacyOpen((current) => !current)}
                className="flex items-center justify-between gap-3 rounded-2xl bg-orange-50/60 p-4 text-left font-black text-slate-950 ring-1 ring-orange-100 transition hover:bg-white hover:text-orange-600"
              >
                <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-orange-500" />Privacy settings</span>
                <span className="text-xs font-black uppercase tracking-[0.14em] text-orange-500">{isPrivacyOpen ? 'Close' : 'Open'}</span>
              </button>

              {isPrivacyOpen && (
                <div className="grid gap-3 rounded-[1.5rem] border border-orange-100 bg-orange-50/50 p-4">
                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Profile visibility
                    <select
                      value={settings.profileVisibility}
                      onChange={(event) => updateSetting('profileVisibility', event.target.value)}
                      className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="private">Private</option>
                      <option value="friends">Friends only</option>
                      <option value="public">Public traveler profile</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={handlePrepareDataDownload}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left font-black text-slate-950 ring-1 ring-orange-100 transition hover:text-orange-600"
                  >
                    <span className="flex items-center gap-3"><Save className="h-5 w-5 text-orange-500" />Prepare data export</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${settings.dataDownloadReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {settings.dataDownloadReady ? 'Ready' : 'Generate'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-orange-100 bg-white p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">Recent activity</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Travel timeline</h2>
            <div className="mt-5 grid gap-3">
              {dummyActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <article key={activity.title} className="flex gap-3 rounded-2xl bg-orange-50/50 p-4 ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:bg-white">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${activity.tone}`}>{createElement(Icon, { className: 'h-5 w-5' })}</span>
                    <div>
                      <h3 className="font-black text-slate-950">{activity.title}</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{activity.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}

export default ProfilePage;
