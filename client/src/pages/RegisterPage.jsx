import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Compass, MapPin, Plane, Sparkles, Wallet } from 'lucide-react';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../hooks/useAuth.js';

const passwordRules = [
  {
    label: 'Minimum 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'One number',
    test: (password) => /\d/.test(password),
  },
];

const heroFeatures = [
  'Personalized itineraries',
  'Budget planner',
  'Saved places',
  'AI travel assistant',
];

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || { pathname: '/dashboard' };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStatus = useMemo(() => {
    const passedRules = passwordRules.filter((rule) => rule.test(formData.password));
    const score = passedRules.length;

    if (!formData.password) {
      return {
        label: 'Weak',
        width: '0%',
        color: 'bg-stone-200',
        textColor: 'text-stone-400',
        passedRules,
      };
    }

    if (score <= 1) {
      return {
        label: 'Weak',
        width: '33%',
        color: 'bg-orange-400',
        textColor: 'text-orange-600',
        passedRules,
      };
    }

    if (score === 2) {
      return {
        label: 'Medium',
        width: '66%',
        color: 'bg-amber-400',
        textColor: 'text-amber-600',
        passedRules,
      };
    }

    return {
      label: 'Strong',
      width: '100%',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      passedRules,
    };
  }, [formData.password]);

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

    if (passwordStatus.passedRules.length < passwordRules.length) {
      setError('Please create a stronger password before signing up.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions to continue.');
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
        navigate(redirectTo || '/dashboard', { replace: true });
        return;
      }

      setSuccess('Account created. Please confirm your email, then login.');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setAcceptedTerms(false);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full overflow-hidden rounded-[1.5rem] border border-orange-100/80 bg-[#fffaf3] shadow-2xl shadow-orange-100/80 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:order-2 lg:px-12">
        <div className="pointer-events-none absolute left-8 top-10 h-40 w-40 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-44 w-44 rounded-full bg-emerald-200/40 blur-3xl" />

        <div className="relative w-full max-w-lg rounded-[24px] border border-white/90 bg-white/90 p-6 shadow-2xl shadow-orange-100/70 backdrop-blur-xl sm:p-8">
          <Link to="/" className="inline-flex items-center gap-3 text-xl font-black text-stone-950 transition hover:text-orange-600">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-200 transition group-hover:rotate-6">
              <Plane className="h-5 w-5" />
            </span>
            TripSafar
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-600">
            <Sparkles className="h-3.5 w-3.5" />
            Travel smarter
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-stone-950 sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
            Join TripSafar and plan your next adventure smarter.
          </p>

          {error && (
            <p className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-semibold text-orange-700">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
              {success}
            </p>
          )}

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-bold text-stone-700">
              Full name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                autoComplete="name"
                className="rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="Enter your full name"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-stone-700">
              Email address
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="you@example.com"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold text-stone-700">
              Password
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="At least 8 characters"
              />
            </label>

            <div className="rounded-2xl border border-orange-100 bg-[#fff8ed] p-4">
              <div className="flex items-center justify-between gap-4 text-xs font-black uppercase tracking-[0.16em]">
                <span className="text-stone-500">Password strength</span>
                <span className={passwordStatus.textColor}>{passwordStatus.label}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                <div className={`h-full rounded-full ${passwordStatus.color} transition-all duration-300`} style={{ width: passwordStatus.width }} />
              </div>
              <div className="mt-4 grid gap-2 text-xs font-semibold text-stone-600">
                {passwordRules.map((rule) => {
                  const isPassed = rule.test(formData.password);

                  return (
                    <div key={rule.label} className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${isPassed ? 'text-emerald-500' : 'text-stone-300'}`} />
                      <span className={isPassed ? 'text-emerald-700' : ''}>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <label className="grid gap-2 text-sm font-bold text-stone-700">
              Confirm password
              <PasswordInput
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-orange-200 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                placeholder="Repeat password"
              />
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold leading-5 text-stone-600 transition hover:border-orange-200 hover:bg-orange-50/40">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-orange-300 text-orange-500 focus:ring-orange-400"
              />
              <span>
                I agree to the{' '}
                <span className="font-black text-orange-600">
                  Terms & Conditions
                </span>{' '}
                and privacy-friendly travel planning experience.
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-orange-50/80 p-4 text-center text-sm text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-black text-orange-600 transition hover:text-orange-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <aside className="relative min-h-[32rem] overflow-hidden bg-stone-950 lg:min-h-full">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=90"
          alt="Warm travel destination with mountains and a scenic road"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(120,53,15,0.82),rgba(234,88,12,0.52)_45%,rgba(20,83,45,0.72))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(254,243,199,0.42),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(20,184,166,0.35),transparent_30%)]" />

        <div className="relative flex h-full min-h-[32rem] flex-col justify-between p-8 text-white sm:p-10 lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur-md">
              <Compass className="h-4 w-4 text-amber-200" />
              AI trip builder
            </span>
            <span className="rounded-full bg-emerald-400/20 px-4 py-2 text-xs font-black text-emerald-100 backdrop-blur-md">
              Premium planning
            </span>
          </div>

          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-amber-100 backdrop-blur-md">
              <MapPin className="h-4 w-4" />
              Your next adventure starts here
            </div>
            <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Start planning your dream trips with AI
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-orange-50/90">
              Build smarter routes, save places you love, track budgets, and turn travel ideas into beautiful itineraries.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {heroFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-[24px] border border-white/15 bg-white/15 p-4 backdrop-blur-md sm:grid-cols-3">
            <div>
              <p className="text-2xl font-black">120+</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-100/80">Destinations</p>
            </div>
            <div>
              <p className="text-2xl font-black">AI</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-100/80">Assistant</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-2xl font-black">
                <Wallet className="h-5 w-5 text-amber-200" /> Smart
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-100/80">Budgets</p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default RegisterPage;
