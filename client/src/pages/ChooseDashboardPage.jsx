import { Link, Navigate } from 'react-router-dom';
import { canChooseAdminDashboard } from '../features/admin/adminConstants.js';
import { useAuth } from '../hooks/useAuth.js';

function ChooseDashboardPage() {
  const { user } = useAuth();

  if (!canChooseAdminDashboard(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="page-stack">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/90 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8 text-center text-slate-950 shadow-soft backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-100/80 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-amber-100/70 blur-2xl" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-500">Choose workspace</p>
          <h1 className="landing-hero-title mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Where do you want to go?
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
            Your account has admin access. You can manage the platform or continue using the travel
            planner as a normal user.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Link
          to="/admin"
          className="group overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/85 p-7 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
        >
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-50 text-3xl shadow-sm ring-1 ring-slate-100" aria-hidden="true">
            🛡️
          </span>
          <h2 className="mt-5 text-2xl font-black text-slate-950">Open Admin Panel</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Manage users, trips, bookings, content, support, reviews, settings, reports, and audit
            logs.
          </p>
          <span className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-black text-white transition group-hover:bg-orange-600">
            Go to admin
          </span>
        </Link>

        <Link
          to="/dashboard"
          className="group overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/85 p-7 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
        >
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-orange-50 text-3xl shadow-sm ring-1 ring-orange-100" aria-hidden="true">
            🧳
          </span>
          <h2 className="mt-5 text-2xl font-black text-slate-950">Continue as User</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Plan trips, manage budgets, and explore destinations from the
            user dashboard.
          </p>
          <span className="mt-6 inline-flex rounded-full border border-orange-100 bg-white px-5 py-2.5 text-sm font-black text-slate-700 transition group-hover:border-orange-200 group-hover:bg-orange-50 group-hover:text-orange-600">
            Go to dashboard
          </span>
        </Link>
      </div>
    </section>
  );
}

export default ChooseDashboardPage;
